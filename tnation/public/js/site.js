/* T Nation — site behaviour. Progressive enhancement: everything works without JS. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };

  // ---- Scroll reveal ------------------------------------------------------
  var reveals = $$('.reveal');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    // Elements already on screen appear immediately (no flash); the rest animate in.
    reveals.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add('is-in'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = Math.min(i * 70, 280) + 'ms';
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { if (!el.classList.contains('is-in')) io.observe(el); });
  }

  // ---- Header -------------------------------------------------------------
  var header = $('[data-header]');
  var onScroll = function () { header && header.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  var menuBtn = $('[data-menu]'); var nav = $('#site-nav');
  if (menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1280) setMenu(false); });
  }

  // ---- Navigation language toggle (English / Malayalam / Kannada) ----------
  function setLang(lang) {
    if (['en', 'ml', 'kn'].indexOf(lang) < 0) lang = 'en';
    doc.setAttribute('data-nav-lang', lang);
    $$('[data-i18n]').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang) || el.getAttribute('data-en');
      el.setAttribute('lang', lang);
    });
    $$('.lang__btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === lang)); });
    store.set('tn_nav_lang', lang);
  }
  $$('.lang__btn').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  var savedLang = store.get('tn_nav_lang');
  if (savedLang && savedLang !== 'en') setLang(savedLang);

  // ---- Carousel -------------------------------------------------------------
  var carousel = $('[data-carousel]');
  if (carousel) {
    var step = function (dir) {
      var card = carousel.firstElementChild;
      var w = card ? card.getBoundingClientRect().width + 16 : 300;
      carousel.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    };
    var prev = $('[data-carousel-prev]'); var next = $('[data-carousel-next]');
    prev && prev.addEventListener('click', function () { step(-1); });
    next && next.addEventListener('click', function () { step(1); });
    carousel.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  }

  // ---- Live "upcoming shows" ticker -----------------------------------------
  var ticker = $('[data-ticker]');
  function fillTicker(items) {
    if (!ticker || !items.length) return;
    ticker.innerHTML = '';
    // Duplicate the list so the marquee loops seamlessly.
    [0, 1].forEach(function (copy) {
      items.forEach(function (s) {
        var li = document.createElement('li'); var a = document.createElement('a');
        a.href = s.talentUrl || '/live';
        var strong = document.createElement('strong'); strong.textContent = s.date;
        a.appendChild(strong);
        a.appendChild(document.createTextNode((s.talent || s.title) + ' — ' + s.city + ', ' + s.country + (s.placeholder ? ' (placeholder)' : '')));
        if (copy) li.setAttribute('aria-hidden', 'true');
        li.appendChild(a); ticker.appendChild(li);
      });
    });
  }
  if (ticker) {
    var refresh = function () {
      fetch(ticker.getAttribute('data-endpoint'), { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && d.shows) fillTicker(d.shows); })
        .catch(function () { /* keep server-rendered list */ });
    };
    refresh();
    setInterval(function () { if (!document.hidden) refresh(); }, 60000);
  }

  // ---- Roster filters (instant, URL kept in sync) ----------------------------
  var filters = $('[data-filters]');
  if (filters) {
    var grid = $('[data-grid]'); var countEl = $('[data-filter-count]'); var empty = $('[data-empty]');
    var apply = function () {
      var f = {};
      $$('[data-filter]', filters).forEach(function (s) { f[s.name] = s.value; });
      var n = 0;
      $$('.card', grid).forEach(function (card) {
        var langs = (card.getAttribute('data-languages') || '').split(',').map(function (x) { return x.trim(); });
        var show = (!f.category || card.getAttribute('data-category') === f.category) &&
          (!f.city || card.getAttribute('data-city') === f.city) &&
          (!f.language || langs.indexOf(f.language) >= 0) &&
          (!f.genre || card.getAttribute('data-genre') === f.genre);
        card.hidden = !show; if (show) { n++; card.classList.add('is-in'); }
      });
      if (countEl) countEl.textContent = n + (n === 1 ? ' profile' : ' profiles');
      if (empty) empty.hidden = n > 0;
      var qs = new URLSearchParams(); Object.keys(f).forEach(function (k) { if (f[k]) qs.set(k, f[k]); });
      history.replaceState(null, '', '/roster' + (qs.toString() ? '?' + qs : ''));
    };
    filters.addEventListener('change', apply);
    filters.addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    var reset = $('[data-filter-reset]');
    reset && reset.addEventListener('click', function (e) { e.preventDefault(); $$('[data-filter]', filters).forEach(function (s) { s.value = ''; }); apply(); });
    // The server rendered a filtered list; fetch the full grid so client filtering can widen it.
    if (location.search) {
      fetch('/roster').then(function (r) { return r.text(); }).then(function (t) {
        var full = new DOMParser().parseFromString(t, 'text/html').querySelector('[data-grid]');
        if (full) { grid.innerHTML = full.innerHTML; apply(); }
      }).catch(function () {});
    }
  }

  // ---- Show tabs (India / overseas) ----------------------------------------
  var tabs = $('[data-tabs]');
  if (tabs) {
    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-tab]'); if (!btn) return;
      var t = btn.getAttribute('data-tab');
      $$('[data-tab]', tabs).forEach(function (b) { b.setAttribute('aria-selected', String(b === btn)); });
      $$('[data-tab-panel]').forEach(function (p) {
        var show = t === 'all' || p.getAttribute('data-tab-panel') === t;
        p.hidden = !show;
        if (p.previousElementSibling && p.previousElementSibling.tagName === 'H2') p.previousElementSibling.hidden = !show;
      });
    });
  }

  // Booking deep link (/live?talent=slug#booking) — scroll to the form.
  if (location.hash === '#booking') { var bk = $('#booking'); bk && setTimeout(function () { bk.scrollIntoView({ block: 'start' }); }, 50); }

  // ---- Forms: inline validation and fetch submission -------------------------
  $$('form.js-form').forEach(function (form) {
    var status = $('.form__status', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      $$('.field.has-error', form).forEach(function (f) { f.classList.remove('has-error'); });
      var invalid = $$('input, select, textarea', form).filter(function (el) { return !el.checkValidity(); });
      if (invalid.length) {
        invalid.forEach(function (el) { var f = el.closest('.field'); f && f.classList.add('has-error'); });
        status.className = 'form__status is-error';
        status.textContent = 'Please complete the highlighted fields.';
        invalid[0].focus();
        return;
      }
      form.dispatchEvent(new CustomEvent('tn:before-submit'));
      var multipart = form.enctype === 'multipart/form-data';
      var data = new FormData(form);
      form.classList.add('is-sending');
      status.className = 'form__status'; status.textContent = 'Sending…';
      fetch(form.action, {
        method: 'POST',
        headers: { 'X-Requested-With': 'fetch', Accept: 'application/json' },
        body: multipart ? data : new URLSearchParams(data),
      }).then(function (r) { return r.json().catch(function () { return { ok: false, message: 'Something went wrong. Please try again.' }; }); })
        .then(function (res) {
          status.className = 'form__status ' + (res.ok ? 'is-ok' : 'is-error');
          status.textContent = res.message || (res.ok ? 'Sent.' : 'Something went wrong.');
          if (res.ok) {
            form.reset();
            form.dispatchEvent(new CustomEvent('tn:sent', { detail: res }));
          }
        })
        .catch(function () { status.className = 'form__status is-error'; status.textContent = 'Network error. Please check your connection and try again.'; })
        .then(function () { form.classList.remove('is-sending'); });
    });
  });

  // ---- Cookie consent ------------------------------------------------------
  var banner = $('[data-cookie]');
  var getConsent = function () { var m = document.cookie.match(/(?:^|; )tn_consent=([^;]+)/); return m ? m[1] : null; };
  window.tnConsent = { analytics: getConsent() === 'all' };
  if (banner && !getConsent()) banner.hidden = false;
  $$('[data-cookie-choice]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.getAttribute('data-cookie-choice');
      document.cookie = 'tn_consent=' + v + '; Max-Age=' + 60 * 60 * 24 * 365 + '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
      window.tnConsent.analytics = v === 'all';
      banner.hidden = true;
      document.dispatchEvent(new CustomEvent('tn:consent', { detail: v }));
    });
  });
  $$('[data-cookie-settings]').forEach(function (b) { b.addEventListener('click', function () { banner.hidden = false; }); });
})();
