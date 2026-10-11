(function () {
  const form = document.getElementById('quote-form');
  const messageBox = document.getElementById('formMessage');
  const nav = document.getElementById('mainNav');
  const menuToggle = document.querySelector('.menu-toggle');

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
          return 'Please confirm the required consent checkbox before submitting.';
        }
        continue;
      }

      if (!field.value.trim()) {
        return 'Please fill out all required fields.';
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

  function buildEmailBody() {
    const refNum = buildReferenceNumber();
    const data = {
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
      referenceLink: document.getElementById('referenceLink').value.trim()
    };

    const subject = encodeURIComponent(`Quotation Request - ${data.customerName} [${refNum}]`);
    const body = encodeURIComponent(
      `Reference Number: ${refNum}\n` +
      `Submitted: ${new Date().toLocaleString()}\n\n` +
      `CUSTOMER DETAILS:\n` +
      `Name: ${data.customerName}\n` +
      `Contact Number: ${data.contactNumber}\n` +
      `Email: ${data.emailAddress}\n` +
      `Project Location: ${data.projectLocation}\n\n` +
      `SIGNAGE REQUIREMENTS:\n` +
      `Type: ${data.signageType}\n` +
      `Width: ${data.width}\n` +
      `Height: ${data.height}\n` +
      `Lighted/Non-lighted: ${data.lighting}\n` +
      `Installation Required: ${data.installation}\n` +
      `Estimated Budget: ${data.budget}\n` +
      `Target Completion Date: ${data.completionDate}\n\n` +
      `PROJECT DESCRIPTION:\n` +
      `${data.projectDescription}\n\n` +
      `Reference Image/Link:\n` +
      `${data.referenceLink || '(None provided)'}\n\n` +
      `---\n` +
      `This quotation request was submitted via the J.K SignMaker'S website.`
    );

    return { subject, body };
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError, 'error');
      return;
    }

    const { subject, body } = buildEmailBody();
    const mailtoLink = `mailto:j.ksignmakers@gmail.com?subject=${subject}&body=${body}`;

    setMessage('Opening your email app to send the quotation request...', 'success');
    window.location.href = mailtoLink;

    setTimeout(() => {
      form.reset();
      setMessage('', '');
    }, 500);
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
})();
