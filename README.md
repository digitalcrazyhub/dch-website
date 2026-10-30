# Digital Crazy Hub — Official Website

Official website repository for **Digital Crazy Hub**, a premier digital marketing agency based in Chennai, Tamil Nadu, India.

---

## 1. Company Profile

- **Company Name:** Digital Crazy Hub
- **Business Type:** Digital Marketing Agency
- **Office Address:**  
  3rd Floor, S3, Khivraj Building,  
  No. 624, Anna Salai, Near Anna Flyover,  
  Thousand Lights West, Thousand Lights,  
  Chennai, Tamil Nadu 600006, India.
- **Phone:** +91 9659239187
- **Email:** [info@digitalcrazyhub.com](mailto:info@digitalcrazyhub.com)
- **Website:** [https://digitalcrazyhub.com](https://digitalcrazyhub.com)
- **Primary Market:** Chennai, Tamil Nadu, India (with additional approved regional markets)

### Core Services
1. Social Media Marketing
2. Google Ads
3. SEO Services
4. Web & App Development
5. Personal Branding
6. Lead Generation
7. Content Marketing
8. Ad Poster & Video Making

---

## 2. Technology Stack & Guidelines

This project strictly adheres to a clean, native, lightweight production stack without unnecessary frontend frameworks or bundlers.

- **Frontend:**
  - Semantic HTML5
  - Modern CSS3 (CSS Custom Properties, Flexbox, CSS Grid)
  - Vanilla JavaScript ES6+ (No jQuery, React, Vue, or Angular)
- **Backend (When Required):**
  - Core PHP
  - MySQL (When database storage is required)
  - Apache HTTP Server (e.g., via local XAMPP environment)
  - Secure environment configuration (`.env` with safe `.env.example`)

---

## 3. Approved Brand Design System

Primary design tokens are centralised in `css/root.css`:

- **Primary Brand Color:** `#0755C9`
- **Secondary Brand Color:** `#6547F5`
- **Dark Brand Navy:** `#0B1730`
- **Backgrounds:** Clean white `#FFFFFF` and light tints (`#F5F6FA`, `#F8F9FD`, `#F0F4FF`)
- **Brand Gradient:** `linear-gradient(135deg, #0755C9 0%, #6547F5 100%)`

---

## 4. Directory Structure

```text
digital-crazy-hub/
│
├── index.html                  # Homepage (Stage 3)
├── about-us.html                  # About Us Page (Stage 5)
├── digital-marketing-services.html               # Services Overview (Stage 6)
├── projects.html               # Portfolio & Case Studies (Stage 8)
├── contact.html                # Contact Page (Stage 9)
│
├── services/                   # Individual Service Pages (Stage 7)
│   ├── social-media-marketing-in-chennai.html
│   ├── google-ads.html
│   ├── seo-digital-marketing-services.html
│   ├── web-app-development.html
│   ├── personal-branding.html
│   ├── lead-generation.html
│   ├── content-marketing.html
│   └── ad-poster-video-making.html
│
├── components/                 # Shared Components
│   ├── navbar.html
│   ├── footer.html
│   └── page-banner.html
│
├── css/                        # Centralized Stylesheets
│   ├── root.css                # CSS Variables & Tokens
│   ├── global.css              # Reset, Base, & Utilities
│   ├── components.css          # Shared Component Styles
│   ├── responsive.css          # Centralized Media Queries
│   └── pages/                  # Page-Specific Stylesheets
│       ├── home.css
│       ├── about.css
│       ├── services.css
│       ├── service-detail.css
│       ├── projects.css
│       └── contact.css
│
├── js/                         # Vanilla JavaScript Modules
│   ├── components.js
│   ├── navbar.js
│   ├── main.js
│   ├── carousel.js
│   ├── animations.js
│   ├── projects.js
│   └── contact.js
│
├── assets/                     # Media & Static Assets
│   ├── images/
│   │   ├── logo/
│   │   ├── hero/
│   │   ├── services/
│   │   ├── projects/
│   │   ├── team/
│   │   ├── testimonials/
│   │   └── company/
│   ├── icons/
│   └── fonts/
│
├── backend/                    # PHP Backend (Isolated & Secure)
│   ├── config/
│   ├── api/
│   ├── services/
│   ├── utils/
│   ├── logs/
│   ├── .env.example            # Safe Environment Variables Template
│   └── .htaccess
│
├── .gitignore                  # Git Ignore Rules
├── README.md                   # Project Overview & Documentation
└── PROJECT_RULES.md            # Master Project Rules & Governance
```

---

## 5. Development Governance & Staged Workflow

Development follows a strict 11-stage process defined in [PROJECT_RULES.md](file:///d:/xampp/htdocs/digitalcrazyhub/PROJECT_RULES.md):

1. **Stage 1:** Project Inspection and Master Rules *(Current)*
2. **Stage 2:** Reference Analysis and Design System
3. **Stage 3:** Homepage Implementation
4. **Stage 4:** Homepage Audit
5. **Stage 5:** About Us Page
6. **Stage 7:** Individual Service Pages
7. **Stage 8:** Projects or Portfolio
8. **Stage 9:** Contact Page and Backend
9. **Stage 10:** SEO, Legal Pages, and Supporting Files
10. **Stage 11:** Website-Wide Audit

---

## 6. Local Development Setup

1. **Prerequisites:**
   - XAMPP / Apache with PHP 8.x installed.
   - Project directory located at `htdocs/digitalcrazyhub`.
2. **Accessing Local Server:**
   - Start Apache via XAMPP Control Panel.
   - Access URL: `http://localhost/digitalcrazyhub/`
3. **Configuration:**
   - Copy `backend/.env.example` to `backend/.env` when backend features are configured.
   - Never commit sensitive production credentials.
4. **Company Profile Document:**
   - Upload the company profile PDF to the server manually (via SFTP/cPanel) to `backend/storage/documents/digital-crazy-hub-company-profile.pdf` or an external secure directory specified in `PROFILE_PDF_PATH`.
