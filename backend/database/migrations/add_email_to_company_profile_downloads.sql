-- ==============================================================================
-- Migration: Add email column to company_profile_downloads
-- File: backend/database/migrations/add_email_to_company_profile_downloads.sql
-- ==============================================================================

USE `u338618600_webcontacpage`;

ALTER TABLE `company_profile_downloads`
  ADD COLUMN `email` VARCHAR(150) NOT NULL AFTER `phone`,
  ADD KEY `idx_profile_email` (`email`);
