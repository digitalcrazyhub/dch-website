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

  // Project Portfolio Filter Tabs (Matching Reference Design)
  const filterBtns = document.querySelectorAll('.portfolio-filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (filterBtns.length > 0 && projectCards.length > 0) {
    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Toggle active button
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = '';
            card.classList.add('visible');
          } else {
            card.style.display = 'none';
            card.classList.remove('visible');
          }
        });
      });
    });
  }

  // Intersection Observer for Scroll Reveals
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((el) => {
      revealObserver.observe(el);
    });
  } else {
    // If reduced motion is preferred or IntersectionObserver not supported, reveal immediately
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('revealed');
    });
  }

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
});
