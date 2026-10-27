/**
 * Digital Crazy Hub — Client Testimonials Page Controller
 * File: js/pages/testimonials.js
 * Vanilla JavaScript ES6+
 *
 * Responsibilities:
 * 1. Centralized YouTube Shorts Manifest: 6 unique client testimonial videos.
 * 2. On-demand Embedded Player: Instantiates official YouTube iframe only when requested.
 * 3. Video Modal Lightbox:
 *    - Opens on card click or keyboard activation (Enter / Space).
 *    - Centered portrait (9:16) presentation.
 *    - Desktop & mobile Previous / Next buttons with circular navigation (1 -> 6, 6 -> 1).
 *    - Dismiss via close button, backdrop click, or Escape key.
 *    - ArrowLeft / ArrowRight keyboard navigation.
 *    - Horizontal touch swipe gestures with velocity & angle filters.
 *    - Full focus trap & restoration to triggering card.
 *    - Clean destruction of iframe on close/switch to immediately terminate playback.
 *    - Loading indicator and graceful fallback link to YouTube.
 */

export const TESTIMONIAL_VIDEOS = [
  {
    index: 0,
    youtubeId: 'QF5Cw0pFvtM',
    embedUrl: 'https://www.youtube.com/embed/QF5Cw0pFvtM',
    youtubeUrl: 'https://youtube.com/shorts/QF5Cw0pFvtM',
    thumbnailUrl: 'https://img.youtube.com/vi/QF5Cw0pFvtM/hqdefault.jpg',
    tag: 'Story #1',
    title: 'Digital Marketing Training Feedback & Growth',
    rating: 5
  },
  {
    index: 1,
    youtubeId: '6kOk99bZVU8',
    embedUrl: 'https://www.youtube.com/embed/6kOk99bZVU8',
    youtubeUrl: 'https://youtube.com/shorts/6kOk99bZVU8',
    thumbnailUrl: 'https://img.youtube.com/vi/6kOk99bZVU8/hqdefault.jpg',
    tag: 'Story #2',
    title: 'Student Success Story & Measurable Results',
    rating: 5
  },
  {
    index: 2,
    youtubeId: '8C3peuzmF9M',
    embedUrl: 'https://www.youtube.com/embed/8C3peuzmF9M',
    youtubeUrl: 'https://youtube.com/shorts/8C3peuzmF9M',
    thumbnailUrl: 'https://img.youtube.com/vi/8C3peuzmF9M/hqdefault.jpg',
    tag: 'Story #3',
    title: 'Why Learners Choose Digital Crazy Hub',
    rating: 5
  },
  {
    index: 3,
    youtubeId: 'oAPa7foomvc',
    embedUrl: 'https://www.youtube.com/embed/oAPa7foomvc',
    youtubeUrl: 'https://youtube.com/shorts/oAPa7foomvc',
    thumbnailUrl: 'https://img.youtube.com/vi/oAPa7foomvc/hqdefault.jpg',
    tag: 'Story #4',
    title: 'Digital Marketing Course Review & Practical Skills',
    rating: 5
  },
  {
    index: 4,
    youtubeId: 'diEbe2G2PQM',
    embedUrl: 'https://www.youtube.com/embed/diEbe2G2PQM',
    youtubeUrl: 'https://youtube.com/shorts/diEbe2G2PQM',
    thumbnailUrl: 'https://img.youtube.com/vi/diEbe2G2PQM/hqdefault.jpg',
    tag: 'Story #5',
    title: 'From Beginner to Professional Marketer',
    rating: 5
  },
  {
    index: 5,
    youtubeId: 'Ysf-as3Eo5s',
    embedUrl: 'https://www.youtube.com/embed/Ysf-as3Eo5s',
    youtubeUrl: 'https://youtube.com/shorts/Ysf-as3Eo5s',
    thumbnailUrl: 'https://img.youtube.com/vi/Ysf-as3Eo5s/hqdefault.jpg',
    tag: 'Story #6',
    title: 'Career Transformation & Strategic Marketing',
    rating: 5
  }
];

export function initTestimonials() {
  const grid = document.getElementById('testimonial-video-grid');
  const lightbox = document.getElementById('testimonial-lightbox');

  // Only run on the Testimonials page where these elements exist
  if (!grid || !lightbox) return;

  // Prevent duplicate initialization
  if (grid.dataset.initialized === 'true') return;
  grid.dataset.initialized = 'true';

  // Lightbox DOM references
  const lightboxBackdrop = document.getElementById('testimonial-lightbox-backdrop');
  const lightboxClose = document.getElementById('testimonial-lightbox-close');
  const prevBtn = document.getElementById('testimonial-lightbox-prev');
  const nextBtn = document.getElementById('testimonial-lightbox-next');
  const mobilePrevBtn = document.getElementById('testimonial-mobile-prev');
  const mobileNextBtn = document.getElementById('testimonial-mobile-next');
  const mobileCounter = document.getElementById('testimonial-mobile-counter');
  const badgeText = document.getElementById('testimonial-lightbox-badge');
  const stage = document.getElementById('testimonial-lightbox-stage');
  const iframeContainer = document.getElementById('testimonial-iframe-container');
  const loader = document.getElementById('testimonial-lightbox-loader');
  const fallbackBox = document.getElementById('testimonial-embed-fallback');
  const fallbackLink = document.getElementById('testimonial-fallback-link');

  const totalVideos = TESTIMONIAL_VIDEOS.length;
  let currentIndex = 0;
  let lastFocusedCard = null;
  let loadSafetyTimer = null;

  /* --------------------------------------------------------------------------
     1. Video Player Loader & Switcher
     -------------------------------------------------------------------------- */
  const loadVideoByIndex = (index) => {
    // Implement circular navigation bounds
    if (index < 0) {
      currentIndex = totalVideos - 1;
    } else if (index >= totalVideos) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }

    const video = TESTIMONIAL_VIDEOS[currentIndex];
    if (!video) return;

    // Immediately stop and destroy any existing player to prevent background audio
    if (iframeContainer) {
      iframeContainer.innerHTML = '';
    }

    // Reset fallback and display loading indicator
    if (fallbackBox) {
      fallbackBox.style.display = 'none';
    }
    if (loader) {
      loader.classList.remove('hidden');
      loader.setAttribute('aria-hidden', 'false');
    }
    if (loadSafetyTimer) {
      clearTimeout(loadSafetyTimer);
    }

    // Update UI Indicators
    if (badgeText) {
      badgeText.textContent = `Client Story #${currentIndex + 1} of ${totalVideos}`;
    }
    if (mobileCounter) {
      mobileCounter.textContent = `${currentIndex + 1} / ${totalVideos}`;
    }
    if (fallbackLink) {
      fallbackLink.href = video.youtubeUrl;
    }

    // Construct official YouTube embed iframe
    const iframe = document.createElement('iframe');
    const embedUrl = `https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&playsinline=1&rel=0&enablejsapi=1`;

    iframe.setAttribute('src', embedUrl);
    iframe.setAttribute('title', `${video.title} - Digital Crazy Hub Client Testimonial`);
    iframe.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    );
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('loading', 'eager');
    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

    // Hide loader once the iframe document loads
    iframe.addEventListener('load', () => {
      if (loader) {
        loader.classList.add('hidden');
        loader.setAttribute('aria-hidden', 'true');
      }
    });

    // In case embed fails or error occurs
    iframe.addEventListener('error', () => {
      if (loader) {
        loader.classList.add('hidden');
        loader.setAttribute('aria-hidden', 'true');
      }
      if (fallbackBox) {
        fallbackBox.style.display = 'block';
      }
    });

    // Safety timeout: remove loader after 6s regardless of network conditions
    loadSafetyTimer = setTimeout(() => {
      if (loader) {
        loader.classList.add('hidden');
        loader.setAttribute('aria-hidden', 'true');
      }
    }, 6000);

    if (iframeContainer) {
      iframeContainer.appendChild(iframe);
    }
  };

  /* --------------------------------------------------------------------------
     2. Lightbox Open and Close Handlers
     -------------------------------------------------------------------------- */
  const openLightbox = (index, triggerElement) => {
    lastFocusedCard = triggerElement || null;

    // Show modal & lock background scroll
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');

    // Load requested video
    loadVideoByIndex(index);

    // Shift keyboard focus into modal for accessible navigation
    requestAnimationFrame(() => {
      if (lightboxClose) {
        lightboxClose.focus();
      }
    });
  };

  const closeLightbox = () => {
    if (!lightbox.classList.contains('is-open')) return;

    if (loadSafetyTimer) {
      clearTimeout(loadSafetyTimer);
    }

    // Completely remove iframe to kill YouTube player and playback audio immediately
    if (iframeContainer) {
      iframeContainer.innerHTML = '';
    }
    if (fallbackBox) {
      fallbackBox.style.display = 'none';
    }
    if (loader) {
      loader.classList.add('hidden');
      loader.setAttribute('aria-hidden', 'true');
    }

    // Close modal & unlock background scrolling
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');

    // Restore focus to triggering card
    if (lastFocusedCard && typeof lastFocusedCard.focus === 'function') {
      lastFocusedCard.focus();
    }
  };

  /* --------------------------------------------------------------------------
     3. Navigation Helpers (Circular: 1->6, 6->1)
     -------------------------------------------------------------------------- */
  const goToPrevVideo = () => {
    loadVideoByIndex(currentIndex - 1);
  };

  const goToNextVideo = () => {
    loadVideoByIndex(currentIndex + 1);
  };

  /* --------------------------------------------------------------------------
     4. Card Click & Keyboard Activation Listeners
     -------------------------------------------------------------------------- */
  const cards = grid.querySelectorAll('.testimonial-video-card');
  cards.forEach((card) => {
    const cardIndexAttr = card.dataset.index;
    const cardVideoId = card.dataset.videoId;

    let targetIndex = 0;
    if (cardIndexAttr !== undefined && !isNaN(parseInt(cardIndexAttr, 10))) {
      targetIndex = parseInt(cardIndexAttr, 10);
    } else if (cardVideoId) {
      const foundIdx = TESTIMONIAL_VIDEOS.findIndex((v) => v.youtubeId === cardVideoId);
      if (foundIdx !== -1) targetIndex = foundIdx;
    }

    const handleCardActivate = (e) => {
      e.preventDefault();
      openLightbox(targetIndex, card);
    };

    card.addEventListener('click', handleCardActivate);

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleCardActivate(e);
      }
    });
  });

  /* --------------------------------------------------------------------------
     5. Lightbox Button Controls (Desktop & Mobile)
     -------------------------------------------------------------------------- */
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToPrevVideo();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToNextVideo();
    });
  }

  if (mobilePrevBtn) {
    mobilePrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToPrevVideo();
    });
  }

  if (mobileNextBtn) {
    mobileNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToNextVideo();
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }

  // Dismiss if user clicks empty backdrop area of modal container
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  /* --------------------------------------------------------------------------
     6. Keyboard Shortcuts & Accessible Focus Trap
     -------------------------------------------------------------------------- */
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;

    // Escape closes modal
    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
      return;
    }

    // Arrow Left / Right navigation
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevVideo();
      return;
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNextVideo();
      return;
    }

    // Modal Focus Trap for Tab key
    if (e.key === 'Tab') {
      const focusableElements = lightbox.querySelectorAll(
        'button:not([disabled]), a[href]:not([disabled]), [tabindex="0"]'
      );
      const focusable = Array.from(focusableElements).filter(
        (el) => el.offsetParent !== null && !el.classList.contains('hidden')
      );

      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  });

  /* --------------------------------------------------------------------------
     7. Touch Horizontal Swipe Gestures (Mobile Support)
     -------------------------------------------------------------------------- */
  if (stage) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    stage.addEventListener(
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

    stage.addEventListener(
      'touchend',
      (e) => {
        if (e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          const deltaTime = Date.now() - touchStartTime;

          // Check if swipe is predominantly horizontal, exceeds threshold, and happened within reasonable time
          const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY) * 1.5;
          const exceedsDistance = Math.abs(deltaX) >= 45;
          const isQuickSwipe = deltaTime < 800;

          if (isHorizontal && exceedsDistance && isQuickSwipe) {
            if (deltaX < 0) {
              // Swiped left -> Next video
              goToNextVideo();
            } else {
              // Swiped right -> Previous video
              goToPrevVideo();
            }
          }
        }
      },
      { passive: true }
    );
  }
}

// Auto-run if DOM is ready or wait for DOMContentLoaded event
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTestimonials);
} else {
  initTestimonials();
}
