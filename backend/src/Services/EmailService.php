<?php

declare(strict_types=1);

namespace DigitalCrazyHub\Backend\Services;

use DigitalCrazyHub\Backend\Config\Env;
use DigitalCrazyHub\Backend\Security\Logger;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;
use Throwable;

/**
 * Class EmailService
 * Production transactional mailer using PHPMailer with responsive HTML templates.
 */
final class EmailService
{
    private bool $enabled;
    private string $host;
    private int $port;
    private string $encryption;
    private string $username;
    private string $password;
    private string $fromAddress;
    private string $fromName;
    private string $adminRecipient;
    private int $timeout;

    public function __construct()
    {
        $this->enabled = Env::getBool('MAIL_ENABLED', true);
        $this->host = Env::getString('SMTP_HOST', '');
        $this->port = Env::getInt('SMTP_PORT', 587);
        $this->encryption = strtolower(Env::getString('SMTP_ENCRYPTION', 'tls'));
        $this->username = Env::getString('SMTP_USERNAME', '');
        $this->password = Env::getString('SMTP_PASSWORD', '');

        // Normalize sender address if domain-only was configured
        $from = Env::getString('MAIL_FROM_ADDRESS', 'info@digitalcrazyhub.com');
        if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
            if (str_contains($from, '.') && !str_contains($from, '@')) {
                $from = 'info@' . $from;
            } else {
                $from = 'info@digitalcrazyhub.com';
            }
        }
        $this->fromAddress = $from;
        $this->fromName = Env::getString('MAIL_FROM_NAME', 'Digital Crazy Hub');

        // Normalize admin recipient address if domain-only was configured
        $admin = Env::getString('MAIL_ADMIN_ADDRESS', 'info@digitalcrazyhub.com');
        if (!filter_var($admin, FILTER_VALIDATE_EMAIL)) {
            if (str_contains($admin, '.') && !str_contains($admin, '@')) {
                $admin = 'info@' . $admin;
            } else {
                $admin = 'info@digitalcrazyhub.com';
            }
        }
        $this->adminRecipient = $admin;
        $this->timeout = Env::getInt('SMTP_TIMEOUT', 10);
    }

    /**
     * Build an authenticated PHPMailer instance.
     */
    private function createMailer(): PHPMailer
    {
        $mailer = new PHPMailer(true);
        $mailer->isSMTP();
        $mailer->Host = $this->host;
        $mailer->SMTPAuth = !empty($this->username);
        $mailer->Username = $this->username;
        $mailer->Password = $this->password;
        $mailer->Timeout = $this->timeout;
        $mailer->CharSet = PHPMailer::CHARSET_UTF8;

        if ($this->encryption === 'tls') {
            $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        } elseif ($this->encryption === 'ssl') {
            $mailer->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        } else {
            $mailer->SMTPSecure = '';
            $mailer->SMTPAutoTLS = false;
        }

        $mailer->Port = $this->port;
        $mailer->setFrom($this->fromAddress, $this->fromName);

        return $mailer;
    }

    /**
     * Send internal lead notification email to Digital Crazy Hub staff.
     */
    public function sendAdminNotification(array $lead): bool
    {
        if (!$this->enabled) {
            Logger::info('Internal lead notification skipped (mail disabled)', ['lead_uuid' => $lead['uuid'] ?? '']);
            return false;
        }

        if (empty($this->host) || $this->host === 'smtp.example.com' || $this->host === 'smtp.your-mail-provider.com') {
            Logger::warning('SMTP host is not configured; skipping admin email', ['lead_uuid' => $lead['uuid'] ?? '']);
            return false;
        }

        try {
            $mailer = $this->createMailer();
            $mailer->addAddress($this->adminRecipient, 'Digital Crazy Hub Team');

            // Set reply-to to the lead's email so replying goes directly to customer
            if (!empty($lead['email'])) {
                $mailer->addReplyTo($lead['email'], $lead['name'] ?? '');
            }

            $service = htmlspecialchars($lead['service'] ?? 'General Inquiry', ENT_QUOTES, 'UTF-8');
            $name = htmlspecialchars($lead['name'] ?? 'Prospective Client', ENT_QUOTES, 'UTF-8');
            
            $mailer->isHTML(true);
            $mailer->Subject = sprintf('🔥 New Lead: %s - %s [Digital Crazy Hub]', $service, $name);
            $mailer->Body = $this->buildAdminHtmlTemplate($lead);
            $mailer->AltBody = $this->buildAdminPlainTextTemplate($lead);

            $mailer->send();
            Logger::info('Admin notification email accepted by SMTP server', [
                'email_type' => 'Admin Notification',
                'recipient' => self::maskEmail($this->adminRecipient),
                'lead_uuid' => $lead['uuid'] ?? '',
                'result' => 'SMTP server accepted message for delivery'
            ]);
            return true;
        } catch (PHPMailerException $e) {
            Logger::error('PHPMailer failed to send admin notification', [
                'email_type' => 'Admin Notification',
                'recipient' => self::maskEmail($this->adminRecipient),
                'error' => $e->getMessage(),
                'lead_uuid' => $lead['uuid'] ?? '',
            ]);
            return false;
        } catch (Throwable $e) {
            Logger::error('Unexpected error sending admin notification', [
                'email_type' => 'Admin Notification',
                'recipient' => self::maskEmail($this->adminRecipient),
                'error' => $e->getMessage(),
                'lead_uuid' => $lead['uuid'] ?? '',
            ]);
            return false;
        }
    }

    /**
     * Send acknowledgement email to the prospective customer.
     */
    public function sendCustomerAcknowledgement(array $lead): bool
    {
        if (!$this->enabled) {
            Logger::info('Customer acknowledgement email skipped (mail disabled)', ['lead_uuid' => $lead['uuid'] ?? '']);
            return false;
        }

        if (empty($this->host) || $this->host === 'smtp.example.com' || $this->host === 'smtp.your-mail-provider.com') {
            Logger::warning('SMTP host is not configured; skipping customer acknowledgement', ['lead_uuid' => $lead['uuid'] ?? '']);
            return false;
        }

        $recipientEmail = trim((string)($lead['email'] ?? ''));
        if ($recipientEmail === '' || !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            Logger::warning('Invalid or missing recipient email for customer acknowledgement', [
                'recipient_email' => self::maskEmail($recipientEmail),
                'lead_uuid' => $lead['uuid'] ?? ''
            ]);
            return false;
        }

        try {
            $mailer = $this->createMailer();
            $customerName = trim((string)($lead['name'] ?? ''));
            $mailer->addAddress($recipientEmail, $customerName);
            $mailer->addReplyTo($this->adminRecipient, $this->fromName);

            $mailer->isHTML(true);
            $mailer->CharSet = PHPMailer::CHARSET_UTF8;
            $mailer->Subject = 'Thank you for contacting Digital Crazy Hub!';
            $mailer->Body = $this->buildCustomerHtmlTemplate($lead);
            $mailer->AltBody = $this->buildCustomerPlainTextTemplate($lead);

            $mailer->send();
            Logger::info('Customer confirmation email accepted by SMTP server', [
                'email_type' => 'Customer Confirmation',
                'recipient' => self::maskEmail($recipientEmail),
                'lead_uuid' => $lead['uuid'] ?? '',
                'result' => 'SMTP server accepted message for delivery'
            ]);
            return true;
        } catch (PHPMailerException $e) {
            Logger::error('PHPMailer failed to send customer confirmation', [
                'email_type' => 'Customer Confirmation',
                'recipient' => self::maskEmail($recipientEmail),
                'error' => $e->getMessage(),
                'lead_uuid' => $lead['uuid'] ?? '',
            ]);
            return false;
        } catch (Throwable $e) {
            Logger::error('Unexpected error sending customer confirmation', [
                'email_type' => 'Customer Confirmation',
                'recipient' => self::maskEmail($recipientEmail),
                'error' => $e->getMessage(),
                'lead_uuid' => $lead['uuid'] ?? '',
            ]);
            return false;
        }
    }

    /**
     * Mask email address for privacy and secure logging (e.g. s****r@example.com).
     */
    public static function maskEmail(string $email): string
    {
        $email = trim($email);
        $parts = explode('@', $email, 2);
        if (count($parts) !== 2 || $parts[0] === '') {
            return '***';
        }
        $name = $parts[0];
        $domain = $parts[1];
        $len = mb_strlen($name, 'UTF-8');
        if ($len <= 2) {
            $maskedName = mb_substr($name, 0, 1, 'UTF-8') . '*';
        } else {
            $maskedName = mb_substr($name, 0, 1, 'UTF-8') . str_repeat('*', min(4, $len - 2)) . mb_substr($name, -1, 1, 'UTF-8');
        }
        return $maskedName . '@' . $domain;
    }

    /**
     * Audit current configuration without leaking secrets.
     */
    public function getDiagnosticStatus(): array
    {
        return [
            'mail_enabled' => $this->enabled,
            'smtp_host' => $this->host,
            'smtp_host_configured' => !empty($this->host) && $this->host !== 'smtp.example.com' && $this->host !== 'smtp.your-mail-provider.com',
            'smtp_port' => $this->port,
            'smtp_encryption' => $this->encryption,
            'smtp_username_configured' => !empty($this->username),
            'smtp_username' => !empty($this->username) ? self::maskEmail($this->username) : '[NOT CONFIGURED]',
            'smtp_password_configured' => !empty($this->password),
            'from_address' => $this->fromAddress,
            'from_name' => $this->fromName,
            'admin_recipient' => $this->adminRecipient,
            'plane_image_url_configured' => trim(Env::getString('MAIL_PLANE_IMAGE_URL', '')) !== '',
            'phpmailer_installed' => class_exists(PHPMailer::class),
        ];
    }

    /**
     * Test low-level SMTP connectivity and handshake without sending an email.
     */
    public function testSmtpConnection(): array
    {
        if (empty($this->host) || $this->host === 'smtp.example.com' || $this->host === 'smtp.your-mail-provider.com') {
            return [
                'success' => false,
                'stage' => 'configuration',
                'message' => 'SMTP_HOST is not configured or still set to placeholder: ' . ($this->host ?: '(empty)')
            ];
        }

        try {
            $mailer = $this->createMailer();
            $connected = $mailer->smtpConnect();
            if ($connected) {
                $mailer->smtpClose();
                return [
                    'success' => true,
                    'stage' => 'handshake',
                    'message' => 'SMTP connection and authentication successful'
                ];
            }
            return [
                'success' => false,
                'stage' => 'handshake',
                'message' => 'SMTP connection failed without specific exception'
            ];
        } catch (Throwable $e) {
            return [
                'success' => false,
                'stage' => 'connection_error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Send an authorized diagnostic test email (development only).
     */
    public function sendDiagnosticTestEmail(string $recipientEmail): array
    {
        $recipientEmail = trim($recipientEmail);
        if (!filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'message' => "Invalid test recipient address: {$recipientEmail}"
            ];
        }

        $testLead = [
            'name' => 'Diagnostic Test Recipient',
            'email' => $recipientEmail,
            'phone' => '+919659239187',
            'location' => 'Chennai',
            'service' => 'Backend Email Audit',
            'message' => 'This is an authorized diagnostic test email verifying the Digital Crazy Hub email delivery pipeline.',
            'uuid' => 'diag-' . bin2hex(random_bytes(4)),
            'created_at' => date('Y-m-d H:i:s'),
        ];

        try {
            $mailer = $this->createMailer();
            $mailer->addAddress($recipientEmail, 'Diagnostic Recipient');
            $mailer->addReplyTo($this->adminRecipient, $this->fromName);

            $mailer->isHTML(true);
            $mailer->CharSet = PHPMailer::CHARSET_UTF8;
            $mailer->Subject = 'Digital Crazy Hub - Email Delivery System Verification';
            $mailer->Body = $this->buildCustomerHtmlTemplate($testLead);
            $mailer->AltBody = $this->buildCustomerPlainTextTemplate($testLead);

            $sent = $mailer->send();
            Logger::info('Diagnostic test email accepted by SMTP server', [
                'email_type' => 'Diagnostic Test',
                'recipient' => self::maskEmail($recipientEmail),
                'result' => 'SMTP server accepted message for delivery'
            ]);

            return [
                'success' => true,
                'message' => 'SMTP server accepted the message for delivery'
            ];
        } catch (Throwable $e) {
            Logger::error('Diagnostic test email transmission failed', [
                'email_type' => 'Diagnostic Test',
                'recipient' => self::maskEmail($recipientEmail),
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Send an authorized diagnostic admin notification email (development only).
     */
    public function sendDiagnosticAdminEmail(string $recipientEmail = ''): array
    {
        $target = trim($recipientEmail !== '' ? $recipientEmail : $this->adminRecipient);
        if (!filter_var($target, FILTER_VALIDATE_EMAIL)) {
            return [
                'success' => false,
                'message' => "Invalid admin test recipient address: {$target}"
            ];
        }

        $testLead = [
            'name' => 'Admin Diagnostic Tester',
            'email' => $target,
            'phone' => '+919659239187',
            'location' => 'Chennai',
            'service' => 'Diagnostic Verification',
            'message' => 'Controlled SMTP verification test for internal staff notifications.',
            'uuid' => 'admin-diag-' . bin2hex(random_bytes(4)),
            'created_at' => date('Y-m-d H:i:s'),
            'page_url' => 'https://digitalcrazyhub.com/contact.html',
            'ip_address' => '127.0.0.1'
        ];

        try {
            $mailer = $this->createMailer();
            $mailer->addAddress($target, 'Digital Crazy Hub Admin');
            $mailer->isHTML(true);
            $mailer->Subject = '🔥 [DIAGNOSTIC TEST] New Lead: Diagnostic Verification - Admin Diagnostic Tester';
            $mailer->Body = $this->buildAdminHtmlTemplate($testLead);
            $mailer->AltBody = $this->buildAdminPlainTextTemplate($testLead);

            $mailer->send();
            Logger::info('Diagnostic admin email accepted by SMTP server', [
                'email_type' => 'Diagnostic Admin Notification',
                'recipient' => self::maskEmail($target),
                'result' => 'SMTP server accepted message for delivery'
            ]);

            return [
                'success' => true,
                'message' => 'SMTP server accepted the admin notification message for delivery'
            ];
        } catch (Throwable $e) {
            Logger::error('Diagnostic admin email transmission failed', [
                'email_type' => 'Diagnostic Admin Notification',
                'recipient' => self::maskEmail($target),
                'error' => $e->getMessage()
            ]);
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Internal Admin Email HTML Template.
     * Redesigned to use the professional blue-and-white visual identity matching customer confirmation.
     * Strictly excludes Reference ID / UUID from visible content.
     */
    public function buildAdminHtmlTemplate(array $lead): string
    {
        $rawName = trim((string)($lead['name'] ?? ''));
        $name = htmlspecialchars($rawName !== '' ? $rawName : 'Prospective Client', ENT_QUOTES, 'UTF-8');

        $rawPhone = trim((string)($lead['phone'] ?? ''));
        $phone = htmlspecialchars($rawPhone !== '' ? $rawPhone : 'N/A', ENT_QUOTES, 'UTF-8');
        $phoneHref = preg_replace('/[^\d+]/', '', $rawPhone);

        $rawEmail = trim((string)($lead['email'] ?? ''));
        $email = htmlspecialchars($rawEmail !== '' ? $rawEmail : 'N/A', ENT_QUOTES, 'UTF-8');
        $isEmailValid = filter_var($rawEmail, FILTER_VALIDATE_EMAIL) !== false;

        $rawLocation = trim((string)($lead['location'] ?? ''));
        $location = htmlspecialchars($rawLocation !== '' ? $rawLocation : 'N/A', ENT_QUOTES, 'UTF-8');

        $rawService = trim((string)($lead['service'] ?? ''));
        $service = htmlspecialchars($rawService !== '' ? $rawService : 'General Inquiry', ENT_QUOTES, 'UTF-8');

        $rawMessage = trim((string)($lead['message'] ?? ''));
        $message = nl2br(htmlspecialchars($rawMessage !== '' ? $rawMessage : 'No message provided.', ENT_QUOTES, 'UTF-8'));

        $rawPageUrl = trim((string)($lead['page_url'] ?? ''));
        $timestamp = htmlspecialchars($lead['created_at'] ?? date('Y-m-d H:i:s T'), ENT_QUOTES, 'UTF-8');

        // Optional Page URL row
        $pageUrlRow = '';
        $subTimeBorder = 'border-bottom:1px solid #e2e8f0;';
        if ($rawPageUrl !== '' && $rawPageUrl !== 'Direct submission') {
            $pageUrlEsc = htmlspecialchars($rawPageUrl, ENT_QUOTES, 'UTF-8');
            $pageUrlRow = <<<HTML
                <tr>
                  <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Page URL</td>
                  <td style="padding:12px 18px;color:#0078f8;font-size:13px;word-break:break-all;">
                    <a href="{$pageUrlEsc}" style="color:#0078f8;text-decoration:none;">{$pageUrlEsc}</a>
                  </td>
                </tr>
HTML;
        } else {
            $subTimeBorder = '';
        }

        // Campaign Attribution (UTM parameters)
        $utmRows = '';
        $utms = [
            'utm_source' => 'Campaign Source',
            'utm_medium' => 'Campaign Medium',
            'utm_campaign' => 'Campaign Name',
            'utm_term' => 'Campaign Term',
            'utm_content' => 'Campaign Content',
        ];
        foreach ($utms as $key => $label) {
            if (!empty($lead[$key])) {
                $utmRows .= sprintf(
                    '<tr><td style="padding:10px 16px;color:#64748b;font-size:13px;font-weight:600;width:34%%;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:0.5px;">%s</td><td style="padding:10px 16px;color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #e2e8f0;">%s</td></tr>',
                    htmlspecialchars($label, ENT_QUOTES, 'UTF-8'),
                    htmlspecialchars((string)$lead[$key], ENT_QUOTES, 'UTF-8')
                );
            }
        }

        $campaignSection = '';
        if ($utmRows !== '') {
            $campaignSection = <<<HTML
              <h3 style="margin:28px 0 10px 0;font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">Campaign Attribution</h3>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 24px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                {$utmRows}
              </table>
HTML;
        }

        // Reply to Customer Button
        $replyButton = '';
        if ($isEmailValid) {
            $safeSubject = rawurlencode('Re: Digital Crazy Hub Inquiry - ' . ($rawService !== '' ? $rawService : 'Our Services'));
            $mailtoUrl = 'mailto:' . rawurlencode($rawEmail) . '?subject=' . $safeSubject;
            $replyButton = <<<HTML
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:28px auto 8px auto;border-collapse:collapse;">
                <tr>
                  <td align="center" bgcolor="#0078f8" style="border-radius:6px;background-color:#0078f8;mso-padding-alt:0;">
                    <a href="{$mailtoUrl}" style="display:inline-block;padding:14px 36px;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;letter-spacing:0.3px;">
                      Reply to Customer
                    </a>
                  </td>
                </tr>
              </table>
HTML;
        }

        return <<<HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
<title>New Lead Notification - Digital Crazy Hub</title>
<style type="text/css">
  body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  body { margin: 0; padding: 0; width: 100% !important; background-color: #ffffff; }

  @media only screen and (max-width: 600px) {
    .email-container {
      width: 100% !important;
      max-width: 100% !important;
    }
    .email-header-title {
      font-size: 26px !important;
      line-height: 32px !important;
    }
    .email-header-subtitle {
      font-size: 13px !important;
      line-height: 18px !important;
    }
    .email-body-content {
      padding: 28px 20px !important;
    }
    .lead-table td {
      padding: 10px 12px !important;
    }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Centering Outer Wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:20px 0;margin:0;">
        <!-- Email Container (600px width matching customer confirmation) -->
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-collapse:collapse;margin:0 auto;box-shadow:0 4px 16px rgba(0,0,0,0.04);">
          
          <!-- HEADER ROW (Consistent Blue Brand Header) -->
          <tr>
            <td align="center" bgcolor="#0078f8" style="background-color:#0078f8;padding:36px 24px 30px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                <!-- Company Name -->
                <tr>
                  <td align="center" style="padding:0;">
                    <h1 class="email-header-title" style="margin:0;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:30px;line-height:36px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;text-align:center;">Digital Crazy Hub</h1>
                  </td>
                </tr>
                <!-- Spacing -->
                <tr>
                  <td height="8" style="height:8px;line-height:8px;font-size:0;mso-line-height-rule:exactly;">&nbsp;</td>
                </tr>
                <!-- Header Subtitle / Tagline -->
                <tr>
                  <td align="center" style="padding:0;">
                    <p class="email-header-subtitle" style="margin:0 auto;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:20px;font-weight:500;color:#ffffff;text-align:center;letter-spacing:0.2px;">New Website Lead Notification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY ROW -->
          <tr>
            <td class="email-body-content" bgcolor="#ffffff" style="background-color:#ffffff;padding:40px 48px;font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:22px;color:#1f2937;text-align:left;">
              
              <p style="margin:0 0 20px 0;font-size:15px;line-height:24px;color:#374151;">
                A new prospective client enquiry has been submitted through the <strong>Digital Crazy Hub</strong> website:
              </p>

              <!-- Lead Details Table -->
              <table role="presentation" class="lead-table" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 24px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;width:34%;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:0.5px;">Customer Name</td>
                  <td style="padding:12px 18px;color:#0f172a;font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;">{$name}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:0.5px;">Phone Number</td>
                  <td style="padding:12px 18px;color:#0f172a;font-size:15px;font-weight:600;border-bottom:1px solid #e2e8f0;">
                    <a href="tel:{$phoneHref}" style="color:#0078f8;text-decoration:none;font-weight:700;">{$phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:0.5px;">Email Address</td>
                  <td style="padding:12px 18px;color:#0f172a;font-size:14px;border-bottom:1px solid #e2e8f0;">
                    <a href="mailto:{$email}" style="color:#0078f8;text-decoration:none;font-weight:600;">{$email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:0.5px;">Location</td>
                  <td style="padding:12px 18px;color:#1e293b;font-size:14px;border-bottom:1px solid #e2e8f0;">{$location}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;border-bottom:1px solid #e2e8f0;text-transform:uppercase;letter-spacing:0.5px;">Requested Service</td>
                  <td style="padding:12px 18px;color:#0078f8;font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;">{$service}</td>
                </tr>
                <tr>
                  <td style="padding:12px 18px;color:#64748b;font-size:13px;font-weight:600;{$subTimeBorder}text-transform:uppercase;letter-spacing:0.5px;">Submission Time</td>
                  <td style="padding:12px 18px;color:#475569;font-size:13px;{$subTimeBorder}">{$timestamp}</td>
                </tr>
                {$pageUrlRow}
              </table>

              <!-- Client Message Box -->
              <h3 style="margin:24px 0 10px 0;font-size:14px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;">Client Message:</h3>
              <div style="background-color:#f1f5f9;border-left:4px solid #0078f8;padding:16px 20px;border-radius:4px;color:#1e293b;font-size:14px;line-height:22px;margin:0 0 24px 0;">
                {$message}
              </div>

              {$campaignSection}

              {$replyButton}
            </td>
          </tr>

          <!-- FOOTER ROW (Blue strip matching customer confirmation) -->
          <tr>
            <td bgcolor="#0078f8" height="12" style="background-color:#0078f8;height:12px;line-height:12px;font-size:0;padding:0;margin:0;mso-line-height-rule:exactly;">
              &nbsp;
            </td>
          </tr>

        </table>

        <!-- Subtle sub-footer info -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:600px;margin:12px auto 0 auto;">
          <tr>
            <td align="center" style="font-family:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#94a3b8;text-align:center;">
              Digital Crazy Hub Internal Notification • <a href="https://digitalcrazyhub.com" style="color:#64748b;text-decoration:none;">digitalcrazyhub.com</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }

    /**
     * Admin Email Plain Text Template.
     * Strictly excludes Reference ID / UUID from visible content.
     */
    public function buildAdminPlainTextTemplate(array $lead): string
    {
        $rawName = trim((string)($lead['name'] ?? ''));
        $name = $rawName !== '' ? $rawName : 'Prospective Client';
        $phone = trim((string)($lead['phone'] ?? 'N/A'));
        $email = trim((string)($lead['email'] ?? 'N/A'));
        $location = trim((string)($lead['location'] ?? 'N/A'));
        $service = trim((string)($lead['service'] ?? 'General Inquiry'));
        $timestamp = trim((string)($lead['created_at'] ?? date('Y-m-d H:i:s T')));
        $pageUrl = trim((string)($lead['page_url'] ?? ''));
        $message = trim((string)($lead['message'] ?? ''));

        $text = "NEW LEAD ENQUIRY - DIGITAL CRAZY HUB\n";
        $text .= "====================================\n\n";
        $text .= "Customer Name:     {$name}\n";
        $text .= "Phone Number:      {$phone}\n";
        $text .= "Email Address:     {$email}\n";
        $text .= "Location:          {$location}\n";
        $text .= "Requested Service: {$service}\n";
        $text .= "Submission Time:   {$timestamp}\n";
        if ($pageUrl !== '' && $pageUrl !== 'Direct submission') {
            $text .= "Page URL:          {$pageUrl}\n";
        }
        $text .= "\nCLIENT MESSAGE:\n";
        $text .= "------------------------------------\n";
        $text .= ($message !== '' ? $message : 'No message provided.') . "\n\n";

        // Campaign attribution
        $utms = [
            'utm_source' => 'Campaign Source',
            'utm_medium' => 'Campaign Medium',
            'utm_campaign' => 'Campaign Name',
            'utm_term' => 'Campaign Term',
            'utm_content' => 'Campaign Content',
        ];
        $hasUtm = false;
        $utmText = "CAMPAIGN ATTRIBUTION:\n------------------------------------\n";
        foreach ($utms as $key => $label) {
            if (!empty($lead[$key])) {
                $hasUtm = true;
                $utmText .= sprintf("%-18s: %s\n", $label, (string)$lead[$key]);
            }
        }
        if ($hasUtm) {
            $text .= $utmText . "\n";
        }

        $text .= "Best regards,\nTeam Digital Crazy Hub";
        return $text;
    }

    /**
     * Customer Acknowledgement Email HTML Template matching reference design.
     */
    public function buildCustomerHtmlTemplate(array $lead, string $imageSrc = ''): string
    {
        $rawName = trim((string)($lead['name'] ?? ''));
        $name = htmlspecialchars($rawName !== '' ? $rawName : 'Valued Client', ENT_QUOTES, 'UTF-8');

        $planeUrl = $imageSrc !== '' ? $imageSrc : trim(Env::getString('MAIL_PLANE_IMAGE_URL', ''));

        if ($planeUrl !== '') {
            $planeBlock = <<<HTML
                    <!--[if mso]>
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td height="133" style="height:133px;overflow:hidden;line-height:0;font-size:0;mso-line-height-rule:exactly;">
                          <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:435px;height:133px;">
                            <v:fill type="frame" src="{$planeUrl}" />
                          </v:rect>
                        </td>
                      </tr>
                    </table>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <div style="height:133px;max-height:133px;overflow:hidden;line-height:0;font-size:0;text-align:left;">
                      <img src="{$planeUrl}" width="511" height="353" alt="paper-plane" style="display:block;border:0;width:511px;height:353px;max-width:none;margin-left:-65px;margin-top:0;" />
                    </div>
                    <!--<![endif]-->
HTML;
        } else {
            $planeBlock = <<<HTML
                    <!-- paper-plane spacer -->
                    <div style="height:40px;line-height:40px;font-size:0;mso-line-height-rule:exactly;">&nbsp;</div>
HTML;
        }

        return <<<HTML
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
<title>Thank you for contacting Digital Crazy Hub</title>
<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
<style type="text/css">
  body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
  body { margin: 0; padding: 0; width: 100% !important; background-color: #ffffff; }
  /* Brand color reference: #0877ff (fallback #0078f8) */

  @media only screen and (max-width: 620px) {
    .email-container {
      width: 100% !important;
      max-width: 100% !important;
    }
    .email-header-title {
      font-size: 32px !important;
      line-height: 38px !important;
    }
    .email-header-subtitle {
      font-size: 13px !important;
      line-height: 18px !important;
      padding: 0 16px !important;
    }
    .email-body-content {
      padding: 36px 24px 36px 24px !important;
    }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:'Poppins','Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Centering Outer Wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#ffffff;border-collapse:collapse;margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:0;margin:0;">
        <!-- Email Container (600px width matching reference) -->
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="600" style="width:100%;max-width:600px;background-color:#ffffff;border-collapse:collapse;margin:0 auto;">
          
          <!-- HEADER ROW -->
          <tr>
            <td align="center" bgcolor="#0877ff" style="background-color:#0877ff;padding:0;margin:0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
                <!-- Header Top Spacing -->
                <tr>
                  <td height="50" style="height:50px;line-height:50px;font-size:0;mso-line-height-rule:exactly;">&nbsp;</td>
                </tr>
                <!-- Company Name -->
                <tr>
                  <td align="center" style="padding:0 24px;">
                    <h1 class="email-header-title" style="margin:0;font-family:'Poppins','Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;font-size:48px;line-height:54px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;text-align:center;">Digital Crazy Hub</h1>
                  </td>
                </tr>
                <!-- Gap between Title and Subtitle -->
                <tr>
                  <td height="16" style="height:16px;line-height:16px;font-size:0;mso-line-height-rule:exactly;">&nbsp;</td>
                </tr>
                <!-- Subtitle -->
                <tr>
                  <td align="center" style="padding:0 30px;">
                    <p class="email-header-subtitle" style="margin:0 auto;font-family:'Poppins','Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:22px;font-weight:400;color:#ffffff;text-align:center;max-width:480px;">Design a clean, professional confirmation email matching Digital Crazy Hub&#8217;s website branding.</p>
                  </td>
                </tr>
                <!-- Gap between Subtitle and Plane -->
                <tr>
                  <td height="20" style="height:20px;line-height:20px;font-size:0;mso-line-height-rule:exactly;">&nbsp;</td>
                </tr>
                <!-- Paper Plane Image Positioned at Bottom of Blue Header -->
                <tr>
                  <td align="left" valign="bottom" style="line-height:0;font-size:0;padding:0;margin:0;overflow:hidden;">
                    {$planeBlock}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY ROW -->
          <tr>
            <td class="email-body-content" bgcolor="#ffffff" style="background-color:#ffffff;padding:56px 60px 46px 60px;font-family:'Poppins','Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:18px;color:#000000;text-align:left;">
              
              <p style="margin:0 0 19px 0;font-size:15px;line-height:18px;color:#000000;text-align:left;">Dear {$name},</p>

              <p style="margin:0 0 19px 0;font-size:15px;line-height:18px;color:#000000;text-align:left;">Thank you for contacting <strong>Digital Crazy Hub</strong>!</p>

              <p style="margin:0 0 19px 0;font-size:15px;line-height:18px;color:#000000;text-align:left;">We have successfully received your inquiry through our website. We appreciate your interest in our services.</p>

              <p style="margin:0 0 19px 0;font-size:15px;line-height:18px;color:#000000;text-align:left;">Our team will review your requirements and get in touch with you shortly to discuss how we can help your business grow with the right digital solutions.</p>

              <p style="margin:0 0 19px 0;font-size:15px;line-height:18px;color:#000000;text-align:left;">If you have any additional questions or requirements, please feel free to contact us.</p>

              <p style="margin:0 0 19px 0;font-size:15px;line-height:18px;color:#000000;text-align:left;">We look forward to connecting with you and helping your business achieve its digital goals.</p>

              <p style="margin:0;font-size:15px;line-height:18px;color:#000000;text-align:left;">
                Best regards,<br />
                <strong>Team Digital Crazy Hub</strong>
              </p>

            </td>
          </tr>

          <!-- FOOTER ROW -->
          <tr>
            <td bgcolor="#0877ff" height="15" style="background-color:#0877ff;height:15px;line-height:15px;font-size:0;padding:0;margin:0;mso-line-height-rule:exactly;">
              &nbsp;
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }

    /**
     * Customer Acknowledgement Plain Text Template.
     */
    public function buildCustomerPlainTextTemplate(array $lead): string
    {
        $rawName = trim((string)($lead['name'] ?? ''));
        $name = $rawName !== '' ? $rawName : 'Valued Client';

        return <<<TEXT
Dear {$name},

Thank you for contacting Digital Crazy Hub!

We have successfully received your inquiry through our website. We appreciate your interest in our services.

Our team will review your requirements and get in touch with you shortly to discuss how we can help your business grow with the right digital solutions.

If you have any additional questions or requirements, please feel free to contact us.

We look forward to connecting with you and helping your business achieve its digital goals.

Best regards,
Team Digital Crazy Hub
TEXT;
    }
}
