# Digital Crazy Hub — Complete Production Backend & Secure Company Profile Download

Production-grade PHP 8.2+ backend with MySQL 8.0+ persistence, PDO prepared statements, PHPMailer SMTP delivery, Google reCAPTCHA v3 spam protection, Google Sheets integration, and **Secure Tokenized Company Profile PDF Download with Lead Capture**.

---

## 1. System Architecture Overview

```
backend/
├── public/
│   └── api/
│       ├── contact.php                    # Contact Us lead intake endpoint
│       ├── request-company-profile.php    # Company Profile lead capture & token issuer
│       └── download-company-profile.php   # Authenticated one-time PDF streaming
├── api/                                   # Root API proxies (for flexible routing)
│   ├── contact.php
│   ├── request-company-profile.php
│   └── download-company-profile.php
├── src/
│   ├── Config/
│   │   ├── Database.php                   # Singleton PDO connection with secure defaults
│   │   └── Env.php                        # Typed environment variable loader (Dotenv)
│   ├── Controllers/
│   │   ├── ContactController.php          # Contact form request handler & orchestrator
│   │   └── ProfileDownloadController.php  # Lead capture, token hashing & PDF streamer
│   ├── Repositories/
│   │   ├── LeadRepository.php             # Leads & transactional retry outbox persistence
│   │   └── ProfileDownloadRepository.php  # Company profile leads & atomic token consumption
│   ├── Services/
│   │   ├── EmailService.php               # PHPMailer SMTP with branded HTML templates
│   │   ├── GoogleSheetsService.php        # Google Apps Script webhook integration
│   │   └── RecaptchaService.php           # Google reCAPTCHA v3 server verification
│   ├── Security/
│   │   ├── Logger.php                     # Structured file logging with credential redaction
│   │   └── RateLimiter.php                # Atomic sliding-window file-based rate limiter
│   └── Validation/
│       ├── ContactValidator.php           # Strict validation across all 7 contact fields
│       └── ProfileDownloadValidator.php   # Validation for company profile download leads
├── database/
│   └── schema.sql                         # MySQL 8.0+ schema for leads, outbox & downloads
├── storage/
│   ├── documents/                         # Private, unexposed documents directory
│   │   └── digital-crazy-hub-company-profile.pdf
│   └── ratelimit/                         # Atomic rate limit locks & timestamps
├── logs/
│   └── app.log                            # Application activity & error logs
├── tests/
│   ├── test_backend.php                   # Automated test suite (54 assertions)
│   └── test_profile_download.php          # Company profile test suite (24 assertions)
├── .env.example                           # Configuration template with placeholder settings
├── .htaccess                              # Apache rules restricting access to internal files
├── composer.json                          # Composer dependencies & PSR-4 mapping
└── README.md                              # Complete setup & deployment documentation
```

---

## 2. Feature: Secure Company Profile PDF Download

### The Problem
Previously, the homepage hero button was a public HTML link:
`<a href="/assets/file/company-profile.pdf" download>Download Profile</a>`
This exposed the company profile to direct downloads and web scrapers without capturing the visitor's name, phone, or location.

### The Solution
1. **Public File Relocation & Blocking**:
   - The original PDF was relocated to a private directory outside direct web access: `backend/storage/documents/digital-crazy-hub-company-profile.pdf`.
   - The public directory `assets/file/` has an active `.htaccess` file denying all direct requests (`Require all denied`).
   - Any direct attempt to navigate to `/assets/file/company-profile.pdf` yields `403 Forbidden` / `404 Not Found`.

2. **Frontend Lead Capture Modal (`#modal-company-profile`)**:
   - Clicking the "Download Profile" button in the hero banner opens a modern, branded popup modal.
   - Captures: **Name**, **Phone Number** (with country dialing code prefix), **Location**, and **Explicit Consent Checkbox**.
   - Accessible keyboard support (Focus trapping, `Escape` key close, and focus restoration to button).
   - Real-time client-side and server-side validation.

3. **Backend Authorization & One-Time Token Generation**:
   - Upon valid submission to `backend/api/request-company-profile.php`, the visitor's lead is stored in MySQL.
   - The backend generates a cryptographically unpredictable 32-byte token (`bin2hex(random_bytes(32))`), computes its SHA-256 hash, and stores the hash with a 5-minute expiration timestamp.
   - The plain token is returned to the browser in a secure single-use download link:
     `backend/api/download-company-profile.php?token=<TOKEN>`

4. **Atomic Token Consumption & Safe PDF Streaming**:
   - When the browser calls `backend/api/download-company-profile.php?token=<TOKEN>`, the endpoint:
     1. Computes the SHA-256 hash of the incoming token.
     2. Runs an atomic database update:
        ```sql
        UPDATE `company_profile_downloads`
        SET `download_token_used_at` = NOW()
        WHERE `download_token_hash` = :hash
          AND `download_token_used_at` IS NULL
          AND `download_token_expires_at` > NOW();
        ```
     3. If `rowCount() === 1`: The token was consumed successfully. The server sets:
        - `Content-Type: application/pdf`
        - `Content-Disposition: attachment; filename="Digital-Crazy-Hub-Company-Profile.pdf"`
        - `X-Content-Type-Options: nosniff`
        - `Cache-Control: private, no-store, no-cache, must-revalidate`
        and streams the PDF safely to the visitor.
     4. If `rowCount() === 0`: The link is invalid, expired, or was already used. The request is rejected with `HTTP 410 / 403`. Concurrent replay requests cannot reuse the token!

---

## 3. Database Setup (MySQL 8.0+)

### Step 1: Create Database and Import Schema
Run the provided SQL file using MySQL CLI or phpMyAdmin:

```bash
# Using MySQL Command Line
mysql -u root -p < backend/database/schema.sql
```

This creates the database `dch_db` with three tables:
1. `leads`: Stores inquiries from the main Contact Us form.
2. `lead_sync_outbox`: Transactional outbox retry queue for external SMTP & Google Sheets integrations.
3. `company_profile_downloads`: Stores captured leads and SHA-256 hashed download authorization tokens.

### Step 2: Dedicated MySQL User (Production Best Practice)
Create a dedicated user with restricted permissions:

```sql
CREATE USER 'dch_user'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT SELECT, INSERT, UPDATE, DELETE ON `dch_db`.* TO 'dch_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 4. Environment Configuration (`.env`)

Duplicate `.env.example` to create `.env` inside `backend/`:

```bash
cp backend/.env.example backend/.env
```

Configure your production parameters:

```ini
# Application Mode
APP_ENV=production
APP_URL=https://digitalcrazyhub.com
APP_DEBUG=false
ALLOWED_ORIGIN=https://digitalcrazyhub.com

# MySQL Database
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=dch_db
DB_USER=dch_user
DB_PASS=YOUR_STRONG_PASSWORD
DB_CHARSET=utf8mb4

# PHPMailer SMTP Settings
MAIL_ENABLED=true
SMTP_HOST=smtp.your-mail-provider.com
SMTP_PORT=587
SMTP_ENCRYPTION=tls
SMTP_USERNAME=info@digitalcrazyhub.com
SMTP_PASSWORD=YOUR_SMTP_PASSWORD
MAIL_FROM_ADDRESS=info@digitalcrazyhub.com
MAIL_FROM_NAME="Digital Crazy Hub"
MAIL_ADMIN_ADDRESS=info@digitalcrazyhub.com

# Google reCAPTCHA v3
RECAPTCHA_ENABLED=true
RECAPTCHA_SITE_KEY=your-recaptcha-v3-site-key
RECAPTCHA_SECRET_KEY=your-recaptcha-v3-secret-key
RECAPTCHA_SCORE_THRESHOLD=0.5
RECAPTCHA_ALLOWED_HOSTNAMES=digitalcrazyhub.com,www.digitalcrazyhub.com

# Google Sheets Webhook
GOOGLE_SHEETS_ENABLED=false
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
GOOGLE_SHEETS_WEBHOOK_SECRET=your-random-webhook-secret-token

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=5
RATE_LIMIT_DECAY_SECONDS=600

# Company Profile PDF Settings
PROFILE_DOWNLOAD_TOKEN_EXPIRY=300
PROFILE_PDF_PATH=storage/documents/digital-crazy-hub-company-profile.pdf
```

> **Note on Company Profile PDF:** For security and repository hygiene, `storage/documents/*.pdf` files are excluded from Git version control. Upload the company profile PDF to the server manually via SFTP or cPanel (e.g. to `backend/storage/documents/digital-crazy-hub-company-profile.pdf` or an external secure directory outside the web root), then set `PROFILE_PDF_PATH` in `backend/.env` (relative paths resolve against the `backend/` directory; absolute paths stay as-is).

---

## 5. Google Sheets Integration (Google Apps Script)

To automatically record leads into Google Sheets without complex GCP API keys:

1. Create a new Google Spreadsheet in your Google Drive (e.g. `Digital Crazy Hub Leads`).
2. Go to **Extensions > Apps Script**.
3. Replace the script code with:

```javascript
function doPost(e) {
  try {
    const SECRET_KEY = "your-random-webhook-secret-token"; // Must match GOOGLE_SHEETS_WEBHOOK_SECRET in .env
    
    const requestSecret = e.parameter.secret || (e.postData ? JSON.parse(e.postData.contents).secret : '');
    // Or inspect headers
    
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add header row if first entry
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Reference ID", "Name", "Phone", "Email",
        "Location", "Service", "Message", "Landing Page",
        "UTM Source", "UTM Medium", "UTM Campaign", "Status"
      ]);
    }
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.uuid || "",
      data.name || "",
      data.phone || "",
      data.email || "",
      data.location || "",
      data.service || "",
      data.message || "",
      data.page_url || "",
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || "",
      data.status || "new"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Deploy > New deployment**.
5. Select type: **Web app**.
6. Set:
   - **Execute as**: *Me*
   - **Who has access**: *Anyone*
7. Copy the generated Web App URL into `GOOGLE_SHEETS_WEBHOOK_URL` and set `GOOGLE_SHEETS_ENABLED=true` in `backend/.env`.

---

## 6. Running Automated Tests

To execute the full test suite verifying validators, rate limiting, token security, and email templates:

```bash
# Main Backend Test Suite (54 Assertions)
php -c backend/php.ini backend/tests/test_backend.php

# Company Profile Download Test Suite (24 Assertions)
php -c backend/php.ini backend/tests/test_profile_download.php
```

All 78 tests run without external dependencies and assert:
- International phone normalization & RFC email validation.
- Rate limiting sliding windows & auto-cleanup.
- Automatic redaction of passwords, tokens, and secrets from logs.
- Single-use token consumption, replay prevention, and expiration handling.
- PDF private file integrity and public download blocking.

---

## 7. Security Best Practices & Deployment Checklist

- [x] **Zero Plaintext Tokens**: Only SHA-256 hashes of download tokens are stored in the database.
- [x] **Race-Condition Protection**: Atomic single-query token consumption (`UPDATE ... WHERE used_at IS NULL ...`) prevents simultaneous download reuse.
- [x] **Path Traversal Protection**: Download endpoints stream strictly from trusted, hardcoded or server-configured paths; arbitrary filenames from user input are ignored.
- [x] **Public Directory Lockdown**: `assets/file/.htaccess` blocks all direct document downloads.
- [x] **Internal Directory Protection**: `backend/.htaccess` prohibits direct browser access to `src/`, `database/`, `logs/`, `storage/`, `vendor/`, and `.env`.
- [x] **Input Sanitization**: All incoming inputs are trimmed, length-bounded, and filtered before persistence.
- [x] **No Leaked Errors**: Internal database exceptions and stack traces are logged locally to `logs/app.log` and never sent to the browser.
