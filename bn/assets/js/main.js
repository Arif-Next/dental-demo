/* Smile Care Dental — vanilla JS (nav, header, reveal, FAQ, appointment form) */
(function () {
  'use strict';
  var d = document;
  d.documentElement.classList.add('js');

  /* Mobile nav */
  var toggle = d.querySelector('.nav-toggle');
  var nav = d.getElementById('main-nav');
  if (toggle && nav) {
    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন');
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setNav(false);
        toggle.focus();
      }
    });
    d.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setNav(false);
    });
    var mq = window.matchMedia('(min-width: 1024px)');
    var onMq = function () { if (mq.matches) setNav(false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);
  }

  /* Header shadow on scroll */
  var header = d.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Fade-up on scroll */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    d.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('reveal-init');
      io.observe(el);
    });
  }

  /* FAQ accordion */
  d.querySelectorAll('.faq-q').forEach(function (btn) {
    var item = btn.closest('.faq-item');
    var panel = d.getElementById(btn.getAttribute('aria-controls'));
    var sync = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', String(!open));
    };
    sync(btn.getAttribute('aria-expanded') === 'true');
    btn.addEventListener('click', function () {
      sync(btn.getAttribute('aria-expanded') !== 'true');
    });
  });

  /* Appointment form (demo — no backend) */
  var form = d.getElementById('appointment-form');
  if (!form) return;
  form.noValidate = true;

  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var now = new Date();
  var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  form.elements.date.min = today;

  var bnDigits = '০১২৩৪৫৬৭৮৯';
  var toLatin = function (s) {
    return s.replace(/[০-৯]/g, function (c) { return bnDigits.indexOf(c); });
  };

  var rules = {
    name: function (v) {
      return v.trim().length < 2 ? 'অনুগ্রহ করে আপনার নাম লিখুন।' : '';
    },
    phone: function (v) {
      v = toLatin(v).replace(/[\s()-]/g, '');
      if (!v) return 'মোবাইল নম্বর লিখুন।';
      return /^(\+?88)?01[3-9]\d{8}$/.test(v) ? '' : 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন (যেমন: ০১৭১২৩৪৫৬৭৮)।';
    },
    service: function (v) {
      return v ? '' : 'একটি সেবা বেছে নিন।';
    },
    date: function (v) {
      if (!v) return 'পছন্দের তারিখ বেছে নিন।';
      return v < today ? 'আজ বা পরের কোনো তারিখ বেছে নিন।' : '';
    },
    time: function () {
      return form.querySelector('input[name="time"]:checked') ? '' : 'পছন্দের সময় বেছে নিন।';
    }
  };

  var check = function (name) {
    var field = form.querySelector('[data-field="' + name + '"]');
    var el = form.elements[name];
    var msg = rules[name](el.value || '');
    field.querySelector('.field-error').textContent = msg;
    field.classList.toggle('has-error', !!msg);
    field.querySelectorAll('input, select, textarea').forEach(function (i) {
      if (msg) i.setAttribute('aria-invalid', 'true'); else i.removeAttribute('aria-invalid');
    });
    return !msg;
  };

  var recheck = function (e) {
    var name = e.target.name;
    if (rules[name] && form.querySelector('[data-field="' + name + '"]').classList.contains('has-error')) check(name);
  };
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    Object.keys(rules).forEach(function (name) {
      if (!check(name) && !first) first = name;
    });
    if (first) {
      var el = form.elements[first];
      (el.tagName ? el : el[0]).focus();
      return;
    }
    var ok = d.getElementById('form-success');
    form.hidden = true;
    ok.hidden = false;
    ok.focus();
  });
})();
