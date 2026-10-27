<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Services;

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Security\Logger;
use Throwable;

/**
 * Class RecaptchaService
 * Server-side verification of Google reCAPTCHA v3 tokens.
 */
final class RecaptchaService
{
    private const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

    private bool $enabled;
    private string $secretKey;
    private float $scoreThreshold;
    private array $allowedHostnames;

    public function __construct(
        ?bool $enabled = null,
        ?string $secretKey = null,
        ?float $scoreThreshold = null,
        ?array $allowedHostnames = null
    ) {
        $this->enabled = $enabled ?? Env::getBool('RECAPTCHA_ENABLED', true);
        $this->secretKey = $secretKey ?? Env::getString('RECAPTCHA_SECRET_KEY', '');
        $this->scoreThreshold = $scoreThreshold ?? Env::getFloat('RECAPTCHA_SCORE_THRESHOLD', 0.5);

        if ($allowedHostnames !== null) {
            $this->allowedHostnames = $allowedHostnames;
        } else {
            $rawHosts = Env::getString('RECAPTCHA_ALLOWED_HOSTNAMES', '');
            $this->allowedHostnames = $rawHosts !== '' ? array_map('trim', explode(',', $rawHosts)) : [];
        }
    }

    /**
     * Verify the client reCAPTCHA v3 token.
     *
     * @return array{isValid: bool, score: float, message: string}
     */
    public function verify(string $token, string $expectedAction = 'contact_form', ?string $clientIp = null): array
    {
        // 1. If reCAPTCHA is explicitly disabled (e.g. local development or unit testing)
        if (!$this->enabled) {
            Logger::debug('reCAPTCHA verification skipped (service disabled in configuration)');
            return [
                'isValid' => true,
                'score' => 1.0,
                'message' => 'Verification disabled in environment'
            ];
        }

        // 2. Secret key check
        if ($this->secretKey === '' || $this->secretKey === 'your-recaptcha-v3-secret-key-here') {
            Logger::warning('reCAPTCHA is enabled but RECAPTCHA_SECRET_KEY is not configured');
            // Fail open in development, or fail closed in production
            if (!Env::isProduction()) {
                return [
                    'isValid' => true,
                    'score' => 1.0,
                    'message' => 'Placeholder reCAPTCHA secret bypassed in non-production mode'
                ];
            }
            return [
                'isValid' => false,
                'score' => 0.0,
                'message' => 'Spam verification service is not properly configured on server.'
            ];
        }

        // 3. Token check
        if (trim($token) === '') {
            return [
                'isValid' => false,
                'score' => 0.0,
                'message' => 'Spam protection token is missing. Please refresh the page and try again.'
            ];
        }

        // 4. Send verification request to Google
        $postData = [
            'secret' => $this->secretKey,
            'response' => $token,
        ];
        if ($clientIp !== null && filter_var($clientIp, FILTER_VALIDATE_IP)) {
            $postData['remoteip'] = $clientIp;
        }

        try {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, self::VERIFY_URL);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 6);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 4);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

            $rawResponse = curl_exec($ch);
            $curlError = curl_error($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($rawResponse === false || $httpCode !== 200) {
                Logger::error('Failed to communicate with Google reCAPTCHA API', [
                    'curl_error' => $curlError,
                    'http_code' => $httpCode,
                ]);

                // On verification service network outage, do not punish legitimate users unless in strict mode
                if (Env::getBool('RECAPTCHA_FAIL_CLOSED', false)) {
                    return [
                        'isValid' => false,
                        'score' => 0.0,
                        'message' => 'Could not verify security token with verification server.'
                    ];
                }

                return [
                    'isValid' => true,
                    'score' => 0.5,
                    'message' => 'Verification network failure - tolerated by policy'
                ];
            }

            $result = json_decode((string)$rawResponse, true);
            if (!is_array($result)) {
                Logger::error('Invalid JSON response received from Google reCAPTCHA', ['response' => $rawResponse]);
                return [
                    'isValid' => false,
                    'score' => 0.0,
                    'message' => 'Security verification returned unreadable data.'
                ];
            }

            $success = (bool)($result['success'] ?? false);
            $score = (float)($result['score'] ?? 0.0);
            $action = (string)($result['action'] ?? '');
            $hostname = (string)($result['hostname'] ?? '');

            if (!$success) {
                $errorCodes = $result['error-codes'] ?? [];
                Logger::warning('reCAPTCHA validation failed with errors', ['errors' => $errorCodes]);
                return [
                    'isValid' => false,
                    'score' => $score,
                    'message' => 'Security verification failed. Please try again.'
                ];
            }

            // Check action
            if ($expectedAction !== '' && $action !== '' && $action !== $expectedAction) {
                Logger::warning('reCAPTCHA action mismatch', [
                    'expected' => $expectedAction,
                    'actual' => $action
                ]);
                return [
                    'isValid' => false,
                    'score' => $score,
                    'message' => 'Security token action mismatch.'
                ];
            }

            // Check hostname if allowed hostnames configured
            if (!empty($this->allowedHostnames) && $hostname !== '') {
                if (!in_array($hostname, $this->allowedHostnames, true)) {
                    Logger::warning('reCAPTCHA hostname mismatch', [
                        'expected' => $this->allowedHostnames,
                        'actual' => $hostname
                    ]);
                    return [
                        'isValid' => false,
                        'score' => $score,
                        'message' => 'Security token hostname is not recognized.'
                    ];
                }
            }

            // Check score against threshold
            if ($score < $this->scoreThreshold) {
                Logger::warning('reCAPTCHA score below threshold', [
                    'score' => $score,
                    'threshold' => $this->scoreThreshold
                ]);
                return [
                    'isValid' => false,
                    'score' => $score,
                    'message' => 'Suspicious activity detected. Submission denied.'
                ];
            }

            return [
                'isValid' => true,
                'score' => $score,
                'message' => 'Verification succeeded'
            ];
        } catch (Throwable $e) {
            Logger::error('Unexpected exception during reCAPTCHA verification', [
                'exception' => $e->getMessage()
            ]);
            return [
                'isValid' => false,
                'score' => 0.0,
                'message' => 'Security verification could not be completed.'
            ];
        }
    }
}
