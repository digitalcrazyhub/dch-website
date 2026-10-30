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
    id: 'profile-ash2-speccore',
    title: 'Ash2 SpecCore Safety Pvt. Ltd.',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Fire Safety',
    badgeClass: 'badge-profile',
    index: '08',
    description: 'Comprehensive fire safety solutions, fire protection systems, and security services designed to protect lives and properties.',
    image: 'assets/images/projects/brochure-01.png',
    altText: 'Ash2 SpecCore Safety Fire Protection and Safety Solutions Company Profile Brochure',
    liveUrl: null,
    formatTag: 'Format: Multi-Page Corporate Brochure'
  },
  {
    id: 'profile-phoenix-tech',
    title: 'Phoenix Industrial Technology',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Heavy Fabrication',
    badgeClass: 'badge-profile',
    index: '09',
    description: 'Industrial engineering solutions specializing in PEB sheds, conveyor systems, heavy fabrication, and structural design.',
    image: 'assets/images/projects/brochure-02.png',
    altText: 'Phoenix Industrial Technology Heavy Fabrication and Structural Engineering Company Profile',
    liveUrl: null,
    formatTag: 'Format: Executive Presentation Dossier'
  },
  {
    id: 'profile-painting-square',
    title: 'Painting Square',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Painting',
    badgeClass: 'badge-profile',
    index: '10',
    description: 'Complete painting and renovation solutions, including interior and exterior painting, waterproofing, modular kitchens, and home improvement services.',
    image: 'assets/images/projects/brochure-03.png',
    altText: 'Painting Square Complete Painting and Renovation Solutions Corporate Profile',
    liveUrl: null,
    formatTag: 'Format: Monograph & Capability Book'
  },
  {
    id: 'profile-sri-amma-builders',
    title: 'Sri Amma Industrial Developers Pvt. Ltd.',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Construction',
    badgeClass: 'badge-profile',
    index: '11',
    description: 'Professional construction services for industrial, commercial, residential, and warehouse buildings with reliable engineering expertise.',
    image: 'assets/images/projects/brochure-04.png',
    altText: 'Sri Amma Industrial Developers Industrial and Commercial Construction Corporate Profile',
    liveUrl: null,
    formatTag: 'Format: Enterprise Capability Profile'
  },
  {
    id: 'profile-wallclad',
    title: 'Wallclad Facade Systems',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Wallclad Facade',
    badgeClass: 'badge-profile',
    index: '12',
    description: 'Modern facade solutions enhancing building aesthetics, durability, energy efficiency, and architectural excellence through innovative exterior systems.',
    image: 'assets/images/projects/brochure-05.png',
    altText: 'Wallclad Facade Systems Architectural Exterior Facade Profile',
    liveUrl: null,
    formatTag: 'Format: Enterprise Capability Profile'
  },
  {
    id: 'profile-aishwarya-build-care',
    title: 'Aishwarya Build Care',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Waterproofing',
    badgeClass: 'badge-profile',
    index: '13',
    description: 'Professional waterproofing solutions protecting buildings from water leakage, seepage, and structural damage with quality workmanship.',
    image: 'assets/images/projects/brochure-06.png',
    altText: 'Aishwarya Build Care Waterproofing Solutions Company Profile',
    liveUrl: null,
    formatTag: 'Format: Enterprise Capability Profile'
  },
  {
    id: 'profile-krishna-leela',
    title: 'Krishna-Leela – Flow of Spaces',
    category: 'profile',
    categoryLabel: 'Corporate Profile • Construction',
    badgeClass: 'badge-profile',
    index: '14',
    description: 'Premium residential apartments featuring contemporary architecture, thoughtfully planned spaces, and comfortable modern living in Chennai.',
    image: 'assets/images/projects/brochure-07.png',
    altText: 'Krishna-Leela Flow of Spaces Premium Residential Apartments Architecture Profile',
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
  new CompanyProfileLightbox();
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

/**
 * Interactive Lightbox Controller for Company Profile Projects ONLY.
 * Website projects are strictly excluded and maintain normal hyperlink behavior.
 */
export class CompanyProfileLightbox {
  constructor() {
    this.modal = document.getElementById('project-lightbox');
    if (!this.modal) return;

    this.backdrop = document.getElementById('project-lightbox-backdrop');
    this.closeBtn = document.getElementById('project-lightbox-close');
    this.prevBtn = document.getElementById('project-lightbox-prev');
    this.nextBtn = document.getElementById('project-lightbox-next');
    this.img = document.getElementById('project-lightbox-img');
    this.figureEl = document.getElementById('project-lightbox-figure');
    this.titleEl = document.getElementById('project-lightbox-title');
    this.currentEl = document.getElementById('project-lightbox-current');
    this.totalEl = document.getElementById('project-lightbox-total');
    this.catEl = document.getElementById('project-lightbox-category');
    this.formatEl = document.getElementById('project-lightbox-format');
    this.descEl = document.getElementById('project-lightbox-desc');

    this.items = this.collectProfileItems();
    this.currentIndex = 0;
    this.isOpen = false;
    this.lastFocusedTrigger = null;

    this.touchStartX = 0;
    this.touchStartY = 0;

    this.init();
  }

  /**
   * Collect Company Profile project items either from PROJECT_INVENTORY or DOM cards
   */
  collectProfileItems() {
    const inventoryProfiles = PROJECT_INVENTORY.filter((p) => p.category === 'profile');
    if (inventoryProfiles.length > 0) {
      return inventoryProfiles;
    }

    // Fallback: collect from DOM
    const profileCards = document.querySelectorAll('.project-card[data-category="profile"]');
    const items = [];
    profileCards.forEach((card, idx) => {
      const img = card.querySelector('.project-card-img');
      const title = card.querySelector('.project-card-title');
      const desc = card.querySelector('.project-card-desc');
      const catLabel = card.querySelector('.project-card-category-label');
      const formatTag = card.querySelector('.project-card-static-tag span');

      items.push({
        id: `profile-item-${idx}`,
        title: title ? title.textContent.trim() : 'Company Profile',
        category: 'profile',
        categoryLabel: catLabel ? catLabel.textContent.trim() : 'Company Profile',
        description: desc ? desc.textContent.trim() : '',
        image: img ? img.getAttribute('src') : '',
        altText: img ? img.getAttribute('alt') : 'Company Profile Brochure',
        formatTag: formatTag ? formatTag.textContent.trim() : 'Format: Enterprise Capability Profile'
      });
    });
    return items;
  }

  init() {
    if (!this.modal || this.items.length === 0) return;

    if (this.totalEl) {
      this.totalEl.textContent = this.items.length;
    }

    this.bindTriggers();
    this.bindEvents();
  }

  /**
   * Attach triggers to Company Profile items only.
   * STRICT ENFORCEMENT: Website project cards are untouched.
   */
  bindTriggers() {
    // 1. Media container clicks/keyboard (only on .project-card-media-profile)
    const mediaTriggers = document.querySelectorAll('.project-card[data-category="profile"] .project-card-media-profile');
    mediaTriggers.forEach((trigger) => {
      const getIndex = () => {
        const rawIdx = trigger.getAttribute('data-profile-index');
        return rawIdx !== null ? parseInt(rawIdx, 10) : 0;
      };

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const idx = getIndex();
        this.open(idx, trigger);
      });

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = getIndex();
          this.open(idx, trigger);
        }
      });
    });

    // 2. "Preview" footer button clicks
    const btnTriggers = document.querySelectorAll('.project-card[data-category="profile"] .project-card-preview-btn');
    btnTriggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const rawIdx = btn.getAttribute('data-profile-index');
        const idx = rawIdx !== null ? parseInt(rawIdx, 10) : 0;
        this.open(idx, btn);
      });
    });
  }

  bindEvents() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop click
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Prevent closing when clicking figure
    if (this.figureEl) {
      this.figureEl.addEventListener('click', (e) => e.stopPropagation());
    }

    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.prev();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.next();
      });
    }

    // Keyboard navigation & accessibility focus trap
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        this.close();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.next();
      } else if (e.key === 'Tab') {
        this.trapFocus(e);
      }
    });

    // Mobile touch gestures
    this.modal.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.modal.addEventListener('touchend', (e) => {
      if (!this.isOpen || e.changedTouches.length !== 1) return;
      const deltaX = e.changedTouches[0].clientX - this.touchStartX;
      const deltaY = e.changedTouches[0].clientY - this.touchStartY;

      // Threshold: at least 45px horizontal movement, more horizontal than vertical
      if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
        if (deltaX < 0) {
          this.next();
        } else {
          this.prev();
        }
      }
    }, { passive: true });
  }

  trapFocus(e) {
    const focusable = [this.prevBtn, this.nextBtn, this.closeBtn].filter(Boolean);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  open(index, triggerEl = null) {
    if (!this.items.length) return;
    this.currentIndex = Math.max(0, Math.min(index, this.items.length - 1));
    this.lastFocusedTrigger = triggerEl || document.activeElement;
    this.isOpen = true;

    this.render();

    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');

    // Focus close button for clean accessibility flow
    requestAnimationFrame(() => {
      if (this.closeBtn) {
        this.closeBtn.focus();
      } else {
        this.modal.focus();
      }
    });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');

    // Restore focus to original trigger
    if (this.lastFocusedTrigger && typeof this.lastFocusedTrigger.focus === 'function') {
      try {
        this.lastFocusedTrigger.focus();
      } catch (_) {
        // Safe fallback if trigger was removed
      }
    }
  }

  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.render();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.render();
  }

  render() {
    const item = this.items[this.currentIndex];
    if (!item) return;

    if (this.currentEl) {
      this.currentEl.textContent = this.currentIndex + 1;
    }
    if (this.totalEl) {
      this.totalEl.textContent = this.items.length;
    }
    if (this.titleEl) {
      this.titleEl.textContent = item.title;
    }
    if (this.catEl) {
      this.catEl.textContent = item.categoryLabel || 'Company Profile';
    }
    if (this.formatEl) {
      this.formatEl.textContent = item.formatTag || 'Format: Enterprise Capability Profile';
    }
    if (this.descEl) {
      this.descEl.textContent = item.description || '';
    }

    if (this.img) {
      this.img.classList.add('is-loading');
      const tempImg = new Image();
      tempImg.onload = () => {
        this.img.src = item.image;
        this.img.alt = item.altText || item.title;
        this.img.classList.remove('is-loading');
      };
      tempImg.onerror = () => {
        this.img.src = item.image;
        this.img.alt = item.altText || item.title;
        this.img.classList.remove('is-loading');
      };
      tempImg.src = item.image;
    }

    // Preload next & previous images for instant navigation
    this.preloadAdjacent();
  }

  preloadAdjacent() {
    if (this.items.length <= 1) return;
    const nextIdx = (this.currentIndex + 1) % this.items.length;
    const prevIdx = (this.currentIndex - 1 + this.items.length) % this.items.length;

    [nextIdx, prevIdx].forEach((idx) => {
      const item = this.items[idx];
      if (item && item.image) {
        const pre = new Image();
        pre.src = item.image;
      }
    });
  }
}

// Auto-run if loaded directly in browser
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectsPage);
  } else {
    initProjectsPage();
  }
}
