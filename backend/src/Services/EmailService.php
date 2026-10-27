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
        $this->fromAddress = Env::getString('MAIL_FROM_ADDRESS', 'info@digitalcrazyhub.com');
        $this->fromName = Env::getString('MAIL_FROM_NAME', 'Digital Crazy Hub');
        $this->adminRecipient = Env::getString('MAIL_ADMIN_ADDRESS', 'info@digitalcrazyhub.com');
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
            return true;
        }

        if (empty($this->host) || $this->host === 'smtp.example.com') {
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
            Logger::info('Admin notification email delivered successfully', ['lead_uuid' => $lead['uuid'] ?? '']);
            return true;
        } catch (PHPMailerException $e) {
            Logger::error('PHPMailer failed to send admin notification', [
                'error' => $e->getMessage(),
                'lead_uuid' => $lead['uuid'] ?? '',
            ]);
            return false;
        } catch (Throwable $e) {
            Logger::error('Unexpected error sending admin notification', [
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
            return true;
        }

        if (empty($this->host) || $this->host === 'smtp.example.com') {
            Logger::warning('SMTP host is not configured; skipping customer acknowledgement', ['lead_uuid' => $lead['uuid'] ?? '']);
            return false;
        }

        try {
            $mailer = $this->createMailer();
            $mailer->addAddress($lead['email'], $lead['name']);
            $mailer->addReplyTo($this->adminRecipient, $this->fromName);

            $mailer->isHTML(true);
            $mailer->Subject = 'Thank you for reaching out to Digital Crazy Hub!';
            $mailer->Body = $this->buildCustomerHtmlTemplate($lead);
            $mailer->AltBody = $this->buildCustomerPlainTextTemplate($lead);

            $mailer->send();
            Logger::info('Customer acknowledgement email sent successfully', [
                'customer_email' => $lead['email'],
                'lead_uuid' => $lead['uuid'] ?? '',
            ]);
            return true;
        } catch (PHPMailerException $e) {
            Logger::error('PHPMailer failed to send customer acknowledgement', [
                'customer_email' => $lead['email'] ?? '',
                'error' => $e->getMessage(),
            ]);
            return false;
        } catch (Throwable $e) {
            Logger::error('Unexpected error sending customer acknowledgement', [
                'customer_email' => $lead['email'] ?? '',
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Internal Admin Email HTML Template.
     */
    private function buildAdminHtmlTemplate(array $lead): string
    {
        $name = htmlspecialchars($lead['name'] ?? '', ENT_QUOTES, 'UTF-8');
        $phone = htmlspecialchars($lead['phone'] ?? '', ENT_QUOTES, 'UTF-8');
        $email = htmlspecialchars($lead['email'] ?? '', ENT_QUOTES, 'UTF-8');
        $location = htmlspecialchars($lead['location'] ?? '', ENT_QUOTES, 'UTF-8');
        $service = htmlspecialchars($lead['service'] ?? '', ENT_QUOTES, 'UTF-8');
        $message = nl2br(htmlspecialchars($lead['message'] ?? '', ENT_QUOTES, 'UTF-8'));
        $uuid = htmlspecialchars($lead['uuid'] ?? 'N/A', ENT_QUOTES, 'UTF-8');
        $pageUrl = htmlspecialchars($lead['page_url'] ?? 'Direct submission', ENT_QUOTES, 'UTF-8');
        $ip = htmlspecialchars($lead['ip_address'] ?? 'N/A', ENT_QUOTES, 'UTF-8');
        $timestamp = htmlspecialchars($lead['created_at'] ?? date('Y-m-d H:i:s T'), ENT_QUOTES, 'UTF-8');

        // UTMs
        $utmList = '';
        $utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        foreach ($utms as $utm) {
            if (!empty($lead[$utm])) {
                $utmList .= sprintf('<tr><td style="padding:6px 12px;color:#888;font-size:13px;">%s:</td><td style="padding:6px 12px;color:#fff;font-size:13px;font-weight:600;">%s</td></tr>',
                    htmlspecialchars($utm, ENT_QUOTES, 'UTF-8'),
                    htmlspecialchars((string)$lead[$utm], ENT_QUOTES, 'UTF-8')
                );
            }
        }

        $utmSection = $utmList !== '' ? "
            <h3 style=\"color:#fff;margin:24px 0 8px;font-size:15px;letter-spacing:0.5px;\">Campaign Attribution</h3>
            <table style=\"width:100%;border-collapse:collapse;background:#1a1a1a;border-radius:6px;overflow:hidden;\">
                $utmList
            </table>
        " : '';

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>New Lead Notification</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0f11;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e6e6e6;">
<div style="max-width:620px;margin:30px auto;background:#18181c;border:1px solid #2a2a32;border-radius:12px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.5);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg, #E50914 0%, #990000 100%);padding:28px 32px;text-align:left;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">DIGITAL CRAZY HUB</h1>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">⚡ New Business Enquiry Received</p>
    </div>

    <!-- Content -->
    <div style="padding:32px;">
        <p style="margin:0 0 20px;font-size:15px;color:#bbb;">A new prospective client enquiry has been submitted through the Digital Crazy Hub website:</p>

        <!-- Lead Summary Card -->
        <table style="width:100%;border-collapse:collapse;background:#1f1f26;border-radius:8px;overflow:hidden;margin-bottom:24px;border:1px solid #2e2e38;">
            <tr>
                <td style="padding:12px 16px;color:#8f90a2;font-size:14px;width:35%;border-bottom:1px solid #2e2e38;">Customer Name</td>
                <td style="padding:12px 16px;color:#ffffff;font-size:15px;font-weight:700;border-bottom:1px solid #2e2e38;">{$name}</td>
            </tr>
            <tr>
                <td style="padding:12px 16px;color:#8f90a2;font-size:14px;border-bottom:1px solid #2e2e38;">Phone Number</td>
                <td style="padding:12px 16px;color:#4ade80;font-size:15px;font-weight:700;border-bottom:1px solid #2e2e38;">
                    <a href="tel:{$phone}" style="color:#4ade80;text-decoration:none;">{$phone}</a>
                </td>
            </tr>
            <tr>
                <td style="padding:12px 16px;color:#8f90a2;font-size:14px;border-bottom:1px solid #2e2e38;">Email Address</td>
                <td style="padding:12px 16px;color:#60a5fa;font-size:14px;font-weight:600;border-bottom:1px solid #2e2e38;">
                    <a href="mailto:{$email}" style="color:#60a5fa;text-decoration:none;">{$email}</a>
                </td>
            </tr>
            <tr>
                <td style="padding:12px 16px;color:#8f90a2;font-size:14px;border-bottom:1px solid #2e2e38;">Location</td>
                <td style="padding:12px 16px;color:#ffffff;font-size:14px;border-bottom:1px solid #2e2e38;">{$location}</td>
            </tr>
            <tr>
                <td style="padding:12px 16px;color:#8f90a2;font-size:14px;border-bottom:1px solid #2e2e38;">Requested Service</td>
                <td style="padding:12px 16px;color:#f87171;font-size:15px;font-weight:700;border-bottom:1px solid #2e2e38;">{$service}</td>
            </tr>
            <tr>
                <td style="padding:12px 16px;color:#8f90a2;font-size:14px;border-bottom:1px solid #2e2e38;">Reference ID</td>
                <td style="padding:12px 16px;color:#94a3b8;font-size:12px;font-family:monospace;border-bottom:1px solid #2e2e38;">{$uuid}</td>
            </tr>
            <tr>
                <td style="padding:12px 16px;color:#8f90a2;font-size:14px;">Submission Time</td>
                <td style="padding:12px 16px;color:#94a3b8;font-size:13px;">{$timestamp} (IP: {$ip})</td>
            </tr>
        </table>

        <!-- Message Box -->
        <h3 style="color:#ffffff;font-size:15px;margin:20px 0 10px;letter-spacing:0.3px;">Client Message:</h3>
        <div style="background:#131317;border-left:4px solid #E50914;padding:16px 20px;border-radius:4px;color:#e2e8f0;font-size:14px;line-height:1.6;">
            {$message}
        </div>

        {$utmSection}

        <div style="margin-top:28px;text-align:center;">
            <a href="mailto:{$email}?subject=Re:%20Digital%20Crazy%20Hub%20Inquiry%20-%20{$service}" style="display:inline-block;background:#E50914;color:#ffffff;text-decoration:none;padding:12px 28px;font-weight:600;font-size:14px;border-radius:6px;box-shadow:0 4px 12px rgba(229,9,20,0.4);">
                Reply to {$name}
            </a>
        </div>
    </div>

    <!-- Footer -->
    <div style="background:#111114;padding:16px 32px;border-top:1px solid #22222a;font-size:12px;color:#6b7280;text-align:center;">
        Digital Crazy Hub Lead Management Engine • <a href="https://digitalcrazyhub.com" style="color:#9ca3af;text-decoration:none;">digitalcrazyhub.com</a>
    </div>
</div>
</body>
</html>
HTML;
    }

    /**
     * Admin Email Plain Text Template.
     */
    private function buildAdminPlainTextTemplate(array $lead): string
    {
        return sprintf(
            "NEW ENQUIRY RECEIVED - DIGITAL CRAZY HUB\n" .
            "-----------------------------------------\n" .
            "Reference ID: %s\n" .
            "Date/Time:    %s\n" .
            "Name:         %s\n" .
            "Phone:        %s\n" .
            "Email:        %s\n" .
            "Location:     %s\n" .
            "Service:      %s\n" .
            "Page URL:     %s\n" .
            "IP Address:   %s\n\n" .
            "MESSAGE:\n%s\n\n" .
            "CAMPAIGN ATTRIBUTION:\n" .
            "Source:   %s\n" .
            "Medium:   %s\n" .
            "Campaign: %s\n" .
            "Term:     %s\n" .
            "Content:  %s\n",
            $lead['uuid'] ?? 'N/A',
            $lead['created_at'] ?? date('Y-m-d H:i:s'),
            $lead['name'] ?? '',
            $lead['phone'] ?? '',
            $lead['email'] ?? '',
            $lead['location'] ?? '',
            $lead['service'] ?? '',
            $lead['page_url'] ?? '',
            $lead['ip_address'] ?? '',
            $lead['message'] ?? '',
            $lead['utm_source'] ?? 'N/A',
            $lead['utm_medium'] ?? 'N/A',
            $lead['utm_campaign'] ?? 'N/A',
            $lead['utm_term'] ?? 'N/A',
            $lead['utm_content'] ?? 'N/A'
        );
    }

    /**
     * Customer Acknowledgement Email HTML Template.
     */
    private function buildCustomerHtmlTemplate(array $lead): string
    {
        $name = htmlspecialchars($lead['name'] ?? 'there', ENT_QUOTES, 'UTF-8');
        $service = htmlspecialchars($lead['service'] ?? 'our digital services', ENT_QUOTES, 'UTF-8');

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Enquiry Received - Digital Crazy Hub</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0b0e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e5e7eb;">
<div style="max-width:600px;margin:30px auto;background:#15151b;border:1px solid #262633;border-radius:12px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.6);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg, #E50914 0%, #800000 100%);padding:32px 32px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:1px;">DIGITAL CRAZY HUB</h1>
        <p style="margin:8px 0 0;color:#fde047;font-size:14px;font-weight:600;">Creative • Strategic • Results-Driven</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 32px 24px;">
        <h2 style="margin:0 0 16px;color:#ffffff;font-size:20px;">Hello {$name},</h2>
        
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d1d5db;">
            Thank you for reaching out to <strong>Digital Crazy Hub</strong>! We have successfully received your enquiry regarding <strong>{$service}</strong>.
        </p>

        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#d1d5db;">
            Our digital marketing and growth specialists are currently reviewing your project requirements. A member of our team will get in touch with you shortly to discuss how we can elevate your brand.
        </p>

        <!-- Inquiry Summary Box -->
        <div style="background:#1b1b24;border:1px solid #2d2d3d;border-radius:8px;padding:20px;margin-bottom:24px;">
            <h3 style="margin:0 0 12px;color:#f87171;font-size:14px;text-transform:uppercase;letter-spacing:0.8px;">Enquiry Summary</h3>
            <p style="margin:4px 0;font-size:14px;color:#9ca3af;"><strong>Service Requested:</strong> <span style="color:#ffffff;">{$service}</span></p>
            <p style="margin:4px 0;font-size:14px;color:#9ca3af;"><strong>Status:</strong> <span style="color:#4ade80;font-weight:600;">Received & Queued for Review</span></p>
        </div>

        <!-- Need Immediate Assistance -->
        <p style="margin:0 0 8px;font-size:14px;color:#9ca3af;">Need immediate assistance? Feel free to contact our Chennai office directly:</p>
        <p style="margin:0 0 24px;font-size:15px;color:#ffffff;">
            📞 <strong>Phone:</strong> <a href="tel:+919659239187" style="color:#60a5fa;text-decoration:none;">+91 9659239187</a><br>
            ✉️ <strong>Email:</strong> <a href="mailto:info@digitalcrazyhub.com" style="color:#60a5fa;text-decoration:none;">info@digitalcrazyhub.com</a><br>
            📍 <strong>Office:</strong> 3rd Floor, S3, Khivraj Building, No: 624, Anna Salai, near Anna Flyover, Thousand Lights, Chennai, TN 600006.
        </p>

        <div style="text-align:center;margin-top:28px;">
            <a href="https://digitalcrazyhub.com/" style="display:inline-block;background:#E50914;color:#ffffff;text-decoration:none;padding:12px 28px;font-weight:600;font-size:14px;border-radius:6px;">
                Visit Our Website
            </a>
        </div>
    </div>

    <!-- Footer -->
    <div style="background:#0e0e13;padding:20px 32px;border-top:1px solid #22222e;font-size:12px;color:#6b7280;text-align:center;line-height:1.5;">
        © 2026 Digital Crazy Hub. All rights reserved.<br>
        This is an automated confirmation email regarding your inquiry submitted at digitalcrazyhub.com.
    </div>
</div>
</body>
</html>
HTML;
    }

    /**
     * Customer Acknowledgement Plain Text Template.
     */
    private function buildCustomerPlainTextTemplate(array $lead): string
    {
        $name = $lead['name'] ?? 'there';
        $service = $lead['service'] ?? 'our digital services';

        return <<<TEXT
Hello {$name},

Thank you for reaching out to Digital Crazy Hub!

We have successfully received your enquiry regarding {$service}. Our team is reviewing your project details and will be in touch with you shortly.

Summary of Your Enquiry:
- Service: {$service}
- Status: Received & Queued for Review

Contact Information:
- Phone: +91 9659239187
- Email: info@digitalcrazyhub.com
- Address: 3rd Floor, S3, Khivraj Building, No: 624, Anna Salai, near Anna Flyover, Thousand Lights West, Thousand Lights, Chennai, Tamil Nadu 600006.
- Website: https://digitalcrazyhub.com/

Best regards,
The Digital Crazy Hub Team
TEXT;
    }
}
