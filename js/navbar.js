/**
 * Digital Crazy Hub - Global Navbar Interaction & State Management
 * Clean-Room Rebuild - Desktop Navigation, Dropdowns, Mobile Drawer & In-Flow Accordions
 * Vanilla JavaScript ES6+
 */

export function initNavbar() {
  const navRoot = document.getElementById('dch-navbar');
  if (!navRoot) {
    return;
  }

  // Prevent duplicate event listener registration
  if (navRoot.dataset.initialized === 'true') {
    return;
  }
  navRoot.dataset.initialized = 'true';

  // Elements
  const mobileToggle = document.getElementById('dch-mobile-toggle');
  let drawerBackdrop = document.getElementById('dch-drawer-backdrop');
  let mobileDrawer = document.getElementById('dch-mobile-drawer');
  const drawerCloseBtn = document.getElementById('dch-drawer-close');
  const desktopDropdowns = navRoot.querySelectorAll('.dch-has-dropdown');

  // Teleport mobile drawer and backdrop directly to document.body
  // This completely decouples them from .site-header containment, clipping, and backdrop-filter issues
  if (drawerBackdrop && drawerBackdrop.parentElement !== document.body) {
    document.body.appendChild(drawerBackdrop);
  }
  if (mobileDrawer && mobileDrawer.parentElement !== document.body) {
    document.body.appendChild(mobileDrawer);
  }

  const mobileAccordions = mobileDrawer ? mobileDrawer.querySelectorAll('.dch-drawer-accordion') : [];

  // ==========================================
  // 1. ACTIVE LINK HIGHLIGHTING
  // ==========================================
  try {
    const rawPath = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
    const currentFile = rawPath.endsWith('.html') ? rawPath : (rawPath === '' ? 'index.html' : `${rawPath}.html`);

    // Highlight all desktop and mobile navigation links
    const allNavLinks = document.querySelectorAll('.dch-nav-link, .dch-drawer-link, .dch-dropdown-link, .dch-accordion-link');
    allNavLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href) {
        const linkFile = href.split('/').filter(Boolean).pop();
        if (linkFile === currentFile || ((currentFile === 'index.html' || currentFile === '') && linkFile === 'index.html')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });

    // Parent category highlighting: Services
    const isServicesPage = currentFile === 'services.html' || window.location.pathname.includes('/services/');
    if (isServicesPage) {
      const desktopServicesLink = navRoot.querySelector('.dch-has-dropdown[data-dropdown="services"] > .dch-dropdown-trigger-group > .dch-nav-link');
      const mobileServicesBtn = document.querySelector('.dch-drawer-accordion[data-accordion="services"] .dch-accordion-header-btn, .dch-drawer-accordion[data-accordion="services"] .dch-accordion-title');
      if (desktopServicesLink) desktopServicesLink.classList.add('active');
      if (mobileServicesBtn) mobileServicesBtn.classList.add('active');
    }

    // Parent category highlighting: About Us
    const isAboutPage = ['about.html', 'team.html', 'achievements.html', 'clients.html'].includes(currentFile);
    if (isAboutPage) {
      const desktopAboutLink = navRoot.querySelector('.dch-has-dropdown[data-dropdown="about"] > .dch-dropdown-trigger-group > .dch-nav-link');
      const mobileAboutBtn = document.querySelector('.dch-drawer-accordion[data-accordion="about"] .dch-accordion-header-btn, .dch-drawer-accordion[data-accordion="about"] .dch-accordion-title');
      if (desktopAboutLink) desktopAboutLink.classList.add('active');
      if (mobileAboutBtn) mobileAboutBtn.classList.add('active');
    }
  } catch (err) {
    // Fail gracefully
  }

  // ==========================================
  // 2. MOBILE DRAWER STATE MANAGEMENT
  // ==========================================
  let isDrawerOpen = false;

  const openMobileDrawer = () => {
    if (!mobileDrawer || isDrawerOpen) return;

    // Ensure elements are at document.body level
    if (drawerBackdrop && drawerBackdrop.parentElement !== document.body) {
      document.body.appendChild(drawerBackdrop);
    }
    if (mobileDrawer && mobileDrawer.parentElement !== document.body) {
      document.body.appendChild(mobileDrawer);
    }

    isDrawerOpen = true;

    // Reset drawer body scroll position to top
    const drawerBody = mobileDrawer.querySelector('.dch-drawer-body');
    if (drawerBody) {
      drawerBody.scrollTop = 0;
    }

    // Accessibility attributes
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileToggle.setAttribute('aria-label', 'Close navigation menu');
    mobileToggle.classList.add('is-active');

    mobileDrawer.removeAttribute('inert');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileDrawer.classList.add('is-open');

    if (drawerBackdrop) {
      drawerBackdrop.classList.add('is-active');
      drawerBackdrop.setAttribute('aria-hidden', 'false');
    }

    // Prevent background scrolling
    document.body.classList.add('dch-drawer-open');

    // Focus close button for keyboard accessibility
    if (drawerCloseBtn) {
      setTimeout(() => drawerCloseBtn.focus(), 50);
    }
  };

  const closeMobileDrawer = () => {
    if (!mobileDrawer || !isDrawerOpen) return;
    isDrawerOpen = false;

    // Accessibility attributes
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-label', 'Open navigation menu');
    mobileToggle.classList.remove('is-active');

    mobileDrawer.setAttribute('inert', '');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileDrawer.classList.remove('is-open');

    if (drawerBackdrop) {
      drawerBackdrop.classList.remove('is-active');
      drawerBackdrop.setAttribute('aria-hidden', 'true');
    }

    // Restore background scrolling
    document.body.classList.remove('dch-drawer-open');

    // Reset body scroll position
    const drawerBody = mobileDrawer.querySelector('.dch-drawer-body');
    if (drawerBody) {
      drawerBody.scrollTop = 0;
    }

    // Close any open mobile accordions
    mobileAccordions.forEach((acc) => {
      acc.classList.remove('is-expanded');
      const btn = acc.querySelector('.dch-accordion-header-btn, .dch-accordion-toggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });

    // Restore focus to hamburger toggle
    if (mobileToggle) {
      mobileToggle.focus();
    }
  };

  if (mobileToggle) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isDrawerOpen) {
        closeMobileDrawer();
      } else {
        openMobileDrawer();
      }
    });
  }

  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileDrawer();
    });
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', () => {
      closeMobileDrawer();
    });
  }

  // Close drawer automatically when clicking any mobile navigation link
  const drawerLinks = mobileDrawer ? mobileDrawer.querySelectorAll('a') : [];
  drawerLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // Focus trap inside mobile drawer
  if (mobileDrawer) {
    mobileDrawer.addEventListener('keydown', (e) => {
      if (!isDrawerOpen || e.key !== 'Tab') return;

      const focusableEls = mobileDrawer.querySelectorAll(
        'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    });
  }

  // ==========================================
  // 3. MOBILE IN-FLOW ACCORDIONS
  // ==========================================
  mobileAccordions.forEach((accordion) => {
    const toggleBtn = accordion.querySelector('.dch-accordion-header-btn, .dch-accordion-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = accordion.classList.contains('is-expanded');

      // Close other mobile accordions for clean UX (single-open accordion behavior)
      mobileAccordions.forEach((other) => {
        if (other !== accordion) {
          other.classList.remove('is-expanded');
          const otherBtn = other.querySelector('.dch-accordion-header-btn, .dch-accordion-toggle');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      if (isExpanded) {
        accordion.classList.remove('is-expanded');
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        accordion.classList.add('is-expanded');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ==========================================
  // 4. DESKTOP DROPDOWNS (Click & Keyboard Support)
  // ==========================================
  const closeAllDesktopDropdowns = () => {
    desktopDropdowns.forEach((dd) => {
      dd.classList.remove('is-open');
      const btn = dd.querySelector('.dch-dropdown-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  };

  desktopDropdowns.forEach((dropdown) => {
    const btn = dropdown.querySelector('.dch-dropdown-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyOpen = dropdown.classList.contains('is-open');

      closeAllDesktopDropdowns();

      if (!isCurrentlyOpen) {
        dropdown.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });

    // Close on focusout when focus leaves dropdown
    dropdown.addEventListener('focusout', (e) => {
      if (dropdown.classList.contains('is-open') && !dropdown.contains(e.relatedTarget)) {
        dropdown.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // ==========================================
  // 5. GLOBAL KEYBOARD & OUTSIDE CLICK HANDLERS
  // ==========================================
  document.addEventListener('click', (e) => {
    // If mobile drawer is open and clicked outside
    if (isDrawerOpen && mobileDrawer && !mobileDrawer.contains(e.target) && !mobileToggle.contains(e.target)) {
      closeMobileDrawer();
    }

    // If desktop dropdown is open and clicked outside
    if (!navRoot.contains(e.target)) {
      closeAllDesktopDropdowns();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isDrawerOpen) {
        closeMobileDrawer();
      } else {
        closeAllDesktopDropdowns();
      }
    }
  });

  // Close mobile drawer when resizing back to desktop viewport (> 1100px)
  try {
    const desktopMedia = window.matchMedia('(min-width: 1101px)');
    const handleDesktopResize = (e) => {
      if (e.matches && isDrawerOpen) {
        closeMobileDrawer();
        closeAllDesktopDropdowns();
      }
    };
    if (desktopMedia.addEventListener) {
      desktopMedia.addEventListener('change', handleDesktopResize);
    } else if (desktopMedia.addListener) {
      desktopMedia.addListener(handleDesktopResize);
    }
  } catch (err) {
    // Ignore media query listener errors
  }

  // ==========================================
  // 6. STICKY NAVBAR SHADOW ON SCROLL
  // ==========================================
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }
}
