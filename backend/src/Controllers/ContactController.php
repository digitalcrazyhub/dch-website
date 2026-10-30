<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Controllers;

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Config\Database;
use DigitalCrazyHub\Backend\Repositories\LeadRepository;
use DigitalCrazyHub\Backend\Security\Logger;
use DigitalCrazyHub\Backend\Security\RateLimiter;
use DigitalCrazyHub\Backend\Services\EmailService;
use DigitalCrazyHub\Backend\Services\GoogleSheetsService;
use DigitalCrazyHub\Backend\Services\RecaptchaService;
use DigitalCrazyHub\Backend\Validation\ContactValidator;
use Throwable;

/**
 * Class ContactController
 * Orchestrates incoming contact form requests, validation, rate limiting, persistence, and external notifications.
 */
final class ContactController
{
    private RateLimiter $rateLimiter;
    private RecaptchaService $recaptchaService;
    private EmailService $emailService;
    private GoogleSheetsService $googleSheetsService;

    public function __construct(
        ?RateLimiter $rateLimiter = null,
        ?RecaptchaService $recaptchaService = null,
        ?EmailService $emailService = null,
        ?GoogleSheetsService $googleSheetsService = null
    ) {
        $this->rateLimiter = $rateLimiter ?? new RateLimiter();
        $this->recaptchaService = $recaptchaService ?? new RecaptchaService();
        $this->emailService = $emailService ?? new EmailService();
        $this->googleSheetsService = $googleSheetsService ?? new GoogleSheetsService();
    }

    /**
     * Main entry point to process HTTP request.
     */
    public function handle(): void
    {
        $this->sendSecurityAndCorsHeaders();

        // Handle CORS preflight
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        // 1. Enforce POST method only
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse(405, [
                'success' => false,
                'message' => 'Method Not Allowed. Only POST requests are accepted.'
            ]);
            return;
        }

        $clientIp = RateLimiter::getClientIp();

        // 2. Enforce Rate Limiting
        $rateCheck = $this->rateLimiter->check($clientIp, 'contact_form');
        if (!$rateCheck['allowed']) {
            Logger::warning('Rate limit exceeded for client IP', [
                'ip' => $clientIp,
                'retry_after' => $rateCheck['retry_after'],
            ]);

            header(sprintf('Retry-After: %d', $rateCheck['retry_after']));
            $this->jsonResponse(429, [
                'success' => false,
                'message' => 'Too many submissions. Please wait a few minutes before trying again.',
                'retry_after' => $rateCheck['retry_after']
            ]);
            return;
        }

        // 3. Parse submitted payload safely
        $rawInput = $this->parseInput();
        if ($rawInput === null) {
            $this->jsonResponse(400, [
                'success' => false,
                'message' => 'Invalid request payload. Ensure valid JSON or form data is supplied.'
            ]);
            return;
        }

        // 4. Validate input fields
        $validation = ContactValidator::validate($rawInput);
        if (!$validation['isValid']) {
            $this->jsonResponse(422, [
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validation['errors']
            ]);
            return;
        }

        $leadData = $validation['data'];

        // 5. Verify reCAPTCHA v3
        $recaptchaToken = (string)($leadData['recaptcha_token'] ?? '');
        $recaptchaResult = $this->recaptchaService->verify($recaptchaToken, 'contact_form', $clientIp);
        if (!$recaptchaResult['isValid']) {
            Logger::warning('Contact form submission rejected by reCAPTCHA', [
                'ip' => $clientIp,
                'score' => $recaptchaResult['score'],
                'message' => $recaptchaResult['message']
            ]);

            $this->jsonResponse(422, [
                'success' => false,
                'message' => 'Security verification failed. Please refresh the page and try again.',
                'errors' => [
                    'recaptcha' => $recaptchaResult['message']
                ]
            ]);
            return;
        }

        $leadData['recaptcha_score'] = $recaptchaResult['score'];
        $leadData['ip_address'] = $clientIp;
        $leadData['user_agent'] = isset($_SERVER['HTTP_USER_AGENT']) ? mb_substr($_SERVER['HTTP_USER_AGENT'], 0, 255, 'UTF-8') : null;

        // Record successful rate limiting attempt now that validation passed
        $this->rateLimiter->record($clientIp, 'contact_form');

        // 6. Persist Lead in MySQL
        $savedLead = null;
        try {
            $repository = new LeadRepository();
            $savedLead = $repository->createLead($leadData);
        } catch (Throwable $e) {
            Logger::critical('Fatal error recording lead in database', [
                'error' => $e->getMessage(),
                'ip' => $clientIp,
            ]);

            $this->jsonResponse(500, [
                'success' => false,
                'message' => 'We could not process your request at this moment. Please try again later or contact us directly via phone.'
            ]);
            return;
        }

        $leadId = (int)$savedLead['id'];

        // 7. Asynchronous/Non-blocking External Dispatches
        // A. Admin notification email
        $adminEmailSent = false;
        try {
            $adminEmailSent = $this->emailService->sendAdminNotification($savedLead);
            if ($adminEmailSent) {
                $repository->updateEmailStatus($leadId, true);
                $repository->markOutboxItemCompleted($leadId, 'email_admin');
            } else {
                $repository->recordOutboxItemFailure($leadId, 'email_admin', 'SMTP dispatch failed or service not configured');
            }
        } catch (Throwable $e) {
            Logger::error('Admin email dispatch exception: ' . $e->getMessage(), [
                'lead_id' => $leadId,
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            $repository->recordOutboxItemFailure($leadId, 'email_admin', 'Exception: ' . $e->getMessage());
        }

        // B. Customer acknowledgement email (isolated: failure of admin email must not block customer confirmation)
        $custEmailSent = false;
        try {
            $custEmailSent = $this->emailService->sendCustomerAcknowledgement($savedLead);
            if ($custEmailSent) {
                $repository->markOutboxItemCompleted($leadId, 'email_customer');
            } else {
                $repository->recordOutboxItemFailure($leadId, 'email_customer', 'Customer acknowledgement email failed or service not configured');
            }
        } catch (Throwable $e) {
            Logger::error('Customer acknowledgement email dispatch exception: ' . $e->getMessage(), [
                'lead_id' => $leadId,
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            $repository->recordOutboxItemFailure($leadId, 'email_customer', 'Exception: ' . $e->getMessage());
        }

        // C. Google Sheets sync (isolated: email status must not block spreadsheet logging)
        $sheetsSynced = false;
        try {
            $sheetsSynced = $this->googleSheetsService->syncLead($savedLead);
            if ($sheetsSynced) {
                $repository->updateSheetsStatus($leadId, true);
                $repository->markOutboxItemCompleted($leadId, 'google_sheets');
            } else {
                $repository->recordOutboxItemFailure($leadId, 'google_sheets', 'Google Sheets sync failed or webhook not configured');
            }
        } catch (Throwable $e) {
            Logger::error('Google Sheets sync exception: ' . $e->getMessage(), [
                'lead_id' => $leadId,
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            $repository->recordOutboxItemFailure($leadId, 'google_sheets', 'Exception: ' . $e->getMessage());
        }

        // 8. Return standardized clean JSON response
        $this->jsonResponse(200, [
            'success' => true,
            'message' => 'Thank you for contacting Digital Crazy Hub. We have received your enquiry.',
            'reference_id' => 'DCH-' . strtoupper(substr(str_replace('-', '', $savedLead['uuid']), 0, 8))
        ]);
    }

    /**
     * Safely parse request body regardless of content type.
     */
    private function parseInput(): ?array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $rawContent = file_get_contents('php://input');
            if ($rawContent === false || trim($rawContent) === '') {
                return null;
            }
            $decoded = json_decode($rawContent, true);
            return is_array($decoded) ? $decoded : null;
        }

        // Regular form post / multipart
        if (!empty($_POST)) {
            return $_POST;
        }

        // Check php://input fallback
        $raw = file_get_contents('php://input');
        if (!empty($raw)) {
            $parsed = [];
            parse_str($raw, $parsed);
            if (!empty($parsed)) {
                return $parsed;
            }
        }

        return [];
    }

    /**
     * Send standard security and CORS headers.
     */
    private function sendSecurityAndCorsHeaders(): void
    {
        if (headers_sent()) {
            return;
        }

        // Security headers
        header('Content-Type: application/json; charset=UTF-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');

        // CORS headers
        $allowedOrigin = Env::getString('ALLOWED_ORIGIN', '*');
        $httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if ($allowedOrigin === '*' || $allowedOrigin === $httpOrigin) {
            header("Access-Control-Allow-Origin: " . ($allowedOrigin === '*' ? '*' : $httpOrigin));
        } elseif (!empty($httpOrigin)) {
            // Check if origin ends with digitalcrazyhub.com or is localhost
            $parsedHost = parse_url($httpOrigin, PHP_URL_HOST);
            if ($parsedHost === 'digitalcrazyhub.com' || str_ends_with((string)$parsedHost, '.digitalcrazyhub.com') || $parsedHost === 'localhost' || $parsedHost === '127.0.0.1') {
                header("Access-Control-Allow-Origin: " . $httpOrigin);
            }
        }

        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');
    }

    /**
     * Helper to render standardized JSON response and exit cleanly.
     */
    private function jsonResponse(int $statusCode, array $data): void
    {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}
