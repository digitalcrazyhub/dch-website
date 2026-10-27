<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Validation;

/**
 * Class ProfileDownloadValidator
 * Strict server-side validation for Company Profile download lead capture.
 * Enforces 5 required fields: Name, 10-digit Indian Mobile Phone, Email, Location, Consent.
 */
final class ProfileDownloadValidator
{
    public const MAX_NAME_LENGTH = 100;
    public const MIN_NAME_LENGTH = 2;
    public const MAX_EMAIL_LENGTH = 150;
    public const MIN_LOCATION_LENGTH = 2;
    public const MAX_LOCATION_LENGTH = 120;

    /**
     * Validate raw input and return array of sanitized data or field-level errors.
     *
     * @param array<string, mixed> $input
     * @return array{isValid: bool, errors: array<string, string>, data: array<string, mixed>}
     */
    public static function validate(array $input): array
    {
        $errors = [];
        $sanitized = [];

        // 1. Name validation
        $rawName = isset($input['name']) && is_scalar($input['name']) ? trim((string)$input['name']) : '';
        if ($rawName === '') {
            $errors['name'] = 'Full name is required.';
        } elseif (mb_strlen($rawName, 'UTF-8') < self::MIN_NAME_LENGTH) {
            $errors['name'] = sprintf('Name must be at least %d characters.', self::MIN_NAME_LENGTH);
        } elseif (mb_strlen($rawName, 'UTF-8') > self::MAX_NAME_LENGTH) {
            $errors['name'] = sprintf('Name cannot exceed %d characters.', self::MAX_NAME_LENGTH);
        } elseif (!preg_match('/^[\p{L}\p{M}\s.\'\-]+$/u', $rawName)) {
            $errors['name'] = 'Please enter a valid name using letters and standard punctuation only.';
        } else {
            $sanitized['name'] = preg_replace('/\s+/', ' ', $rawName);
        }

        // 2. Phone validation (Strict 10-digit Indian Mobile Number without prefixes)
        $rawPhone = isset($input['phone']) && is_scalar($input['phone']) ? trim((string)$input['phone']) : '';
        if ($rawPhone === '') {
            $errors['phone'] = 'Phone number is required.';
        } elseif (!preg_match('/^\d+$/', $rawPhone)) {
            $errors['phone'] = 'Phone number must contain numeric digits only (no spaces, letters, or symbols).';
        } elseif (strlen($rawPhone) !== 10) {
            $errors['phone'] = 'Please enter a valid 10-digit Indian mobile number.';
        } elseif (!preg_match('/^[6-9]\d{9}$/', $rawPhone)) {
            $errors['phone'] = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
        } else {
            $sanitized['phone'] = $rawPhone;
        }

        // 3. Email validation
        $rawEmail = isset($input['email']) && is_scalar($input['email']) ? trim((string)$input['email']) : '';
        if ($rawEmail === '') {
            $errors['email'] = 'Email address is required.';
        } elseif (mb_strlen($rawEmail, 'UTF-8') > self::MAX_EMAIL_LENGTH) {
            $errors['email'] = sprintf('Email address cannot exceed %d characters.', self::MAX_EMAIL_LENGTH);
        } elseif (!filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please enter a valid email address.';
        } else {
            $sanitized['email'] = strtolower($rawEmail);
        }

        // 4. Location validation
        $rawLocation = isset($input['location']) && is_scalar($input['location']) ? trim((string)$input['location']) : '';
        if ($rawLocation === '') {
            $errors['location'] = 'Location (city, state, or area) is required.';
        } elseif (mb_strlen($rawLocation, 'UTF-8') < self::MIN_LOCATION_LENGTH) {
            $errors['location'] = sprintf('Location must be at least %d characters.', self::MIN_LOCATION_LENGTH);
        } elseif (mb_strlen($rawLocation, 'UTF-8') > self::MAX_LOCATION_LENGTH) {
            $errors['location'] = sprintf('Location cannot exceed %d characters.', self::MAX_LOCATION_LENGTH);
        } else {
            $sanitized['location'] = preg_replace('/\s+/', ' ', $rawLocation);
        }

        // 5. Consent checkbox
        $rawConsent = $input['consent'] ?? null;
        $isConsented = false;
        if (is_bool($rawConsent) && $rawConsent === true) {
            $isConsented = true;
        } elseif (is_scalar($rawConsent)) {
            $strConsent = strtolower(trim((string)$rawConsent));
            if (in_array($strConsent, ['1', 'true', 'on', 'yes'], true)) {
                $isConsented = true;
            }
        }

        if (!$isConsented) {
            $errors['consent'] = 'You must agree to share your details for company profile access.';
        } else {
            $sanitized['consent_status'] = 1;
            $sanitized['consent_timestamp'] = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d H:i:s');
        }

        return [
            'isValid' => empty($errors),
            'errors' => $errors,
            'data' => $sanitized,
        ];
    }
}
