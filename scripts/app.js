const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbysvsIQ7WV1WDdt-6Wl8iVw1WHd8gjbdS4bsiBnMAvBKTsoU__lCR1YXN3WyoMgWYLrhQ/exec';

const selectors = {
  cursor: '#cursor',
  navbar: '#navbar',
  revealItems: '.reveal, .reveal-left',
  counterItems: '[data-target]',
  floatingInputs: '.form-field-wrap input, .form-field-wrap select, .form-field-wrap textarea',
  contactForm: '#contactForm',
  submitButton: '#submitBtn',
  formStatus: '#formStatus',
  privacyModal: '#privacyModal',
  privacyOpeners: '[data-action="open-privacy"]',
  privacyCloser: '[data-action="close-privacy"]'
};

const classes = {
  expanded: 'expanded',
  scrolled: 'scrolled',
  visible: 'visible',
  open: 'open',
  error: 'error',
  success: 'success'
};

function get(selector) {
  return document.querySelector(selector);
}

function getAll(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function initCursor() {
  const cursor = get(selectors.cursor);
  if (!cursor) return;

  document.addEventListener('mousemove', event => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  const interactiveElements = getAll(
    'a, button, .industry-item, .step, .team-item, input, select, textarea, .tag'
  );

  interactiveElements.forEach(element => {
    element.addEventListener('mouseenter', () => cursor.classList.add(classes.expanded));
    element.addEventListener('mouseleave', () => cursor.classList.remove(classes.expanded));
  });
}

function initNavbarScroll() {
  const navbar = get(selectors.navbar);
  if (!navbar) return;

  window.addEventListener(
    'scroll',
    () => {
      navbar.classList.toggle(classes.scrolled, window.scrollY > 60);
    },
    { passive: true }
  );
}

function initRevealAnimations() {
  const items = getAll(selectors.revealItems);
  if (!items.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(classes.visible);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  items.forEach(item => observer.observe(item));
}

function initCounters() {
  const items = getAll(selectors.counterItems);
  if (!items.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const target = parseInt(element.dataset.target, 10);
        const suffix = element.dataset.suffix || '';
        let startTime = 0;
        const duration = 1400;

        const step = timestamp => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          element.textContent = `${Math.floor(eased * target)}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          }
        };

        requestAnimationFrame(step);
        observer.unobserve(element);
      });
    },
    { threshold: 0.5 }
  );

  items.forEach(item => observer.observe(item));
}

function initFloatingLabels() {
  const fields = getAll(selectors.floatingInputs);
  if (!fields.length) return;

  fields.forEach(field => {
    const wrapper = field.closest('.form-field-wrap');
    if (!wrapper) return;

    const updateState = () => {
      const hasValue = field.value.length > 0 || (field.tagName === 'SELECT' && field.value !== '');
      wrapper.classList.toggle('filled', hasValue);
    };

    field.addEventListener('focus', () => wrapper.classList.add('focused'));
    field.addEventListener('blur', () => {
      wrapper.classList.remove('focused');
      updateState();
    });
    field.addEventListener('input', updateState);
    field.addEventListener('change', updateState);
    updateState();
  });
}

function showPrivacyModal() {
  const modal = get(selectors.privacyModal);
  if (!modal) return;

  modal.classList.add(classes.open);
  document.body.style.overflow = 'hidden';
}

function hidePrivacyModal() {
  const modal = get(selectors.privacyModal);
  if (!modal) return;

  modal.classList.remove(classes.open);
  document.body.style.overflow = '';
}

function initPrivacyModal() {
  const openers = getAll(selectors.privacyOpeners);
  const closer = get(selectors.privacyCloser);
  const modal = get(selectors.privacyModal);
  if (!modal) return;

  openers.forEach(opener => {
    opener.addEventListener('click', event => {
      event.preventDefault();
      showPrivacyModal();
    });
  });

  if (closer) {
    closer.addEventListener('click', hidePrivacyModal);
  }

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      hidePrivacyModal();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      hidePrivacyModal();
    }
  });
}

function setStatus(statusElement, message, statusClass) {
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.className = `form-status ${statusClass}`;
}

function initContactForm() {
  const form = get(selectors.contactForm);
  const statusElement = get(selectors.formStatus);
  const submitButton = get(selectors.submitButton);

  if (!form || !statusElement || !submitButton) return;

  form.addEventListener('submit', async event => {
    event.preventDefault();

    const honeypot = form.querySelector('[name="_honeypot"]');
    if (honeypot && honeypot.value) {
      return;
    }

    if (!form.consent.checked) {
      setStatus(statusElement, 'Please confirm your consent before submitting.', classes.error);
      return;
    }

    const requiredFields = ['name', 'company', 'email', 'industry', 'series', 'revenue'];
    let formIsValid = true;

    requiredFields.forEach(fieldName => {
      const field = form.elements[fieldName];
      const wrapper = field.closest('.form-field-wrap');
      if (!field || !wrapper) return;

      if (!field.value.trim()) {
        formIsValid = false;
        wrapper.style.borderBottom = '1px solid #e26060';
      } else {
        wrapper.style.borderBottom = '';
      }
    });

    if (!formIsValid) {
      setStatus(statusElement, 'Please fill in all required fields.', classes.error);
      return;
    }

    submitButton.disabled = true;
    submitButton.innerHTML = 'Sending…';
    statusElement.className = 'form-status';

    const payload = {
      name: form.name.value,
      company: form.company.value,
      email: form.email.value,
      industry: form.industry.value,
      series: form.series.value,
      revenue: form.revenue.value,
      message: form.message.value,
      timestamp: new Date().toISOString()
    };

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setStatus(statusElement, "Message sent. We'll be in touch soon.", classes.success);
      form.reset();
      getAll('.form-field-wrap').forEach(wrapper => wrapper.classList.remove('filled', 'focused'));
    } catch (error) {
      setStatus(statusElement, 'Something went wrong. Please email contact@theoxfordcomma.agency directly.', classes.error);
      console.error(error);
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML =
        'Send message <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  });
}

function initializeApp() {
  initCursor();
  initNavbarScroll();
  initRevealAnimations();
  initCounters();
  initFloatingLabels();
  initPrivacyModal();
  initContactForm();
}

window.addEventListener('DOMContentLoaded', initializeApp);
