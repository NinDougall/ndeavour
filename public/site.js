// Contact form: checks the fields, then sends the message to Netlify Forms.
(function () {
  var form = document.getElementById('inquiry-form');
  if (!form) return;

  var button = document.getElementById('inquiry-submit');
  var status = document.getElementById('form-status');
  var fallbackEmail = 'nindougall@gmail.com';

  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(function (el) { el.remove(); });
    form.querySelectorAll('[aria-invalid]').forEach(function (el) {
      el.removeAttribute('aria-invalid');
      var ids = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (id) { return id && !/-error$/.test(id); });
      if (ids.length) el.setAttribute('aria-describedby', ids.join(' ')); else el.removeAttribute('aria-describedby');
    });
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

// Gentle motion: soft header edge on scroll and a one-time fade-in for sections.
// Nothing here is needed to use the page.
(function () {
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm) return;

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

// Pause animations: lets visitors stop the logo float, shimmer and other motion.
// Hidden for visitors who already ask their device for reduced motion.
(function () {
  var button = document.getElementById('motion-toggle');
  if (!button) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var root = document.documentElement;
  function setOff(off) {
    root.classList.toggle('motion-off', off);
    button.setAttribute('aria-pressed', off ? 'true' : 'false');
    try { localStorage.setItem('ndeavour-motion', off ? 'off' : 'on'); } catch (e) { /* storage may be blocked */ }
  }

  var saved = null;
  try { saved = localStorage.getItem('ndeavour-motion'); } catch (e) { /* storage may be blocked */ }
  button.hidden = false;
  setOff(saved === 'off');
  button.addEventListener('click', function () { setOff(!root.classList.contains('motion-off')); });
})();
