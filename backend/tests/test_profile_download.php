<?php

declare(strict_types=1);

/**
 * Digital Crazy Hub - Company Profile Download Tests
 * File: backend/tests/test_profile_download.php
 * Verifies:
 * - 5 required fields (Name, 10-digit Indian Mobile Phone, Email, Location, Consent)
 * - Strict 10-digit phone validation (no country code dropdown, no prefixes)
 * - Server-side RFC email validation & database persistence
 * - Atomic single-use token generation & PDF streaming
 */

require_once dirname(__DIR__) . '/vendor/autoload.php';

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Controllers\ProfileDownloadController;
use DigitalCrazyHub\Backend\Repositories\ProfileDownloadRepository;
use DigitalCrazyHub\Backend\Validation\ProfileDownloadValidator;

Env::load(dirname(__DIR__));

class ProfileTestSuite
{
    private int $passed = 0;
    private int $failed = 0;

    public function assert(bool $cond, string $name, string $details = ''): void
    {
        if ($cond) {
            $this->passed++;
            echo "  [PASS] {$name}\n";
        } else {
            $this->failed++;
            echo "  [FAIL] {$name}" . ($details !== '' ? " -> {$details}" : '') . "\n";
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

$suite = new ProfileTestSuite();

echo "Running Company Profile Download Backend Test Suite...\n\n";

// ==============================================================================
// 1. Validator Tests
// ==============================================================================
echo "--- Testing ProfileDownloadValidator (5 Required Fields) ---\n";

$valid = [
    'name' => 'Kavitha Ramachandran',
    'phone' => '9659239187',
    'email' => 'kavitha@example.com',
    'location' => 'Chennai, Tamil Nadu',
    'consent' => true
];

$res = ProfileDownloadValidator::validate($valid);
$suite->assert($res['isValid'] === true, 'Valid 5-field profile download input passes');
$suite->assert($res['data']['phone'] === '9659239187', 'Phone is plain 10 digits without prefixes');
$suite->assert($res['data']['email'] === 'kavitha@example.com', 'Email is sanitized and preserved');
$suite->assert($res['data']['consent_status'] === 1, 'Consent is recorded as 1');

// Test Missing Name
$badName = $valid;
$badName['name'] = ' ';
$res = ProfileDownloadValidator::validate($badName);
$suite->assert(!$res['isValid'] && isset($res['errors']['name']), 'Empty name is rejected');

// Test Strict 10-Digit Phone Numbers (Indian mobile policy)
$phones = [
    ['9659239187', true],   // starts with 9
    ['8765432109', true],   // starts with 8
    ['7654321098', true],   // starts with 7
    ['6543210987', true],   // starts with 6
    ['+919659239187', false], // country code prefix prohibited
    ['+14155552671', false],  // foreign country code prohibited
    ['96592 39187', false],   // spaces prohibited
    ['96592-39187', false],   // hyphens prohibited
    ['965923918', false],     // 9 digits (too short)
    ['96592391870', false],   // 11 digits (too long)
    ['1234567890', false],    // invalid leading digit (does not start with 6-9)
    ['abcdefghij', false],    // alphabetic characters prohibited
];

foreach ($phones as [$p, $expectedValid]) {
    $inp = $valid;
    $inp['phone'] = $p;
    $v = ProfileDownloadValidator::validate($inp);
    if ($expectedValid) {
        $suite->assert($v['isValid'] && $v['data']['phone'] === $p, "10-digit Indian phone '{$p}' is accepted");
    } else {
        $suite->assert(!$v['isValid'] && isset($v['errors']['phone']), "Invalid phone '{$p}' is rejected");
    }
}

// Test Email Validation
$emails = [
    ['praveen.kumar@digitalcrazyhub.com', true],
    ['client@sub.domain.co.in', true],
    ['not-an-email', false],
    ['missing-at.com', false],
    ['', false],
];

foreach ($emails as [$em, $expectedValid]) {
    $inp = $valid;
    $inp['email'] = $em;
    $v = ProfileDownloadValidator::validate($inp);
    if ($expectedValid) {
        $suite->assert($v['isValid'] && $v['data']['email'] === strtolower($em), "Valid email '{$em}' is accepted");
    } else {
        $suite->assert(!$v['isValid'] && isset($v['errors']['email']), "Invalid email '{$em}' is rejected");
    }
}

// Test Missing Location
$badLoc = $valid;
$badLoc['location'] = '';
$res = ProfileDownloadValidator::validate($badLoc);
$suite->assert(!$res['isValid'] && isset($res['errors']['location']), 'Missing location rejected');

// Test Missing Consent
$badConsent = $valid;
$badConsent['consent'] = false;
$res = ProfileDownloadValidator::validate($badConsent);
$suite->assert(!$res['isValid'] && isset($res['errors']['consent']), 'Unchecked consent rejected');


// ==============================================================================
// 2. Private PDF File Verification
// ==============================================================================
echo "\n--- Testing Private PDF File Storage ---\n";
$pdfPath = dirname(__DIR__) . '/storage/documents/digital-crazy-hub-company-profile.pdf';
$suite->assert(file_exists($pdfPath), 'Private company profile PDF exists in backend/storage/documents');
$suite->assert(filesize($pdfPath) > 1000000, 'Private PDF has valid size (> 1MB)');

$publicPdf = dirname(__DIR__, 2) . '/assets/file/company-profile.pdf';
$suite->assert(!file_exists($publicPdf), 'Old public PDF assets/file/company-profile.pdf has been removed');

$htaccessPath = dirname(__DIR__, 2) . '/assets/file/.htaccess';
$suite->assert(file_exists($htaccessPath), 'assets/file/.htaccess exists to deny direct file access');


// ==============================================================================
// 3. Database Lifecycle & Atomic Token Consumption Tests
// ==============================================================================
echo "\n--- Testing Database Lifecycle & Atomic Token Consumption ---\n";

$testPdo = new PDO('sqlite::memory:', null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$testPdo->exec("
CREATE TABLE `company_profile_downloads` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `uuid` TEXT NOT NULL UNIQUE,
  `name` TEXT NOT NULL,
  `phone` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `location` TEXT NOT NULL,
  `consent_status` INTEGER NOT NULL DEFAULT 1,
  `consent_timestamp` TEXT NOT NULL,
  `download_token_hash` TEXT NOT NULL UNIQUE,
  `download_token_expires_at` TEXT NOT NULL,
  `download_token_used_at` TEXT DEFAULT NULL,
  `ip_address` TEXT DEFAULT NULL,
  `user_agent` TEXT DEFAULT NULL,
  `created_at` TEXT DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP
);
");

$repo = new ProfileDownloadRepository($testPdo);

$testRawToken = bin2hex(random_bytes(32));
$testTokenHash = hash('sha256', $testRawToken);
$leadData = [
    'name' => 'Meera Krishnan',
    'phone' => '9659239187',
    'email' => 'meera@example.com',
    'location' => 'Chennai',
    'consent_status' => 1,
    'consent_timestamp' => date('Y-m-d H:i:s'),
    'ip_address' => '127.0.0.1',
    'user_agent' => 'Mozilla/5.0 Test Suite'
];

$saved = $repo->createLeadAndToken($leadData, $testTokenHash, 300);
$suite->assert($saved['id'] > 0 && !empty($saved['uuid']), 'ProfileDownloadRepository saves lead and returns valid ID and UUID');
$suite->assert($saved['email'] === 'meera@example.com', 'Lead email is stored in repository');
$suite->assert($saved['phone'] === '9659239187', 'Lead phone is stored without prefix');

// Test Token Consumption (First use -> must succeed)
$consumed = $repo->consumeToken($testTokenHash);
$suite->assert($consumed !== null && $consumed['name'] === 'Meera Krishnan', 'First token consumption succeeds and returns lead record');
$suite->assert($consumed['email'] === 'meera@example.com', 'Consumed record retains correct customer email address');

// Test Token Consumption Replay (Second use -> must fail)
$replayed = $repo->consumeToken($testTokenHash);
$suite->assert($replayed === null, 'Replaying the same token fails (single-use strictly enforced)');

// Test Invalid Token Hash -> must fail
$invalidHash = hash('sha256', 'bogus_token');
$consumedBogus = $repo->consumeToken($invalidHash);
$suite->assert($consumedBogus === null, 'Non-existent token hash is safely rejected');

// Test Expired Token -> must fail
$expiredRawToken = bin2hex(random_bytes(32));
$expiredHash = hash('sha256', $expiredRawToken);
$stmt = $testPdo->prepare("INSERT INTO company_profile_downloads (
    uuid, name, phone, email, location, consent_status, consent_timestamp,
    download_token_hash, download_token_expires_at, created_at
) VALUES (:uuid, :name, :phone, :email, :location, 1, datetime('now'), :hash, datetime('now', '-10 minutes'), datetime('now'))");
$stmt->execute([
    ':uuid' => ProfileDownloadRepository::generateUuid(),
    ':name' => 'Expired User',
    ':phone' => '9659239187',
    ':email' => 'expired@example.com',
    ':location' => 'Chennai',
    ':hash' => $expiredHash,
]);
$consumedExpired = $repo->consumeToken($expiredHash);
$suite->assert($consumedExpired === null, 'Expired token is strictly rejected');


// ==============================================================================
// 4. Controller HTTP Simulation Tests
// ==============================================================================
echo "\n--- Testing ProfileDownloadController Endpoints ---\n";

\DigitalCrazyHub\Backend\Config\Database::setConnection($testPdo);

// Test 4A: Reject GET on submission endpoint
$_SERVER['REQUEST_METHOD'] = 'GET';
ob_start();
$controller = new ProfileDownloadController(null, $repo);
$controller->handleSubmission();
$out = ob_get_clean();
$status = http_response_code();
$suite->assert($status === 405, 'Submission endpoint rejects GET with HTTP 405');

// Test 4B: Rejection of invalid token format on download endpoint
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['token'] = 'invalid-short-token';
$_SERVER['HTTP_ACCEPT'] = 'application/json';
ob_start();
$controller->handleDownload();
$out = ob_get_clean();
$status = http_response_code();
$suite->assert($status === 403, 'Download endpoint rejects malformed token with HTTP 403');
$decoded = json_decode($out, true);
$suite->assert(isset($decoded['success']) && $decoded['success'] === false, 'Download endpoint returns JSON error format');

// Clean test environment DB connection
\DigitalCrazyHub\Backend\Config\Database::reset();

$allPassed = $suite->summary();
exit($allPassed ? 0 : 1);
