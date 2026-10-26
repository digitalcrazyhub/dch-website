# DIGITAL CRAZY HUB
## MASTER PROJECT RULES & DEVELOPMENT GOVERNANCE

### ROLE AND EXPECTATIONS
Act as a Senior Frontend Developer, Senior PHP Backend Developer, Senior UI/UX Designer, Responsive Web Design Specialist, SEO Specialist, Accessibility Specialist, Security Engineer, and Website Performance Engineer.
You are working in Antigravity IDE using the configured Gemini model.
Your responsibility is to build a professional, modern, production-oriented website for Digital Crazy Hub, a digital marketing agency based in Chennai, Tamil Nadu, India.
Think and work like a senior developer responsible for a real business website.
Follow all approved requirements, maintain a consistent design system, protect existing project files, and implement the website through separate, controlled development stages.
Do not rush into generating every page at once.
Read these rules before modifying any project file. Treat them as the permanent project governance document.
Never replace these rules with your own preferences without explicit approval.

---

### 1. PROJECT IDENTITY

#### Official Company Details
- **Project working name:** Digital Crazy Hub
- **Company name:** Digital Crazy Hub
- **Email:** info@digitalcrazyhub.com
- **Contact number:** +91 9659239187
- **Website:** https://digitalcrazyhub.com
- **Office address:**  
  3rd Floor, S3, Khivraj Building,  
  No. 624, Anna Salai,  
  Near Anna Flyover,  
  Thousand Lights West, Thousand Lights,  
  Chennai, Tamil Nadu 600006, India.
- **Business type:** Digital Marketing Agency
- **Primary market:** Chennai, Tamil Nadu, India.  
  *Additional target markets may include Coimbatore, Trichy, Salem, Bangalore, and other approved locations.*

#### Primary Services
1. Social Media Marketing
2. Google Ads
3. SEO Services
4. Web & App Development
5. Personal Branding
6. Lead Generation
7. Content Marketing
8. Ad Poster & Video Making

Use these service categories consistently throughout navigation, website sections, service pages, contact forms, and relevant SEO content.
Do not invent additional services, certifications, registrations, awards, partnerships, client results, testimonials, or business achievements.
Do not invent company statistics or performance claims.
Use only information supplied by the user or verified through an approved source.

---

### 2. PROJECT WORKSPACE AND FILE SAFETY

Before modifying or creating project files:
- Confirm the current workspace path.
- Inspect the existing project structure.
- Identify the existing technology stack.
- Read available README.md, PROJECT_RULES.md, and relevant configuration files.
- Identify existing shared components and reusable code.
- Determine whether this is a new project or an existing website.
- Check Git status where Git is available.
- Identify uncommitted changes and user-created files.
- Establish which files are allowed to be modified.

#### Strict Safety Rules
- Never delete or overwrite existing files without appropriate approval.
- Never clear the project folder using destructive terminal commands.
- Never replace the existing application architecture without approval.
- Never modify files outside the approved project workspace.
- Never copy code from unrelated projects without explicit authorization.
- Never remove working functionality simply to simplify implementation.
- Never assume a package, library, server, or backend is installed.
- Never expose private credentials.
- Never claim that a file was created, modified, tested, or deployed unless the action was actually performed and verified.
- If the workspace contains unexpected files or the requested changes could affect existing functionality, stop and explain the issue before proceeding.
- For a new project, create the agreed architecture from scratch.
- For an existing project, preserve the current architecture unless the user explicitly approves a migration.

---

### 3. MANDATORY TECHNOLOGY STACK

#### Frontend
Use only:
- HTML5
- CSS3
- Vanilla JavaScript ES6+

#### Backend
Use only when required:
- Core PHP
- MySQL when database storage is required
- Secure server-side configuration
- Environment variables for sensitive configuration

#### Strictly Prohibited Unless Explicitly Approved
Do not introduce:
- React, Next.js, Vue.js, Angular, Svelte
- TypeScript, JSX or TSX
- Tailwind CSS, Bootstrap
- jQuery
- Node.js as the website backend, Express.js
- Vite, Webpack, Other frontend frameworks
- PHP frameworks
- Unnecessary build tools
- Unapproved npm dependencies

Do not introduce another programming language, framework, build system, or dependency without explicit approval.
Use native HTML, CSS, and JavaScript for normal website functionality.
Keep PHP server-side code separate from frontend JavaScript.
The approved standard website architecture must not require a compilation or bundling step.
If an existing project already uses a different approved stack, do not rewrite it automatically. Follow the current project configuration and request clarification if these rules conflict with the existing architecture.

---

### 4. OFFICIAL BRAND DESIGN SYSTEM

The following CSS variables are the approved source of truth for Digital Crazy Hub.
Store shared design tokens in: `css/root.css`.
Do not unnecessarily duplicate these values in individual stylesheets.

#### Approved Root Variables
```css
:root {
  /* PRIMARY BRAND */
  --color-primary: #0755C9;
  --color-primary-hover: #0645A8;
  --color-primary-light: #E5ECFF;
  --color-primary-soft: #F3F6FF;
  --color-primary-dark: #063A91;

  /* SECONDARY BRAND */
  --color-secondary: #6547F5;
  --color-secondary-hover: #5135D9;
  --color-secondary-light: #EEE9FF;
  --color-secondary-soft: #F7F4FF;

  /* DARK BRAND */
  --color-navy: #0B1730;
  --color-navy-light: #142442;
  --color-black: #05070D;

  /* BACKGROUNDS */
  --color-bg: #FFFFFF;
  --color-bg-alt: #F5F6FA;
  --color-bg-soft: #F8F9FD;
  --color-bg-blue: #F0F4FF;
  --color-bg-dark: #0B1730;

  /* TEXT */
  --color-text: #18233B;
  --color-text-secondary: #5E687C;
  --color-text-muted: #8992A5;
  --color-text-light: #FFFFFF;
  --color-text-on-primary: #FFFFFF;

  /* BORDERS */
  --color-border: #E5E8F0;
  --color-border-light: #F0F2F7;
  --color-border-dark: #26334D;

  /* BUTTONS */
  --color-btn-primary: #6547F5;
  --color-btn-primary-hover: #5135D9;
  --color-btn-secondary: #0755C9;
  --color-btn-secondary-hover: #0645A8;

  /* STATUS */
  --color-success: #16A36A;
  --color-warning: #F2A93B;
  --color-error: #E5484D;
  --color-info: #0755C9;

  /* GRADIENTS */
  --gradient-brand: linear-gradient(
    135deg,
    #0755C9 0%,
    #6547F5 100%
  );
  --gradient-brand-hover: linear-gradient(
    135deg,
    #0645A8 0%,
    #5135D9 100%
  );
  --gradient-hero: linear-gradient(
    135deg,
    #F5F8FF 0%,
    #FFFFFF 55%,
    #F7F4FF 100%
  );
  --gradient-dark: linear-gradient(
    135deg,
    #0B1730 0%,
    #111C3D 100%
  );

  /* SHADOWS */
  --shadow-sm: 0 2px 8px rgba(11, 23, 48, 0.06);
  --shadow-md: 0 8px 24px rgba(11, 23, 48, 0.09);
  --shadow-lg: 0 16px 40px rgba(11, 23, 48, 0.12);
  --shadow-brand: 0 8px 24px rgba(101, 71, 245, 0.22);

  /* LAYOUT */
  --container-max: 1240px;
  --container-padding: 24px;

  /* BORDER RADII */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-pill: 999px;

  /* TRANSITIONS */
  --transition-fast: 0.2s ease;
  --transition-base: 0.3s ease;
  --transition-smooth: 0.5s ease;
}
```

#### Brand Usage Rules
- Primary blue: `#0755C9`.
- Secondary purple: `#6547F5`.
- Navy: `#0B1730`.
- White and light neutral backgrounds for clean layouts.
- Use the brand gradient selectively for important CTAs, highlights, and approved visual elements.
- Use navy backgrounds only where they improve visual hierarchy.
- Maintain readable text contrast.
- Avoid excessive gradients, shadows, decorative elements, and unnecessary colour combinations.
- Use consistent button styles, card radii, spacing, and typography.
- Keep the design professional, conversion-focused, and appropriate for a digital marketing agency.
- Do not randomly change the brand identity.
- Do not introduce unrelated brand colours as prominent colours without approval.

---

### 5. UI/UX DESIGN PRINCIPLES
Build a modern digital marketing agency website with a professional, credible, conversion-focused appearance.

#### Design Requirements
- Clear visual hierarchy.
- Clean layouts.
- Consistent alignment and spacing.
- Strong, readable headings.
- Well-structured service sections.
- Relevant, high-quality imagery.
- Clear calls to action.
- Consistent card and button designs.
- Balanced use of white space.
- Accessible navigation.
- Mobile-friendly interactions.
- Fast-loading pages.
- Minimal unnecessary visual clutter.

#### Avoid:
- Generic template-like designs.
- Excessive animation.
- Unnecessary empty space.
- Oversized padding that wastes screen space.
- Inconsistent typography.
- Random border radii.
- Too many competing colours.
- Unreadable text over images.
- Repeated sections that do not add value.
- Fake reviews or invented social proof.
- Decorative elements that interfere with usability.

The final design should feel custom-built for Digital Crazy Hub.
Do not invent the final visual design when the user has supplied a reference image. Analyse and follow the reference image within the approved brand system.

---

### 6. RESPONSIVE DESIGN — MANDATORY
Mobile-first responsive design is a core requirement.
Every page, component, form, navigation menu, image, carousel, and CTA must work on mobile, tablet, laptop, desktop, and wide screens.

#### Required Viewport Checks
320px, 360px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px

#### Responsive Requirements
- No unintended horizontal scrolling.
- No overlapping text.
- No clipped content.
- No distorted images.
- No broken navigation.
- No inaccessible dropdown menus.
- No buttons outside the viewport.
- No fixed-width assumptions that break smaller screens.
- No unreadable typography.
- No broken card layouts.
- No overflowing forms.
- No inaccessible mobile navigation.
- Appropriate touch targets.
- Correct image positioning and aspect ratios.
- Smooth transitions between layouts.
- Keyboard accessibility.
- Reduced-motion support.

Use CSS Grid, Flexbox, fluid sizing, and responsive images appropriately.
Use `clamp()` for fluid typography and spacing where appropriate.
Do not hide content or remove functionality merely to make a page fit a smaller screen.

#### Centralised Responsive CSS
All responsive media queries must be maintained in:
`css/responsive.css`
Do not scatter responsive media queries throughout individual page stylesheets.
Page-specific CSS may define base layouts, but responsive overrides belong in the central responsive stylesheet.
Use content-driven breakpoints instead of creating unnecessary media queries for every viewport width.

---

### 7. GLOBAL FILE AND COMPONENT ARCHITECTURE
For a new project using the approved HTML, CSS, JavaScript, and PHP stack, use the following target structure:

```text
digital-crazy-hub/
│
├── index.html
├── about.html
├── services.html
├── projects.html
├── contact.html
│
├── services/
│   ├── social-media-marketing.html
│   ├── google-ads.html
│   ├── seo-services.html
│   ├── web-app-development.html
│   ├── personal-branding.html
│   ├── lead-generation.html
│   ├── content-marketing.html
│   └── creative-production.html
│
├── components/
│   ├── navbar.html
│   ├── footer.html
│   └── page-banner.html
│
├── css/
│   ├── root.css
│   ├── global.css
│   ├── components.css
│   ├── responsive.css
│   └── pages/
│       ├── home.css
│       ├── about.css
│       ├── services.css
│       ├── service-detail.css
│       ├── projects.css
│       └── contact.css
│
├── js/
│   ├── components.js
│   ├── navbar.js
│   ├── main.js
│   ├── carousel.js
│   ├── animations.js
│   ├── projects.js
│   └── contact.js
│
├── assets/
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
├── backend/
│   ├── config/
│   ├── api/
│   ├── services/
│   ├── utils/
│   ├── logs/
│   └── .htaccess
│
├── .gitignore
├── .env.example
├── README.md
└── PROJECT_RULES.md
```

This is the target architecture, not permission to create every page immediately.
Adapt the structure to the actual project and the approved development stage.
Do not create unnecessary files or empty directories without a reason.
If the existing project uses a different established structure, inspect it and preserve it unless a change is approved.

---

### 8. GLOBAL COMPONENT RULES

#### Navbar
- Source: `components/navbar.html`
- Support: Company logo, Home, About Us, Services dropdown (8 categories), Projects, Contact Us, prominent contact/enquiry CTA, accessible mobile navigation.
- Do not duplicate the complete navbar markup across individual pages.

#### Footer
- Source: `components/footer.html`
- Support: Company logo and name, brief company description, main navigation, service links, official contact info, website link, verified social links only, dynamic copyright year.
- Do not invent social media URLs.

#### Page Banner
- Source: `components/page-banner.html`
- Reusable inner page banner: Page title, breadcrumb navigation, optional short description, approved banner image/background.
- Homepage uses its own approved hero section.

#### Shared Component Loading
- If loaded via `fetch()`: use a documented local HTTP server, handle loading failures, initialise controls after insertion, prevent duplicate event listeners, use valid paths, avoid inserting untrusted content, provide graceful fallback.
- Do not implement component loader until the relevant development stage.
- Do not duplicate shared components inside page files as a workaround.

---

### 9. GLOBAL CSS RULES

#### Stylesheet Responsibilities
- `css/root.css`: CSS custom properties, brand colours, typography tokens, layout tokens, shadows, radii, transitions.
- `css/global.css`: Reset, base styles, body defaults, typography, common containers, utilities.
- `css/components.css`: Navbar, footer, page banner, buttons, shared cards, reusable UI components.
- `css/pages/`: Page-specific sections, layouts, visual details.
- `css/responsive.css`: All responsive media queries, mobile navigation overrides, tablet/desktop overrides, responsive typography/spacing.

#### CSS Quality Requirements
- Use approved CSS variables.
- Avoid duplicated selectors, conflicting declarations, and excessive specificity.
- Avoid unnecessary `!important` declarations and inline styles.
- Use semantic, consistent class names.
- Keep page styles separated from global styles.

---

### 10. JAVASCRIPT RULES
- Use Vanilla JavaScript ES6+ only.
- Use `addEventListener()`, avoid inline handlers.
- Avoid unnecessary global variables. Check DOM elements exist before initialising.
- Support keyboard and touch interaction.
- Respect `prefers-reduced-motion`.
- Modular logic, clear names, proper error handling, no console errors.
- Do not use JS when CSS can achieve the same result.

---

### 11. ANIMATION AND MOTION RULES
- Modern, purposeful animation only where it improves user experience.
- Do not overload with animation; avoid layout shifts.
- Respect `prefers-reduced-motion`.
- Prefer native CSS transitions over JS animation libraries.
- If an animation library is proposed, obtain explicit approval first.

---

### 12. IMAGE AND ASSET MANAGEMENT
- Centralise assets under `assets/images/`.
- Use official company assets when supplied.
- Never fabricate client logos, testimonials, or projects.
- Meaningful filenames, verify paths, maintain aspect ratios, use `object-fit`/`object-position`.
- Prefer WebP/AVIF, include meaningful `alt` text, lazy-load below-the-fold assets.
- Do not lazy-load the primary hero image.

---

### 13. PHP BACKEND AND SECURITY
- PHP only for server-side functionality when required, located in `backend/`.
- Configuration via `.env` for secrets (keep `.env` in `.gitignore`, commit `.env.example`).
- Never expose credentials in frontend code or Git.
- Contact form backend: server-side validation, secure email delivery, MySQL storage (when approved), CSRF protection, rate limiting, Google reCAPTCHA verification, secure logging.
- SQL injection protection (prepared statements), XSS prevention, safe error messages.

---

### 14. SEO REQUIREMENTS
- Unique page titles, meta descriptions, canonical URLs.
- Semantic HTML5, single `<h1>` per page, logical heading hierarchy.
- Descriptive image `alt` tags, descriptive internal links, Open Graph metadata.
- Fast-loading content, mobile-friendly layouts, valid robots.txt and sitemap.xml when required.
- Accurate, authentic local SEO targeting Chennai and approved locations without keyword stuffing.

---

### 15. ACCESSIBILITY REQUIREMENTS
- WCAG accessibility principles, semantic HTML, keyboard navigability, visible focus indicators.
- Suitable colour contrast, labelled form controls, ARIA attributes where needed.
- Touch target sizes (min 44x44px), logical tab order, reduced motion support.

---

### 16. PERFORMANCE REQUIREMENTS
- Optimised asset sizes, reduced network requests, efficient CSS/JS, avoid layout shifts.
- Lazy-load below-the-fold assets, avoid oversized video backgrounds, verify in browser tools.

---

### 17. CONVERSION AND BUSINESS REQUIREMENTS
- Goal: Generate qualified business enquiries, promote services, build brand trust.
- Clear, relevant CTAs (e.g., "Get a Free Consultation", "Discuss Your Project", "Explore Our Services").
- Use official company contact details (+91 9659239187, info@digitalcrazyhub.com).
- Do not promise unsubstantiated guarantees.

---

### 18. CONTENT AND COPYWRITING RULES
- Professional, natural, human-friendly copy; avoid generic AI fluff.
- Indian English conventions where appropriate.
- Genuine company facts; do not invent fake case studies or customer success stories.

---

### 19. DEVELOPMENT WORKFLOW
- **Stage 1** — Project Inspection and Master Rules
- **Stage 2** — Reference Analysis and Design System
- **Stage 3** — Homepage Implementation
- **Stage 4** — Homepage Audit
- **Stage 5** — About Us Page
- **Stage 6** — Services Overview
- **Stage 7** — Individual Service Pages
- **Stage 8** — Projects or Portfolio
- **Stage 9** — Contact Page and Backend
- **Stage 10** — SEO, Legal Pages, and Supporting Files
- **Stage 11** — Website-Wide Audit

*Do not skip stages or implement all pages at once without approval.*

---

### 20. TESTING AND VERIFICATION
- Never claim a task is complete without checking the output.
- Distinguish between: Implemented, Inspected, Tested, Verified, Not tested.
- Do not fabricate test results or browser behaviour.

---

### 21. CHANGE MANAGEMENT
- Identify affected files, understand existing code, make smallest suitable change, preserve working features, verify and report outcome.

---

### 22. INITIAL PROJECT SETUP TASK RULES
When the user explicitly asks to initialise a fresh project, execute only the approved setup tasks:
1. Inspect the selected workspace.
2. Confirm the workspace path.
3. Check for existing files.
4. Ask before overwriting unexpected content.
5. Create PROJECT_RULES.md.
6. Create README.md.
7. Create the approved directory structure.
8. Create .gitignore.
9. Create a safe .env.example containing placeholder names only.
10. Verify the resulting files and directories.
11. Report the completed setup.

Do not automatically implement homepage sections, complete HTML pages, navbar HTML, footer HTML, page banners, carousels, final visual designs, PHP endpoints, database schemas, or external integrations.
Stop after completing the approved setup and wait for the next development prompt.

---

### 23. REQUIRED RESPONSE FORMAT
After completing a development task, provide a concise report containing:
1. Task completed.
2. Files created or modified.
3. Main implementation details.
4. Responsive behaviour addressed.
5. Tests actually performed.
6. Issues remaining.
7. Items requiring user approval.
8. Recommended next development step.
