/**
 * Digital Crazy Hub - Client Configuration
 * Source of Truth for verified company details, social profile endpoints, and environment settings.
 *
 * NOTE: Social media profile URLs are currently placeholders awaiting final client confirmation.
 * Once verified, update the respective URLs in this configuration.
 */

export const COMPANY_CONFIG = {
  name: 'Digital Crazy Hub',
  legalName: 'Digital Crazy Hub', // Marked for formal company confirmation
  tagline: 'Your Growth Partner in the Digital World',
  businessType: 'Digital Marketing Agency',
  email: 'info@digitalcrazyhub.com',
  phone: '+91 9659239187',
  website: 'https://digitalcrazyhub.com',
  address: {
    line1: '3rd Floor, S3, Khivraj Building',
    line2: 'No. 624, Anna Salai, Near Anna Flyover',
    landmark: 'Thousand Lights West, Thousand Lights',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600006',
    country: 'India'
  },
  // Social Media Profile Configurations
  // IMPORTANT: Replace placeholders with verified profile URLs upon official client confirmation
  socialProfiles: {
    facebook: {
      platform: 'Facebook',
      url: 'https://facebook.com/digitalcrazyhub', // Placeholder - to be confirmed by client
      status: 'pending_confirmation',
      ariaLabel: 'Follow Digital Crazy Hub on Facebook'
    },
    twitter: {
      platform: 'Twitter / X',
      url: 'https://x.com/digitalcrazyhub', // Placeholder - to be confirmed by client
      status: 'pending_confirmation',
      ariaLabel: 'Follow Digital Crazy Hub on Twitter / X'
    },
    instagram: {
      platform: 'Instagram',
      url: 'https://instagram.com/digitalcrazyhub', // Placeholder - to be confirmed by client
      status: 'pending_confirmation',
      ariaLabel: 'Follow Digital Crazy Hub on Instagram'
    },
    linkedin: {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/company/digitalcrazyhub', // Placeholder - to be confirmed by client
      status: 'pending_confirmation',
      ariaLabel: 'Connect with Digital Crazy Hub on LinkedIn'
    },
    pinterest: {
      platform: 'Pinterest',
      url: 'https://pinterest.com/digitalcrazyhub', // Placeholder - to be confirmed by client
      status: 'pending_confirmation',
      ariaLabel: 'Follow Digital Crazy Hub on Pinterest'
    }
  }
};
