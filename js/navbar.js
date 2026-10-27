/**
 * Digital Crazy Hub - Navbar & Navigation Controls
 * Vanilla JavaScript ES6+
 */

export function initNavbar() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

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
    const servicesToggle = document.getElementById('services-menu-btn');
    if (servicesLink) {
      if (isServicesPage) {
        servicesLink.classList.add('active');
      } else if (currentFile !== 'services.html') {
        servicesLink.classList.remove('active');
      }
    }
    if (servicesToggle) {
      if (isServicesPage) {
        servicesToggle.classList.add('active');
      } else {
        servicesToggle.classList.remove('active');
      }
    }

    // Also highlight About Us link and dropdown toggle when on about overview or subpages
    const isAboutPage = ['about.html', 'team.html', 'achievements.html', 'clients.html'].includes(currentFile);
    const aboutLink = navMenu.querySelector('#about-dropdown > .nav-dropdown-wrapper > a.nav-link');
    const aboutToggle = document.getElementById('about-menu-btn');
    if (aboutLink) {
      if (isAboutPage) {
        aboutLink.classList.add('active');
      } else if (currentFile !== 'about.html') {
        aboutLink.classList.remove('active');
      }
    }
    if (aboutToggle) {
      if (isAboutPage) {
        aboutToggle.classList.add('active');
      } else {
        aboutToggle.classList.remove('active');
      }
    }
  } catch (err) {
    // Fail gracefully
  }

  /**
   * Mobile menu state handlers
   */
  const closeAllDropdowns = () => {
    const openDropdowns = navMenu.querySelectorAll('.dropdown.dropdown-open');
    openDropdowns.forEach((dd) => {
      dd.classList.remove('dropdown-open');
      const btn = dd.querySelector('.dropdown-toggle-btn');
      if (btn) {
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  };

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
      closeAllDropdowns();
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

  // Generic Dropdown toggles for touch & keyboard (About Us, Services, etc.)
  const dropdownContainers = navMenu.querySelectorAll('.dropdown');
  dropdownContainers.forEach((dropdown) => {
    const btn = dropdown.querySelector('.dropdown-toggle-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlyOpen = dropdown.classList.contains('dropdown-open');

      // Close other open dropdowns for clean accordion UX on mobile
      dropdownContainers.forEach((other) => {
        if (other !== dropdown) {
          other.classList.remove('dropdown-open');
          const otherBtn = other.querySelector('.dropdown-toggle-btn');
          if (otherBtn) {
            otherBtn.setAttribute('aria-expanded', 'false');
          }
        }
      });

      btn.setAttribute('aria-expanded', String(!isCurrentlyOpen));
      dropdown.classList.toggle('dropdown-open', !isCurrentlyOpen);
    });

    // Keyboard support: Escape closes dropdown
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('dropdown-open')) {
        e.stopPropagation();
        btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('dropdown-open');
        btn.focus();
      }
    });

    // Keyboard support: Close dropdown when focus leaves container
    dropdown.addEventListener('focusout', (e) => {
      if (dropdown.classList.contains('dropdown-open') && !dropdown.contains(e.relatedTarget)) {
        btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('dropdown-open');
      }
    });
  });

  // Close menus on click outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      closeMobileMenu();
    } else if (!navMenu.contains(e.target)) {
      closeAllDropdowns();
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
        closeAllDropdowns();
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

