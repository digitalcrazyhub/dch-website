/**
 * Digital Crazy Hub — Projects Page Script
 * File: js/pages/projects.js
 * Vanilla JavaScript ES6+
 * Features:
 * - Centralized project portfolio inventory data structure
 * - Category filter tabs (All, Websites, Company Profiles) with accessible ARIA states
 * - Subtle 3D tilt effect (pointer-only, 3–5 deg max, reduced-motion safe)
 */

/**
 * Approved Project Portfolio Inventory
 * Centralized data architecture supporting titles, categories, descriptions, assets, and live URLs.
 * Derived from genuine client website deliverables and official project documents.
 */
export const PROJECT_INVENTORY = [
  // 1. Website Projects (Official supplied destinations with genuine site content)
  {
    id: 'victory-facility',
    title: 'Victory Facility',
    category: 'website',
    categoryLabel: 'Facility Services & Management',
    badgeClass: 'badge-website',
    index: '01',
    description: 'Comprehensive facility management and commercial maintenance website designed with intuitive service browsing and instant client inquiry workflows.',
    image: 'assets/images/projects/victory-facility-project.png',
    altText: 'Victory Facility Management Services Website Mockup by Digital Crazy Hub',
    liveUrl: 'https://victoryfacility.com/',
    linkLabel: 'Visit Website'
  },
  {
    id: 'opulents-interiors',
    title: 'Opulents Interiors',
    category: 'website',
    categoryLabel: 'Luxury Interior Design',
    badgeClass: 'badge-website',
    index: '02',
    description: 'High-end residential and commercial interior design digital portfolio showcasing bespoke living concepts, spatial planning, and turnkey project showcases.',
    image: 'assets/images/projects/opulents-interiors-project.png',
    altText: 'Opulents Interiors Luxury Interior Design Portfolio Website Mockup by Digital Crazy Hub',
    liveUrl: 'https://opulentsinteriors.com/',
    linkLabel: 'Visit Website'
  },
  {
    id: 'lnd-chairs',
    title: 'LND Chairs',
    category: 'website',
    categoryLabel: 'Ergonomic Workspace Furniture',
    badgeClass: 'badge-website',
    index: '03',
    description: 'Modern office seating and commercial furniture showcase highlighting ergonomic executive chairs, posture support features, and B2B product specifications.',
    image: 'assets/images/projects/LND-chairs-project.png',
    altText: 'LND Chairs Ergonomic Seating Showcase Website Mockup by Digital Crazy Hub',
    liveUrl: 'https://lndchairs.com/',
    linkLabel: 'Visit Website'
  },
  {
    id: 'aspirations-architects',
    title: 'Aspirations Architects Engineers',
    category: 'website',
    categoryLabel: 'Architecture & Engineering',
    badgeClass: 'badge-website',
    index: '04',
    description: 'Full-service architectural engineering firm website presenting turnkey residential planning, structural design blueprints, and project consultation booking.',
    image: 'assets/images/projects/aspirations-architects-engineers-project.png',
    altText: 'Aspirations Architects Engineers Firm Website Mockup by Digital Crazy Hub',
    liveUrl: 'https://arkitect.in/',
    linkLabel: 'Visit Website'
  },
  {
    id: 'geonik',
    title: 'Geonik Foundation',
    category: 'website',
    categoryLabel: 'Geotechnical Engineering',
    badgeClass: 'badge-website',
    index: '05',
    description: 'Engineering and infrastructure corporate website presenting specialized geotechnical foundation works, structural testing, and major civil infrastructure developments.',
    image: 'assets/images/projects/geonik-project.png',
    altText: 'Geonik Geotechnical Engineering Corporate Website Mockup by Digital Crazy Hub',
    liveUrl: 'https://geonik.in/',
    linkLabel: 'Visit Website'
  },
  {
    id: 'lbh-studio',
    title: 'Little Big Home Studio (LBH)',
    category: 'website',
    categoryLabel: 'Interior Architecture Studio',
    badgeClass: 'badge-website',
    index: '06',
    description: 'Contemporary interior architecture showcase featuring curated spatial transformations, modern residential aesthetics, and completed interior design project galleries.',
    image: 'assets/images/projects/LBH-studio-project.png',
    altText: 'LBH Studio Interior Design Portfolio Website Mockup by Digital Crazy Hub',
    liveUrl: 'https://lbhstudio.in/',
    linkLabel: 'Visit Website'
  },
  {
    id: 'sri-amma-builders',
    title: 'Sri Amma Industrial Developers',
    category: 'website',
    categoryLabel: 'Industrial Construction & Development',
    badgeClass: 'badge-website',
    index: '07',
    description: 'Industrial construction and pre-engineered structural building website showcasing heavy industrial manufacturing parks, warehouse complexes, and client partnerships.',
    image: 'assets/images/projects/sri-amma-builders-project.png',
    altText: 'Sri Amma Builders Industrial Construction Website Mockup by Digital Crazy Hub',
    liveUrl: 'https://sriammabuilders.com/',
    linkLabel: 'Visit Website'
  },

  // 2. Company Profile Projects (Print & Digital Presentation Dossiers, No external redirect links)
  {
    id: 'profile-industrial',
    title: 'Precision Advantage Global',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Manufacturing',
    badgeClass: 'badge-profile',
    index: '08',
    description: 'Comprehensive multi-page corporate monograph presenting advanced CNC machining capabilities, ISO manufacturing standards, plant infrastructure, and engineering workflows.',
    image: 'assets/images/projects/company-profile-industrial.jpg',
    altText: 'Precision Advantage Industrial Manufacturing Company Profile Brochure Presentation',
    liveUrl: null,
    formatTag: 'Format: Multi-Page Corporate Brochure'
  },
  {
    id: 'profile-healthcare',
    title: 'MediPulse Healthcare Diagnostics',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Healthcare',
    badgeClass: 'badge-profile',
    index: '09',
    description: 'Executive healthcare presentation dossier detailing clinical specialties, advanced MRI/CT imaging infrastructure, pathology labs, and physician credentials.',
    image: 'assets/images/projects/company-profile-healthcare.jpg',
    altText: 'MediPulse Healthcare Network & Medical Diagnostics Group Executive Company Profile',
    liveUrl: null,
    formatTag: 'Format: Executive Presentation Dossier'
  },
  {
    id: 'profile-architecture',
    title: 'Structura Architecture & Engineering',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Architecture',
    badgeClass: 'badge-profile',
    index: '10',
    description: 'High-resolution architectural capability monograph detailing structural innovations, technical blueprints, residential landmarks, and engineering credentials.',
    image: 'assets/images/projects/company-profile-architecture.jpg',
    altText: 'Structura Architecture & Engineering Firm Monograph Company Profile Showcase',
    liveUrl: null,
    formatTag: 'Format: Monograph & Capability Book'
  },
  {
    id: 'profile-logistics',
    title: 'Globelink Logistics & Freight',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Logistics',
    badgeClass: 'badge-profile',
    index: '11',
    description: 'Corporate enterprise capability presentation outlining multimodal logistics networks across 450+ routes, air & ocean freight capacity, and fleet infrastructure.',
    image: 'assets/images/projects/company-profile-logistics.jpg',
    altText: 'Globelink Logistics Worldwide Supply Chain Corporate Capability Profile Brochure',
    liveUrl: null,
    formatTag: 'Format: Enterprise Capability Profile'
  }
];

/**
 * Initialize Projects Page Interactions
 */
export function initProjectsPage() {
  initProjectFilters();
  initProjectTilt();
}

/**
 * Project Category Filter Tabs with smooth transitions
 */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.projects-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const categoryGroups = document.querySelectorAll('.projects-category-group');

  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedFilter = btn.dataset.filter;

      // Update ARIA and active states
      filterBtns.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Filter category groups
      categoryGroups.forEach((group) => {
        const groupCategory = group.dataset.categoryGroup;
        const shouldShowGroup = selectedFilter === 'all' || groupCategory === selectedFilter;

        if (shouldShowGroup) {
          group.style.display = '';
          requestAnimationFrame(() => {
            group.style.opacity = '1';
          });
        } else {
          group.style.display = 'none';
        }
      });

      // Filter individual cards
      projectCards.forEach((card) => {
        const cardCategory = card.dataset.category;
        const shouldShow = selectedFilter === 'all' || cardCategory === selectedFilter;

        if (shouldShow) {
          card.style.display = 'flex';
          requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            if (card.style.opacity === '0') {
              card.style.display = 'none';
            }
          }, 250);
        }
      });
    });
  });
}

/**
 * Subtle 3D Tilt Card Interaction
 * Capped at 3-5 degrees, pointer devices only, disabled on touch and prefers-reduced-motion
 */
function initProjectTilt() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (isReducedMotion || isTouchDevice) {
    return;
  }

  const cards = document.querySelectorAll('.project-card');

  cards.forEach((card) => {
    let bounds = null;
    let isHovering = false;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      isHovering = true;
      card.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
    };

    const onMouseMove = (e) => {
      if (!isHovering || !bounds) return;

      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = (mouseX / bounds.width) - 0.5;
      const yPct = (mouseY / bounds.height) - 0.5;

      // 3.5 degrees max rotation for smooth, premium tactile feel
      const rotateX = (-yPct * 3.5).toFixed(2);
      const rotateY = (xPct * 3.5).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    };

    const onMouseLeave = () => {
      isHovering = false;
      card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    };

    card.addEventListener('mouseenter', onMouseEnter, { passive: true });
    card.addEventListener('mousemove', onMouseMove, { passive: true });
    card.addEventListener('mouseleave', onMouseLeave, { passive: true });
  });
}

// Auto-run if loaded directly in browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectsPage);
  } else {
    initProjectsPage();
  }
}
