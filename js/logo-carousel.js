/**
 * Digital Crazy Hub - Client Logo Showcase / Marquee Utility
 * Vanilla JavaScript ES6+
 */

export function initLogoShowcase(containerSelector = '.client-logos-track') {
  const track = document.querySelector(containerSelector);
  if (!track) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    track.style.animation = 'none';
  }
}
