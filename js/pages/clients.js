/**
 * Digital Crazy Hub — Clients Page Gallery & Lightbox Controller
 * File: js/pages/clients.js
 * Theme: "Coffee with Clients | Real Meetings | Business Relationships"
 * Vanilla JavaScript ES6+
 *
 * Responsibilities:
 * 1. Verified inventory of authentic client meeting photographs (30 verified web-safe assets).
 * 2. Automatic synchronization of gallery count badge (30).
 * 3. Accessible, touch-enabled interactive lightbox:
 *    - Navigation: Previous / Next buttons, Keyboard ArrowLeft/Right, Touch swipe gestures.
 *    - Dismiss: Close button, Backdrop click, Escape key.
 *    - Image figure click is non-dismissive.
 *    - Image counter (X / 30) dynamically updated.
 *    - Preloading of adjacent images for smooth navigation.
 *    - Keyboard focus management & focus restoration to active thumbnail.
 *    - Scroll lock on background body while lightbox is open.
 */

/**
 * Verified Client Meeting Photographs Inventory
 * Sourced directly from assets/images/coffee-with-clients/
 * 30 distinct photographs featuring founder Devendran Muthaiyan & clients in real business meetings.
 * Note: HEIC files (client 1..3.HEIC) are excluded as they are not natively supported by standard web browsers.
 */
export const CLIENTS_IMAGES = [
  // 8 .jpeg assets
  {
    id: 1,
    src: 'assets/images/coffee-with-clients/client (1).jpeg',
    alt: 'Digital Crazy Hub client consultation and face-to-face business discussion'
  },
  {
    id: 2,
    src: 'assets/images/coffee-with-clients/client (2).jpeg',
    alt: 'Client strategy discussion and project collaboration over coffee'
  },
  {
    id: 3,
    src: 'assets/images/coffee-with-clients/client (3).jpeg',
    alt: 'One-on-one business relationship meeting with Digital Crazy Hub'
  },
  {
    id: 4,
    src: 'assets/images/coffee-with-clients/client (4).jpeg',
    alt: 'Face-to-face client networking and partnership conversation'
  },
  {
    id: 5,
    src: 'assets/images/coffee-with-clients/client (5).jpeg',
    alt: 'Professional business review and client interaction session'
  },
  {
    id: 6,
    src: 'assets/images/coffee-with-clients/client (6).jpeg',
    alt: 'Collaborative client discussion exploring digital growth solutions'
  },
  {
    id: 7,
    src: 'assets/images/coffee-with-clients/client (7).jpeg',
    alt: 'Real-world business interaction and relationship building'
  },
  {
    id: 8,
    src: 'assets/images/coffee-with-clients/client (8).jpeg',
    alt: 'Strategic client meeting and consultation with Digital Crazy Hub'
  },

  // 22 .jpg assets
  {
    id: 9,
    src: 'assets/images/coffee-with-clients/client (1).jpg',
    alt: 'Client partnership discussion and business meeting over coffee'
  },
  {
    id: 10,
    src: 'assets/images/coffee-with-clients/client (2).jpg',
    alt: 'Professional client meeting and marketing roadmap exchange'
  },
  {
    id: 11,
    src: 'assets/images/coffee-with-clients/client (3).jpg',
    alt: 'Client strategy session focused on digital marketing goals'
  },
  {
    id: 12,
    src: 'assets/images/coffee-with-clients/client (4).jpg',
    alt: 'Business partnership meeting and face-to-face interaction'
  },
  {
    id: 13,
    src: 'assets/images/coffee-with-clients/client (5).jpg',
    alt: 'Digital Crazy Hub founder meeting with client partner'
  },
  {
    id: 14,
    src: 'assets/images/coffee-with-clients/client (6).jpg',
    alt: 'Professional networking and client business review'
  },
  {
    id: 15,
    src: 'assets/images/coffee-with-clients/client (7).jpg',
    alt: 'Client collaboration and digital roadmap planning session'
  },
  {
    id: 16,
    src: 'assets/images/coffee-with-clients/client (8).jpg',
    alt: 'Face-to-face conversation and business relationship building'
  },
  {
    id: 17,
    src: 'assets/images/coffee-with-clients/client (9).jpg',
    alt: 'Consultation session reviewing digital performance and growth'
  },
  {
    id: 18,
    src: 'assets/images/coffee-with-clients/client (10).jpg',
    alt: 'Client relationship discussion in professional office setting'
  },
  {
    id: 19,
    src: 'assets/images/coffee-with-clients/client (11).jpg',
    alt: 'Strategic consultation meeting with business partners'
  },
  {
    id: 20,
    src: 'assets/images/coffee-with-clients/client (12).jpg',
    alt: 'One-on-one client interaction and strategy review'
  },
  {
    id: 21,
    src: 'assets/images/coffee-with-clients/client (13).jpg',
    alt: 'Client meeting discussing tailored digital solutions'
  },
  {
    id: 22,
    src: 'assets/images/coffee-with-clients/client (14).jpg',
    alt: 'Face-to-face partnership review and collaboration discussion'
  },
  {
    id: 23,
    src: 'assets/images/coffee-with-clients/client (15).jpg',
    alt: 'Business discussion and client networking over coffee'
  },
  {
    id: 24,
    src: 'assets/images/coffee-with-clients/client (16).jpg',
    alt: 'Collaborative strategy meeting with enterprise client'
  },
  {
    id: 25,
    src: 'assets/images/coffee-with-clients/client (17).jpg',
    alt: 'Client consultation exploring omnichannel marketing initiatives'
  },
  {
    id: 26,
    src: 'assets/images/coffee-with-clients/client (18).jpg',
    alt: 'Professional meeting strengthening long-term client relationship'
  },
  {
    id: 27,
    src: 'assets/images/coffee-with-clients/client (19).jpg',
    alt: 'Face-to-face client consultation and strategic alignment'
  },
  {
    id: 28,
    src: 'assets/images/coffee-with-clients/client (20).jpg',
    alt: 'Business networking and client partnership discussion'
  },
  {
    id: 29,
    src: 'assets/images/coffee-with-clients/client (21).jpg',
    alt: 'Coffee consultation meeting with business leader'
  },
  {
    id: 30,
    src: 'assets/images/coffee-with-clients/client (22).jpg',
    alt: 'Face-to-face client interaction and project celebration'
  }
];

/**
 * Accessible Lightbox Controller for Coffee with Clients Gallery
 */
export class ClientsLightbox {
  constructor(images = CLIENTS_IMAGES) {
    this.images = images;
    this.modal = document.getElementById('clients-lightbox');
    if (!this.modal) return;

    this.backdrop = document.getElementById('clients-lightbox-backdrop');
    this.closeBtn = document.getElementById('clients-lightbox-close');
    this.prevBtn = document.getElementById('clients-lightbox-prev');
    this.nextBtn = document.getElementById('clients-lightbox-next');
    this.previewImg = document.getElementById('clients-lightbox-img');
    this.figure = document.getElementById('clients-lightbox-figure');
    this.currentIdxEl = document.getElementById('clients-lightbox-current');
    this.totalIdxEl = document.getElementById('clients-lightbox-total');

    this.currentIndex = 0;
    this.isOpen = false;
    this.lastFocusedTrigger = null;

    // Touch gesture tracking
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.initEvents();
  }

  initEvents() {
    // Close button click
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Backdrop click closes lightbox
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Prevent clicks inside preview image or figure from closing lightbox
    if (this.figure) {
      this.figure.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Previous and Next buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.prev();
      });
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.next();
      });
    }

    // Touch Swipe handling on figure container
    if (this.figure) {
      this.figure.addEventListener(
        'touchstart',
        (e) => {
          if (e.touches.length === 1) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.touchStartTime = Date.now();
          }
        },
        { passive: true }
      );

      this.figure.addEventListener(
        'touchend',
        (e) => {
          if (e.changedTouches.length === 1) {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            const elapsedTime = Date.now() - this.touchStartTime;

            // Check if swipe is horizontal, quick (< 600ms), and of significant distance (> 40px)
            if (
              elapsedTime < 600 &&
              Math.abs(deltaX) > 40 &&
              Math.abs(deltaX) > Math.abs(deltaY) * 1.2
            ) {
              if (deltaX < 0) {
                this.next(); // Swiped left -> show next image
              } else {
                this.prev(); // Swiped right -> show previous image
              }
            }
          }
        },
        { passive: true }
      );
    }
  }

  open(index, triggerEl) {
    if (index < 0 || index >= this.images.length) return;

    this.currentIndex = index;
    this.lastFocusedTrigger = triggerEl || document.activeElement;
    this.isOpen = true;

    // Show modal
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    document.body.style.overflow = 'hidden';

    // Render image & counter
    this.updateView();

    // Attach keyboard listener
    document.addEventListener('keydown', this.handleKeyDown);

    // Focus close button for keyboard accessibility
    requestAnimationFrame(() => {
      if (this.closeBtn) this.closeBtn.focus();
    });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    document.body.style.overflow = '';

    // Clear preview image to free memory
    if (this.previewImg) {
      this.previewImg.src = '';
    }

    // Detach keyboard listener
    document.removeEventListener('keydown', this.handleKeyDown);

    // Restore focus to triggering button
    if (this.lastFocusedTrigger && typeof this.lastFocusedTrigger.focus === 'function') {
      this.lastFocusedTrigger.focus();
    }
  }

  next() {
    if (this.images.length === 0) return;
    // Circular navigation: loop to first image when reaching the end
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateView();
  }

  prev() {
    if (this.images.length === 0) return;
    // Circular navigation: loop to last image when at the start
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    this.updateView();
  }

  updateView() {
    if (!this.previewImg || this.images.length === 0) return;
    const item = this.images[this.currentIndex];

    // Smooth subtle opacity transition
    this.previewImg.style.opacity = '0.35';

    // Preload image
    const imgObj = new Image();
    imgObj.src = item.src;
    imgObj.onload = () => {
      this.previewImg.src = item.src;
      this.previewImg.alt = item.alt;
      this.previewImg.style.opacity = '1';
    };
    imgObj.onerror = () => {
      this.previewImg.src = item.src;
      this.previewImg.alt = item.alt;
      this.previewImg.style.opacity = '1';
    };

    // Update Counter indicators
    if (this.currentIdxEl) {
      this.currentIdxEl.textContent = String(this.currentIndex + 1);
    }
    if (this.totalIdxEl) {
      this.totalIdxEl.textContent = String(this.images.length);
    }

    // Preload next and previous images in background
    this.preloadNeighbors();
  }

  preloadNeighbors() {
    const nextIdx = (this.currentIndex + 1) % this.images.length;
    const prevIdx = (this.currentIndex - 1 + this.images.length) % this.images.length;
    const nextImg = new Image();
    nextImg.src = this.images[nextIdx].src;
    const prevImg = new Image();
    prevImg.src = this.images[prevIdx].src;
  }

  handleKeyDown(e) {
    if (!this.isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      this.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      this.prev();
    } else if (e.key === 'Tab') {
      // Focus trap within available controls (closeBtn, prevBtn, nextBtn)
      const focusable = [this.prevBtn, this.nextBtn, this.closeBtn].filter(Boolean);
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
  }
}

/**
 * Initialize Clients Page Functionality
 */
export function initClientsPage() {
  const clientsSection = document.querySelector('.clients-page');
  const lightboxEl = document.getElementById('clients-lightbox');
  if (!clientsSection && !lightboxEl) return;

  // Update count badge automatically from manifest
  const countBadge = document.querySelector('.clients-count-badge');
  if (countBadge) {
    countBadge.textContent = String(CLIENTS_IMAGES.length);
  }

  // Initialize lightbox controller
  const lightbox = new ClientsLightbox(CLIENTS_IMAGES);

  // Attach click handler to each thumbnail trigger card
  const cards = document.querySelectorAll('.clients-card');
  cards.forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(card.dataset.index, 10);
      if (!isNaN(idx)) {
        lightbox.open(idx, card);
      }
    });
  });
}

// Auto-initialize when document is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClientsPage);
  } else {
    initClientsPage();
  }
}
