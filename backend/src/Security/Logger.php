<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Security;

use DigitalCrazyHub\Backend\Config\Env;
use Throwable;

/**
 * Class Logger
 * Secure, file-based structured logger with automatic redaction of sensitive credentials.
 */
final class Logger
{
    private const SENSITIVE_KEYS = [
        'password',
        'pass',
        'secret',
        'token',
        'key',
        'recaptcha_secret',
        'db_pass',
        'smtp_pass',
        'authorization',
        'auth',
        'cookie',
        'session'
    ];

    private static ?string $logFile = null;

    public static function setLogFile(string $filePath): void
    {
        self::$logFile = $filePath;
    }

    public static function getLogFile(): string
    {
        if (self::$logFile === null) {
            $configured = Env::getString('LOG_FILE', '');
            $baseDir = dirname(__DIR__, 2);
            if ($configured !== '') {
                // If absolute path or has drive letter
                if (preg_match('/^([a-zA-Z]:[\\\\\/]|\/)/', $configured)) {
                    self::$logFile = $configured;
                } else {
                    self::$logFile = $baseDir . '/' . ltrim($configured, '/\\');
                }
            } else {
                self::$logFile = $baseDir . '/logs/app.log';
            }
        }
        return self::$logFile;
    }

    public static function info(string $message, array $context = []): void
    {
        self::log('INFO', $message, $context);
    }

    public static function warning(string $message, array $context = []): void
    {
        self::log('WARNING', $message, $context);
    }

    public static function error(string $message, array $context = []): void
    {
        self::log('ERROR', $message, $context);
    }

    public static function debug(string $message, array $context = []): void
    {
        if (Env::isDebug()) {
            self::log('DEBUG', $message, $context);
        }
    }

    public static function critical(string $message, array $context = []): void
    {
        self::log('CRITICAL', $message, $context);
    }

    /**
     * Write formatted log entry.
     */
    private static function log(string $level, string $message, array $context = []): void
    {
        try {
            $filePath = self::getLogFile();
            $logDir = dirname($filePath);
            if (!is_dir($logDir)) {
                @mkdir($logDir, 0755, true);
            }

            $sanitizedContext = self::redactSensitiveData($context);
            $contextStr = !empty($sanitizedContext) ? ' ' . json_encode($sanitizedContext, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) : '';
            
            $timestamp = (new \DateTimeImmutable('now', new \DateTimeZone('Asia/Kolkata')))->format('Y-m-d H:i:s.v');
            $line = sprintf("[%s] [%s] %s%s\n", $timestamp, strtoupper($level), $message, $contextStr);

            @file_put_contents($filePath, $line, FILE_APPEND | LOCK_EX);
        } catch (Throwable) {
            // Fail silently; logging must never crash the main request lifecycle
        }
    }

    /**
     * Recursively mask sensitive keys in context arrays.
     */
    public static function redactSensitiveData(mixed $data): mixed
    {
        if (!is_array($data)) {
            return $data;
        }

        $redacted = [];
        foreach ($data as $key => $value) {
            $isSensitive = false;
            $lowerKey = strtolower((string)$key);
            foreach (self::SENSITIVE_KEYS as $sensitive) {
                if (str_contains($lowerKey, $sensitive)) {
                    $isSensitive = true;
                    break;
                }
            }

            if ($isSensitive) {
                $redacted[$key] = '***REDACTED***';
            } elseif (is_array($value)) {
                $redacted[$key] = self::redactSensitiveData($value);
            } else {
                $redacted[$key] = $value;
            }
        }

        return $redacted;
    }
}
