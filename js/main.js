/**
 * Digital Crazy Hub - Main Application Interactions
 * Vanilla JavaScript ES6+
 */

import './components.js';
import './pages/service-detail.js';
import './pages/projects.js';
import './pages/blog.js';
import './pages/blog-detail.js';
import './pages/team.js';
import './pages/achievements.js';
import './pages/clients.js';
import './pages/contact.js';
import './pages/testimonials.js';
import './components/profile-modal.js';
import './components/testimonial-carousel.js';
import './components/scoreboard-counter.js';
import { initGlobalAnimations, DCHAnimations } from './animations.js';

document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for in-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Project Portfolio Filter Tabs (Homepage Showcase)
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const projectCards = document.querySelectorAll('#projects .project-card, .projects-grid .project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Toggle active button and ARIA state
        filterBtns.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter;

        projectCards.forEach((card) => {
          const isMatch = filter === 'all' || card.dataset.category === filter;
          if (isMatch) {
            card.style.display = 'flex';
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
            card.classList.add('visible');
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            setTimeout(() => {
              if (card.style.opacity === '0') {
                card.style.display = 'none';
              }
            }, 250);
            card.classList.remove('visible');
          }
        });
      });
    });
  }

  // Global Scroll Reveal & Animation System
  initGlobalAnimations();

  // Background Video Performance & Reduced Motion Handling
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    } else {
      const playPromise = heroVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy prevented playback; poster fallback remains active
        });
      }
    }
  }

  // Legal Page Table of Contents active state on scroll
  const tocLinks = document.querySelectorAll('.legal-toc-link');
  const legalClauses = document.querySelectorAll('.legal-clause');
  if (tocLinks.length > 0 && legalClauses.length > 0 && 'IntersectionObserver' in window) {
    const clauseObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          tocLinks.forEach((link) => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-10% 0px -65% 0px',
      threshold: 0
    });

    legalClauses.forEach((clause) => {
      clauseObserver.observe(clause);
    });
  }

  // About Section Read More / Read Less Toggle
  initAboutToggle();
});

/**
 * Initialize About section Read More / Read Less expandable content toggles
 */
export function initAboutToggle() {
  const aboutToggleBtns = document.querySelectorAll('.about-read-more-btn, #home-about-toggle');
  aboutToggleBtns.forEach((btn) => {
    if (btn.dataset.boundToggle === 'true') return;
    btn.dataset.boundToggle = 'true';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('aria-controls');
      const targetContent = document.getElementById(targetId);
      if (!targetContent) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const newExpanded = !isExpanded;

      btn.setAttribute('aria-expanded', String(newExpanded));
      targetContent.setAttribute('aria-hidden', String(!newExpanded));

      if (newExpanded) {
        targetContent.classList.add('is-expanded');
      } else {
        targetContent.classList.remove('is-expanded');
      }

      // Update button text: Support child .btn-text span (about-us.html) and direct button text (index.html)
      const textSpan = btn.querySelector('.btn-text');
      if (textSpan) {
        textSpan.textContent = newExpanded ? 'Read Less' : 'Read More';
      } else {
        const arrow = btn.querySelector('.btn-arrow, svg');
        if (arrow) {
          btn.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
              node.textContent = newExpanded ? 'Read Less ' : 'Read More ';
            }
          });
        } else {
          btn.textContent = newExpanded ? 'Read Less' : 'Read More';
        }
      }
    });
  });
}

// Immediate execution if DOM is already parsed
if (typeof document !== 'undefined' && (document.readyState === 'interactive' || document.readyState === 'complete')) {
  initAboutToggle();
}
