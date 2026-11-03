/**
 * Digital Crazy Hub - Global Floating Actions Component Controller
 * Vanilla JavaScript ES6+
 *
 * Actions:
 * 1. Phone Call (tel:+919361501280)
 * 2. WhatsApp Chat (https://wa.me/919361501280)
 * 3. Scroll to Top (Smooth / Accessible / Reduced Motion compliant)
 */

import { loadComponent } from '../components.js';

const FALLBACK_HTML = `
<aside class="floating-actions" id="floating-actions" aria-label="Quick Actions">
  <a href="tel:+919361501280"
     class="floating-action-btn floating-action-phone"
     aria-label="Call Digital Crazy Hub at +91 93615 01280">
    <svg class="floating-action-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
    <span class="floating-action-tooltip" role="tooltip">Call Us</span>
  </a>

  <a href="https://wa.me/919361501280?text=Hello%20Digital%20Crazy%20Hub%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services."
     target="_blank"
     rel="noopener noreferrer"
     class="floating-action-btn floating-action-whatsapp"
     aria-label="Chat with Digital Crazy Hub on WhatsApp">
    <svg class="floating-action-icon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.16C10.57 20.16 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.05 20.16ZM16.57 14.46C16.32 14.33 15.11 13.74 14.88 13.66C14.66 13.57 14.49 13.53 14.33 13.78C14.16 14.03 13.69 14.58 13.55 14.75C13.4 14.92 13.26 14.94 13.01 14.81C12.76 14.69 11.95 14.42 11 13.57C10.25 12.91 9.75 12.09 9.6 11.84C9.46 11.59 9.59 11.45 9.71 11.33C9.82 11.22 9.96 11.04 10.09 10.89C10.21 10.75 10.26 10.64 10.34 10.48C10.42 10.31 10.38 10.17 10.32 10.04C10.26 9.92 9.75 8.68 9.55 8.16C9.34 7.67 9.13 7.73 8.97 7.72C8.82 7.72 8.65 7.71 8.48 7.71C8.31 7.71 8.04 7.77 7.81 8.02C7.58 8.27 6.94 8.87 6.94 10.09C6.94 11.31 7.83 12.48 7.95 12.65C8.08 12.82 9.7 15.31 12.17 16.38C12.76 16.63 13.22 16.79 13.58 16.9C14.17 17.09 14.71 17.06 15.14 17C15.62 16.93 16.61 16.4 16.82 15.82C17.03 15.24 17.03 14.75 16.96 14.64C16.9 14.53 16.76 14.46 16.57 14.46Z"/>
    </svg>
    <span class="floating-action-tooltip" role="tooltip">Chat on WhatsApp</span>
  </a>

  <button type="button"
          class="floating-action-btn floating-action-scrolltop is-visible"
          id="scroll-to-top"
          aria-label="Scroll to top"
          tabindex="0">
    <svg class="floating-action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
    <span class="floating-action-tooltip" role="tooltip">Scroll to top</span>
  </button>
</aside>
`;

/**
 * Initialize the floating actions component and attach scroll & click behaviors
 */
export async function initFloatingActions() {
  // Prevent duplicate execution if already present in DOM
  if (document.getElementById('floating-actions')) {
    attachFloatingActionEvents();
    return true;
  }

  // Ensure mounting container exists
  let container = document.getElementById('floating-actions-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'floating-actions-container';
    document.body.appendChild(container);
  }

  // Attempt to load external component
  const loaded = await loadComponent('floating-actions-container', 'components/floating-actions.html');

  // Fallback if component could not be fetched (e.g. offline file:// protocol testing)
  if (!loaded && (!container.children || container.children.length === 0)) {
    container.innerHTML = FALLBACK_HTML.trim();
  }

  attachFloatingActionEvents();
  return true;
}

/**
 * Bind scroll state throttle and smooth scroll click handlers
 */
function attachFloatingActionEvents() {
  const scrollTopBtn = document.getElementById('scroll-to-top');
  if (!scrollTopBtn) return;

  // Ensure button is visible, focusable and accessible
  scrollTopBtn.classList.add('is-visible');
  scrollTopBtn.setAttribute('tabindex', '0');
  scrollTopBtn.removeAttribute('aria-hidden');

  // Prevent multiple listeners if already bound
  if (scrollTopBtn.dataset.bound === 'true') return;
  scrollTopBtn.dataset.bound = 'true';

  let isTicking = false;
  const SCROLL_THRESHOLD = 150;

  const updateScrollTopState = () => {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollY > SCROLL_THRESHOLD) {
      if (!scrollTopBtn.classList.contains('is-scrolled')) {
        scrollTopBtn.classList.add('is-scrolled');
      }
    } else {
      if (scrollTopBtn.classList.contains('is-scrolled')) {
        scrollTopBtn.classList.remove('is-scrolled');
      }
    }
    isTicking = false;
  };

  const onScroll = () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateScrollTopState);
      isTicking = true;
    }
  };

  // Passive scroll listener for maximum scrolling performance
  window.addEventListener('scroll', onScroll, { passive: true });

  // Initial check upon mounting
  updateScrollTopState();

  // Smooth scroll to top on click
  scrollTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    try {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    } catch (_) {
      window.scrollTo(0, 0);
    }

    // Safely remove focus ring without cancelling ongoing smooth scroll
    setTimeout(() => {
      if (document.activeElement === scrollTopBtn) {
        scrollTopBtn.blur();
      }
    }, 350);
  });
}

