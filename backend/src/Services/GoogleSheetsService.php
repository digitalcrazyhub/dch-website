<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Services;

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Security\Logger;
use Throwable;

/**
 * Class GoogleSheetsService
 * Secure, non-blocking Google Sheets integration via Google Apps Script Webhook.
 */
final class GoogleSheetsService
{
    private bool $enabled;
    private string $webhookUrl;
    private string $secretToken;
    private int $timeout;

    public function __construct()
    {
        $this->enabled = Env::getBool('GOOGLE_SHEETS_ENABLED', false);
        $this->webhookUrl = Env::getString('GOOGLE_SHEETS_WEBHOOK_URL', '');
        $this->secretToken = Env::getString('GOOGLE_SHEETS_WEBHOOK_SECRET', '');
        $this->timeout = Env::getInt('GOOGLE_SHEETS_TIMEOUT', 8);
    }

    /**
     * Dispatch lead payload to Google Sheets webhook.
     */
    public function syncLead(array $lead): bool
    {
        if (!$this->enabled) {
            Logger::info('Google Sheets sync skipped (service disabled)', ['lead_uuid' => $lead['uuid'] ?? '']);
            return true;
        }

        if (empty($this->webhookUrl) || $this->webhookUrl === 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec') {
            Logger::warning('Google Sheets webhook URL is not configured; skipping sync', ['lead_uuid' => $lead['uuid'] ?? '']);
            return false;
        }

        $payload = [
            'action' => 'append_lead',
            'timestamp' => $lead['created_at'] ?? (new \DateTimeImmutable('now', new \DateTimeZone('Asia/Kolkata')))->format('Y-m-d H:i:s'),
            'uuid' => $lead['uuid'] ?? '',
            'name' => $lead['name'] ?? '',
            'phone' => $lead['phone'] ?? '',
            'email' => $lead['email'] ?? '',
            'location' => $lead['location'] ?? '',
            'service' => $lead['service'] ?? '',
            'message' => $lead['message'] ?? '',
            'page_url' => $lead['page_url'] ?? '',
            'utm_source' => $lead['utm_source'] ?? '',
            'utm_medium' => $lead['utm_medium'] ?? '',
            'utm_campaign' => $lead['utm_campaign'] ?? '',
            'status' => $lead['status'] ?? 'new',
            'recaptcha_score' => $lead['recaptcha_score'] ?? null,
        ];

        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $this->webhookUrl);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Apps Script redirects 302 to script.googleusercontent.com
            curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

            $headers = ['Content-Type: application/json'];
            if (!empty($this->secretToken)) {
                $headers[] = 'X-Webhook-Secret: ' . $this->secretToken;
            }
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

            $rawResponse = curl_exec($ch);
            $curlError = curl_error($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($rawResponse === false || $httpCode < 200 || $httpCode >= 300) {
                Logger::error('Google Sheets sync HTTP error', [
                    'lead_uuid' => $lead['uuid'] ?? '',
                    'http_code' => $httpCode,
                    'curl_error' => $curlError,
                ]);
                return false;
            }

            $decoded = json_decode((string)$rawResponse, true);
            if (is_array($decoded) && isset($decoded['status']) && $decoded['status'] === 'error') {
                Logger::error('Google Sheets webhook returned operational error', [
                    'lead_uuid' => $lead['uuid'] ?? '',
                    'response' => $decoded,
                ]);
                return false;
            }

            Logger::info('Google Sheets synced successfully', ['lead_uuid' => $lead['uuid'] ?? '']);
            return true;
        } catch (Throwable $e) {
            Logger::error('Unexpected exception during Google Sheets sync', [
                'lead_uuid' => $lead['uuid'] ?? '',
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }
}
