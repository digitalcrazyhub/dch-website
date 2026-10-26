/**
 * Digital Crazy Hub — Blog Detail Page Logic
 * File: js/pages/blog-detail.js
 * Vanilla JavaScript ES6+
 * 
 * Features:
 * - Dynamic URL parameter hydration (?id=1 to 30)
 * - Table of Contents generation & active scroll spy (IntersectionObserver)
 * - Accessible FAQ Accordion with keyboard navigation
 * - Sidebar widgets (Recent Posts, Categories with deep linking, Popular Insights)
 * - Related Articles generation (filtered by category, excluding current post)
 * - Graceful degradation & prefers-reduced-motion support
 */

import { BLOG_POSTS, BLOG_CATEGORIES, getArticleData } from '../data/blog-posts.js';

document.addEventListener('DOMContentLoaded', () => {
  const articleContainer = document.getElementById('blog-detail-article');
  if (!articleContainer) return; // Exit if not on the blog detail page

  // Check if current page is an individual pre-rendered static blog detail page
  const isStaticDetailPage = document.body.classList.contains('blog-static-page') || 
                             articleContainer.hasAttribute('data-static-article') ||
                             window.location.pathname.includes('/blog-page/');
  if (isStaticDetailPage) {
    const faqListEl = document.getElementById('article-faq-accordion');
    if (faqListEl) setupFaqAccordion(faqListEl);
    setupTocScrollSpy();
    return;
  }

  // 1. Identify Target Article from URL Query Parameter
  const urlParams = new URLSearchParams(window.location.search);
  const postIdParam = urlParams.get('id');
  const targetId = parseInt(postIdParam, 10) || 1;

  // Retrieve complete article payload
  const article = getArticleData(targetId);

  // 2. Hydrate SEO Meta and Document Title
  document.title = `${article.title} | Digital Crazy Hub Blog`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', article.summary || article.leadParagraph.slice(0, 155));
  }
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', article.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', article.summary || article.leadParagraph.slice(0, 155));
  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.setAttribute('content', article.image);

  // 3. Hydrate Breadcrumbs
  const breadcrumbCurrent = document.getElementById('breadcrumb-article-title');
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = article.title;
    breadcrumbCurrent.title = article.title;
  }
  const breadcrumbCategory = document.getElementById('breadcrumb-category-link');
  if (breadcrumbCategory) {
    breadcrumbCategory.textContent = article.categoryLabel;
    breadcrumbCategory.href = `blog.html?category=${article.category}`;
  }

  // 4. Hydrate Article Header
  const badgeEl = document.getElementById('article-category-badge');
  if (badgeEl) {
    badgeEl.textContent = article.categoryLabel;
    badgeEl.href = `blog.html?category=${article.category}`;
  }

  const titleEl = document.getElementById('article-main-title');
  if (titleEl) {
    titleEl.textContent = article.title;
  }

  const readTimeEl = document.getElementById('article-reading-time');
  if (readTimeEl) {
    readTimeEl.textContent = article.readingTime || '6 min read';
  }

  // 5. Hydrate Featured Image
  const featuredImg = document.getElementById('article-featured-image');
  if (featuredImg) {
    featuredImg.src = article.image;
    featuredImg.alt = article.altText || article.title;
    featuredImg.onerror = () => {
      featuredImg.src = 'assets/images/blog/blog-image-18.png';
    };
  }

  // 6. Hydrate Lead Introduction Paragraph
  const leadEl = document.getElementById('article-lead-text');
  if (leadEl) {
    leadEl.textContent = article.leadParagraph;
  }

  // 7. Render Table of Contents
  const tocList = document.getElementById('article-toc-list');
  if (tocList && article.toc && article.toc.length > 0) {
    tocList.innerHTML = article.toc.map((item, index) => `
      <li class="toc-item">
        <a href="#${item.id}" class="toc-link" data-target="${item.id}">
          <span class="toc-index">${index + 1}.</span>
          <span class="toc-text">${item.title.replace(/^\d+\.\s*/, '')}</span>
        </a>
      </li>
    `).join('');
  } else if (tocList) {
    const tocContainer = document.getElementById('article-toc-container');
    if (tocContainer) tocContainer.style.display = 'none';
  }

  // 8. Render Full Article Sections & Content
  const bodyContentEl = document.getElementById('article-body-content');
  if (bodyContentEl && article.sections) {
    const sectionsHtml = article.sections.map((section) => {
      let bulletsHtml = '';
      if (section.bulletPoints && section.bulletPoints.length > 0) {
        bulletsHtml = `
          <ul class="article-bullet-list">
            ${section.bulletPoints.map((bp) => `<li>${bp}</li>`).join('')}
          </ul>
        `;
      }

      let quoteHtml = '';
      if (section.calloutQuote) {
        quoteHtml = `
          <blockquote class="article-quote-box">
            <p>${section.calloutQuote}</p>
          </blockquote>
        `;
      }

      return `
        <section id="${section.id}" class="article-content-section">
          <h2 class="article-h2">${section.heading}</h2>
          ${section.paragraphs.map((p) => `<p class="article-p">${p}</p>`).join('')}
          ${quoteHtml}
          ${bulletsHtml}
        </section>
      `;
    }).join('');

    bodyContentEl.innerHTML = sectionsHtml;
  }

  // 9. Render Conclusion Section
  const conclusionSection = document.getElementById('article-conclusion-section');
  if (conclusionSection && article.conclusion) {
    conclusionSection.innerHTML = `
      <h2 class="article-h2">${article.conclusion.heading || 'Conclusion'}</h2>
      ${article.conclusion.paragraphs.map((p) => `<p class="article-p">${p}</p>`).join('')}
    `;
  }

  // 10. Render FAQs Accordion
  const faqListEl = document.getElementById('article-faq-accordion');
  if (faqListEl && article.faqs && article.faqs.length > 0) {
    faqListEl.innerHTML = article.faqs.map((faq, index) => {
      const isFirst = index === 0;
      return `
        <div class="faq-item ${isFirst ? 'active' : ''}">
          <button 
            type="button" 
            class="faq-question" 
            aria-expanded="${isFirst ? 'true' : 'false'}" 
            aria-controls="faq-answer-${index}"
            id="faq-btn-${index}"
          >
            <span class="faq-question-text">${faq.question}</span>
            <span class="faq-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </span>
          </button>
          <div 
            id="faq-answer-${index}" 
            class="faq-answer" 
            role="region" 
            aria-labelledby="faq-btn-${index}"
            style="${isFirst ? 'display: block;' : 'display: none;'}"
          >
            <p class="faq-answer-text">${faq.answer}</p>
          </div>
        </div>
      `;
    }).join('');

    // Attach FAQ Accordion Event Listeners
    setupFaqAccordion(faqListEl);
  } else if (faqListEl) {
    const faqContainer = document.getElementById('article-faq-container');
    if (faqContainer) faqContainer.style.display = 'none';
  }

  // 11. Render Tags
  const tagsListEl = document.getElementById('article-tags-list');
  if (tagsListEl && article.tags && article.tags.length > 0) {
    tagsListEl.innerHTML = article.tags.map((tag) => `
      <a href="blog.html?category=${article.category}" class="tag-pill" title="Filter by ${tag}">
        <span class="tag-hash">#</span>${tag}
      </a>
    `).join('');
  }

  // 12. Render Sidebar: Recent Posts Widget (Excluding current article)
  const sidebarRecentEl = document.getElementById('sidebar-recent-posts');
  if (sidebarRecentEl) {
    const recentPosts = BLOG_POSTS.filter((p) => p.id !== targetId).slice(0, 4);
    sidebarRecentEl.innerHTML = recentPosts.map((post) => `
      <li class="recent-post-item">
        <a href="${post.url}" class="recent-post-link">
          <div class="recent-post-thumb">
            <img src="${post.image}" alt="${post.title}" loading="lazy" width="70" height="52">
          </div>
          <div class="recent-post-details">
            <span class="recent-post-category">${post.categoryLabel}</span>
            <h4 class="recent-post-title">${post.title}</h4>
            <span class="recent-post-time">${post.readingTime}</span>
          </div>
        </a>
      </li>
    `).join('');
  }

  // 13. Render Sidebar: Categories Widget
  const sidebarCategoriesEl = document.getElementById('sidebar-categories-list');
  if (sidebarCategoriesEl) {
    const catsToDisplay = BLOG_CATEGORIES.filter((c) => c.id !== 'all');
    sidebarCategoriesEl.innerHTML = catsToDisplay.map((cat) => {
      const isCurrentCat = cat.id === article.category;
      return `
        <li class="category-item ${isCurrentCat ? 'active' : ''}">
          <a href="blog.html?category=${cat.id}" class="category-link">
            <span class="category-name">${cat.label}</span>
            <span class="category-count">(${cat.count})</span>
          </a>
        </li>
      `;
    }).join('');
  }

  // 14. Render Sidebar: Popular Insights Widget (Additional verified articles)
  const sidebarInsightsEl = document.getElementById('sidebar-popular-insights');
  if (sidebarInsightsEl) {
    // Pick different verified articles to avoid exact duplication with recent posts
    const insightPosts = BLOG_POSTS.filter((p) => p.id !== targetId && p.id > 5).slice(0, 3);
    sidebarInsightsEl.innerHTML = insightPosts.map((post) => `
      <li class="popular-insight-item">
        <a href="${post.url}" class="insight-link">
          <div class="insight-thumb">
            <img src="${post.image}" alt="${post.title}" loading="lazy" width="60" height="45">
          </div>
          <div class="insight-info">
            <h5 class="insight-title">${post.title}</h5>
            <span class="insight-read">${post.readingTime}</span>
          </div>
        </a>
      </li>
    `).join('');
  }

  // 15. Render Related Articles Section (Bottom Grid, max 3 cards)
  const relatedGridEl = document.getElementById('related-articles-grid');
  if (relatedGridEl) {
    // Prefer posts from same category, fallback to others
    let relatedPosts = BLOG_POSTS.filter((p) => p.id !== targetId && p.category === article.category);
    if (relatedPosts.length < 3) {
      const otherPosts = BLOG_POSTS.filter((p) => p.id !== targetId && p.category !== article.category);
      relatedPosts = [...relatedPosts, ...otherPosts];
    }
    const finalRelated = relatedPosts.slice(0, 3);

    relatedGridEl.innerHTML = finalRelated.map((post) => `
      <article class="related-card reveal">
        <a href="${post.url}" class="related-card-media" aria-label="Read ${post.title}">
          <img src="${post.image}" alt="${post.altText || post.title}" loading="lazy" width="400" height="225">
          <span class="related-card-badge">${post.categoryLabel}</span>
        </a>
        <div class="related-card-body">
          <div class="related-card-meta">
            <span class="reading-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${post.readingTime}
            </span>
          </div>
          <h3 class="related-card-title">
            <a href="${post.url}">${post.title}</a>
          </h3>
          <p class="related-card-summary">${post.summary}...</p>
          <a href="${post.url}" class="related-card-link" aria-label="Read full article: ${post.title}">
            Read Article
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      </article>
    `).join('');
  }

  // 16. Setup Active TOC Scroll Spy using IntersectionObserver
  setupTocScrollSpy();
});

/**
 * Handles FAQ accordion interactions with accessible ARIA state management
 */
function setupFaqAccordion(faqContainer) {
  const faqQuestions = faqContainer.querySelectorAll('.faq-question');

  faqQuestions.forEach((button) => {
    button.addEventListener('click', () => {
      const faqItem = button.closest('.faq-item');
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const answer = faqItem.querySelector('.faq-answer');

      if (isExpanded) {
        button.setAttribute('aria-expanded', 'false');
        faqItem.classList.remove('active');
        if (answer) answer.style.display = 'none';
      } else {
        // Optional accordion behavior: close siblings
        faqContainer.querySelectorAll('.faq-item').forEach((item) => {
          item.classList.remove('active');
          const btn = item.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
          const ans = item.querySelector('.faq-answer');
          if (ans) ans.style.display = 'none';
        });

        button.setAttribute('aria-expanded', 'true');
        faqItem.classList.add('active');
        if (answer) answer.style.display = 'block';
      }
    });
  });
}

/**
 * Sets up smooth TOC scroll spy and active state highlighting on headings
 */
function setupTocScrollSpy() {
  const tocLinks = document.querySelectorAll('.toc-link');
  if (tocLinks.length === 0) return;

  const headingIds = Array.from(tocLinks).map((link) => link.getAttribute('data-target')).filter(Boolean);
  const headings = headingIds.map((id) => document.getElementById(id)).filter(Boolean);

  if (headings.length === 0 || !('IntersectionObserver' in window)) return;

  const observerOptions = {
    root: null,
    rootMargin: '-110px 0px -65% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const activeId = entry.target.id;
        tocLinks.forEach((link) => {
          if (link.getAttribute('data-target') === activeId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  headings.forEach((heading) => observer.observe(heading));
}
