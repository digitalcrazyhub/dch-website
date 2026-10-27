<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Security;

use DigitalCrazyHub\Backend\Config\Env;
use Throwable;

/**
 * Class RateLimiter
 * Atomic, file-based sliding window rate limiter with secure IP resolution and file locking.
 */
final class RateLimiter
{
    private string $storageDir;
    private int $maxAttempts;
    private int $decaySeconds;

    public function __construct(?string $storageDir = null, ?int $maxAttempts = null, ?int $decaySeconds = null)
    {
        $this->storageDir = $storageDir ?? (dirname(__DIR__, 2) . '/storage/ratelimit');
        $this->maxAttempts = $maxAttempts ?? Env::getInt('RATE_LIMIT_MAX_REQUESTS', 5);
        $this->decaySeconds = $decaySeconds ?? Env::getInt('RATE_LIMIT_DECAY_SECONDS', 600);

        if (!is_dir($this->storageDir)) {
            @mkdir($this->storageDir, 0755, true);
        }
    }

    /**
     * Resolve reliable client IP address, avoiding spoofed forwarded headers unless behind a trusted proxy.
     */
    public static function getClientIp(): string
    {
        $remoteAddr = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        $trustedProxies = Env::getString('TRUSTED_PROXIES', '');

        if ($trustedProxies !== '') {
            $trustedList = array_map('trim', explode(',', $trustedProxies));
            if (in_array($remoteAddr, $trustedList, true)) {
                $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
                if ($forwarded !== '') {
                    $ips = array_map('trim', explode(',', $forwarded));
                    $candidate = $ips[0];
                    if (filter_var($candidate, FILTER_VALIDATE_IP)) {
                        return $candidate;
                    }
                }
            }
        }

        return $remoteAddr;
    }

    /**
     * Check if client IP is within rate limits for an action.
     *
     * @return array{allowed: bool, remaining: int, retry_after: int}
     */
    public function check(string $ip, string $action = 'contact_form'): array
    {
        $safeIp = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ip);
        $filename = sprintf('%s/%s_%s.json', $this->storageDir, $action, $safeIp);

        $now = time();
        $timestamps = [];

        if (file_exists($filename)) {
            $fp = @fopen($filename, 'r');
            if ($fp) {
                if (flock($fp, LOCK_SH)) {
                    $content = stream_get_contents($fp);
                    flock($fp, LOCK_UN);
                    if ($content) {
                        $decoded = json_decode($content, true);
                        if (is_array($decoded)) {
                            $timestamps = $decoded;
                        }
                    }
                }
                fclose($fp);
            }
        }

        // Filter out timestamps outside the sliding window
        $windowStart = $now - $this->decaySeconds;
        $activeTimestamps = array_values(array_filter($timestamps, fn(int $t) => $t > $windowStart));

        $count = count($activeTimestamps);
        if ($count >= $this->maxAttempts) {
            $oldestInWindow = min($activeTimestamps);
            $retryAfter = max(1, ($oldestInWindow + $this->decaySeconds) - $now);

            return [
                'allowed' => false,
                'remaining' => 0,
                'retry_after' => $retryAfter,
            ];
        }

        return [
            'allowed' => true,
            'remaining' => max(0, $this->maxAttempts - $count),
            'retry_after' => 0,
        ];
    }

    /**
     * Record a new request attempt for the client IP.
     */
    public function record(string $ip, string $action = 'contact_form'): void
    {
        $safeIp = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ip);
        $filename = sprintf('%s/%s_%s.json', $this->storageDir, $action, $safeIp);

        $now = time();
        $windowStart = $now - $this->decaySeconds;

        $fp = @fopen($filename, 'c+');
        if ($fp) {
            if (flock($fp, LOCK_EX)) {
                $content = stream_get_contents($fp);
                $timestamps = [];
                if ($content) {
                    $decoded = json_decode($content, true);
                    if (is_array($decoded)) {
                        $timestamps = $decoded;
                    }
                }

                $activeTimestamps = array_values(array_filter($timestamps, fn(int $t) => $t > $windowStart));
                $activeTimestamps[] = $now;

                ftruncate($fp, 0);
                rewind($fp);
                fwrite($fp, json_encode($activeTimestamps));
                fflush($fp);
                flock($fp, LOCK_UN);
            }
            fclose($fp);
        }
    }

    /**
     * Reset/clear rate limit for an IP (e.g., during tests).
     */
    public function reset(string $ip, string $action = 'contact_form'): void
    {
        $safeIp = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $ip);
        $filename = sprintf('%s/%s_%s.json', $this->storageDir, $action, $safeIp);
        if (file_exists($filename)) {
            @unlink($filename);
        }
    }
}
