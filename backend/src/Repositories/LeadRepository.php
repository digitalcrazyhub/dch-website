<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Repositories;

use DigitalCrazyHub\Backend\Config\Database;
use DigitalCrazyHub\Backend\Security\Logger;
use PDO;
use RuntimeException;
use Throwable;

/**
 * Class LeadRepository
 * Secure PDO repository managing lead persistence and transactional outbox entries.
 */
final class LeadRepository
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
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100 (v4)
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Insert new lead and initialize outbox queue in a single atomic database transaction.
     *
     * @param array<string, mixed> $leadData
     * @return array<string, mixed> Full lead record
     * @throws RuntimeException on database execution failure
     */
    public function createLead(array $leadData): array
    {
        $uuid = self::generateUuid();
        $leadData['uuid'] = $uuid;

        try {
            $this->getDb()->beginTransaction();

            $sql = "INSERT INTO `leads` (
                `uuid`, `name`, `phone`, `email`, `location`, `service`, `message`,
                `consent_status`, `consent_timestamp`, `submission_source`, `page_url`, `referrer_url`,
                `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`,
                `recaptcha_score`, `status`, `email_sent`, `sheets_synced`, `ip_address`, `user_agent`, `created_at`
            ) VALUES (
                :uuid, :name, :phone, :email, :location, :service, :message,
                :consent_status, :consent_timestamp, :submission_source, :page_url, :referrer_url,
                :utm_source, :utm_medium, :utm_campaign, :utm_term, :utm_content,
                :recaptcha_score, 'new', 0, 0, :ip_address, :user_agent, NOW()
            )";

            $stmt = $this->getDb()->prepare($sql);
            $stmt->execute([
                ':uuid' => $uuid,
                ':name' => $leadData['name'],
                ':phone' => $leadData['phone'],
                ':email' => $leadData['email'],
                ':location' => $leadData['location'],
                ':service' => $leadData['service'],
                ':message' => $leadData['message'],
                ':consent_status' => $leadData['consent_status'] ?? 1,
                ':consent_timestamp' => $leadData['consent_timestamp'] ?? date('Y-m-d H:i:s'),
                ':submission_source' => $leadData['submission_source'] ?? 'contact_page',
                ':page_url' => $leadData['page_url'] ?? null,
                ':referrer_url' => $leadData['referrer_url'] ?? null,
                ':utm_source' => $leadData['utm_source'] ?? null,
                ':utm_medium' => $leadData['utm_medium'] ?? null,
                ':utm_campaign' => $leadData['utm_campaign'] ?? null,
                ':utm_term' => $leadData['utm_term'] ?? null,
                ':utm_content' => $leadData['utm_content'] ?? null,
                ':recaptcha_score' => $leadData['recaptcha_score'] ?? null,
                ':ip_address' => $leadData['ip_address'] ?? null,
                ':user_agent' => $leadData['user_agent'] ?? null,
            ]);

            $leadId = (int)$this->getDb()->lastInsertId();
            $leadData['id'] = $leadId;

            // Initialize transactional outbox for reliable retry queue
            $outboxSql = "INSERT INTO `lead_sync_outbox` (
                `lead_id`, `service_type`, `payload`, `attempts`, `max_attempts`, `next_attempt_at`, `status`
            ) VALUES (:lead_id, :service_type, :payload, 0, 5, NOW(), 'pending')";

            $outboxStmt = $this->getDb()->prepare($outboxSql);
            $jsonPayload = json_encode($leadData);

            // Queue Admin Email task
            $outboxStmt->execute([
                ':lead_id' => $leadId,
                ':service_type' => 'email_admin',
                ':payload' => $jsonPayload,
            ]);

            // Queue Customer Acknowledgement Email task
            $outboxStmt->execute([
                ':lead_id' => $leadId,
                ':service_type' => 'email_customer',
                ':payload' => $jsonPayload,
            ]);

            // Queue Google Sheets task
            $outboxStmt->execute([
                ':lead_id' => $leadId,
                ':service_type' => 'google_sheets',
                ':payload' => $jsonPayload,
            ]);

            $this->getDb()->commit();

            Logger::info('New lead saved to database', [
                'lead_id' => $leadId,
                'uuid' => $uuid,
                'email' => $leadData['email'],
                'service' => $leadData['service']
            ]);

            return $leadData;
        } catch (Throwable $e) {
            if ($this->getDb()->inTransaction()) {
                $this->getDb()->rollBack();
            }
            Logger::critical('Failed to save lead in database', [
                'error' => $e->getMessage(),
                'email' => $leadData['email'] ?? 'unknown',
            ]);
            throw new RuntimeException('Failed to record inquiry into database.');
        }
    }

    /**
     * Update lead's email_sent flag.
     */
    public function updateEmailStatus(int $leadId, bool $sent): void
    {
        try {
            $stmt = $this->getDb()->prepare("UPDATE `leads` SET `email_sent` = :sent WHERE `id` = :id");
            $stmt->execute([':sent' => $sent ? 1 : 0, ':id' => $leadId]);
        } catch (Throwable $e) {
            Logger::error('Failed to update lead email_sent flag', ['lead_id' => $leadId, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Update lead's sheets_synced flag.
     */
    public function updateSheetsStatus(int $leadId, bool $synced): void
    {
        try {
            $stmt = $this->getDb()->prepare("UPDATE `leads` SET `sheets_synced` = :synced WHERE `id` = :id");
            $stmt->execute([':synced' => $synced ? 1 : 0, ':id' => $leadId]);
        } catch (Throwable $e) {
            Logger::error('Failed to update lead sheets_synced flag', ['lead_id' => $leadId, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Mark an outbox item as completed.
     */
    public function markOutboxItemCompleted(int $leadId, string $serviceType): void
    {
        try {
            $stmt = $this->getDb()->prepare(
                "UPDATE `lead_sync_outbox` 
                 SET `status` = 'completed', `last_attempt_at` = NOW() 
                 WHERE `lead_id` = :lead_id AND `service_type` = :service_type"
            );
            $stmt->execute([':lead_id' => $leadId, ':service_type' => $serviceType]);
        } catch (Throwable $e) {
            Logger::error('Failed to mark outbox item completed', ['lead_id' => $leadId, 'type' => $serviceType, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Record failure on an outbox item and increment attempts.
     */
    public function recordOutboxItemFailure(int $leadId, string $serviceType, string $errorMessage): void
    {
        try {
            // Exponential backoff: retry in 2^(attempts) * 2 minutes
            $stmt = $this->getDb()->prepare(
                "UPDATE `lead_sync_outbox` 
                 SET `attempts` = `attempts` + 1,
                     `last_attempt_at` = NOW(),
                     `next_attempt_at` = DATE_ADD(NOW(), INTERVAL (POWER(2, `attempts` + 1) * 2) MINUTE),
                     `status` = CASE WHEN `attempts` + 1 >= `max_attempts` THEN 'failed' ELSE 'pending' END,
                     `error_message` = :error_msg 
                 WHERE `lead_id` = :lead_id AND `service_type` = :service_type"
            );
            $stmt->execute([
                ':error_msg' => mb_substr($errorMessage, 0, 1000, 'UTF-8'),
                ':lead_id' => $leadId,
                ':service_type' => $serviceType,
            ]);
        } catch (Throwable $e) {
            Logger::error('Failed to record outbox item failure', ['lead_id' => $leadId, 'type' => $serviceType, 'error' => $e->getMessage()]);
        }
    }

    /**
     * Fetch lead record by its public UUID.
     */
    public function findByUuid(string $uuid): ?array
    {
        try {
            $stmt = $this->getDb()->prepare("SELECT * FROM `leads` WHERE `uuid` = :uuid LIMIT 1");
            $stmt->execute([':uuid' => $uuid]);
            $res = $stmt->fetch();
            return $res !== false ? $res : null;
        } catch (Throwable $e) {
            Logger::error('Failed to find lead by UUID', ['uuid' => $uuid, 'error' => $e->getMessage()]);
            return null;
        }
    }
}
