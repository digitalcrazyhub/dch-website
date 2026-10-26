/**
 * Digital Crazy Hub - Service Detail Page Interactions
 * Vanilla JavaScript ES6+
 * Features:
 *  - Accessible FAQ Accordion
 *  - Lightweight, performant 3D Tilt Card effect (pointer-based, 3-5 deg max)
 *  - Automatic touch and prefers-reduced-motion safety
 */

export function initServiceDetail() {
  initFaqAccordion();
  initTiltEffect();
}

/**
 * Accessible FAQ Accordion Handler
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.service-faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.service-faq-trigger');
    const content = item.querySelector('.service-faq-content');
    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Optionally close other open accordions
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains('is-active')) {
          otherItem.classList.remove('is-active');
          const otherTrigger = otherItem.querySelector('.service-faq-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current item
      if (isExpanded) {
        item.classList.remove('is-active');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/**
 * Premium 3D Tilt Card Effect
 * Applied selectively to benefit cards, process cards, and related service cards
 */
function initTiltEffect() {
  // Disable on touch devices or if user prefers reduced motion
  const isTouchDevice = window.matchMedia('(hover: none)').matches || ('ontouchstart' in window);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isTouchDevice || prefersReducedMotion) {
    return;
  }

  const tiltCards = document.querySelectorAll('.service-benefit-card, .service-process-card, .related-service-card');
  if (!tiltCards.length) return;

  const maxTilt = 4.5; // Max tilt rotation in degrees

  tiltCards.forEach((card) => {
    let ticking = false;

    card.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const cardWidth = rect.width;
        const cardHeight = rect.height;

        // Pointer position relative to card center (-1 to 1)
        const xOffset = (e.clientX - rect.left - cardWidth / 2) / (cardWidth / 2);
        const yOffset = (e.clientY - rect.top - cardHeight / 2) / (cardHeight / 2);

        // Calculate rotation angles
        const rotateY = (xOffset * maxTilt).toFixed(2);
        const rotateX = (-yOffset * maxTilt).toFixed(2);

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        ticking = false;
      });
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

// Auto-run if loaded directly in a page
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initServiceDetail);
} else {
  initServiceDetail();
}
