/**
 * Digital Crazy Hub — Client Testimonials Carousel Controller
 * File: js/components/testimonial-carousel.js
 * Vanilla JavaScript ES6+ Module
 *
 * Responsibilities:
 * 1. Responsive Multi-Card Carousel:
 *    - Desktop (>= 1024px): 3 cards visible simultaneously
 *    - Tablet (768px - 1023px): 2 cards visible simultaneously
 *    - Mobile (< 768px): 1 card visible
 * 2. Previous / Next navigation with smooth circular navigation
 * 3. Dynamic pagination dots synchronized with current position
 * 4. Touch swipe gesture support for mobile and tablet devices
 * 5. Keyboard navigation (ArrowLeft / ArrowRight / Home / End)
 * 6. Full accessibility (ARIA carousel roles, tablist, aria-selected, live announcements)
 * 7. Respects prefers-reduced-motion
 */

export function initTestimonialCarousel() {
  const section = document.querySelector('.dch-testimonials-section');
  const track = document.getElementById('dch-testimonials-track');
  const viewport = document.getElementById('dch-testimonials-viewport');
  const prevBtn = document.getElementById('dch-testimonials-prev');
  const nextBtn = document.getElementById('dch-testimonials-next');
  const pagination = document.getElementById('dch-testimonials-pagination');

  if (!track || !viewport) return;

  // Prevent multiple initializations
  if (track.dataset.carouselInitialized === 'true') return;
  track.dataset.carouselInitialized = 'true';

  const cards = Array.from(track.querySelectorAll('.dch-testimonials-card'));
  const totalCards = cards.length;
  if (totalCards === 0) return;

  let currentIndex = 0;
  let cardsPerView = 3;
  let maxIndex = 0;

  // Calculate cards visible per view based on CSS variables and viewport width
  function getCardsPerView() {
    if (section) {
      const cssVal = parseInt(getComputedStyle(section).getPropertyValue('--dch-cards-per-view'), 10);
      if (!isNaN(cssVal) && cssVal > 0) return cssVal;
    }
    const width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 1024) return 2;
    return 3;
  }

  function updateMetrics() {
    cardsPerView = getCardsPerView();
    maxIndex = Math.max(0, totalCards - cardsPerView);
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }
  }

  // Render pagination dots matching available scroll positions (maxIndex + 1)
  function renderPagination() {
    if (!pagination) return;
    pagination.innerHTML = '';
    const positionsCount = maxIndex + 1;

    for (let i = 0; i < positionsCount; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dch-testimonials-dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to testimonial slide ${i + 1}`);
      dot.setAttribute('aria-selected', i === currentIndex ? 'true' : 'false');
      dot.dataset.index = String(i);

      dot.addEventListener('click', () => {
        goToSlide(i);
      });

      pagination.appendChild(dot);
    }
  }

  function updatePagination() {
    if (!pagination) return;
    const dots = pagination.querySelectorAll('.dch-testimonials-dot');
    dots.forEach((dot, idx) => {
      const isActive = idx === currentIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  function updateSlideAccessibility() {
    cards.forEach((card, idx) => {
      const isVisible = idx >= currentIndex && idx < currentIndex + cardsPerView;
      card.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
      const focusable = card.querySelectorAll('a, button, [tabindex]');
      focusable.forEach((el) => {
        if (isVisible) {
          el.removeAttribute('tabindex');
        } else {
          el.setAttribute('tabindex', '-1');
        }
      });
    });
  }

  function goToSlide(index) {
    currentIndex = Math.max(0, Math.min(index, maxIndex));

    const card = cards[0];
    if (card) {
      const cardWidth = card.getBoundingClientRect().width;
      const computedGap = parseFloat(getComputedStyle(track).gap) || 28;
      const offset = currentIndex * (cardWidth + computedGap);
      track.style.transform = `translateX(-${offset}px)`;
    }

    updatePagination();
    updateSlideAccessibility();
  }

  // Prev / Next button listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const targetIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
      goToSlide(targetIndex);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const targetIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
      goToSlide(targetIndex);
    });
  }

  // Keyboard navigation on viewport and wrapper
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const targetIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
      goToSlide(targetIndex);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const targetIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
      goToSlide(targetIndex);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(maxIndex);
    }
  });

  // Touch swipe gestures
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;

  viewport.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    },
    { passive: true }
  );

  viewport.addEventListener(
    'touchend',
    (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const deltaTime = Date.now() - touchStartTime;

        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.3;
        const exceedsDistance = Math.abs(deltaX) >= 40;
        const isQuickSwipe = deltaTime < 800;

        if (isHorizontal && exceedsDistance && isQuickSwipe) {
          if (deltaX < 0) {
            // Swiped left -> Next
            const targetIndex = currentIndex < maxIndex ? currentIndex + 1 : 0;
            goToSlide(targetIndex);
          } else {
            // Swiped right -> Prev
            const targetIndex = currentIndex > 0 ? currentIndex - 1 : maxIndex;
            goToSlide(targetIndex);
          }
        }
      }
    },
    { passive: true }
  );

  // Resize handling
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const prevCardsPerView = cardsPerView;
      updateMetrics();
      if (prevCardsPerView !== cardsPerView) {
        renderPagination();
      }
      goToSlide(currentIndex);
    }, 100);
  });

  // Initial layout calculation & render
  updateMetrics();
  renderPagination();
  goToSlide(0);
}

// Auto-run if DOM is ready or wait for DOMContentLoaded event
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestimonialCarousel);
  } else {
    initTestimonialCarousel();
  }
}

