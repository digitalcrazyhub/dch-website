/**
 * Digital Crazy Hub — Contact Page Interactions & Validation
 * File: js/pages/contact.js
 * Vanilla JavaScript ES6+
 *
 * Responsibilities:
 * 1. Comprehensive, accessible client-side form validation across all 7 mandatory fields:
 *    - Name: trimmed, sensible length, allows unicode/international names, rejects invalid characters.
 *    - Phone: rejects letters, supports 10-digit national numbers and international E.164 formats with country codes.
 *    - Email: trimmed, RFC-compliant format validation.
 *    - Location: trimmed, rejects empty/whitespace.
 *    - Service: strict validation against 8 approved service categories.
 *    - Message: trimmed 10 - 2,000 characters with live character counter.
 *    - Consent: mandatory checkbox, unchecked by default.
 * 2. Focus management, scrolling to first error, ARIA attributes (aria-invalid, aria-describedby).
 * 3. Backend submission integration (submission-ready, preserves inputs on failure, never fakes success).
 * 4. Accessible single-open FAQ accordion with keyboard support.
 */

// Approved official service categories (PROJECT_RULES.md)
export const APPROVED_SERVICES = [
  'Social Media Marketing',
  'Google Ads',
  'SEO Services',
  'Web & App Development',
  'Personal Branding',
  'Lead Generation',
  'Content Marketing',
  'Ad Poster & Video Making'
];

/**
 * Initialize Contact Page Functionality
 */
export function initContactPage() {
  const form = document.getElementById('contact-form');
  initFaqAccordion();
  initCharCounter();

  if (form) {
    initContactForm(form);
  }
}

/**
 * Live Character Counter for Message Textarea
 */
function initCharCounter() {
  const textarea = document.getElementById('contact-message');
  const counter = document.getElementById('char-counter-text');
  if (!textarea || !counter) return;

  const updateCount = () => {
    const len = textarea.value.length;
    counter.textContent = `${len} / 2,000 characters`;
    if (len > 2000) {
      counter.classList.add('is-limit');
    } else {
      counter.classList.remove('is-limit');
    }
  };

  textarea.addEventListener('input', updateCount);
  updateCount();
}

/**
 * Contact Form Controller
 */
function initContactForm(form) {
  const nameInput = document.getElementById('contact-name');
  const phoneInput = document.getElementById('contact-phone');
  const emailInput = document.getElementById('contact-email');
  const locationInput = document.getElementById('contact-location');
  const serviceSelect = document.getElementById('contact-service');
  const messageInput = document.getElementById('contact-message');
  const consentCheckbox = document.getElementById('contact-consent');
  const submitBtn = document.getElementById('contact-submit-btn');
  const btnText = document.getElementById('submit-btn-text');
  const alertContainer = document.getElementById('contact-alert');

  // Real-time error dismissal when user interacts with an invalid field
  const fields = [
    { el: nameInput, validate: validateName },
    { el: phoneInput, validate: validatePhone },
    { el: emailInput, validate: validateEmail },
    { el: locationInput, validate: validateLocation },
    { el: serviceSelect, validate: validateService },
    { el: messageInput, validate: validateMessage },
    { el: consentCheckbox, validate: validateConsent }
  ];

  fields.forEach(({ el, validate }) => {
    if (!el) return;
    const eventType = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(eventType, () => {
      const group = el.closest('.form-group') || el.closest('.form-checkbox-group');
      if (group && group.classList.contains('has-error')) {
        const error = validate();
        if (!error) {
          clearFieldError(el, group);
        }
      }
    });
  });

  // Form Submit Handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Hide any previous alert banner
    hideAlert(alertContainer);

    // Validate all 7 fields
    const errors = [];
    let firstInvalidField = null;

    fields.forEach(({ el, validate }) => {
      if (!el) return;
      const group = el.closest('.form-group') || el.closest('.form-checkbox-group');
      const errorMsg = validate();
      if (errorMsg) {
        showFieldError(el, group, errorMsg);
        errors.push({ el, msg: errorMsg });
        if (!firstInvalidField) {
          firstInvalidField = el;
        }
      } else {
        clearFieldError(el, group);
      }
    });

    // If validation fails
    if (errors.length > 0) {
      showAlert(alertContainer, 'error', 'Please check the highlighted fields.');
      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Valid inputs: Proceed to submission
    const formData = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      location: locationInput.value.trim(),
      service: serviceSelect.value,
      message: messageInput.value.trim(),
      consent: consentCheckbox.checked
    };

    // Set loading state
    setSubmitting(true, submitBtn, btnText);

    try {
      // Backend submission endpoint (backend/api/contact.php)
      const ENDPOINT = 'backend/api/contact.php';

      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.success) {
        // Confirmed successful receipt by backend
        showAlert(alertContainer, 'success', 'Your enquiry has been submitted successfully. Our team will contact you shortly.');
        form.reset();
        initCharCounter();
      } else {
        throw new Error(result?.message || 'Submission was not accepted by the server.');
      }
    } catch (err) {
      // Backend endpoint is not yet configured or returned an error
      console.warn('Form submission notice:', err.message);
      showAlert(
        alertContainer,
        'error',
        'Submission unavailable: A backend endpoint (backend/api/contact.php) is required to receive enquiries. Please reach us directly at info@digitalcrazyhub.com or +91 9659239187.'
      );
      // Preserving entered field values as required by project governance
    } finally {
      // Restore submit button state
      setSubmitting(false, submitBtn, btnText);
    }
  });
}

/**
 * Field 1: Name Validation
 */
function validateName() {
  const el = document.getElementById('contact-name');
  if (!el) return null;
  const val = el.value.trim();

  if (!val) {
    return 'Please enter your name.';
  }

  // Reject names exceeding sensible length
  if (val.length > 100) {
    return 'Name must not exceed 100 characters.';
  }

  // Reject control characters or digits / symbols that are not legitimate name characters
  // Supports international Unicode characters (\p{L}), spaces, hyphens, and apostrophes
  const nameRegex = /^[\p{L}\s'\-.]+$/u;
  if (!nameRegex.test(val)) {
    return 'Please enter a valid name.';
  }

  return null;
}

/**
 * Field 2: Phone Number Validation
 * Supports 10-digit national numbers and international E.164 formats with country codes
 */
function validatePhone() {
  const el = document.getElementById('contact-phone');
  if (!el) return null;
  const rawVal = el.value.trim();

  if (!rawVal) {
    return 'Please enter your phone number.';
  }

  // Reject any alphabetic letters
  if (/[a-zA-Z]/.test(rawVal)) {
    return 'Enter a valid phone number using digits and an optional leading +.';
  }

  // Reject any invalid symbols (allowed: digits, spaces, hyphens, parens, and leading '+')
  if (!/^\+?[0-9\s\-()]+$/.test(rawVal)) {
    return 'Enter a valid phone number using digits and an optional leading +.';
  }

  // Leading '+' is allowed ONLY as the very first character
  if (rawVal.indexOf('+') > 0) {
    return 'Enter a valid phone number using digits and an optional leading +.';
  }

  const isInternational = rawVal.startsWith('+');
  // Extract all digit characters
  const digitsOnly = rawVal.replace(/\D/g, '');

  if (isInternational) {
    // International E.164 standard: country calling code + subscriber number (7 to 15 digits total)
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return 'Enter a valid 10-digit phone number or an international number with its country code.';
    }
  } else {
    // National format without country code: must be exactly 10 digits
    if (digitsOnly.length !== 10) {
      return 'Enter a valid 10-digit phone number or an international number with its country code.';
    }
  }

  return null;
}

/**
 * Field 3: Email Validation
 */
function validateEmail() {
  const el = document.getElementById('contact-email');
  if (!el) return null;
  const val = el.value.trim();

  if (!val) {
    return 'Please enter your email address.';
  }

  // Standard RFC-compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(val)) {
    return 'Please enter a valid email address.';
  }

  return null;
}

/**
 * Field 4: Location Validation
 */
function validateLocation() {
  const el = document.getElementById('contact-location');
  if (!el) return null;
  const val = el.value.trim();

  if (!val) {
    return 'Please enter your location.';
  }

  if (val.length < 2 || val.length > 120) {
    return 'Please enter a valid location (between 2 and 120 characters).';
  }

  return null;
}

/**
 * Field 5: Service Dropdown Validation
 */
function validateService() {
  const el = document.getElementById('contact-service');
  if (!el) return null;
  const val = el.value;

  if (!val || val === '' || !APPROVED_SERVICES.includes(val)) {
    return 'Please select a service.';
  }

  return null;
}

/**
 * Field 6: Message Validation
 */
function validateMessage() {
  const el = document.getElementById('contact-message');
  if (!el) return null;
  const val = el.value.trim();

  if (!val) {
    return 'Please enter your message.';
  }

  if (val.length < 10) {
    return 'Please provide a little more detail about your requirements.';
  }

  if (el.value.length > 2000) {
    return 'Your message must not exceed 2,000 characters.';
  }

  return null;
}

/**
 * Field 7: Consent Checkbox Validation
 */
function validateConsent() {
  const el = document.getElementById('contact-consent');
  if (!el) return null;

  if (!el.checked) {
    return 'Please accept the consent statement before submitting.';
  }

  return null;
}

/**
 * Helper: Show error on form field
 */
function showFieldError(el, group, message) {
  if (!group) return;
  group.classList.add('has-error');
  el.setAttribute('aria-invalid', 'true');

  const errorEl = group.querySelector('.form-error-msg');
  if (errorEl) {
    const textSpan = errorEl.querySelector('.error-text') || errorEl;
    textSpan.textContent = message;
    el.setAttribute('aria-describedby', errorEl.id);
  }
}

/**
 * Helper: Clear error on form field
 */
function clearFieldError(el, group) {
  if (!group) return;
  group.classList.remove('has-error');
  el.setAttribute('aria-invalid', 'false');

  const errorEl = group.querySelector('.form-error-msg');
  if (errorEl) {
    const textSpan = errorEl.querySelector('.error-text') || errorEl;
    textSpan.textContent = '';
  }
}

/**
 * Helper: Show top alert banner
 */
function showAlert(container, type, message) {
  if (!container) return;
  container.className = `contact-alert contact-alert-${type} is-visible`;
  const textEl = container.querySelector('.contact-alert-text');
  if (textEl) {
    textEl.textContent = message;
  }
  container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Helper: Hide top alert banner
 */
function hideAlert(container) {
  if (!container) return;
  container.className = 'contact-alert';
  const textEl = container.querySelector('.contact-alert-text');
  if (textEl) textEl.textContent = '';
}

/**
 * Helper: Set submit button loading state
 */
function setSubmitting(isLoading, btn, textEl) {
  if (!btn) return;
  btn.disabled = isLoading;
  if (isLoading) {
    btn.classList.add('is-loading');
    if (textEl) textEl.textContent = 'Submitting...';
  } else {
    btn.classList.remove('is-loading');
    if (textEl) textEl.textContent = 'Send Enquiry';
  }
}

/**
 * FAQ Accordion Controller
 * Single-open accordion with keyboard accessibility and ARIA states
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.contact-faq-item');
  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const trigger = item.querySelector('.contact-faq-trigger');
    const content = item.querySelector('.contact-faq-content');
    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close other open accordion items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains('is-active')) {
          otherItem.classList.remove('is-active');
          const otherTrigger = otherItem.querySelector('.contact-faq-trigger');
          if (otherTrigger) {
            otherTrigger.setAttribute('aria-expanded', 'false');
          }
        }
      });

      // Toggle clicked item
      if (isExpanded) {
        item.classList.remove('is-active');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-active');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// Auto-run on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactPage);
  } else {
    initContactPage();
  }
}
