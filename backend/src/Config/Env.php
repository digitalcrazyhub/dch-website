<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Config;

use Dotenv\Dotenv;
use Throwable;

/**
 * Class Env
 * Centralized environment variable loader and typed accessor.
 */
final class Env
{
    private static bool $loaded = false;

    /**
     * Initialize environment variables from .env file if present.
     */
    public static function load(string $baseDir = ''): void
    {
        if (self::$loaded) {
            return;
        }

        if ($baseDir === '') {
            $baseDir = dirname(__DIR__, 2);
        }

        if (file_exists($baseDir . '/.env') && class_exists(Dotenv::class)) {
            try {
                $dotenv = Dotenv::createImmutable($baseDir);
                $dotenv->safeLoad();
            } catch (Throwable) {
                // Fail gracefully, rely on getenv() or $_ENV
            }
        }

        self::$loaded = true;
    }

    /**
     * Get an environment variable with optional default.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        self::load();

        if (isset($_ENV[$key])) {
            return $_ENV[$key];
        }

        if (isset($_SERVER[$key])) {
            return $_SERVER[$key];
        }

        $val = getenv($key);
        if ($val !== false) {
            return $val;
        }

        return $default;
    }

    public static function getString(string $key, string $default = ''): string
    {
        $val = self::get($key, $default);
        return is_scalar($val) ? (string) $val : $default;
    }

    public static function getInt(string $key, int $default = 0): int
    {
        $val = self::get($key, $default);
        return is_numeric($val) ? (int) $val : $default;
    }

    public static function getFloat(string $key, float $default = 0.0): float
    {
        $val = self::get($key, $default);
        return is_numeric($val) ? (float) $val : $default;
    }

    public static function getBool(string $key, bool $default = false): bool
    {
        $val = self::get($key, $default);
        if (is_bool($val)) {
            return $val;
        }
        if (is_string($val)) {
            $lower = strtolower(trim($val));
            return in_array($lower, ['true', '1', 'yes', 'on'], true);
        }
        return (bool) $val;
    }

    public static function isProduction(): bool
    {
        return strtolower(self::getString('APP_ENV', 'production')) === 'production';
    }

    public static function isDebug(): bool
    {
        return self::getBool('APP_DEBUG', false);
    }
}
