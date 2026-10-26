/**
 * Digital Crazy Hub — Our Team Page Script
 * File: js/pages/team.js
 * Vanilla JavaScript ES6+
 *
 * Responsibilities:
 * 1. Verified team members configuration & data architecture.
 * 2. Dynamic rendering of verified social media profile links (strictly omitting unapproved/missing URLs).
 * 3. Tactile 3D card tilt effect (desktop pointer only, capped at 3°, reduced-motion safe).
 */

/**
 * Team Members Inventory & Social Profile Configuration
 * Note: Under strict project governance, personal social media links are displayed
 * ONLY when genuine, approved profile URLs are provided by the client.
 * Currently, personal URLs are pending confirmation, so no fake destinations or '#' links are rendered.
 */
export const TEAM_MEMBERS = [
  {
    id: 'devendran-muthaiyan',
    name: 'Devendran Muthaiyan',
    role: 'Founder',
    bio: 'Leads the vision and growth of Digital Crazy Hub, focusing on helping businesses strengthen their digital presence through creative and strategic marketing solutions.',
    image: 'assets/images/team/devendran.webp',
    alt: 'Devendran Muthaiyan - Founder of Digital Crazy Hub',
    socials: {
      linkedin: null, // Pending client confirmation (e.g., 'https://linkedin.com/in/...')
      instagram: null,
      facebook: null,
      x: null
    }
  },
  {
    id: 'sudhakar-vasudevan',
    name: 'Sudhakar Vasudevan',
    role: 'Full Stack Developer',
    bio: 'Builds and maintains web solutions with a focus on functionality, responsive user experiences, and modern development practices.',
    image: 'assets/images/team/sudhakar.webp',
    alt: 'Sudhakar Vasudevan - Full Stack Developer at Digital Crazy Hub',
    socials: {
      linkedin: null, // Pending client confirmation (e.g., 'https://linkedin.com/in/...')
      instagram: null,
      facebook: null,
      x: null
    }
  }
];

/**
 * Approved SVG Icons for Social Media Platforms
 */
const SOCIAL_ICONS = {
  linkedin: `
    <svg class="team-social-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  `,
  instagram: `
    <svg class="team-social-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  `,
  facebook: `
    <svg class="team-social-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
  `,
  x: `
    <svg class="team-social-icon" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </svg>
  `
};

/**
 * Render Verified Social Profile Links
 * If verified URLs are supplied in TEAM_MEMBERS, replace the pending label with live, accessible icon buttons.
 */
export function initTeamSocials() {
  TEAM_MEMBERS.forEach((member) => {
    const container = document.getElementById(`socials-${member.id}`);
    if (!container) return;

    const verifiedLinks = [];

    // Check each platform in configuration
    Object.entries(member.socials).forEach(([platform, url]) => {
      if (url && typeof url === 'string' && url.trim().startsWith('http')) {
        const platformLabels = {
          linkedin: 'LinkedIn',
          instagram: 'Instagram',
          facebook: 'Facebook',
          x: 'X (formerly Twitter)'
        };
        const label = `${member.name} on ${platformLabels[platform] || platform}`;

        verifiedLinks.push(`
          <a href="${url.trim()}"
             target="_blank"
             rel="noopener noreferrer"
             class="team-social-btn"
             aria-label="${label}"
             title="${label}">
            ${SOCIAL_ICONS[platform] || ''}
          </a>
        `);
      }
    });

    // Only inject buttons if at least one verified profile exists
    if (verifiedLinks.length > 0) {
      container.innerHTML = verifiedLinks.join('');
    }
  });
}

/**
 * Subtle 3D Card Tilt Effect
 * Applied on desktop devices with fine pointer (mouse).
 * Strictly limited to 3 degrees max rotation.
 * Automatically disabled on touch screens and when prefers-reduced-motion is active.
 */
export function initTeamTilt() {
  // Check user motion preference and pointer type
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isReducedMotion || !isFinePointer) {
    return;
  }

  const teamCards = document.querySelectorAll('.team-card');
  if (teamCards.length === 0) return;

  teamCards.forEach((card) => {
    let bounds = null;
    let isHovering = false;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      isHovering = true;
      card.style.transition = 'transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease';
    };

    const onMouseMove = (e) => {
      if (!isHovering || !bounds) return;

      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = (mouseX / bounds.width) - 0.5;
      const yPct = (mouseY / bounds.height) - 0.5;

      // Maximum 3.0 degrees rotation as specified in Project Rule 14
      const maxDegrees = 3.0;
      const rotateX = (-yPct * maxDegrees).toFixed(2);
      const rotateY = (xPct * maxDegrees).toFixed(2);

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    };

    const onMouseLeave = () => {
      isHovering = false;
      card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.3s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    };

    card.addEventListener('mouseenter', onMouseEnter, { passive: true });
    card.addEventListener('mousemove', onMouseMove, { passive: true });
    card.addEventListener('mouseleave', onMouseLeave, { passive: true });
  });
}

/**
 * Initialize all Team Page behaviors
 */
export function initTeamPage() {
  initTeamSocials();
  initTeamTilt();
}

// Auto-run when loaded directly
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTeamPage);
  } else {
    initTeamPage();
  }
}
