/**
 * Digital Crazy Hub - Reusable Component Loader
 * Vanilla JavaScript ES6+
 */

import { initNavbar } from './navbar.js';

export async function loadComponent(containerId, componentPath) {
  const container = document.getElementById(containerId);
  if (!container) return false;

  try {
    const response = await fetch(componentPath, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Failed to load component "${componentPath}": ${response.status} ${response.statusText}`);
    }
    let html = await response.text();

    // Strip any live-reload scripts injected by local development servers (e.g. VS Code Live Server).
    // Also remove the target </body> anchor to ensure clean fragment insertion.
    html = html.replace(/<!-- Code injected by live-server -->[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<script[\s\S]*?live-server[\s\S]*?<\/script>/gi, '');
    html = html.replace(/<\/?body>/gi, '');

    container.innerHTML = html.trim();
    return true;
  } catch (error) {
    console.warn(`Component Loader Note: If testing locally without a server, use http://localhost/digitalcrazyhub/ instead of file://. Details:`, error);
    return false;
  }
}

export async function initSharedComponents() {
  // Load Navbar
  try {
    const navbarLoaded = await loadComponent('navbar-container', 'components/navbar.html');
    if (navbarLoaded) {
      initNavbar();
    }
  } catch (err) {
    console.error('Error initializing navbar:', err);
  }

  // Load Page Banner
  try {
    await initPageBanner();
  } catch (err) {
    console.error('Error initializing page banner:', err);
  }

  // Load Footer
  try {
    const footerLoaded = await loadComponent('footer-container', 'components/footer.html');
    if (footerLoaded) {
      updateDynamicYear();
    }
  } catch (err) {
    console.error('Error initializing footer:', err);
  }

  // Refresh global animations on newly injected shared components
  if (typeof window !== 'undefined' && window.DCHAnimations && typeof window.DCHAnimations.init === 'function') {
    window.DCHAnimations.init();
  }
}

/**
 * Initialize and load Page Banner component
 * Supports external component loading, dynamic data-* overrides, and interactive lightbox modal
 */
export async function initPageBanner() {
  const bannerContainer = document.getElementById('page-banner-container');
  if (!bannerContainer) return false;

  // Load banner HTML if container is empty
  if (bannerContainer.children.length === 0) {
    const bannerPath = bannerContainer.dataset.bannerSrc || 'components/page-banner.html';
    const loaded = await loadComponent('page-banner-container', bannerPath);
    if (!loaded) return false;
  }

  // Populate dynamic data-* attributes if defined on the container
  const { title, eyebrow, breadcrumb, desc, showLightbox, videoUrl, videoTitle } = bannerContainer.dataset;

  if (title) {
    const headingEl = bannerContainer.querySelector('#page-banner-heading');
    if (headingEl) {
      const highlightWords = ['Business', 'Services', 'Growth', 'Agency', 'Partner', 'Crazy Hub', 'Clients'];
      let formattedTitle = title;
      for (const word of highlightWords) {
        if (formattedTitle.includes(word)) {
          formattedTitle = formattedTitle.replace(word, `<span class="text-gradient">${word}</span>`);
          break;
        }
      }
      headingEl.innerHTML = formattedTitle;
    }
  }

  if (eyebrow) {
    const eyebrowTextEl = bannerContainer.querySelector('#page-banner-eyebrow-text');
    if (eyebrowTextEl) {
      eyebrowTextEl.textContent = eyebrow;
    } else {
      const eyebrowEl = bannerContainer.querySelector('#page-banner-eyebrow');
      if (eyebrowEl) eyebrowEl.textContent = eyebrow;
    }
  }

  if (breadcrumb) {
    const breadcrumbEl = bannerContainer.querySelector('#page-banner-breadcrumb');
    if (breadcrumbEl) breadcrumbEl.textContent = breadcrumb;
  }

  if (desc) {
    const descEl = bannerContainer.querySelector('#page-banner-description');
    if (descEl) descEl.textContent = desc;
  }

  // Option to hide aside lightbox card (e.g. for legal pages)
  if (showLightbox === 'false') {
    const asideEl = bannerContainer.querySelector('#page-banner-aside');
    const gridEl = bannerContainer.querySelector('#page-banner-grid');
    if (asideEl) asideEl.style.display = 'none';
    if (gridEl) gridEl.style.gridTemplateColumns = '1fr';
  }

  // Setup Lightbox Modal functionality
  setupBannerLightbox(bannerContainer, { videoUrl, videoTitle });

  return true;
}

/**
 * Setup Video Lightbox modal trigger, controls, and accessibility
 */
function setupBannerLightbox(container, config = {}) {
  const trigger = container.querySelector('#banner-lightbox-trigger');
  const modal = container.querySelector('#banner-lightbox-modal');
  if (!trigger || !modal) return;

  const closeBtn = modal.querySelector('#lightbox-modal-close');
  const backdrop = modal.querySelector('#lightbox-modal-backdrop');
  const iframe = modal.querySelector('#lightbox-video-player');
  const titleEl = modal.querySelector('#lightbox-modal-title');

  const targetVideo = config.videoUrl || 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso';

  if (config.videoTitle && titleEl) {
    titleEl.textContent = config.videoTitle;
  }

  const openLightbox = () => {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (iframe) {
      const glue = targetVideo.includes('?') ? '&' : '?';
      iframe.src = `${targetVideo}${glue}autoplay=1&rel=0`;
    }
    if (closeBtn) closeBtn.focus();
  };

  const closeLightbox = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (iframe) {
      iframe.src = '';
    }
    trigger.focus();
  };

  trigger.addEventListener('click', openLightbox);
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox();
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

/**
 * Automatically update all copyright year instances with the current year
 */
export function updateDynamicYear() {
  const currentYear = new Date().getFullYear();
  const yearElements = document.querySelectorAll('#current-year, .current-year, [data-dynamic-year]');
  yearElements.forEach((el) => {
    el.textContent = currentYear;
  });
}

// Auto-run if loaded as a module
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSharedComponents();
  });
} else {
  initSharedComponents();
}
