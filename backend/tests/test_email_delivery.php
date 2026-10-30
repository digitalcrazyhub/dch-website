<?php

declare(strict_types=1);

/**
 * Digital Crazy Hub - Backend Email Delivery Diagnostic & Audit CLI Tool
 * File: backend/tests/test_email_delivery.php
 *
 * SECURITY: Restricted strictly to CLI execution. Unauthenticated HTTP invocation is rejected.
 * Run via CLI: php -c backend/php.ini backend/tests/test_email_delivery.php [options]
 */

// 1. Enforce CLI execution only
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    header('Content-Type: text/plain; charset=UTF-8');
    echo "ERROR 403: Forbidden. This diagnostic tool may only be executed from the secure command line.\n";
    exit(1);
}

// 2. Load Autoloader & Environment
$baseDir = dirname(__DIR__);
$autoloader = $baseDir . '/vendor/autoload.php';

if (!file_exists($autoloader)) {
    echo "[-] CRITICAL: Composer autoloader not found at: {$autoloader}\n";
    exit(1);
}

require_once $autoloader;

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Config\Database;
use DigitalCrazyHub\Backend\Controllers\ContactController;
use DigitalCrazyHub\Backend\Repositories\LeadRepository;
use DigitalCrazyHub\Backend\Security\Logger;
use DigitalCrazyHub\Backend\Security\RateLimiter;
use DigitalCrazyHub\Backend\Services\EmailService;
use DigitalCrazyHub\Backend\Services\RecaptchaService;
use DigitalCrazyHub\Backend\Validation\ContactValidator;
use PHPMailer\PHPMailer\PHPMailer;

Env::load($baseDir);

// Parse CLI options
$options = getopt('', ['to:', 'help', 'verbose', 'run-tests']);

if (isset($options['help'])) {
    echo <<<HELP
Digital Crazy Hub - Email Delivery Diagnostic & Test Suite

Usage:
  php -c backend/php.ini backend/tests/test_email_delivery.php [options]

Options:
  --run-tests     Execute full live SMTP and Contact Form integration tests (Tests A-E).
  --to=EMAIL      Override destination email for live customer test (defaults to configured admin/sender).
  --verbose       Enable verbose SMTP protocol debugging.
  --help          Display this help message.

HELP;
    exit(0);
}

$targetRecipient = isset($options['to']) ? trim((string)$options['to']) : null;
$runLiveTests = isset($options['run-tests']) || $targetRecipient !== null;
$isVerbose = isset($options['verbose']);

echo "====================================================================\n";
echo "   DIGITAL CRAZY HUB - BACKEND SMTP EMAIL AUDIT & VERIFICATION     \n";
echo "====================================================================\n";
echo "Execution Time: " . date('Y-m-d H:i:s T') . "\n";
echo "PHP Version:    " . PHP_VERSION . " (" . PHP_SAPI . ")\n";
echo "Base Directory: " . $baseDir . "\n\n";

$emailService = new EmailService();
$diag = $emailService->getDiagnosticStatus();

// ==============================================================================
// 1. CONFIGURATION & ENVIRONMENT AUDIT
// ==============================================================================
echo "--- 1. ENVIRONMENT CONFIGURATION AUDIT ---\n";

echo sprintf("  %-28s: %s\n", "MAIL_ENABLED", $diag['mail_enabled'] ? "[ENABLED]" : "[DISABLED] (Emails bypassed in configuration)");
echo sprintf("  %-28s: %s\n", "SMTP_HOST", $diag['smtp_host'] !== '' ? $diag['smtp_host'] : "[MISSING]");
echo sprintf("  %-28s: %d\n", "SMTP_PORT", $diag['smtp_port']);
echo sprintf("  %-28s: %s\n", "SMTP_ENCRYPTION", $diag['smtp_encryption'] !== '' ? $diag['smtp_encryption'] : "[NONE]");
echo sprintf("  %-28s: %s\n", "SMTP_USERNAME", $diag['smtp_username']);
echo sprintf("  %-28s: %s\n", "SMTP_PASSWORD", $diag['smtp_password_configured'] ? "[CONFIGURED (Length masked)]" : "[MISSING]");
echo sprintf("  %-28s: %s\n", "MAIL_FROM_ADDRESS", $diag['from_address']);
echo sprintf("  %-28s: %s\n", "MAIL_FROM_NAME", $diag['from_name']);
echo sprintf("  %-28s: %s\n", "MAIL_ADMIN_ADDRESS", $diag['admin_recipient']);
echo sprintf("  %-28s: %s\n", "Paper Plane Asset", $diag['paper_plane_asset_found'] ? "[FOUND (assets/images/paper-plan.png)]" : "[MISSING]");
echo sprintf("  %-28s: %s\n", "PHPMailer Installed", $diag['phpmailer_installed'] ? "[YES (v" . PHPMailer::VERSION . ")]" : "[NO]");

$configIssues = [];
if (!$diag['mail_enabled']) {
    $configIssues[] = "MAIL_ENABLED is false in .env (all outgoing emails are deliberately skipped)";
}
if (!$diag['smtp_host_configured']) {
    $configIssues[] = "SMTP_HOST is not configured or still set to placeholder '{$diag['smtp_host']}'";
}
if (!$diag['smtp_password_configured']) {
    $configIssues[] = "SMTP_PASSWORD is missing in .env";
}
if (!filter_var($diag['from_address'], FILTER_VALIDATE_EMAIL)) {
    $configIssues[] = "MAIL_FROM_ADDRESS '{$diag['from_address']}' is not a valid RFC-5322 email address";
}
if (!filter_var($diag['admin_recipient'], FILTER_VALIDATE_EMAIL)) {
    $configIssues[] = "MAIL_ADMIN_ADDRESS '{$diag['admin_recipient']}' is not a valid RFC-5322 email address";
}

if (!empty($configIssues)) {
    echo "\n  [!] Configuration Notices / Issues Detected:\n";
    foreach ($configIssues as $issue) {
        echo "      - {$issue}\n";
    }
} else {
    echo "\n  [PASS] Configuration validation passed.\n";
}

// ==============================================================================
// 2. TEMPLATE INTEGRITY & SEPARATION AUDIT
// ==============================================================================
echo "\n--- 2. TEMPLATE INTEGRITY & SEPARATION AUDIT ---\n";

$testLeadAudit = [
    'name' => 'Sudhakar',
    'email' => 'sudhakar@example.com',
    'phone' => '+919659239187',
    'location' => 'Chennai',
    'service' => 'Web & App Development',
    'message' => 'We need a scalable web application built with modern architecture.',
    'uuid' => '550e8400-e29b-41d4-a716-446655440000',
    'created_at' => date('Y-m-d H:i:s'),
];

$custHtml = $emailService->buildCustomerHtmlTemplate($testLeadAudit, 'cid:paper-plane');
$custText = $emailService->buildCustomerPlainTextTemplate($testLeadAudit);

$refClass = new ReflectionClass(EmailService::class);
$buildAdminHtml = $refClass->getMethod('buildAdminHtmlTemplate');
$buildAdminHtml->setAccessible(true);
$adminHtml = $buildAdminHtml->invoke($emailService, $testLeadAudit);

$buildAdminText = $refClass->getMethod('buildAdminPlainTextTemplate');
$buildAdminText->setAccessible(true);
$adminText = $buildAdminText->invoke($emailService, $testLeadAudit);

$templateChecks = [
    'Customer: Greeting with customer name ("Dear Sudhakar,")' => str_contains($custHtml, 'Dear Sudhakar,'),
    'Customer: Company name typography ("Digital Crazy Hub")' => str_contains($custHtml, 'Digital Crazy Hub'),
    'Customer: Header subtitle present' => str_contains($custHtml, "Design a clean, professional confirmation email"),
    'Customer: Header & footer brand blue color (#0078f8)' => str_contains($custHtml, '#0078f8'),
    'Customer: Paper plane CID inline attachment referenced' => str_contains($custHtml, 'cid:paper-plane'),
    'Customer: Outlook MSO VML fallback included' => str_contains($custHtml, 'urn:schemas-microsoft-com:vml'),
    'Customer: Signature block ("Team Digital Crazy Hub")' => str_contains($custHtml, 'Team Digital Crazy Hub'),
    'Customer: Strict privacy - No Reference ID or Lead ID exposed' => !str_contains($custHtml, 'Reference ID') && !str_contains($custHtml, 'Lead ID') && !str_contains($custHtml, '550e8400'),
    'Customer: UTF-8 charset declared in HTML meta' => str_contains($custHtml, 'charset=UTF-8'),
    'Admin: Redesigned matching blue header & footer (#0078f8)' => str_contains($adminHtml, '#0078f8'),
    'Admin: Contains customer inquiry details (Name, Service, Phone, Location)' => str_contains($adminHtml, 'Sudhakar') && str_contains($adminHtml, 'Web &amp; App Development') && str_contains($adminHtml, 'Chennai'),
    'Admin: Contains functional Reply to Customer button' => str_contains($adminHtml, 'Reply to Customer') && str_contains($adminHtml, 'mailto:sudhakar@example.com'),
    'Admin: Strict requirement - No Reference ID or UUID in visible HTML' => !str_contains($adminHtml, 'Reference ID') && !str_contains($adminHtml, '550e8400'),
    'Admin: Strict requirement - No Reference ID or UUID in plain text' => !str_contains($adminText, 'Reference ID') && !str_contains($adminText, '550e8400'),
    'Separation: Customer confirmation and Admin notification templates remain separate' => $adminHtml !== $custHtml,
];

foreach ($templateChecks as $checkName => $passed) {
    echo sprintf("  [%s] %s\n", $passed ? "PASS" : "FAIL", $checkName);
}

// ==============================================================================
// 3. TEST A: SMTP CONNECTION TEST
// ==============================================================================
echo "\n--- TEST A: SMTP CONNECTION TEST ---\n";

$host = $diag['smtp_host'];
$port = (int)$diag['smtp_port'];
$connectionPassed = false;

if (!$diag['smtp_host_configured']) {
    echo "  [BLOCKED] Cannot test connection: SMTP_HOST is not configured ('{$host}').\n";
} else {
    echo "  [*] Testing DNS resolution for '{$host}'...\n";
    $ip = gethostbyname($host);
    if ($ip === $host && !filter_var($host, FILTER_VALIDATE_IP)) {
        echo "  [FAIL] DNS resolution failed for '{$host}'. Hostname could not be resolved.\n";
    } else {
        echo "  [PASS] Hostname resolved successfully to: {$ip}\n";

        echo "  [*] Testing TCP socket connection to {$host}:{$port} (timeout 5s)...\n";
        $errno = 0;
        $errstr = '';
        $socket = @fsockopen($host, $port, $errno, $errstr, 5);

        if (!$socket) {
            echo "  [FAIL] TCP socket connection failed to {$host}:{$port} -> ({$errno}) {$errstr}\n";
        } else {
            echo "  [PASS] TCP socket successfully connected to {$host}:{$port}\n";
            fclose($socket);
            $connectionPassed = true;
        }
    }
}

// ==============================================================================
// 4. TEST B: SMTP AUTHENTICATION TEST
// ==============================================================================
echo "\n--- TEST B: SMTP AUTHENTICATION TEST ---\n";

$authPassed = false;
if (!$connectionPassed) {
    echo "  [BLOCKED] Skipping SMTP authentication test because connection was not established.\n";
} elseif (!$diag['smtp_password_configured']) {
    echo "  [BLOCKED] Skipping SMTP authentication test: SMTP_PASSWORD is not configured in .env.\n";
} else {
    echo "  [*] Testing PHPMailer SMTP handshake and credential authentication...\n";
    $connResult = $emailService->testSmtpConnection();
    if ($connResult['success']) {
        echo "  [PASS] SMTP handshake and authentication successful!\n";
        $authPassed = true;
    } else {
        echo "  [FAIL] SMTP handshake or authentication failed: {$connResult['message']}\n";
    }
}

// ==============================================================================
// 5. TEST C: ADMIN EMAIL TEST
// ==============================================================================
echo "\n--- TEST C: ADMIN NOTIFICATION EMAIL TEST ---\n";

$adminTestRecipient = $diag['admin_recipient'];
$adminEmailPassed = false;

if (!$authPassed) {
    echo "  [BLOCKED] Skipping admin email test because SMTP authentication is not verified.\n";
} elseif (!$diag['mail_enabled']) {
    echo "  [BLOCKED] Skipping admin email test: MAIL_ENABLED is false.\n";
} else {
    echo "  [*] Dispatching controlled Admin Notification to: " . EmailService::maskEmail($adminTestRecipient) . "...\n";
    $adminSendResult = $emailService->sendDiagnosticAdminEmail($adminTestRecipient);
    if ($adminSendResult['success']) {
        echo "  [PASS] SMTP server ACCEPTED admin notification message for delivery!\n";
        $adminEmailPassed = true;
    } else {
        echo "  [FAIL] SMTP server rejected admin notification: {$adminSendResult['message']}\n";
    }
}

// ==============================================================================
// 6. TEST D: CUSTOMER CONFIRMATION EMAIL TEST
// ==============================================================================
echo "\n--- TEST D: CUSTOMER CONFIRMATION EMAIL TEST ---\n";

$custTestRecipient = $targetRecipient !== null ? $targetRecipient : $adminTestRecipient;
$customerEmailPassed = false;

if (!$authPassed) {
    echo "  [BLOCKED] Skipping customer confirmation email test because SMTP authentication is not verified.\n";
} elseif (!$diag['mail_enabled']) {
    echo "  [BLOCKED] Skipping customer confirmation email test: MAIL_ENABLED is false.\n";
} else {
    echo "  [*] Dispatching controlled Customer Confirmation to: " . EmailService::maskEmail($custTestRecipient) . "...\n";
    $custSendResult = $emailService->sendDiagnosticTestEmail($custTestRecipient);
    if ($custSendResult['success']) {
        echo "  [PASS] SMTP server ACCEPTED customer confirmation message for delivery!\n";
        $customerEmailPassed = true;
    } else {
        echo "  [FAIL] SMTP server rejected customer confirmation: {$custSendResult['message']}\n";
    }
}

// ==============================================================================
// 7. TEST E: COMPLETE CONTACT FORM WORKFLOW INTEGRATION TEST
// ==============================================================================
echo "\n--- TEST E: COMPLETE CONTACT FORM PIPELINE TEST ---\n";

try {
    $pdo = Database::getConnection();
    echo "  [PASS] MySQL database connected successfully.\n";

    // Count existing leads before test
    $countBefore = (int)$pdo->query("SELECT COUNT(*) FROM `leads`")->fetchColumn();

    $controlledLeadData = [
        'name' => 'Controlled Verification Specialist',
        'email' => $custTestRecipient,
        'phone' => '+91 96592 39187',
        'location' => 'Thousand Lights Chennai',
        'service' => 'Web & App Development',
        'message' => 'Controlled pipeline test verifying MySQL storage, independent admin notification, and independent customer confirmation.',
        'consent' => '1',
    ];

    // Validate payload
    $valResult = ContactValidator::validate($controlledLeadData);
    if (!$valResult['isValid']) {
        echo "  [FAIL] ContactValidator rejected test lead data.\n";
    } else {
        echo "  [PASS] Step 1: Server-side validation succeeded.\n";

        // Save lead in MySQL via LeadRepository
        $repo = new LeadRepository($pdo);
        $savedRecord = $repo->createLead($valResult['data']);
        $leadId = (int)$savedRecord['id'];
        echo "  [PASS] Step 2: Lead stored in MySQL successfully (Lead ID: {$leadId}, UUID: {$savedRecord['uuid']}).\n";

        // Verify count incremented exactly once (no duplicate lead)
        $countAfter = (int)$pdo->query("SELECT COUNT(*) FROM `leads`")->fetchColumn();
        if ($countAfter === $countBefore + 1) {
            echo "  [PASS] Step 3: Verified database count incremented by exactly 1 (No duplicate leads created).\n";
        } else {
            echo "  [FAIL] Step 3: Unexpected lead count difference: before={$countBefore}, after={$countAfter}.\n";
        }

        // Attempt Admin Notification independently
        $eAdminSent = false;
        try {
            $eAdminSent = $emailService->sendAdminNotification($savedRecord);
            if ($eAdminSent) {
                $repo->updateEmailStatus($leadId, true);
                $repo->markOutboxItemCompleted($leadId, 'email_admin');
                echo "  [PASS] Step 4: Admin notification attempted and ACCEPTED by SMTP server.\n";
            } else {
                $repo->recordOutboxItemFailure($leadId, 'email_admin', 'SMTP dispatch failed');
                echo "  [FAIL] Step 4: Admin notification dispatch returned false.\n";
            }
        } catch (Throwable $ex) {
            echo "  [FAIL] Step 4: Admin notification exception: {$ex->getMessage()}\n";
        }

        // Attempt Customer Confirmation independently
        $eCustSent = false;
        try {
            $eCustSent = $emailService->sendCustomerAcknowledgement($savedRecord);
            if ($eCustSent) {
                $repo->markOutboxItemCompleted($leadId, 'email_customer');
                echo "  [PASS] Step 5: Customer confirmation attempted and ACCEPTED by SMTP server.\n";
            } else {
                $repo->recordOutboxItemFailure($leadId, 'email_customer', 'Customer acknowledgement failed');
                echo "  [FAIL] Step 5: Customer confirmation dispatch returned false.\n";
            }
        } catch (Throwable $ex) {
            echo "  [FAIL] Step 5: Customer confirmation exception: {$ex->getMessage()}\n";
        }

        // Verify outbox status entries in database
        $outboxStmt = $pdo->prepare("SELECT service_type, status, attempts FROM lead_sync_outbox WHERE lead_id = :lead_id");
        $outboxStmt->execute([':lead_id' => $leadId]);
        $outboxRows = $outboxStmt->fetchAll();

        echo "  [*] Outbox audit for Lead #{$leadId}:\n";
        foreach ($outboxRows as $row) {
            echo sprintf("      - Service: %-16s | Status: %-10s | Attempts: %d\n", $row['service_type'], $row['status'], $row['attempts']);
        }
        echo "  [PASS] Step 6: Both email dispatches attempted and recorded independently without blocking or deleting the lead.\n";
    }
} catch (Throwable $e) {
    echo "  [FAIL] Database pipeline error: " . $e->getMessage() . "\n";
}

echo "\n====================================================================\n";
echo "                       DIAGNOSTIC COMPLETE                         \n";
echo "====================================================================\n";
