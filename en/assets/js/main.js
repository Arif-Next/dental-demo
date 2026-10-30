/* Smile Care Dental — demo v2. Vanilla JS, no dependencies, no build step. */
(function () {
  'use strict';
  var d = document, b = d.body;
  function q(s, c) { return (c || d).querySelector(s); }
  function qa(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Mobile drawer: Esc closes, focus stays inside while open ---- */
  var burger = q('.burger'), drawer = q('#drawer'), scrim = q('.scrim'), mbar = q('.mbar');
  function isOpen() { return drawer.classList.contains('is-open'); }
  function setDrawer(open) {
    drawer.classList.toggle('is-open', open);
    scrim.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    b.classList.toggle('locked', open);
    if (mbar) mbar.classList.toggle('is-hidden', open);
    (open ? q('.drawer-x', drawer) : burger).focus();
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () { setDrawer(true); });
    scrim.addEventListener('click', function () { setDrawer(false); });
    q('.drawer-x', drawer).addEventListener('click', function () { setDrawer(false); });
    d.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { setDrawer(false); return; }
      if (e.key !== 'Tab') return;
      var f = qa('a[href],button', drawer), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    matchMedia('(min-width: 1024px)').addListener(function (m) { if (m.matches && isOpen()) setDrawer(false); });
  }

  /* ---- Sticky mobile bar: hide on scroll down, show on scroll up ---- */
  if (mbar) {
    var lastY = scrollY, ticking = false;
    addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = scrollY;
        if (!b.classList.contains('locked') && Math.abs(y - lastY) > 6) {
          mbar.classList.toggle('is-hidden', y > lastY && y > 120);
          lastY = y;
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Fade-up on scroll ---- */
  var rv = qa('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add('in'); });

  /* ---- FAQ accordion (native buttons → Enter/Space work) ---- */
  qa('.acc button[aria-controls]').forEach(function (btn) {
    var p = d.getElementById(btn.getAttribute('aria-controls'));
    p.hidden = btn.getAttribute('aria-expanded') !== 'true';
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      p.hidden = open;
    });
  });

  /* ---- Before/after slider: drag anywhere, or focus the handle and use arrow keys ---- */
  qa('.ba').forEach(function (ba) {
    var h = q('.ba-h', ba), pos = 50, drag = false;
    function set(v) {
      pos = Math.max(0, Math.min(100, v));
      var r = Math.round(pos);
      ba.style.setProperty('--pos', pos + '%');
      h.setAttribute('aria-valuenow', r);
      h.setAttribute('aria-valuetext', r + '% before, ' + (100 - r) + '% after');
    }
    function at(e) { var r = ba.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
    ba.addEventListener('pointerdown', function (e) {
      e.preventDefault(); // keep focus on the handle so arrow keys keep working
      drag = true;
      if (ba.setPointerCapture) ba.setPointerCapture(e.pointerId);
      at(e);
      h.focus({ preventScroll: true });
    });
    ba.addEventListener('pointermove', function (e) { if (drag) at(e); });
    ['pointerup', 'pointercancel'].forEach(function (t) { ba.addEventListener(t, function () { drag = false; }); });
    h.addEventListener('keydown', function (e) {
      var s = e.shiftKey ? 10 : 5;
      var v = { ArrowLeft: pos - s, ArrowDown: pos - s, ArrowRight: pos + s, ArrowUp: pos + s, PageDown: pos - 10, PageUp: pos + 10, Home: 0, End: 100 }[e.key];
      if (v !== undefined) { e.preventDefault(); set(v); }
    });
  });

  /* ---- 3-step booking form ----
     There is NO backend. The WhatsApp hand-off IS the delivery mechanism: the form validates,
     builds a wa.me link with a pre-filled message, and the patient sends it from their own
     WhatsApp. Nothing is stored or transmitted by this page. */
  var form = q('#booking');
  if (!form) return;
  var WA = '8801712345678';
  var steps = qa('.step', form), prog = qa('.prog li', form), cur = 0;
  var dateEl = q('#f-date'), now = new Date();
  var today = new Date(now.getTime() - now.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  dateEl.min = today;

  // Pre-select a service from ?service=… (links on the treatments page)
  var pre = new URLSearchParams(location.search).get('service');
  qa('[name=service]', form).forEach(function (r) { if (r.value === pre) r.checked = true; });

  function val(n) { var el = form.elements.namedItem(n); return el ? (el.value || '').trim() : ''; }
  // Accepts 01XXXXXXXXX, +8801XXXXXXXXX or 8801XXXXXXXXX, with Bangla digits, spaces or dashes.
  function phone(v) {
    v = v.replace(/[০-৯]/g, function (c) { return c.charCodeAt(0) - 0x09E6; }).replace(/[\s\-().]/g, '');
    return /^(?:\+?88)?01[3-9]\d{8}$/.test(v) ? '+88' + v.slice(v.indexOf('01')) : '';
  }
  function err(name, msg) {
    var e = d.getElementById('e-' + name);
    e.textContent = msg;
    qa('[name=' + name + ']', form).forEach(function (f) { f.setAttribute('aria-invalid', msg ? 'true' : 'false'); });
    return !msg;
  }
  var checks = [
    function () { return err('service', val('service') ? '' : 'Choose a service.'); },
    function () {
      var v = val('date'), fri = v && new Date(v + 'T12:00').getDay() === 5;
      var a = err('date', !v || v < today ? 'Pick today or a later date.' : fri ? 'Friday is closed. Pick another day.' : '');
      var t = err('time', val('time') ? '' : 'Choose a preferred time.');
      return a && t;
    },
    function () {
      var a = err('name', val('name') ? '' : 'Enter your name.');
      var p = err('phone', phone(val('phone')) ? '' : 'Enter a valid mobile number (e.g. 01712345678).');
      return a && p;
    }
  ];
  function focusBad() { var el = q('[aria-invalid=true]', steps[cur]); if (el) el.focus(); }
  // Steps are only hidden, never re-rendered, so values survive going back.
  function go(i) {
    steps[cur].hidden = true;
    cur = i;
    steps[i].hidden = false;
    prog.forEach(function (li, j) {
      li.classList.toggle('done', j < i);
      if (j === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    steps[i].focus();
  }
  steps.forEach(function (s, i) { if (i) s.hidden = true; });

  form.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go]');
    if (!t) return;
    var n = +t.getAttribute('data-go');
    if (n < cur || checks[cur]()) go(n); else focusBad();
  });
  ['input', 'change'].forEach(function (t) {
    form.addEventListener(t, function (e) {
      var x = d.getElementById('e-' + e.target.name);
      if (x && x.textContent) err(e.target.name, '');
    });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Enter pressed on step 1 or 2 → behave like "Continue"
    if (cur < 2) { if (checks[cur]()) go(cur + 1); else focusBad(); return; }
    for (var i = 0; i < 3; i++) if (!checks[i]()) { if (i !== cur) go(i); return focusBad(); }
    var day = new Date(val('date') + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    var msg = [
      'Hello Smile Care Dental, I would like to book a visit.',
      'Service: ' + val('service'),
      'Date: ' + day + ' (' + val('date') + ')',
      'Time: ' + val('time'),
      'Name: ' + val('name'),
      'Phone: ' + phone(val('phone'))
    ];
    if (val('notes')) msg.push('Notes: ' + val('notes'));
    q('#wa-send').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg.join('\n'));
    form.hidden = true;
    var ok = q('#booked');
    ok.hidden = false;
    q('h2', ok).focus();
  });
  q('#edit').addEventListener('click', function () {
    q('#booked').hidden = true;
    form.hidden = false;
    steps[cur].focus();
  });
})();
