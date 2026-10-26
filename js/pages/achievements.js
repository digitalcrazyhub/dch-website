/**
 * Digital Crazy Hub — Achievements Page Gallery & Lightbox Script
 * File: js/pages/achievements.js
 * Vanilla JavaScript ES6+
 *
 * Responsibilities:
 * 1. Verified achievements image manifest (64 verified image assets across 7 sections).
 * 2. Automatic computation and injection of section counts (no hardcoded counts).
 * 3. Fully accessible, circular interactive lightbox:
 *    - Navigation: Previous / Next buttons, Keyboard ArrowLeft/Right, Touch Swipe.
 *    - Close: Close button, Backdrop click, Escape key.
 *    - Non-closing preview image click.
 *    - Keyboard focus management & focus restoration.
 *    - Preload & smooth fade transitions.
 */

/**
 * Verified Achievements Image Inventory
 * Sourced directly from assets/images/achievements/ and subdirectories.
 */
export const ACHIEVEMENTS_GALLERY = [
  {
    id: 'awards',
    title: 'Awards & Recognition',
    images: [
      { src: 'assets/images/achievements/awards/award-01.png', alt: 'Digital Crazy Hub Award Trophy 01' },
      { src: 'assets/images/achievements/awards/award-02.png', alt: 'Digital Crazy Hub Award Trophy 02' },
      { src: 'assets/images/achievements/awards/award-03.png', alt: 'Digital Crazy Hub Award Trophy 03' },
      { src: 'assets/images/achievements/awards/award-04.png', alt: 'Digital Crazy Hub Award Trophy 04' },
      { src: 'assets/images/achievements/awards/award-05.png', alt: 'Digital Crazy Hub Award Trophy 05' },
      { src: 'assets/images/achievements/awards/award-06.png', alt: 'Digital Crazy Hub Award Trophy 06' }
    ]
  },
  {
    id: 'cni-awards',
    title: 'CNI Awards & Felicitation',
    images: [
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-01.jpeg', alt: 'CNI Awards and Felicitation Ceremony 01' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-02.jpg', alt: 'CNI Awards and Felicitation Ceremony 02' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-03.jpeg', alt: 'CNI Awards and Felicitation Ceremony 03' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-04.jpeg', alt: 'CNI Awards and Felicitation Ceremony 04' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-05.JPG', alt: 'CNI Awards and Felicitation Ceremony 05' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-06.JPG', alt: 'CNI Awards and Felicitation Ceremony 06' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-07.jpeg', alt: 'CNI Awards and Felicitation Ceremony 07' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-08.jpg', alt: 'CNI Awards and Felicitation Ceremony 08' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-09.png', alt: 'CNI Awards and Felicitation Ceremony 09' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-10.jpeg', alt: 'CNI Awards and Felicitation Ceremony 10' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-11.jpeg', alt: 'CNI Awards and Felicitation Ceremony 11' },
      { src: 'assets/images/achievements/awards/CNI-awards/CNI-award-12.jpeg', alt: 'CNI Awards and Felicitation Ceremony 12' }
    ]
  },
  {
    id: 'sdc-college',
    title: 'College Events — SDC',
    images: [
      { src: 'assets/images/achievements/Training/SDC-college/SDC-01.png', alt: 'Swami Dayananda College Workshop Presentation 01' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-02.jpg', alt: 'Swami Dayananda College Workshop 02' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-03.jpg', alt: 'Swami Dayananda College Workshop 03' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-04.jpg', alt: 'Swami Dayananda College Workshop 04' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-05.jpg', alt: 'Swami Dayananda College Workshop 05' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-06.jpg', alt: 'Swami Dayananda College Workshop 06' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-07.jpg', alt: 'Swami Dayananda College Workshop 07' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-08.jpg', alt: 'Swami Dayananda College Workshop 08' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-09.jpg', alt: 'Swami Dayananda College Workshop 09' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-10.jpg', alt: 'Swami Dayananda College Workshop 10' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-11.jpg', alt: 'Swami Dayananda College Workshop 11' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-12.jpg', alt: 'Swami Dayananda College Workshop 12' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-13.jpg', alt: 'Swami Dayananda College Workshop 13' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-14.jpg', alt: 'Swami Dayananda College Workshop 14' },
      { src: 'assets/images/achievements/Training/SDC-college/SDC-15.jpg', alt: 'Swami Dayananda College Workshop 15' }
    ]
  },
  {
    id: 'event-sql',
    title: 'Workshops & Activities',
    images: [
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-01.png', alt: 'SQL Workshop for Data Scientists at SIMATS Engineering 01' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-02.jpeg', alt: 'SQL Workshop for Data Scientists 02' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-03.jpeg', alt: 'SQL Workshop for Data Scientists 03' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-04.jpeg', alt: 'SQL Workshop for Data Scientists 04' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-05.jpeg', alt: 'SQL Workshop for Data Scientists 05' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-06.jpeg', alt: 'SQL Workshop for Data Scientists 06' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-07.jpeg', alt: 'SQL Workshop for Data Scientists 07' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-08.jpeg', alt: 'SQL Workshop for Data Scientists 08' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-09.jpeg', alt: 'SQL Workshop for Data Scientists 09' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-10.jpeg', alt: 'SQL Workshop for Data Scientists 10' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-11.jpeg', alt: 'SQL Workshop for Data Scientists 11' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-12.jpeg', alt: 'SQL Workshop for Data Scientists 12' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-13.jpeg', alt: 'SQL Workshop for Data Scientists 13' },
      { src: 'assets/images/achievements/Training/Event-SQL/event-sql-14.jpg', alt: 'SQL Workshop for Data Scientists 14' }
    ]
  },
  {
    id: 'sns-college',
    title: 'College Events — SNS',
    images: [
      { src: 'assets/images/achievements/Training/SNS-college/sns-01.jpg', alt: 'Dr. SNS Rajalakshmi College Event 01' },
      { src: 'assets/images/achievements/Training/SNS-college/sns-02.jpg', alt: 'Dr. SNS Rajalakshmi College Event 02' },
      { src: 'assets/images/achievements/Training/SNS-college/sns-03.jpg', alt: 'Dr. SNS Rajalakshmi College Event 03' },
      { src: 'assets/images/achievements/Training/SNS-college/sns-04.jpg', alt: 'Dr. SNS Rajalakshmi College Event 04' },
      { src: 'assets/images/achievements/Training/SNS-college/sns-05.jpg', alt: 'Dr. SNS Rajalakshmi College Event 05' },
      { src: 'assets/images/achievements/Training/SNS-college/sns-06.jpg', alt: 'Dr. SNS Rajalakshmi College Event 06' },
      { src: 'assets/images/achievements/Training/SNS-college/sns-07.png', alt: 'Dr. SNS Rajalakshmi College Campus 07' }
    ]
  },
  {
    id: 'vels-college',
    title: 'College Events — Vels',
    images: [
      { src: 'assets/images/achievements/Training/vels-college/vels-01.jpg', alt: 'Vels University Workshop on Digital Marketing 01' },
      { src: 'assets/images/achievements/Training/vels-college/vels-02.jpg', alt: 'Vels University Workshop on Digital Marketing 02' },
      { src: 'assets/images/achievements/Training/vels-college/vels-03.jpg', alt: 'Vels University Workshop on Digital Marketing 03' },
      { src: 'assets/images/achievements/Training/vels-college/vels-04.jpg', alt: 'Vels University Workshop on Digital Marketing 04' },
      { src: 'assets/images/achievements/Training/vels-college/vels-05.jpg', alt: 'Vels University Workshop on Digital Marketing 05' }
    ]
  },
  {
    id: 'training-sessions',
    title: 'Training Sessions',
    images: [
      { src: 'assets/images/achievements/Training/training/training-01.jpeg', alt: 'Digital Crazy Hub In-House Training Session 01' },
      { src: 'assets/images/achievements/Training/training/training-02.jpeg', alt: 'Digital Crazy Hub In-House Training Session 02' },
      { src: 'assets/images/achievements/Training/training/training-03.jpg', alt: 'Digital Crazy Hub In-House Training Session 03' },
      { src: 'assets/images/achievements/Training/training/training-04.jpg', alt: 'Digital Crazy Hub In-House Training Session 04' },
      { src: 'assets/images/achievements/Training/training/training-05.jpg', alt: 'Digital Crazy Hub In-House Training Session 05' }
    ]
  }
];

/**
 * Interactive Lightbox Controller
 */
class AchievementsLightbox {
  constructor() {
    this.modal = document.getElementById('achievements-lightbox');
    if (!this.modal) return;

    this.backdrop = document.getElementById('lightbox-backdrop');
    this.closeBtn = document.getElementById('lightbox-close');
    this.prevBtn = document.getElementById('lightbox-prev');
    this.nextBtn = document.getElementById('lightbox-next');
    this.previewImg = document.getElementById('lightbox-preview-img');
    this.figureWrap = document.getElementById('lightbox-figure-wrap');
    this.currentIdxEl = document.getElementById('lightbox-current-idx');
    this.totalIdxEl = document.getElementById('lightbox-total-idx');

    this.activeGroup = null;
    this.currentIndex = 0;
    this.isOpen = false;
    this.lastFocusedTrigger = null;

    // Touch swipe coordinates
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.initEvents();
  }

  initEvents() {
    // Close on close button click
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Close on backdrop click
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Stop propagation on image figure so clicking inside preview DOES NOT close lightbox
    if (this.figureWrap) {
      this.figureWrap.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Prev / Next Navigation
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }

    // Touch Swipe handling on the preview container
    if (this.figureWrap) {
      this.figureWrap.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
          this.touchStartX = e.touches[0].clientX;
          this.touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      this.figureWrap.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const deltaX = touchEndX - this.touchStartX;
          const deltaY = touchEndY - this.touchStartY;

          // If horizontal swipe is significant and greater than vertical drift
          if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
              this.next(); // Swiped left -> next
            } else {
              this.prev(); // Swiped right -> prev
            }
          }
        }
      }, { passive: true });
    }
  }

  open(groupId, index, triggerEl) {
    const group = ACHIEVEMENTS_GALLERY.find((g) => g.id === groupId);
    if (!group || !group.images[index]) return;

    this.activeGroup = group;
    this.currentIndex = index;
    this.lastFocusedTrigger = triggerEl || document.activeElement;
    this.isOpen = true;

    // Show modal
    this.modal.classList.add('is-open');
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Render image & counter
    this.updateView();

    // Attach keyboard listener
    document.addEventListener('keydown', this.handleKeyDown);

    // Set initial focus to close button for accessibility
    requestAnimationFrame(() => {
      if (this.closeBtn) this.closeBtn.focus();
    });
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    this.modal.classList.remove('is-open');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Clear preview to release memory
    if (this.previewImg) {
      this.previewImg.src = '';
    }

    // Detach keyboard listener
    document.removeEventListener('keydown', this.handleKeyDown);

    // Restore focus to thumbnail trigger
    if (this.lastFocusedTrigger && typeof this.lastFocusedTrigger.focus === 'function') {
      this.lastFocusedTrigger.focus();
    }
  }

  next() {
    if (!this.activeGroup || this.activeGroup.images.length === 0) return;
    // Circular navigation: wrap to first image when reaching the end
    this.currentIndex = (this.currentIndex + 1) % this.activeGroup.images.length;
    this.updateView();
  }

  prev() {
    if (!this.activeGroup || this.activeGroup.images.length === 0) return;
    // Circular navigation: wrap to last image when at the beginning
    this.currentIndex = (this.currentIndex - 1 + this.activeGroup.images.length) % this.activeGroup.images.length;
    this.updateView();
  }

  updateView() {
    if (!this.activeGroup || !this.previewImg) return;
    const item = this.activeGroup.images[this.currentIndex];

    // Subtle fade transition
    this.previewImg.style.opacity = '0.35';

    // Update image and attributes
    const imgObj = new Image();
    imgObj.src = item.src;
    imgObj.onload = () => {
      this.previewImg.src = item.src;
      this.previewImg.alt = item.alt || this.activeGroup.title;
      this.previewImg.style.opacity = '1';
    };
    imgObj.onerror = () => {
      this.previewImg.src = item.src;
      this.previewImg.alt = item.alt || this.activeGroup.title;
      this.previewImg.style.opacity = '1';
    };

    // Update Counter
    if (this.currentIdxEl) {
      this.currentIdxEl.textContent = String(this.currentIndex + 1);
    }
    if (this.totalIdxEl) {
      this.totalIdxEl.textContent = String(this.activeGroup.images.length);
    }
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
      // Focus trap within available lightbox controls
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
 * Initialize Achievements Gallery
 * - Updates heading count badges automatically from the manifest.
 * - Attaches click and keyboard activation on all thumbnails.
 */
export function initAchievementsPage() {
  // Update section count badges
  ACHIEVEMENTS_GALLERY.forEach((group) => {
    const badge = document.querySelector(`[data-count-for="${group.id}"]`);
    if (badge) {
      badge.textContent = String(group.images.length);
    }
  });

  // Initialize Lightbox controller
  const lightbox = new AchievementsLightbox();

  // Attach triggers to all gallery card buttons
  const galleryCards = document.querySelectorAll('.gallery-card');
  galleryCards.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const itemEl = btn.closest('.gallery-item');
      if (!itemEl) return;

      const groupId = itemEl.dataset.group;
      const index = parseInt(itemEl.dataset.index, 10);
      if (!isNaN(index)) {
        lightbox.open(groupId, index, btn);
      }
    });
  });
}

// Auto-run on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAchievementsPage);
  } else {
    initAchievementsPage();
  }
}
