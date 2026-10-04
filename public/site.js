// Contact form: checks the fields, then sends the message to Netlify Forms.
(function () {
  var form = document.getElementById('inquiry-form');
  if (!form) return;

  var button = document.getElementById('inquiry-submit');
  var status = document.getElementById('form-status');
  var fallbackEmail = 'nindougall@gmail.com';

  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
  }

  function showError(input, message) {
    input.setAttribute('aria-invalid', 'true');
    var err = document.createElement('span');
    err.className = 'field-error';
    err.id = input.id + '-error';
    err.textContent = message;
    input.setAttribute('aria-describedby', ((input.getAttribute('aria-describedby') || '') + ' ' + err.id).trim());
    input.parentNode.appendChild(err);
  }

  function setStatus(message, kind) {
    status.textContent = message;
    status.className = 'form-status' + (kind ? ' ' + kind : '');
  }

  function validate() {
    clearErrors();
    var firstBad = null;
    var name = form.elements['full_name'];
    var email = form.elements['biz_email'];
    var note = form.elements['bottleneck'];

    if (!name.value.trim()) { showError(name, 'Please enter your name.'); firstBad = firstBad || name; }
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!emailOk) { showError(email, 'Please enter a valid email address.'); firstBad = firstBad || email; }
    if (!note.value.trim()) { showError(note, 'Please tell us a little about where your day gets stuck.'); firstBad = firstBad || note; }

    if (firstBad) { firstBad.focus(); return false; }
    return true;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    setStatus('', '');
    if (!validate()) return;

    button.disabled = true;
    button.textContent = 'Sending…';

    var body = new URLSearchParams(new FormData(form)).toString();

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).then(function (response) {
      if (!response.ok) throw new Error('Status ' + response.status);
      form.reset();
      setStatus('Thank you. Your message is on its way, and I will reply by email within two business days.', 'ok');
    }).catch(function () {
      setStatus('Sorry, that did not send. Please email ' + fallbackEmail + ' instead.', 'bad');
    }).then(function () {
      button.disabled = false;
      button.textContent = 'Send message';
    });
  });
})();

// Gentle motion: soft header edge on scroll, a one-time fade-in for sections,
// and a light that follows the pointer across the hero. Nothing here is needed to use the page.
(function () {
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm) return;

  var panel = document.querySelector('.hero-panel');
  if (panel && window.matchMedia('(hover: hover)').matches) {
    panel.addEventListener('pointermove', function (event) {
      var box = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', ((event.clientX - box.left) / box.width * 100).toFixed(1) + '%');
      panel.style.setProperty('--my', ((event.clientY - box.top) / box.height * 100).toFixed(1) + '%');
    });
  }

  if (!('IntersectionObserver' in window)) return;

  var targets = document.querySelectorAll(
    '.section-head, .stats li, .why-after, .service, .recommend, .step, .pilot-cols > div, ' +
    '.proof-list li, .about-grid > div, .contact-grid > div'
  );
  targets.forEach(function (el) { el.classList.add('reveal'); });

  var observer = new IntersectionObserver(function (entries) {
    var n = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.style.setProperty('--d', Math.min(n * 80, 320) + 'ms');
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
      n++;
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

  targets.forEach(function (el) { observer.observe(el); });
})();
