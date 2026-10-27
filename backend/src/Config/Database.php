<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Config;

use DigitalCrazyHub\Backend\Security\Logger;
use PDO;
use PDOException;
use RuntimeException;

/**
 * Class Database
 * Production PDO connection manager with secure configuration and exception handling.
 */
final class Database
{
    private static ?PDO $instance = null;

    /**
     * Private constructor to prevent direct instantiation.
     */
    private function __construct() {}

    /**
     * Set a custom PDO instance (ideal for automated testing).
     */
    public static function setConnection(?PDO $pdo): void
    {
        self::$instance = $pdo;
    }

    /**
     * Retrieve the active PDO database instance (Singleton).
     *
     * @throws RuntimeException if database connection fails
     */
    public static function getConnection(): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $driver = strtolower(Env::getString('DB_DRIVER', 'mysql'));
        $host = Env::getString('DB_HOST', '127.0.0.1');

        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_TIMEOUT => 5,
        ];

        if ($driver === 'sqlite' || $host === ':memory:') {
            try {
                $dbPath = $host === ':memory:' ? ':memory:' : Env::getString('DB_NAME', ':memory:');
                $pdo = new PDO('sqlite:' . $dbPath, null, null, $options);
                self::$instance = $pdo;
                return self::$instance;
            } catch (PDOException $e) {
                Logger::critical('SQLite database connection failed', ['error' => $e->getMessage()]);
                throw new RuntimeException('Database connection failed.');
            }
        }

        $port = Env::getInt('DB_PORT', 3306);
        $dbname = Env::getString('DB_NAME', 'dch_db');
        $username = Env::getString('DB_USER', 'root');
        $password = Env::getString('DB_PASS', '');
        $charset = Env::getString('DB_CHARSET', 'utf8mb4');

        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $host, $port, $dbname, $charset);

        try {
            $pdo = new PDO($dsn, $username, $password, $options);
            $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
            self::$instance = $pdo;
            return self::$instance;
        } catch (PDOException $e) {
            // Log real database error internally without exposing credentials
            Logger::critical('Database connection failed', [
                'dsn_host' => $host,
                'dsn_port' => $port,
                'dsn_db' => $dbname,
                'error_code' => $e->getCode(),
                'error_message' => $e->getMessage()
            ]);

            throw new RuntimeException('Database connection failed. Please ensure MySQL is configured correctly.');
        }
    }

    /**
     * Check if the database connection can be established.
     */
    public static function isConnected(): bool
    {
        try {
            self::getConnection();
            return true;
        } catch (RuntimeException) {
            return false;
        }
    }

    /**
     * Reset connection instance (useful for testing or reconnecting).
     */
    public static function reset(): void
    {
        self::$instance = null;
    }
}
