<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Validation;

/**
 * Class ContactValidator
 * Strict server-side validation for Digital Crazy Hub lead inquiries.
 */
final class ContactValidator
{
    /**
     * Official approved service list for Digital Crazy Hub.
     */
    public const APPROVED_SERVICES = [
        'Social Media Marketing',
        'Google Ads',
        'SEO Services',
        'Web & App Development',
        'Personal Branding',
        'Lead Generation',
        'Content Marketing',
        'Ad Poster & Video Making',
    ];

    public const MAX_NAME_LENGTH = 100;
    public const MIN_NAME_LENGTH = 2;
    public const MAX_EMAIL_LENGTH = 150;
    public const MIN_LOCATION_LENGTH = 2;
    public const MAX_LOCATION_LENGTH = 120;
    public const MIN_MESSAGE_LENGTH = 10;
    public const MAX_MESSAGE_LENGTH = 3000;

    /**
     * Validate raw input and return array of sanitized data or errors.
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
            $errors['name'] = 'Name contains invalid characters. Please use letters and standard punctuation only.';
        } else {
            $sanitized['name'] = preg_replace('/\s+/', ' ', $rawName);
        }

        // 2. Phone validation
        $rawPhone = isset($input['phone']) && is_scalar($input['phone']) ? trim((string)$input['phone']) : '';
        if ($rawPhone === '') {
            $errors['phone'] = 'Phone number is required.';
        } elseif (preg_match('/[a-zA-Z]/', $rawPhone)) {
            $errors['phone'] = 'Phone number cannot contain alphabetic characters.';
        } else {
            $normalizedPhone = self::normalizePhoneNumber($rawPhone);
            if (!self::isValidInternationalPhone($normalizedPhone)) {
                $errors['phone'] = 'Please enter a valid international phone number (e.g. +91 96592 39187 or +1 415 555 2671).';
            } else {
                $sanitized['phone'] = $normalizedPhone;
                $sanitized['raw_phone'] = $rawPhone;
            }
        }

        // 3. Email validation
        $rawEmail = isset($input['email']) && is_scalar($input['email']) ? trim((string)$input['email']) : '';
        if ($rawEmail === '') {
            $errors['email'] = 'Email address is required.';
        } elseif (mb_strlen($rawEmail, 'UTF-8') > self::MAX_EMAIL_LENGTH) {
            $errors['email'] = sprintf('Email address cannot exceed %d characters.', self::MAX_EMAIL_LENGTH);
        } elseif (!filter_var($rawEmail, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'Please provide a valid email address.';
        } else {
            $sanitized['email'] = strtolower($rawEmail);
        }

        // 4. Location validation
        $rawLocation = isset($input['location']) && is_scalar($input['location']) ? trim((string)$input['location']) : '';
        if ($rawLocation === '') {
            $errors['location'] = 'Location (city/region) is required.';
        } elseif (mb_strlen($rawLocation, 'UTF-8') < self::MIN_LOCATION_LENGTH) {
            $errors['location'] = sprintf('Location must be at least %d characters.', self::MIN_LOCATION_LENGTH);
        } elseif (mb_strlen($rawLocation, 'UTF-8') > self::MAX_LOCATION_LENGTH) {
            $errors['location'] = sprintf('Location cannot exceed %d characters.', self::MAX_LOCATION_LENGTH);
        } else {
            $sanitized['location'] = preg_replace('/\s+/', ' ', $rawLocation);
        }

        // 5. Service validation
        $rawService = isset($input['service']) && is_scalar($input['service']) ? trim((string)$input['service']) : '';
        if ($rawService === '') {
            $errors['service'] = 'Please select a service of interest.';
        } elseif (!in_array($rawService, self::APPROVED_SERVICES, true)) {
            $errors['service'] = 'Invalid service selection. Please choose one from the approved services list.';
        } else {
            $sanitized['service'] = $rawService;
        }

        // 6. Message validation
        $rawMessage = isset($input['message']) && is_scalar($input['message']) ? trim((string)$input['message']) : '';
        if ($rawMessage === '') {
            $errors['message'] = 'Message is required. Please tell us about your project requirements.';
        } elseif (mb_strlen($rawMessage, 'UTF-8') < self::MIN_MESSAGE_LENGTH) {
            $errors['message'] = sprintf('Message must be at least %d characters.', self::MIN_MESSAGE_LENGTH);
        } elseif (mb_strlen($rawMessage, 'UTF-8') > self::MAX_MESSAGE_LENGTH) {
            $errors['message'] = sprintf('Message cannot exceed %d characters.', self::MAX_MESSAGE_LENGTH);
        } else {
            // Store as clean plain text
            $sanitized['message'] = strip_tags($rawMessage);
        }

        // 7. Consent checkbox
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
            $errors['consent'] = 'You must agree to our privacy policy and consent to contact before submitting.';
        } else {
            $sanitized['consent_status'] = 1;
            $sanitized['consent_timestamp'] = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('Y-m-d H:i:s');
        }

        // Optional tracking / context fields
        $sanitized['recaptcha_token'] = isset($input['recaptcha_token']) && is_scalar($input['recaptcha_token']) ? trim((string)$input['recaptcha_token']) : '';
        $sanitized['submission_source'] = isset($input['submission_source']) && is_scalar($input['submission_source']) ? mb_substr(trim((string)$input['submission_source']), 0, 50, 'UTF-8') : 'contact_page';
        $sanitized['page_url'] = isset($input['page_url']) && is_scalar($input['page_url']) ? mb_substr(trim((string)$input['page_url']), 0, 255, 'UTF-8') : null;
        $sanitized['referrer_url'] = isset($input['referrer_url']) && is_scalar($input['referrer_url']) ? mb_substr(trim((string)$input['referrer_url']), 0, 255, 'UTF-8') : null;

        // UTM parameters
        $utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        foreach ($utmKeys as $key) {
            $sanitized[$key] = isset($input[$key]) && is_scalar($input[$key]) ? mb_substr(trim((string)$input[$key]), 0, 100, 'UTF-8') : null;
        }

        return [
            'isValid' => empty($errors),
            'errors' => $errors,
            'data' => $sanitized,
        ];
    }

    /**
     * Normalize an international telephone number.
     * Preserves leading '+' if present and strips spaces, hyphens, and parentheses.
     */
    public static function normalizePhoneNumber(string $phone): string
    {
        $trimmed = trim($phone);
        $hasPlus = str_starts_with($trimmed, '+');
        $digitsOnly = preg_replace('/[^\d]/', '', $trimmed) ?? '';

        return ($hasPlus ? '+' : '') . $digitsOnly;
    }

    /**
     * Validate an international telephone number format.
     * Allows 7 to 18 digits (ITU-T E.164 standard recommends up to 15 digits, allowing 18 for extensions).
     */
    public static function isValidInternationalPhone(string $normalized): bool
    {
        return (bool)preg_match('/^\+?[0-9]{7,18}$/', $normalized);
    }
}
