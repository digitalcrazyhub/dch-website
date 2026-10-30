<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Controllers;

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Repositories\ProfileDownloadRepository;
use DigitalCrazyHub\Backend\Security\Logger;
use DigitalCrazyHub\Backend\Security\RateLimiter;
use DigitalCrazyHub\Backend\Services\EmailService;
use DigitalCrazyHub\Backend\Validation\ProfileDownloadValidator;
use Throwable;

/**
 * Class ProfileDownloadController
 * Handles company profile download lead capture, token generation, and authorized file streaming.
 */
final class ProfileDownloadController
{
    private RateLimiter $rateLimiter;
    private ProfileDownloadRepository $repository;
    private EmailService $emailService;

    public function __construct(
        ?RateLimiter $rateLimiter = null,
        ?ProfileDownloadRepository $repository = null,
        ?EmailService $emailService = null
    ) {
        $this->rateLimiter = $rateLimiter ?? new RateLimiter();
        $this->repository = $repository ?? new ProfileDownloadRepository();
        $this->emailService = $emailService ?? new EmailService();
    }

    /**
     * Endpoint 1: Handle lead capture and authorization token creation.
     */
    public function handleSubmission(): void
    {
        $this->sendSecurityAndCorsHeaders();

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->jsonResponse(405, [
                'success' => false,
                'message' => 'Method Not Allowed. Only POST requests are accepted.'
            ]);
            return;
        }

        $clientIp = RateLimiter::getClientIp();

        // 1. Rate Limiting Check
        $rateCheck = $this->rateLimiter->check($clientIp, 'profile_download');
        if (!$rateCheck['allowed']) {
            Logger::warning('Profile download rate limit exceeded', [
                'ip' => $clientIp,
                'retry_after' => $rateCheck['retry_after'],
            ]);

            header(sprintf('Retry-After: %d', $rateCheck['retry_after']));
            $this->jsonResponse(429, [
                'success' => false,
                'message' => 'Too many download requests. Please wait a few moments before trying again.',
                'retry_after' => $rateCheck['retry_after']
            ]);
            return;
        }

        // 2. Parse Input
        $rawInput = $this->parseInput();
        if ($rawInput === null) {
            $this->jsonResponse(400, [
                'success' => false,
                'message' => 'Invalid request payload. Ensure valid JSON or form data is supplied.'
            ]);
            return;
        }

        // 3. Validate Submitted Fields
        $validation = ProfileDownloadValidator::validate($rawInput);
        if (!$validation['isValid']) {
            $this->jsonResponse(422, [
                'success' => false,
                'message' => 'Please correct the highlighted fields.',
                'errors' => $validation['errors']
            ]);
            return;
        }

        $leadData = $validation['data'];
        $leadData['ip_address'] = $clientIp;
        $leadData['user_agent'] = isset($_SERVER['HTTP_USER_AGENT']) ? mb_substr($_SERVER['HTTP_USER_AGENT'], 0, 255, 'UTF-8') : null;

        // 4. Generate Cryptographically Secure One-Time Token
        $rawToken = bin2hex(random_bytes(32)); // 64 hex characters
        $tokenHash = hash('sha256', $rawToken);
        $expirySeconds = Env::getInt('PROFILE_DOWNLOAD_TOKEN_EXPIRY', 300); // 5 minutes default

        // 5. Persist Lead and Token Hash to MySQL
        try {
            $savedRecord = $this->repository->createLeadAndToken($leadData, $tokenHash, $expirySeconds);
        } catch (Throwable $e) {
            Logger::critical('Failed to save profile download lead', [
                'error' => $e->getMessage(),
                'ip' => $clientIp
            ]);

            $this->jsonResponse(500, [
                'success' => false,
                'message' => 'Could not process your download request at this moment. Please try again later.'
            ]);
            return;
        }

        // Record successful rate limiting attempt
        $this->rateLimiter->record($clientIp, 'profile_download');

        // 6. Send Internal Email Notification (Non-blocking)
        try {
            $adminEmailLead = [
                'uuid' => $savedRecord['uuid'],
                'name' => $savedRecord['name'],
                'phone' => $savedRecord['phone'],
                'email' => $savedRecord['email'] ?? 'info@digitalcrazyhub.com',
                'location' => $savedRecord['location'],
                'service' => 'Company Profile Download',
                'message' => 'Lead requested and was authorized to download the Digital Crazy Hub Company Profile PDF.',
                'ip_address' => $clientIp,
                'created_at' => date('Y-m-d H:i:s')
            ];
            $this->emailService->sendAdminNotification($adminEmailLead);
        } catch (Throwable) {
            // Non-blocking
        }

        // 7. Return Secure Download URL with Short-Lived Single-Use Token
        $downloadUrl = 'backend/api/download-company-profile.php?token=' . urlencode($rawToken);

        $this->jsonResponse(200, [
            'success' => true,
            'message' => 'Thank you! Your company profile download will begin shortly.',
            'downloadUrl' => $downloadUrl,
            'expires_in' => $expirySeconds
        ]);
    }

    /**
     * Endpoint 2: Validate token and stream protected PDF file.
     */
    public function handleDownload(): void
    {
        $rawToken = $_GET['token'] ?? $_POST['token'] ?? '';
        $rawToken = is_string($rawToken) ? trim($rawToken) : '';

        // Validate token format (must be 64 hex characters)
        if ($rawToken === '' || !preg_match('/^[a-fA-F0-9]{64}$/', $rawToken)) {
            $this->renderDownloadError(
                403,
                'Invalid Authorization Token',
                'The download link provided is invalid or malformed. Please return to the homepage to request a new download.'
            );
            return;
        }

        $tokenHash = hash('sha256', $rawToken);

        // Atomically consume the token in database
        $leadRecord = $this->repository->consumeToken($tokenHash);
        if ($leadRecord === null) {
            $this->renderDownloadError(
                410,
                'Download Link Expired or Already Used',
                'This company profile download link has either expired (links are valid for 5 minutes) or has already been used. Please return to the homepage to request a fresh download link.'
            );
            return;
        }

        // Resolve PDF Document Path
        $configuredPath = Env::getString('PROFILE_PDF_PATH', '');
        if ($configuredPath !== '') {
            $pdfPath = $configuredPath;
        } else {
            $pdfPath = dirname(__DIR__, 2) . '/storage/documents/digital-crazy-hub-company-profile.pdf';
        }

        if (!file_exists($pdfPath) || !is_readable($pdfPath)) {
            Logger::critical('Company profile PDF file missing or unreadable on disk', [
                'path' => $pdfPath
            ]);
            $this->renderDownloadError(
                500,
                'Document Unavailable',
                'The company profile document is currently undergoing updates on our server. Please contact us at info@digitalcrazyhub.com or +91 9659239187 to receive a copy directly.'
            );
            return;
        }

        $fileSize = filesize($pdfPath);

        // Send streaming download headers
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="Digital-Crazy-Hub-Company-Profile.pdf"');
        header('X-Content-Type-Options: nosniff');
        header('Cache-Control: private, no-store, no-cache, must-revalidate');
        header('Pragma: no-cache');
        if ($fileSize !== false && $fileSize > 0) {
            header('Content-Length: ' . $fileSize);
        }

        // Clean any previously started output buffers
        while (ob_get_level()) {
            ob_end_clean();
        }

        // Stream file safely in chunks
        $fp = fopen($pdfPath, 'rb');
        if ($fp) {
            while (!feof($fp)) {
                echo fread($fp, 65536);
                flush();
            }
            fclose($fp);
        } else {
            readfile($pdfPath);
        }
        exit;
    }

    /**
     * Render user-friendly error page when download authorization fails.
     */
    private function renderDownloadError(int $statusCode, string $title, string $message): void
    {
        http_response_code($statusCode);

        // If client requested JSON (API client), return JSON
        $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
        if (str_contains($accept, 'application/json')) {
            $this->sendSecurityAndCorsHeaders();
            echo json_encode([
                'success' => false,
                'status' => $statusCode,
                'title' => $title,
                'message' => $message
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
            return;
        }

        // Otherwise render a clean branded HTML error screen
        header('Content-Type: text/html; charset=UTF-8');
        $safeTitle = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
        $safeMessage = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

        echo <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{$safeTitle} — Digital Crazy Hub</title>
<style>
body {
    margin: 0;
    padding: 40px 20px;
    background-color: #0B1730;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 80vh;
}
.card {
    max-width: 520px;
    background: #142442;
    border: 1px solid #26334D;
    border-radius: 16px;
    padding: 40px 32px;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
}
.icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;
    border-radius: 50%;
    background: rgba(229, 9, 20, 0.15);
    color: #f87171;
    display: flex;
    align-items: center;
    justify-content: center;
}
h1 {
    font-size: 22px;
    margin: 0 0 12px;
    font-weight: 700;
}
p {
    color: #8992A5;
    font-size: 15px;
    line-height: 1.6;
    margin: 0 0 28px;
}
.btn {
    display: inline-block;
    background: linear-gradient(135deg, #0755C9 0%, #6547F5 100%);
    color: #FFFFFF;
    text-decoration: none;
    font-weight: 600;
    font-size: 15px;
    padding: 12px 28px;
    border-radius: 9999px;
    transition: transform 0.2s, box-shadow 0.2s;
}
.btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(101, 71, 245, 0.4);
}
</style>
</head>
<body>
<div class="card">
    <div class="icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    </div>
    <h1>{$safeTitle}</h1>
    <p>{$safeMessage}</p>
    <a href="/index.html" class="btn">Return to Homepage</a>
</div>
</body>
</html>
HTML;
        exit;
    }

    /**
     * Parse incoming JSON or Form body safely.
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

        if (!empty($_POST)) {
            return $_POST;
        }

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

    private function sendSecurityAndCorsHeaders(): void
    {
        if (headers_sent()) {
            return;
        }

        header('Content-Type: application/json; charset=UTF-8');
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');

        $allowedOrigin = Env::getString('ALLOWED_ORIGIN', '*');
        $httpOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if ($allowedOrigin === '*' || $allowedOrigin === $httpOrigin) {
            header("Access-Control-Allow-Origin: " . ($allowedOrigin === '*' ? '*' : $httpOrigin));
        } elseif (!empty($httpOrigin)) {
            $parsedHost = parse_url($httpOrigin, PHP_URL_HOST);
            if ($parsedHost === 'digitalcrazyhub.com' || str_ends_with((string)$parsedHost, '.digitalcrazyhub.com') || $parsedHost === 'localhost' || $parsedHost === '127.0.0.1') {
                header("Access-Control-Allow-Origin: " . $httpOrigin);
            }
        }

        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Max-Age: 86400');
    }

    private function jsonResponse(int $statusCode, array $data): void
    {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
}
