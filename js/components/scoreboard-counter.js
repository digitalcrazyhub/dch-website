/**
 * Digital Crazy Hub — Scoreboard Counter Animation Controller
 * File: js/components/scoreboard-counter.js
 * Vanilla JavaScript ES6+ Module
 *
 * Responsibilities:
 * 1. Animates scoreboard numbers from 0 to their target value when scrolled into view.
 * 2. Uses IntersectionObserver to trigger precisely when visible.
 * 3. Applies smooth easeOutCubic curve via requestAnimationFrame (no external libraries).
 * 4. Preserves suffixes (e.g. '+', '%') and prefixes seamlessly.
 * 5. Respects prefers-reduced-motion: displays final target values immediately.
 * 6. Prevents re-animating once completed.
 */

export function initScoreboardCounter() {
  const scoreboardSections = document.querySelectorAll('.scoreboard-section');
  if (scoreboardSections.length === 0) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Ease-out cubic function for a smooth and natural deceleration
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function parseCounterData(el) {
    let target = parseFloat(el.dataset.count);
    let suffix = el.dataset.suffix !== undefined ? el.dataset.suffix : '';
    let prefix = el.dataset.prefix !== undefined ? el.dataset.prefix : '';

    // Fallback: parse raw text if data attributes are omitted
    if (isNaN(target)) {
      const raw = el.textContent.trim();
      const match = raw.match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
      if (match) {
        prefix = match[1] || '';
        target = parseFloat(match[2].replace(/,/g, '')) || 0;
        suffix = match[3] || '';
      } else {
        target = parseFloat(raw) || 0;
      }
    }

    return { target, suffix, prefix };
  }

  function animateCounter(el, target, prefix, suffix, duration = 1800) {
    if (prefersReducedMotion) {
      el.textContent = `${prefix}${target}${suffix}`;
      return;
    }

    const startValue = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentValue = Math.round(startValue + (target - startValue) * easedProgress);
      el.textContent = `${prefix}${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = `${prefix}${target}${suffix}`;
      }
    }

    requestAnimationFrame(update);
  }

  function triggerCounters(section) {
    if (section.dataset.countersAnimated === 'true') return;
    section.dataset.countersAnimated = 'true';

    const numbers = section.querySelectorAll('.scoreboard-number');
    numbers.forEach((numEl) => {
      const { target, suffix, prefix } = parseCounterData(numEl);
      animateCounter(numEl, target, prefix, suffix, 1800);
    });
  }

  // Use IntersectionObserver to start counting when section enters viewport
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.15
    };

    const scoreboardObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerCounters(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    scoreboardSections.forEach((section) => {
      scoreboardObserver.observe(section);
    });
  } else {
    // Immediate fallback for no-observer or reduced motion
    scoreboardSections.forEach((section) => {
      triggerCounters(section);
    });
  }
}

// Auto-run if DOM is ready or wait for DOMContentLoaded event
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScoreboardCounter);
  } else {
    initScoreboardCounter();
  }
}

