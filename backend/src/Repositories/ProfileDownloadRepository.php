<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Repositories;

use DigitalCrazyHub\Backend\Config\Database;
use DigitalCrazyHub\Backend\Security\Logger;
use PDO;
use RuntimeException;
use Throwable;

/**
 * Class ProfileDownloadRepository
 * Manages lead capture and atomic single-use authorization token lifecycles for company profile downloads.
 */
final class ProfileDownloadRepository
{
    private ?PDO $db = null;

    public function __construct(?PDO $pdo = null)
    {
        $this->db = $pdo;
    }

    private function getDb(): PDO
    {
        if ($this->db === null) {
            $this->db = Database::getConnection();
        }
        return $this->db;
    }

    /**
     * Generate RFC 4122 compliant UUID v4.
     */
    public static function generateUuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Store lead and associate a hashed authorization token.
     *
     * @param array<string, mixed> $leadData
     * @param string $tokenHash SHA-256 hash of the plain token
     * @param int $expirySeconds Validity period in seconds (e.g. 300 for 5 minutes)
     * @return array<string, mixed> Saved record metadata
     * @throws RuntimeException on database execution failure
     */
    public function createLeadAndToken(array $leadData, string $tokenHash, int $expirySeconds = 300): array
    {
        $uuid = self::generateUuid();
        $leadData['uuid'] = $uuid;

        $utc = new \DateTimeZone('UTC');
        $now = new \DateTimeImmutable('now', $utc);
        $createdAt = $now->format('Y-m-d H:i:s');
        $expiresAt = $now->modify(sprintf('+%d seconds', $expirySeconds))->format('Y-m-d H:i:s');

        try {
            $sql = "INSERT INTO `company_profile_downloads` (
                `uuid`, `name`, `phone`, `email`, `location`, `consent_status`, `consent_timestamp`,
                `download_token_hash`, `download_token_expires_at`, `ip_address`, `user_agent`, `created_at`
            ) VALUES (
                :uuid, :name, :phone, :email, :location, :consent_status, :consent_timestamp,
                :token_hash, :expires_at, :ip_address, :user_agent, :created_at
            )";

            $stmt = $this->getDb()->prepare($sql);
            $stmt->execute([
                ':uuid' => $uuid,
                ':name' => $leadData['name'],
                ':phone' => $leadData['phone'],
                ':email' => $leadData['email'],
                ':location' => $leadData['location'],
                ':consent_status' => $leadData['consent_status'] ?? 1,
                ':consent_timestamp' => $leadData['consent_timestamp'] ?? $createdAt,
                ':token_hash' => $tokenHash,
                ':expires_at' => $expiresAt,
                ':ip_address' => $leadData['ip_address'] ?? null,
                ':user_agent' => $leadData['user_agent'] ?? null,
                ':created_at' => $createdAt,
            ]);

            $leadId = (int)$this->getDb()->lastInsertId();
            $leadData['id'] = $leadId;

            Logger::info('Company profile download lead recorded', [
                'lead_id' => $leadId,
                'uuid' => $uuid,
                'phone' => mb_substr($leadData['phone'], 0, 4) . '****',
                'email' => $leadData['email'],
                'location' => $leadData['location']
            ]);

            return $leadData;
        } catch (Throwable $e) {
            Logger::critical('Failed to save company profile download lead in database', [
                'error' => $e->getMessage()
            ]);
            throw new RuntimeException('Failed to record download request in database.');
        }
    }

    /**
     * Atomically consume a download token to prevent replay attacks.
     * Marks download_token_used_at = NOW() ONLY IF it has not expired and not already been used.
     *
     * @param string $tokenHash SHA-256 hash of provided token
     * @return array<string, mixed>|null Returns lead record if successfully consumed, or null if invalid/expired/used
     */
    public function consumeToken(string $tokenHash): ?array
    {
        $nowStr = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d H:i:s');

        try {
            // Atomic update: only updates 1 row if token exists, is unused, and is not expired
            $updateSql = "UPDATE `company_profile_downloads`
                          SET `download_token_used_at` = :now_used
                          WHERE `download_token_hash` = :token_hash
                            AND `download_token_used_at` IS NULL
                            AND `download_token_expires_at` > :now_check";

            $stmt = $this->getDb()->prepare($updateSql);
            $stmt->execute([
                ':now_used' => $nowStr,
                ':token_hash' => $tokenHash,
                ':now_check' => $nowStr
            ]);

            if ($stmt->rowCount() === 1) {
                // Token was successfully and atomically consumed
                $selectSql = "SELECT * FROM `company_profile_downloads` WHERE `download_token_hash` = :token_hash LIMIT 1";
                $selectStmt = $this->getDb()->prepare($selectSql);
                $selectStmt->execute([':token_hash' => $tokenHash]);
                $record = $selectStmt->fetch();

                Logger::info('Company profile download token successfully consumed', [
                    'lead_id' => $record['id'] ?? null,
                    'uuid' => $record['uuid'] ?? null
                ]);

                return $record ?: null;
            }

            // Either token was not found, was already used, or expired
            Logger::warning('Company profile download token consumption failed (invalid, expired, or replay)', [
                'token_hash' => substr($tokenHash, 0, 12) . '...'
            ]);
            return null;
        } catch (Throwable $e) {
            Logger::error('Exception while consuming download token', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Inspect token status without consuming (diagnostic utility).
     */
    public function findByTokenHash(string $tokenHash): ?array
    {
        try {
            $stmt = $this->db->prepare("SELECT * FROM `company_profile_downloads` WHERE `download_token_hash` = :token_hash LIMIT 1");
            $stmt->execute([':token_hash' => $tokenHash]);
            $res = $stmt->fetch();
            return $res !== false ? $res : null;
        } catch (Throwable $e) {
            return null;
        }
    }
}
