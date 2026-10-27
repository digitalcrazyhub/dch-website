/**
 * Digital Crazy Hub — Client Testimonials Page Controller
 * File: js/pages/testimonials.js
 * Vanilla JavaScript ES6+
 *
 * Responsibilities:
 * 1. Verified Video Manifest: 5 authentic client testimonial video files.
 * 2. Background Preview Controller: Autoplay muted in loop with IntersectionObserver optimization.
 * 3. Interactive Video Lightbox Modal:
 *    - Opens on card click or keyboard activation.
 *    - Autoplays with sound enabled.
 *    - Graceful fallback with "Tap for Sound" if browser policy blocks unmuted autoplay.
 *    - Native controls remain hidden; click inside video toggles play/pause with subtle status feedback.
 *    - Dismiss via close button, backdrop click, or Escape key.
 *    - Full focus management (focus trapped inside dialog, focus restored to triggering card).
 *    - Background body scroll locking (overflow: hidden).
 */

export const TESTIMONIAL_VIDEOS = [
  {
    id: 1,
    src: 'assets/videos/testimonial/testimonial-1.mp4',
    client: 'Client Story #1',
    tag: 'Verified Client',
    title: 'Driving High-Value Growth & Customer Acquisition',
    meta: 'Digital Marketing Success',
    rating: 5
  },
  {
    id: 2,
    src: 'assets/videos/testimonial/testimonial-2.mp4',
    client: 'Client Story #2',
    tag: 'Verified Client',
    title: 'Scaling Brand Reach with Targeted Social & Ads',
    meta: 'Performance Campaign',
    rating: 5
  },
  {
    id: 3,
    src: 'assets/videos/testimonial/testimonial-3.mp4',
    client: 'Client Story #3',
    tag: 'Verified Client',
    title: 'Measurable SEO & Qualified Lead Generation',
    meta: 'Organic Growth Strategy',
    rating: 5
  },
  {
    id: 4,
    src: 'assets/videos/testimonial/testimonial-4.mp4',
    client: 'Client Story #4',
    tag: 'Verified Client',
    title: 'Accelerated Business Inquiries & Sales Pipeline',
    meta: 'Comprehensive Digital Funnel',
    rating: 5
  },
  {
    id: 5,
    src: 'assets/videos/testimonial/testimonial-5.mp4',
    client: 'Client Story #5',
    tag: 'Verified Client',
    title: 'Strategic Partnership & Compounding Returns',
    meta: 'Long-term Growth Partner',
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

  const lightboxBackdrop = document.getElementById('testimonial-lightbox-backdrop');
  const lightboxClose = document.getElementById('testimonial-lightbox-close');
  const lightboxVideo = document.getElementById('testimonial-lightbox-video');
  const videoWrap = document.querySelector('.testimonial-lightbox-video-wrap');
  const playStatus = document.getElementById('video-play-status');
  const unmutePrompt = document.getElementById('testimonial-unmute-prompt');
  const badgeText = lightbox.querySelector('.testimonial-lightbox-badge');

  let lastFocusedCard = null;
  let statusTimeout = null;

  /* --------------------------------------------------------------------------
     1. Performance-Conscious Intersection Observer for Grid Previews
     -------------------------------------------------------------------------- */
  const previewVideos = grid.querySelectorAll('.testimonial-video-preview');
  if ('IntersectionObserver' in window && previewVideos.length > 0) {
    const previewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            if (video.paused) {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch(() => {
                  // Autoplay policy prevented playback; will retry on interaction
                });
              }
            }
          } else {
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    previewVideos.forEach((video) => previewObserver.observe(video));
  }

  /* --------------------------------------------------------------------------
     2. Lightbox Play / Pause Status Indicator
     -------------------------------------------------------------------------- */
  const showPlayStatus = (isPaused) => {
    if (!playStatus) return;
    clearTimeout(statusTimeout);
    playStatus.classList.remove('is-playing', 'is-paused', 'show');

    if (isPaused) {
      playStatus.classList.add('is-paused');
    } else {
      playStatus.classList.add('is-playing');
    }

    // Trigger reflow to restart transition
    void playStatus.offsetWidth;
    playStatus.classList.add('show');

    statusTimeout = setTimeout(() => {
      playStatus.classList.remove('show');
    }, 600);
  };

  /* --------------------------------------------------------------------------
     3. Lightbox Open and Play Logic
     -------------------------------------------------------------------------- */
  const openLightbox = (videoSrc, clientLabel) => {
    if (!lightboxVideo) return;

    if (badgeText && clientLabel) {
      badgeText.textContent = clientLabel;
    }

    // Set video source
    lightboxVideo.src = videoSrc;
    lightboxVideo.currentTime = 0;
    lightboxVideo.muted = false;

    // Show modal & lock background scroll
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');

    // Hide any previous unmute prompt
    if (unmutePrompt) unmutePrompt.classList.remove('visible');

    // Attempt playback with sound enabled
    const playPromise = lightboxVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Direct unmuted playback restricted by browser policy:', err);
        // Fallback: Start muted and present prominent un-mute prompt
        lightboxVideo.muted = true;
        lightboxVideo.play().catch(() => {});
        if (unmutePrompt) {
          unmutePrompt.classList.add('visible');
        }
      });
    }

    // Shift focus into modal for keyboard navigation
    if (lightboxClose) {
      setTimeout(() => lightboxClose.focus(), 50);
    }
  };

  /* --------------------------------------------------------------------------
     4. Lightbox Close Logic
     -------------------------------------------------------------------------- */
  const closeLightbox = () => {
    if (!lightbox.classList.contains('is-open')) return;

    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.currentTime = 0;
      lightboxVideo.src = '';
    }

    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');

    if (unmutePrompt) {
      unmutePrompt.classList.remove('visible');
    }

    // Restore focus to clicked card
    if (lastFocusedCard) {
      lastFocusedCard.focus();
    }
  };

  /* --------------------------------------------------------------------------
     5. Card Click & Keyboard Activation Listeners
     -------------------------------------------------------------------------- */
  const cards = grid.querySelectorAll('.testimonial-video-card');
  cards.forEach((card) => {
    const handleCardActivate = (e) => {
      e.preventDefault();
      lastFocusedCard = card;
      const videoSrc = card.dataset.videoSrc;
      const clientLabel = card.dataset.clientLabel || 'Client Testimonial';
      if (videoSrc) {
        openLightbox(videoSrc, clientLabel);
      }
    };

    card.addEventListener('click', handleCardActivate);

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleCardActivate(e);
      }
    });
  });

  /* --------------------------------------------------------------------------
     6. Video Tap to Toggle Play / Pause Inside Lightbox
     -------------------------------------------------------------------------- */
  if (videoWrap && lightboxVideo) {
    videoWrap.addEventListener('click', (e) => {
      // Don't toggle play/pause if user tapped the unmute prompt button
      if (unmutePrompt && unmutePrompt.contains(e.target)) return;

      if (lightboxVideo.paused) {
        lightboxVideo.play();
        showPlayStatus(false);
      } else {
        lightboxVideo.pause();
        showPlayStatus(true);
      }
    });
  }

  // Handle Unmute Prompt Tap
  if (unmutePrompt && lightboxVideo) {
    unmutePrompt.addEventListener('click', (e) => {
      e.stopPropagation();
      lightboxVideo.muted = false;
      unmutePrompt.classList.remove('visible');
    });
  }

  /* --------------------------------------------------------------------------
     7. Lightbox Dismiss Listeners
     -------------------------------------------------------------------------- */
  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }

  // Keyboard navigation & accessibility
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
      return;
    }

    // Modal focus trap
    if (e.key === 'Tab') {
      const focusableElements = lightbox.querySelectorAll(
        'button:not([disabled]), video, [tabindex="0"]'
      );
      const focusable = Array.from(focusableElements).filter(
        (el) => el.offsetParent !== null
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
}

// Auto-run if DOM is ready or wait for event
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTestimonials);
} else {
  initTestimonials();
}
