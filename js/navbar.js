/**
 * Digital Crazy Hub - Navbar & Navigation Controls
 * Vanilla JavaScript ES6+
 */

export function initNavbar() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const dropdownToggle = document.getElementById('services-menu-btn');
  const servicesDropdown = document.getElementById('services-dropdown');

  if (!navToggle || !navMenu) {
    return;
  }

  // Prevent duplicate event listener registration
  if (navToggle.dataset.initialized === 'true') {
    return;
  }
  navToggle.dataset.initialized = 'true';

  // Highlight active link matching current page URL
  try {
    const rawPath = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
    const currentFile = rawPath.endsWith('.html') ? rawPath : (rawPath === '' ? 'index.html' : `${rawPath}.html`);
    const links = navMenu.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    links.forEach((link) => {
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

    // Also highlight Services link and dropdown toggle when on services overview or subpages
    const isServicesPage = currentFile === 'services.html' || window.location.pathname.includes('/services/');
    const servicesLink = navMenu.querySelector('a[href="services.html"], a[href$="/services.html"]');
    if (servicesLink) {
      if (isServicesPage) {
        servicesLink.classList.add('active');
      } else if (currentFile !== 'services.html') {
        servicesLink.classList.remove('active');
      }
    }
    if (dropdownToggle) {
      if (isServicesPage) {
        dropdownToggle.classList.add('active');
      } else {
        dropdownToggle.classList.remove('active');
      }
    }
  } catch (err) {
    // Fail gracefully
  }

  /**
   * Mobile menu state handlers
   */
  const openMobileMenu = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
    navToggle.classList.add('active');
    navMenu.classList.add('open');
    document.body.classList.add('nav-open');
  };

  const closeMobileMenu = () => {
    if (navMenu.classList.contains('open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open navigation menu');
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
      document.body.classList.remove('nav-open');
    }
  };

  // Toggle mobile navigation on button click
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Automatically close mobile menu when selecting any link or CTA button
  const allNavLinks = navMenu.querySelectorAll('a');
  allNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Services dropdown toggle for touch & keyboard
  if (dropdownToggle && servicesDropdown) {
    dropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = dropdownToggle.getAttribute('aria-expanded') === 'true';
      dropdownToggle.setAttribute('aria-expanded', String(!isExpanded));
      servicesDropdown.classList.toggle('dropdown-open', !isExpanded);
    });

    // Keyboard support: Escape closes dropdown
    servicesDropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdownToggle.setAttribute('aria-expanded', 'false');
        servicesDropdown.classList.remove('dropdown-open');
        dropdownToggle.focus();
      }
    });
  }

  // Close menus on click outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeMobileMenu();
    }

    if (servicesDropdown && servicesDropdown.classList.contains('dropdown-open') && !servicesDropdown.contains(e.target)) {
      dropdownToggle.setAttribute('aria-expanded', 'false');
      servicesDropdown.classList.remove('dropdown-open');
    }
  });

  // Close mobile menu on Escape key press and return focus to toggle
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMobileMenu();
      navToggle.focus();
    }
  });

  // Close mobile drawer when switching to a desktop viewport (> 1024px)
  try {
    const desktopMediaQuery = window.matchMedia('(min-width: 1025px)');
    const handleViewportChange = (e) => {
      if (e.matches) {
        closeMobileMenu();
        if (servicesDropdown) {
          dropdownToggle.setAttribute('aria-expanded', 'false');
          servicesDropdown.classList.remove('dropdown-open');
        }
      }
    };

    if (desktopMediaQuery.addEventListener) {
      desktopMediaQuery.addEventListener('change', handleViewportChange);
    } else if (desktopMediaQuery.addListener) {
      desktopMediaQuery.addListener(handleViewportChange);
    }
  } catch (err) {
    // Media query listener fallback
  }

  // Sticky navbar shadow on scroll
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

