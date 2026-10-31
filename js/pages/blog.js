/**
 * Digital Crazy Hub — Blog Listing Page Script
 * File: js/pages/blog.js
 * Vanilla JavaScript ES6+
 * 
 * Features:
 * - 4 Approved Category Filtering (All, Digital Marketing Strategies, SEO, Uncategorized, Web Development)
 * - 9 Posts Per Page Working Pagination (Page 1-4 for All Articles)
 * - Accessible ARIA tab & pagination states
 * - Card Hover & Viewport Scroll Reveal Animations (prefers-reduced-motion safe)
 * - Configurable Read More destination handler with friendly notification feedback
 */

import { BLOG_CATEGORIES, BLOG_POSTS } from '../data/blog-posts.js';

let currentCategory = 'all';
let currentPage = 1;
const postsPerPage = 9;

/**
 * Initialize Blog Page
 */
export function initBlogPage() {
  const blogGrid = document.getElementById('blog-grid');
  if (!blogGrid) return;

  // Check URL query parameters for category filter
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam && BLOG_CATEGORIES.some((c) => c.id === categoryParam)) {
    currentCategory = categoryParam;
    const activeBtn = document.querySelector(`.blog-filter-btn[data-filter="${categoryParam}"]`);
    if (activeBtn) {
      document.querySelectorAll('.blog-filter-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-pressed', 'true');
    }
  }

  setupCategoryFilters();
  renderBlogView();
  setupToastContainer();
}

/**
 * Filter Categories Setup
 */
function setupCategoryFilters() {
  const filterBtns = document.querySelectorAll('.blog-filter-btn');
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedFilter = btn.dataset.filter;
      if (selectedFilter === currentCategory) return;

      currentCategory = selectedFilter;
      currentPage = 1; // Reset to page 1 on filter switch

      // Update ARIA and active states on tabs
      filterBtns.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      renderBlogView(true);
    });
  });
}

/**
 * Main Render Controller
 */
function renderBlogView(shouldScroll = false) {
  const blogGrid = document.getElementById('blog-grid');
  const paginationContainer = document.getElementById('blog-pagination');
  const resultCountEl = document.getElementById('blog-result-count');
  if (!blogGrid) return;

  // 1. Filter Posts
  const filteredPosts = currentCategory === 'all'
    ? BLOG_POSTS
    : BLOG_POSTS.filter((post) => post.category === currentCategory);

  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const startIndex = (currentPage - 1) * postsPerPage;
  const endIndex = Math.min(startIndex + postsPerPage, totalPosts);
  const visiblePosts = filteredPosts.slice(startIndex, endIndex);

  // 2. Update Result Count
  if (resultCountEl) {
    if (totalPosts === 0) {
      resultCountEl.textContent = 'No articles found in this category.';
    } else {
      resultCountEl.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalPosts} articles`;
    }
  }

  // 3. Render Cards
  if (visiblePosts.length === 0) {
    blogGrid.innerHTML = `
      <div class="blog-empty-state">
        <p>No articles currently available in this category.</p>
      </div>
    `;
  } else {
    blogGrid.innerHTML = visiblePosts.map((post) => createBlogCardMarkup(post)).join('');
  }

  // 4. Render Pagination
  if (paginationContainer) {
    renderPaginationControls(paginationContainer, totalPages);
  }

  // 5. Attach Read More Handlers
  attachReadMoreHandlers(blogGrid);

  // 6. Observe Animations
  initCardRevealAnimations(blogGrid);

  // 7. Scroll smoothly to top of grid if requested
  if (shouldScroll) {
    const listingTop = document.getElementById('blog-listing-top') || blogGrid;
    const headerOffset = 100;
    const elementPosition = listingTop.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Generate Individual Card HTML
 * Follows strict content order:
 * 1. Image top
 * 2. Title
 * 3. Summary
 * 4. Read More button at bottom
 */
function createBlogCardMarkup(post) {
  const hasUrl = Boolean(post.url);

  return `
    <article class="blog-card reveal" data-category="${post.category}" aria-labelledby="blog-title-${post.id}">
      ${hasUrl ? `
        <a href="${post.url}" class="blog-card-media" aria-label="Read ${escapeHtml(post.title)}">
          <span class="blog-card-category-badge">${post.categoryLabel}</span>
          <img src="${post.image}"
            alt="${post.altText || post.title}"
            class="blog-card-img"
            width="800"
            height="450"
            loading="lazy">
        </a>
      ` : `
        <div class="blog-card-media">
          <span class="blog-card-category-badge">${post.categoryLabel}</span>
          <img src="${post.image}"
            alt="${post.altText || post.title}"
            class="blog-card-img"
            width="800"
            height="450"
            loading="lazy">
        </div>
      `}
      <div class="blog-card-body">
        <h2 class="blog-card-title" id="blog-title-${post.id}">
          ${hasUrl ? `<a href="${post.url}">${escapeHtml(post.title)}</a>` : escapeHtml(post.title)}
        </h2>
        <p class="blog-card-summary">${post.summary}</p>
        <div class="blog-card-footer">
          ${hasUrl ? `
            <a href="${post.url}" class="blog-card-btn" aria-label="Read more: ${post.title}">
              <span>Read More</span>
              <svg class="blog-card-btn-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </a>
          ` : `
            <button type="button" class="blog-card-btn js-blog-readmore-btn" data-title="${escapeHtml(post.title)}" aria-label="Read more about ${escapeHtml(post.title)}">
              <span>Read More</span>
              <svg class="blog-card-btn-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          `}
        </div>
      </div>
    </article>
  `;
}

/**
 * Render Accessible Pagination Controls
 */
function renderPaginationControls(container, totalPages) {
  if (totalPages <= 1) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';

  let html = `
    <nav class="blog-pagination-nav" aria-label="Blog Articles Pagination">
      <ul class="pagination-list">
        <li>
          <button type="button" class="pagination-btn pagination-prev" ${currentPage === 1 ? 'disabled aria-disabled="true"' : ''} aria-label="Previous Page">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 11.5L4.5 7L9 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Previous</span>
          </button>
        </li>
  `;

  for (let page = 1; page <= totalPages; page++) {
    const isCurrent = page === currentPage;
    html += `
      <li>
        <button type="button"
          class="pagination-btn pagination-number ${isCurrent ? 'active' : ''}"
          ${isCurrent ? 'aria-current="page"' : ''}
          data-page="${page}"
          aria-label="Page ${page}">
          ${page}
        </button>
      </li>
    `;
  }

  html += `
        <li>
          <button type="button" class="pagination-btn pagination-next" ${currentPage === totalPages ? 'disabled aria-disabled="true"' : ''} aria-label="Next Page">
            <span>Next</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M5 2.5L9.5 7L5 11.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  `;

  container.innerHTML = html;

  // Add click listeners
  const prevBtn = container.querySelector('.pagination-prev');
  if (prevBtn && currentPage > 1) {
    prevBtn.addEventListener('click', () => {
      currentPage--;
      renderBlogView(true);
    });
  }

  const nextBtn = container.querySelector('.pagination-next');
  if (nextBtn && currentPage < totalPages) {
    nextBtn.addEventListener('click', () => {
      currentPage++;
      renderBlogView(true);
    });
  }

  const pageButtons = container.querySelectorAll('.pagination-number');
  pageButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const pageNum = parseInt(btn.dataset.page, 10);
      if (pageNum && pageNum !== currentPage) {
        currentPage = pageNum;
        renderBlogView(true);
      }
    });
  });
}

/**
 * Handle Read More Clicks for unconfigured destinations
 */
function attachReadMoreHandlers(container) {
  const readMoreButtons = container.querySelectorAll('.js-blog-readmore-btn');
  readMoreButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const articleTitle = btn.dataset.title || 'this article';
      showBlogToast(`Detailed article for "${articleTitle}" is scheduled for publication soon. Contact info@digitalcrazyhub.com for direct insights.`);
    });
  });
}

/**
 * Viewport Scroll Reveal for Blog Cards
 */
function initCardRevealAnimations(container) {
  const cards = container.querySelectorAll('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || !('IntersectionObserver' in window)) {
    cards.forEach((card) => card.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, idx * 60);
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -30px 0px',
    threshold: 0.08
  });

  cards.forEach((card) => observer.observe(card));
}

/**
 * Toast Notification Helper
 */
function setupToastContainer() {
  if (document.getElementById('blog-toast-container')) return;
  const toastContainer = document.createElement('div');
  toastContainer.id = 'blog-toast-container';
  toastContainer.className = 'blog-toast-container';
  toastContainer.setAttribute('role', 'status');
  toastContainer.setAttribute('aria-live', 'polite');
  document.body.appendChild(toastContainer);
}

function showBlogToast(message) {
  const container = document.getElementById('blog-toast-container') || document.body;
  const toast = document.createElement('div');
  toast.className = 'blog-toast';
  toast.innerHTML = `
    <div class="blog-toast-icon" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
    </div>
    <div class="blog-toast-text">${escapeHtml(message)}</div>
    <button type="button" class="blog-toast-close" aria-label="Dismiss notification">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.blog-toast-close');
  const dismiss = () => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  };

  closeBtn.addEventListener('click', dismiss);
  setTimeout(dismiss, 6000);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Auto-run if DOM is already ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBlogPage);
} else {
  initBlogPage();
}
