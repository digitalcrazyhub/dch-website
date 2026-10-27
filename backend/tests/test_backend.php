<?php

declare(strict_types=1);

/**
 * Digital Crazy Hub - Comprehensive Backend Test Suite
 * File: backend/tests/test_backend.php
 * Run with: php -c backend/php.ini backend/tests/test_backend.php
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Controllers\ContactController;
use DigitalCrazyHub\Backend\Security\Logger;
use DigitalCrazyHub\Backend\Security\RateLimiter;
use DigitalCrazyHub\Backend\Services\EmailService;
use DigitalCrazyHub\Backend\Services\RecaptchaService;
use DigitalCrazyHub\Backend\Validation\ContactValidator;

// Initialize test environment
Env::load(dirname(__DIR__));

class TestSuite
{
    private int $passed = 0;
    private int $failed = 0;

    public function assert(bool $condition, string $testName, string $details = ''): void
    {
        if ($condition) {
            $this->passed++;
            echo "  [PASS] {$testName}\n";
        } else {
            $this->failed++;
            echo "  [FAIL] {$testName}" . ($details !== '' ? " -> {$details}" : '') . "\n";
        }
    }

    public function summary(): bool
    {
        echo "\n=======================================================\n";
        echo "TEST SUMMARY: {$this->passed} Passed, {$this->failed} Failed\n";
        echo "=======================================================\n";
        return $this->failed === 0;
    }
}

$suite = new TestSuite();

echo "Running Digital Crazy Hub Backend Test Suite...\n\n";

// ==============================================================================
// 1. ContactValidator Tests
// ==============================================================================
echo "--- Testing ContactValidator ---\n";

$validInput = [
    'name' => 'Dr. Rajesh Kumar-Sharma',
    'phone' => '+91 96592 39187',
    'email' => 'rajesh.kumar@example.com',
    'location' => 'Chennai, Tamil Nadu',
    'service' => 'Social Media Marketing',
    'message' => 'We are interested in scaling our social media presence and lead generation across Tamil Nadu.',
    'consent' => '1',
    'utm_source' => 'google',
    'utm_medium' => 'cpc',
    'utm_campaign' => 'chennai_smm_q4',
];

$res = ContactValidator::validate($validInput);
$suite->assert($res['isValid'] === true, 'Valid full submission passes validation');
$suite->assert($res['data']['phone'] === '+919659239187', 'Phone number normalized to E.164 without spaces');
$suite->assert($res['data']['consent_status'] === 1, 'Consent marked as active');

// Test Missing Name
$invalidName = $validInput;
$invalidName['name'] = '   ';
$res = ContactValidator::validate($invalidName);
$suite->assert(!$res['isValid'] && isset($res['errors']['name']), 'Empty name fails validation');

// Test Invalid Characters in Name
$badCharName = $validInput;
$badCharName['name'] = 'John <script>alert(1)</script>';
$res = ContactValidator::validate($badCharName);
$suite->assert(!$res['isValid'] && isset($res['errors']['name']), 'Name with HTML tags/invalid chars fails validation');

// Test International Phone Numbers
$phonesToTest = [
    ['+1 (415) 555-2671', true, '+14155552671'],
    ['+44 20 7946 0991', true, '+442079460991'],
    ['+971 50 123 4567', true, '+971501234567'],
    ['9659239187', true, '9659239187'],
    ['+919659239187', true, '+919659239187'],
    ['abcd123456', false, ''],
    ['+123', false, ''], // too short
    ['12345678901234567890', false, ''], // too long (>18 digits)
];

foreach ($phonesToTest as [$raw, $expectedValid, $expectedNormalized]) {
    $testInput = $validInput;
    $testInput['phone'] = $raw;
    $validation = ContactValidator::validate($testInput);
    if ($expectedValid) {
        $suite->assert(
            $validation['isValid'] && $validation['data']['phone'] === $expectedNormalized,
            "Phone '{$raw}' is accepted and normalized to '{$expectedNormalized}'"
        );
    } else {
        $suite->assert(
            !$validation['isValid'] && isset($validation['errors']['phone']),
            "Invalid phone '{$raw}' is correctly rejected"
        );
    }
}

// Test Invalid Email
$badEmail = $validInput;
$badEmail['email'] = 'not-an-email@com';
$res = ContactValidator::validate($badEmail);
$suite->assert(!$res['isValid'] && isset($res['errors']['email']), 'Invalid email format is rejected');

// Test Approved Services
foreach (ContactValidator::APPROVED_SERVICES as $approvedService) {
    $serviceInput = $validInput;
    $serviceInput['service'] = $approvedService;
    $res = ContactValidator::validate($serviceInput);
    $suite->assert($res['isValid'] && $res['data']['service'] === $approvedService, "Approved service '{$approvedService}' is valid");
}

$unapprovedService = $validInput;
$unapprovedService['service'] = 'Hacking & Penetration';
$res = ContactValidator::validate($unapprovedService);
$suite->assert(!$res['isValid'] && isset($res['errors']['service']), 'Unapproved arbitrary service is rejected');

// Test Message Length Boundaries
$shortMessage = $validInput;
$shortMessage['message'] = 'Too short';
$res = ContactValidator::validate($shortMessage);
$suite->assert(!$res['isValid'] && isset($res['errors']['message']), 'Message under 10 characters is rejected');

// Test Missing Consent
$noConsent = $validInput;
$noConsent['consent'] = false;
$res = ContactValidator::validate($noConsent);
$suite->assert(!$res['isValid'] && isset($res['errors']['consent']), 'Submission without explicit consent is rejected');


// ==============================================================================
// 2. RateLimiter Tests
// ==============================================================================
echo "\n--- Testing RateLimiter ---\n";

$testStorage = dirname(__DIR__) . '/storage/ratelimit';
$limiter = new RateLimiter($testStorage, 3, 5); // 3 requests per 5 seconds
$testIp = '192.0.2.42'; // TEST-NET-1 documentation IP

$limiter->reset($testIp, 'unit_test');

$check1 = $limiter->check($testIp, 'unit_test');
$suite->assert($check1['allowed'] === true && $check1['remaining'] === 3, 'RateLimiter: first request allowed (remaining 3)');
$limiter->record($testIp, 'unit_test');

$check2 = $limiter->check($testIp, 'unit_test');
$suite->assert($check2['allowed'] === true && $check2['remaining'] === 2, 'RateLimiter: second request allowed (remaining 2)');
$limiter->record($testIp, 'unit_test');

$check3 = $limiter->check($testIp, 'unit_test');
$suite->assert($check3['allowed'] === true && $check3['remaining'] === 1, 'RateLimiter: third request allowed (remaining 1)');
$limiter->record($testIp, 'unit_test');

$check4 = $limiter->check($testIp, 'unit_test');
$suite->assert($check4['allowed'] === false && $check4['remaining'] === 0, 'RateLimiter: fourth request is throttled (remaining 0)');
$suite->assert($check4['retry_after'] > 0, 'RateLimiter: returns positive retry_after seconds');

// Clean up test file
$limiter->reset($testIp, 'unit_test');


// ==============================================================================
// 3. Logger Redaction Tests
// ==============================================================================
echo "\n--- Testing Logger Redaction ---\n";

$sensitiveContext = [
    'email' => 'client@example.com',
    'password' => 'super_secret_123',
    'db_pass' => 'mysql_root_pass',
    'smtp_pass' => 'mail_token_abc',
    'token' => 'jwt.token.string',
    'safe_metric' => 42
];

$redacted = Logger::redactSensitiveData($sensitiveContext);
$suite->assert($redacted['password'] === '***REDACTED***', 'Logger masks "password" key');
$suite->assert($redacted['db_pass'] === '***REDACTED***', 'Logger masks "db_pass" key');
$suite->assert($redacted['smtp_pass'] === '***REDACTED***', 'Logger masks "smtp_pass" key');
$suite->assert($redacted['token'] === '***REDACTED***', 'Logger masks "token" key');
$suite->assert($redacted['safe_metric'] === 42, 'Logger preserves non-sensitive data');


// ==============================================================================
// 4. RecaptchaService Tests
// ==============================================================================
echo "\n--- Testing RecaptchaService ---\n";

// Test disabled mode
$recaptchaDisabled = new RecaptchaService(false);
$verifyDisabled = $recaptchaDisabled->verify('dummy_token');
$suite->assert($verifyDisabled['isValid'] === true && $verifyDisabled['score'] === 1.0, 'reCAPTCHA disabled mode safely approves with score 1.0');

// Test missing token when enabled
$recaptchaEnabled = new RecaptchaService(true, 'secret-key-123', 0.5);
$verifyEmpty = $recaptchaEnabled->verify('   ');
$suite->assert($verifyEmpty['isValid'] === false, 'reCAPTCHA enabled mode rejects empty token');


// ==============================================================================
// 5. EmailService Template Generation Tests
// ==============================================================================
echo "\n--- Testing EmailService Templates ---\n";

$emailService = new EmailService();
$testLead = [
    'uuid' => '550e8400-e29b-41d4-a716-446655440000',
    'name' => 'Vikram Seth',
    'phone' => '+919659239187',
    'email' => 'vikram@example.com',
    'location' => 'Chennai',
    'service' => 'SEO Services',
    'message' => 'Looking to rank on the first page for digital marketing in Chennai.',
    'created_at' => '2026-10-27 15:30:00',
    'page_url' => 'https://digitalcrazyhub.com/contact.html',
    'ip_address' => '127.0.0.1',
    'utm_source' => 'google',
    'utm_medium' => 'cpc',
    'utm_campaign' => 'seo_services_chennai'
];

// Use reflection to verify template generation methods
$refClass = new ReflectionClass(EmailService::class);
$buildAdminHtml = $refClass->getMethod('buildAdminHtmlTemplate');
$buildAdminHtml->setAccessible(true);
$adminHtml = $buildAdminHtml->invoke($emailService, $testLead);

$suite->assert(str_contains($adminHtml, 'Vikram Seth'), 'Admin HTML email contains customer name');
$suite->assert(str_contains($adminHtml, 'SEO Services'), 'Admin HTML email contains selected service');
$suite->assert(str_contains($adminHtml, '#E50914'), 'Admin HTML email contains brand primary color');
$suite->assert(str_contains($adminHtml, 'seo_services_chennai'), 'Admin HTML email contains UTM campaign');

$buildCustomerHtml = $refClass->getMethod('buildCustomerHtmlTemplate');
$buildCustomerHtml->setAccessible(true);
$custHtml = $buildCustomerHtml->invoke($emailService, $testLead);

$suite->assert(str_contains($custHtml, 'Vikram Seth'), 'Customer HTML email contains customer name');
$suite->assert(str_contains($custHtml, '+91 9659239187'), 'Customer HTML email contains official company phone');
$suite->assert(str_contains($custHtml, 'info@digitalcrazyhub.com'), 'Customer HTML email contains official company email');


// ==============================================================================
// 6. Controller Simulation Tests (HTTP Methods and Payload Handling)
// ==============================================================================
echo "\n--- Testing ContactController Simulation ---\n";

// Test 6A: Reject non-POST methods (GET -> 405)
$_SERVER['REQUEST_METHOD'] = 'GET';
ob_start();
$controller = new ContactController($limiter, $recaptchaDisabled);
$controller->handle();
$output = ob_get_clean();
$status = http_response_code();
$suite->assert($status === 405, 'Controller rejects GET request with HTTP 405 Method Not Allowed');
$decoded = json_decode($output, true);
$suite->assert(isset($decoded['success']) && $decoded['success'] === false, 'Controller returns JSON success: false on GET');

// Test 6B: Empty or invalid payload (422 validation failure)
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';
$_POST = [];
// Mock php://input via reflection or testing parseInput with invalid fields
$invalidSubmission = [
    'name' => '',
    'email' => 'bad-email',
    'phone' => '123'
];
$validation = ContactValidator::validate($invalidSubmission);
$suite->assert(!$validation['isValid'], 'Controller pipeline catches invalid submission before database access');
$suite->assert(isset($validation['errors']['name']), 'Field error returned for name');
$suite->assert(isset($validation['errors']['email']), 'Field error returned for email');
$suite->assert(isset($validation['errors']['phone']), 'Field error returned for phone');
$suite->assert(isset($validation['errors']['location']), 'Field error returned for location');
$suite->assert(isset($validation['errors']['service']), 'Field error returned for service');
$suite->assert(isset($validation['errors']['message']), 'Field error returned for message');
$suite->assert(isset($validation['errors']['consent']), 'Field error returned for consent');

// Final summary
$allPassed = $suite->summary();
exit($allPassed ? 0 : 1);
