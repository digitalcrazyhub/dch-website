-- ==============================================================================
-- Digital Crazy Hub - Production MySQL Lead Management Database Schema
-- File: backend/database/schema.sql
-- Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Compatible with MySQL 8.0+ and MariaDB 10.5+
-- ==============================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `dch_db`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `dch_db`;

-- ==============================================================================
-- 2. Table: leads
-- Primary repository of customer enquiries and campaign attribution data
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `leads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL COMMENT 'Public unguessable reference identifier (UUID v4)',
  `name` VARCHAR(100) NOT NULL COMMENT 'Full name of customer',
  `phone` VARCHAR(30) NOT NULL COMMENT 'Customer telephone in international format',
  `email` VARCHAR(150) NOT NULL COMMENT 'Customer contact email address',
  `location` VARCHAR(120) NOT NULL COMMENT 'City, state, or business operating area',
  `service` VARCHAR(60) NOT NULL COMMENT 'Requested service from approved service manifest',
  `message` TEXT NOT NULL COMMENT 'Plain-text business inquiry requirements',
  `consent_status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = explicit consent granted, 0 = no consent',
  `consent_timestamp` DATETIME NOT NULL COMMENT 'Exact UTC timestamp when consent was affirmed',
  `submission_source` VARCHAR(50) NOT NULL DEFAULT 'contact_page' COMMENT 'Origin page identifier',
  `page_url` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Full URL where form was submitted',
  `referrer_url` VARCHAR(255) NULL DEFAULT NULL COMMENT 'HTTP referrer tracking',
  `utm_source` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Google/Meta campaign source',
  `utm_medium` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Campaign medium (cpc, social, organic)',
  `utm_campaign` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Campaign name',
  `utm_term` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Targeted search keyword',
  `utm_content` VARCHAR(100) NULL DEFAULT NULL COMMENT 'Ad creative identifier',
  `recaptcha_score` DECIMAL(3, 2) NULL DEFAULT NULL COMMENT 'Google reCAPTCHA v3 confidence score (0.00 to 1.00)',
  `status` ENUM('new', 'contacted', 'qualified', 'closed', 'spam') NOT NULL DEFAULT 'new' COMMENT 'Internal sales workflow state',
  `email_sent` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = internal notification sent successfully',
  `sheets_synced` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = row added to Google Sheet',
  `ip_address` VARCHAR(45) NULL DEFAULT NULL COMMENT 'IPv4 / IPv6 client address for abuse prevention',
  `user_agent` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Browser user agent string',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_leads_uuid` (`uuid`),
  KEY `idx_leads_created_at` (`created_at`),
  KEY `idx_leads_email` (`email`),
  KEY `idx_leads_phone` (`phone`),
  KEY `idx_leads_service` (`service`),
  KEY `idx_leads_status` (`status`),
  KEY `idx_leads_sheets_synced` (`sheets_synced`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Digital Crazy Hub verified client inquiries';

-- ==============================================================================
-- 3. Table: lead_sync_outbox
-- Transactional outbox for retrying failed external communications (SMTP & Google Sheets)
-- Guarantees zero lead loss if an external API is temporarily down
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `lead_sync_outbox` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `lead_id` BIGINT UNSIGNED NOT NULL COMMENT 'Foreign key to leads table',
  `service_type` ENUM('email_admin', 'email_customer', 'google_sheets') NOT NULL COMMENT 'Target integration service',
  `payload` JSON NOT NULL COMMENT 'Serialized data payload required to execute the action',
  `attempts` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Number of attempts executed so far',
  `max_attempts` TINYINT UNSIGNED NOT NULL DEFAULT 5 COMMENT 'Maximum retry limit before manual escalation',
  `last_attempt_at` DATETIME NULL DEFAULT NULL COMMENT 'Timestamp of most recent attempt',
  `next_attempt_at` DATETIME NOT NULL COMMENT 'Earliest timestamp for next retry execution',
  `status` ENUM('pending', 'failed', 'completed') NOT NULL DEFAULT 'pending' COMMENT 'Queue state',
  `error_message` TEXT NULL DEFAULT NULL COMMENT 'Last error recorded during execution',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_outbox_queue` (`status`, `next_attempt_at`),
  KEY `idx_outbox_lead_id` (`lead_id`),
  CONSTRAINT `fk_outbox_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Reliable retry queue for external service integrations';

-- ==============================================================================
-- 4. Table: company_profile_downloads
-- Tracks visitor leads captured before authorized download of company profile PDF
-- ==============================================================================
CREATE TABLE IF NOT EXISTS `company_profile_downloads` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` CHAR(36) NOT NULL COMMENT 'Public reference identifier (UUID v4)',
  `name` VARCHAR(100) NOT NULL COMMENT 'Lead full name',
  `phone` VARCHAR(15) NOT NULL COMMENT 'Lead 10-digit Indian mobile number',
  `email` VARCHAR(150) NOT NULL COMMENT 'Lead contact email address',
  `location` VARCHAR(120) NOT NULL COMMENT 'Lead city, state, or country',
  `consent_status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = explicit consent granted',
  `consent_timestamp` DATETIME NOT NULL COMMENT 'UTC timestamp when consent was granted',
  `download_token_hash` CHAR(64) NOT NULL COMMENT 'SHA-256 hash of single-use authorization token',
  `download_token_expires_at` DATETIME NOT NULL COMMENT 'Expiration timestamp for download token',
  `download_token_used_at` DATETIME NULL DEFAULT NULL COMMENT 'Timestamp when token was consumed to download PDF',
  `ip_address` VARCHAR(45) NULL DEFAULT NULL COMMENT 'IPv4 / IPv6 client address',
  `user_agent` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Browser user agent string',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_profile_token_hash` (`download_token_hash`),
  UNIQUE KEY `uk_profile_uuid` (`uuid`),
  KEY `idx_profile_token_lookup` (`download_token_hash`, `download_token_expires_at`, `download_token_used_at`),
  KEY `idx_profile_created_at` (`created_at`),
  KEY `idx_profile_phone` (`phone`),
  KEY `idx_profile_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Secure company profile download leads and authorization tokens';

