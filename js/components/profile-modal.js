/**
 * Digital Crazy Hub — Secure Company Profile Download Modal Controller
 * File: js/components/profile-modal.js
 * Vanilla JavaScript ES6+ Module
 *
 * Enforces 5 required fields: Name, 10-digit Indian Mobile Phone, Email, Location, Consent.
 * No country-code dropdown or prefixes.
 */

export function initProfileModal() {
  const triggerBtn = document.getElementById('btn-company-profile-download');
  const modalBackdrop = document.getElementById('modal-company-profile');
  const modalCloseBtn = document.getElementById('profile-modal-close');
  const form = document.getElementById('profile-download-form');
  const nameInput = document.getElementById('profile-name');
  const phoneInput = document.getElementById('profile-phone');
  const emailInput = document.getElementById('profile-email');
  const locationInput = document.getElementById('profile-location');
  const consentCheckbox = document.getElementById('profile-consent');
  const submitBtn = document.getElementById('profile-submit-btn');
  const alertBox = document.getElementById('profile-modal-alert');

  if (!modalBackdrop) return;

  let previousActiveElement = null;

  // Restrict phone input to numeric digits only (max 10 digits)
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  // Open Modal Handler
  function openModal(e) {
    if (e) e.preventDefault();
    previousActiveElement = document.activeElement;
    modalBackdrop.classList.add('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    // Reset previous errors & alert
    hideAlert();
    clearAllErrors();

    // Focus first input field
    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 100);
  }

  // Close Modal Handler
  function closeModal() {
    modalBackdrop.classList.remove('is-open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    // Return keyboard focus to trigger button
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }
  }

  // Trigger click
  if (triggerBtn) {
    triggerBtn.addEventListener('click', openModal);
  }

  // Generic trigger selector for any additional download buttons
  document.querySelectorAll('[data-open-profile-modal]').forEach((btn) => {
    btn.addEventListener('click', openModal);
  });

  // Close button click
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // Backdrop click (click outside card)
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });

  // Keyboard accessibility: Escape key to close & Focus trap
  document.addEventListener('keydown', (e) => {
    if (!modalBackdrop.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      trapFocus(e, modalBackdrop);
    }
  });

  // Real-time field validation dismissal across all 5 fields
  const fieldList = [
    { el: nameInput, validate: validateName },
    { el: phoneInput, validate: validatePhone },
    { el: emailInput, validate: validateEmail },
    { el: locationInput, validate: validateLocation },
    { el: consentCheckbox, validate: validateConsent }
  ];

  fieldList.forEach(({ el, validate }) => {
    if (!el) return;
    const evt = el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      const group = el.closest('.profile-form-group');
      if (group && group.classList.contains('has-error')) {
        const error = validate();
        if (!error) {
          clearFieldError(group, el);
        }
      }
    });
  });

  // Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      // Validate all 5 fields
      let hasError = false;
      let firstInvalidEl = null;

      fieldList.forEach(({ el, validate }) => {
        if (!el) return;
        const group = el.closest('.profile-form-group');
        const err = validate();
        if (err) {
          showFieldError(group, el, err);
          hasError = true;
          if (!firstInvalidEl) firstInvalidEl = el;
        } else {
          clearFieldError(group, el);
        }
      });

      if (hasError) {
        showAlert('error', 'Please correct the highlighted fields before downloading.');
        if (firstInvalidEl) firstInvalidEl.focus();
        return;
      }

      const payload = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        email: emailInput.value.trim(),
        location: locationInput.value.trim(),
        consent: consentCheckbox.checked
      };

      setLoading(true);

      try {
        const response = await fetch('backend/api/request-company-profile.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        let result = null;
        try {
          result = await response.json();
        } catch {
          result = null;
        }

        if (response.ok && result && result.success) {
          const downloadUrl = result.downloadUrl;

          // Trigger download via hidden anchor
          const dlLink = document.createElement('a');
          dlLink.href = downloadUrl;
          dlLink.setAttribute('download', 'Digital-Crazy-Hub-Company-Profile.pdf');
          document.body.appendChild(dlLink);
          dlLink.click();
          document.body.removeChild(dlLink);

          showAlert(
            'success',
            `Your company profile download has started! If it did not begin automatically, <a href="${downloadUrl}" download="Digital-Crazy-Hub-Company-Profile.pdf">click here to download</a>.`
          );

          // Close modal after 2.8 seconds and reset form
          setTimeout(() => {
            closeModal();
            form.reset();
            hideAlert();
          }, 2800);
        } else if (response.status === 422 && result && result.errors) {
          // Field-level errors returned by server
          Object.entries(result.errors).forEach(([key, msg]) => {
            const input = document.getElementById(`profile-${key}`);
            if (input) {
              const group = input.closest('.profile-form-group');
              showFieldError(group, input, msg);
              if (!firstInvalidEl) firstInvalidEl = input;
            }
          });
          showAlert('error', result.message || 'Please correct the highlighted fields.');
          if (firstInvalidEl) firstInvalidEl.focus();
        } else if (response.status === 429) {
          showAlert('error', result?.message || 'Too many download requests. Please wait a few moments.');
        } else {
          showAlert('error', result?.message || 'Could not process download request. Please try again later.');
        }
      } catch (err) {
        console.warn('Profile download network error:', err);
        showAlert('error', 'Network error: Unable to connect to server. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    });
  }

  // Focus trap utility
  function trapFocus(e, container) {
    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  // Field Validators
  function validateName() {
    const val = nameInput ? nameInput.value.trim() : '';
    if (!val) return 'Please enter your full name.';
    if (val.length < 2) return 'Name must be at least 2 characters.';
    if (val.length > 100) return 'Name cannot exceed 100 characters.';
    if (!/^[\p{L}\s.'\-]+$/u.test(val)) {
      return 'Please enter a valid name using letters only.';
    }
    return null;
  }

  function validatePhone() {
    const val = phoneInput ? phoneInput.value.trim() : '';
    if (!val) return 'Please enter your phone number.';
    if (!/^\d+$/.test(val)) {
      return 'Phone number must contain digits only (no spaces, letters, or symbols).';
    }
    if (val.length !== 10) {
      return 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!/^[6-9]\d{9}$/.test(val)) {
      return 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }
    return null;
  }

  function validateEmail() {
    const val = emailInput ? emailInput.value.trim() : '';
    if (!val) return 'Please enter your email address.';
    if (val.length > 150) return 'Email address cannot exceed 150 characters.';

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(val)) {
      return 'Please enter a valid email address.';
    }
    return null;
  }

  function validateLocation() {
    const val = locationInput ? locationInput.value.trim() : '';
    if (!val) return 'Please enter your location (city/state).';
    if (val.length < 2) return 'Location must be at least 2 characters.';
    if (val.length > 120) return 'Location cannot exceed 120 characters.';
    return null;
  }

  function validateConsent() {
    if (!consentCheckbox || !consentCheckbox.checked) {
      return 'You must agree to share your details for company profile access.';
    }
    return null;
  }

  function showFieldError(group, el, message) {
    if (!group) return;
    group.classList.add('has-error');
    if (el) el.setAttribute('aria-invalid', 'true');
    const errEl = group.querySelector('.profile-field-error');
    if (errEl) {
      errEl.textContent = message;
      if (el) el.setAttribute('aria-describedby', errEl.id);
    }
  }

  function clearFieldError(group, el) {
    if (!group) return;
    group.classList.remove('has-error');
    if (el) el.setAttribute('aria-invalid', 'false');
    const errEl = group.querySelector('.profile-field-error');
    if (errEl) {
      errEl.textContent = '';
      if (el) el.removeAttribute('aria-describedby');
    }
  }

  function clearAllErrors() {
    modalBackdrop.querySelectorAll('.profile-form-group').forEach((g) => {
      g.classList.remove('has-error');
      const input = g.querySelector('input');
      if (input) input.setAttribute('aria-invalid', 'false');
      const err = g.querySelector('.profile-field-error');
      if (err) err.textContent = '';
    });
  }

  function showAlert(type, htmlMessage) {
    if (!alertBox) return;
    alertBox.className = `profile-modal-alert profile-modal-alert-${type} is-visible`;
    const textEl = alertBox.querySelector('.profile-alert-text');
    if (textEl) {
      textEl.innerHTML = htmlMessage;
    }
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.className = 'profile-modal-alert';
    const textEl = alertBox.querySelector('.profile-alert-text');
    if (textEl) textEl.innerHTML = '';
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.classList.add('is-loading');
    } else {
      submitBtn.classList.remove('is-loading');
    }
  }
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileModal);
  } else {
    initProfileModal();
  }
}
