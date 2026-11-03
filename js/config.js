/**
 * Digital Crazy Hub - Client Configuration
 * Source of Truth for verified company details, social profile endpoints, and environment settings.
 *
 * NOTE: Social media profile URLs are currently placeholders awaiting final client confirmation.
 * Once verified, update the respective URLs in this configuration.
 */

export const COMPANY_CONFIG = {
  name: 'Digital Crazy Hub',
  legalName: 'Digital Crazy Hub',
  tagline: 'Your Growth Partner in the Digital World',
  businessType: 'Digital Marketing Agency',
  // Official Contact Numbers
  primaryPhone: '+91 93615 01280',
  primaryPhoneRaw: '+919361501280',
  secondaryPhone: '+91 96592 39187',
  secondaryPhoneRaw: '+91 9361501280',
  phone: '+91 93615 01280', // Backwards compatibility
  phoneRaw: '+919361501280',
  // Official Email Addresses
  primaryEmail: 'digitalcrazyhub@gmail.com',
  secondaryEmail: 'digitalcrazyhub@gmail.com',
  email: 'digitalcrazyhub@gmail.com', // Backwards compatibility
  // WhatsApp Integration
  whatsappNumber: '919361501280',
  whatsappMessage: 'Hello Digital Crazy Hub, I would like to know more about your services.',
  whatsappUrl: 'https://wa.me/919361501280?text=Hello%20Digital%20Crazy%20Hub%2C%20I%20would%20like%20to%20know%20more%20about%20your%20services.',
  // Official Website
  website: 'https://digitalcrazyhub.com/',
  // Complete Registered / Business Address
  address: {
    floor: '4th Floor, C1',
    building: 'Khivraj Building',
    street: 'No. 624, Anna Salai',
    landmark: 'Near Anna Flyover, Thousand Lights West, Thousand Lights',
    line1: '4th Floor, C1, Khivraj Building',
    line2: 'No. 624, Anna Salai, Near Anna Flyover',
    area: 'Thousand Lights West, Thousand Lights',
    city: 'Chennai',
    state: 'Tamil Nadu',
    postalCode: '600006',
    country: 'India',
    full: '4th Floor, C1, Khivraj Building, No. 624, Anna Salai, Near Anna Flyover, Thousand Lights West, Thousand Lights, Chennai, Tamil Nadu 600006, India.',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=4th+Floor%2C+C1%2C+Khivraj+Building%2C+No.+624%2C+Anna+Salai%2C+Near+Anna+Flyover%2C+Thousand+Lights+West%2C+Thousand+Lights%2C+Chennai%2C+Tamil+Nadu+600006%2C+India'
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
