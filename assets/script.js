(function () {
  const form = document.getElementById('quote-form');
  const messageBox = document.getElementById('formMessage');
  const nav = document.getElementById('mainNav');
  const menuToggle = document.querySelector('.menu-toggle');

  const config = {
    backendUrl: window.QUOTE_BACKEND_URL || window.GOOGLE_SCRIPT_WEBAPP_URL || ''
  };

  function setMessage(text, type) {
    messageBox.textContent = text;
    messageBox.className = 'form-message ' + type;
  }

  function validateForm() {
    const requiredFields = [
      'customerName',
      'contactNumber',
      'emailAddress',
      'signageType',
      'width',
      'height',
      'lighting',
      'installation',
      'budget',
      'completionDate',
      'projectLocation',
      'projectDescription',
      'consent'
    ];

    for (const fieldId of requiredFields) {
      const field = document.getElementById(fieldId);
      if (!field) continue;

      if (field.type === 'checkbox') {
        if (!field.checked) {
          return `Please confirm the required consent checkbox before submitting.`;
        }
        continue;
      }

      if (!field.value.trim()) {
        return `Please complete the required field: ${field.previousElementSibling?.textContent || 'the form'}`;
      }
    }

    const email = document.getElementById('emailAddress').value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address.';
    }

    return '';
  }

  function buildReferenceNumber() {
    const date = new Date();
    const stamp = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `JK-${stamp}-${random}`;
  }

  function buildPayload() {
    const data = {
      referenceNumber: buildReferenceNumber(),
      customerName: document.getElementById('customerName').value.trim(),
      contactNumber: document.getElementById('contactNumber').value.trim(),
      emailAddress: document.getElementById('emailAddress').value.trim(),
      signageType: document.getElementById('signageType').value,
      width: document.getElementById('width').value.trim(),
      height: document.getElementById('height').value.trim(),
      lighting: document.getElementById('lighting').value,
      installation: document.getElementById('installation').value,
      budget: document.getElementById('budget').value.trim(),
      completionDate: document.getElementById('completionDate').value,
      projectLocation: document.getElementById('projectLocation').value.trim(),
      projectDescription: document.getElementById('projectDescription').value.trim(),
      referenceLink: document.getElementById('referenceLink').value.trim(),
      submittedAt: new Date().toISOString()
    };

    return data;
  }

  async function submitToBackend(payload) {
    if (!config.backendUrl) {
      throw new Error(
        'The quotation backend is not configured yet. Please add your deployed Google Apps Script Web App URL before using the live form.'
      );
    }

    const response = await fetch(config.backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let json;

    try {
      json = text ? JSON.parse(text) : {};
    } catch (error) {
      json = {};
    }

    if (!response.ok) {
      const backendMessage = json?.message || json?.error || 'Submission failed. Please try again.';
      throw new Error(backendMessage);
    }

    return json;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError, 'error');
      return;
    }

    const payload = buildPayload();
    const submitButton = form.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    setMessage('', '');

    try {
      const result = await submitToBackend(payload);
      const reference = result.referenceNumber || payload.referenceNumber;
      setMessage(
        result.message || `Your quotation request was submitted successfully. Reference: ${reference}`,
        'success'
      );
      form.reset();
    } catch (error) {
      const message = error.message || 'Something went wrong while submitting your request.';
      setMessage(message, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit request';
    }
  });

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const backendInstructions = `
    Configuration required for live quotation submission:
    1) Deploy a Google Apps Script Web App for your Google Sheet.
    2) Set window.QUOTE_BACKEND_URL = 'https://script.google.com/macros/s/.../exec';
    3) Keep credentials only in the backend, never in frontend code.
  `;

  if (!config.backendUrl) {
    setMessage(
      'Live backend is not configured yet. Add your deployed Google Apps Script URL to complete live request submission.',
      'error'
    );
    console.info(backendInstructions);
  }
})();
