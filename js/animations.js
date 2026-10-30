/**
 * Digital Crazy Hub — Global Animation System Controller
 * File: js/animations.js
 * Vanilla JavaScript ES6+ Module
 *
 * Responsibilities:
 * 1. Progressively enhances page by marking <html> with `dch-anim-ready`.
 * 2. Manages an efficient, shared IntersectionObserver for scroll-triggered reveals.
 * 3. Supports class-based reveals (.dch-animate-*, .reveal) and data-animate attributes.
 * 4. Staggers child elements automatically via .dch-stagger-group and data-stagger="true".
 * 5. Respects data-delay and data-duration overrides.
 * 6. Immediately unobserves revealed elements for maximum 60fps performance and zero scroll lag.
 * 7. Automatically respects prefers-reduced-motion: reduce by revealing content immediately.
 * 8. Exposes window.DCHAnimations for dynamic content (AJAX, modals, infinite scroll).
 */

const SELECTORS = [
  '.reveal:not(.revealed)',
  '.dch-animate-fade-up:not(.dch-animated)',
  '.dch-animate-fade-down:not(.dch-animated)',
  '.dch-animate-fade-in:not(.dch-animated)',
  '.dch-animate-slide-left:not(.dch-animated)',
  '.dch-animate-slide-right:not(.dch-animated)',
  '.dch-animate-zoom-in:not(.dch-animated)',
  '.dch-animate-zoom-out:not(.dch-animated)',
  '.dch-animate-blur:not(.dch-animated)',
  '[data-animate]:not(.dch-animated)',
  '.dch-stagger-group:not(.dch-animated)',
  '[data-stagger]:not(.dch-animated)'
].join(', ');

let globalObserver = null;

function applyReveal(element) {
  element.classList.add('revealed', 'dch-animated');

  // If container is a stagger group, ensure children transition
  if (element.classList.contains('dch-stagger-group') || element.dataset.stagger === 'true') {
    Array.from(element.children).forEach((child) => {
      child.classList.add('revealed', 'dch-animated');
    });
  }
}

function revealTarget(element) {
  if (element.classList.contains('dch-animated') && element.classList.contains('revealed')) {
    return;
  }

  const delayAttr = element.dataset.delay;
  const delay = delayAttr ? parseInt(delayAttr, 10) : 0;

  if (delay > 0) {
    setTimeout(() => {
      applyReveal(element);
    }, delay);
  } else {
    applyReveal(element);
  }
}

export function initGlobalAnimations() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduced motion: Immediately reveal all elements and exit
  if (prefersReducedMotion) {
    document.querySelectorAll(SELECTORS).forEach((el) => {
      applyReveal(el);
    });
    return;
  }

  // Progressive enhancement: mark document ready so CSS activates hidden initial states
  document.documentElement.classList.add('dch-anim-ready');

  // If IntersectionObserver is supported, use it for performant scroll-triggered animation
  if ('IntersectionObserver' in window) {
    if (!globalObserver) {
      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
      };

      globalObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealTarget(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);
    }

    const elements = document.querySelectorAll(SELECTORS);
    elements.forEach((el) => {
      globalObserver.observe(el);
    });
  } else {
    // Fallback for browsers without IntersectionObserver: reveal immediately
    document.querySelectorAll(SELECTORS).forEach((el) => {
      applyReveal(el);
    });
  }
}

/**
 * Public Developer API for Future Components and Dynamic Content
 */
export const DCHAnimations = {
  /**
   * Re-scan the DOM for newly added elements and attach observer
   */
  init: initGlobalAnimations,
  refresh: initGlobalAnimations,

  /**
   * Observe a specific element or container
   * @param {Element|string} target - DOM Element or CSS selector
   */
  observe(target) {
    if (!target) return;
    const elements = typeof target === 'string' ? document.querySelectorAll(target) : [target];
    if (globalObserver) {
      elements.forEach((el) => {
        if (!el.classList.contains('dch-animated')) {
          globalObserver.observe(el);
        }
      });
    } else {
      elements.forEach((el) => applyReveal(el));
    }
  },

  /**
   * Immediately reveal all elements without waiting for scroll
   */
  revealAll() {
    document.querySelectorAll(SELECTORS).forEach((el) => {
      applyReveal(el);
    });
  }
};

// Expose on global window object for scripts and future developers
if (typeof window !== 'undefined') {
  window.DCHAnimations = DCHAnimations;
}

// Auto-run if DOM is ready or wait for DOMContentLoaded event
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalAnimations);
  } else {
    initGlobalAnimations();
  }
}

