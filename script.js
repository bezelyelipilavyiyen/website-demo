/* ==========================================================================
   kocadassahlee — interactions
   Small, dependency-free helpers: theme, reveals, counters, tilt, copy, toast.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Profile facts ---------- */
  var PROFILE = {
    username: 'kocadassahlee',
    created: Date.UTC(2025, 3, 7, 23, 23, 26) // 2025-04-07T23:23:26Z
  };

  var DAY = 86400000;
  var daysOnRoblox = Math.max(1, Math.floor((Date.now() - PROFILE.created) / DAY));

  function accountAge(from) {
    var now = new Date();
    var start = new Date(from);
    var months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    if (now.getDate() < start.getDate()) months -= 1;
    months = Math.max(months, 0);

    var years = Math.floor(months / 12);
    var rest = months % 12;
    var parts = [];

    if (years > 0) parts.push(years + (years === 1 ? ' yr' : ' yrs'));
    if (rest > 0) parts.push(rest + (rest === 1 ? ' mo' : ' mos'));
    return parts.length ? parts.join(' ') : 'Just joined';
  }

  /* ---------- DOM ready ---------- */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    setDynamicText();
    initTheme();
    initReveals();
    initCounters();
    initHeader();
    initActiveNav();
    initCopy();
    initTilt();
    initSpotlight();
    initBackToTop();
  });

  /* ---------- Computed text ---------- */
  function setDynamicText() {
    document.querySelectorAll('[data-account-age]').forEach(function (el) {
      el.textContent = accountAge(PROFILE.created);
    });

    document.querySelectorAll('[data-count-days]').forEach(function (el) {
      el.setAttribute('data-count', String(daysOnRoblox));
    });

    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- Theme ---------- */
  function setThemeColor(theme) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f5f4f0' : '#08080a');
  }

  function initTheme() {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    function sync(theme) {
      setThemeColor(theme);
      var light = theme === 'light';
      toggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      toggle.setAttribute('aria-pressed', light ? 'true' : 'false');
    }

    sync(root.dataset.theme || 'dark');

    toggle.addEventListener('click', function () {
      var next = root.dataset.theme === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try {
        localStorage.setItem('koca-theme', next);
      } catch (e) {}
      sync(next);
    });
  }

  /* ---------- Scroll reveals ---------- */
  function initReveals() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up numbers ---------- */
  function initCounters() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!els.length) return;

    function finish(el) {
      var target = Number(el.getAttribute('data-count')) || 0;
      el.textContent = target.toLocaleString('en-US');
    }

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(finish);
      return;
    }

    els.forEach(function (el) { el.textContent = '0'; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    els.forEach(function (el) { io.observe(el); });

    function run(el) {
      var target = Number(el.getAttribute('data-count')) || 0;
      if (target === 0) {
        el.textContent = '0';
        return;
      }

      var duration = 1300;
      var start = null;

      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('en-US');
      }

      requestAnimationFrame(step);
    }
  }

  /* ---------- Header, progress bar ---------- */
  function initHeader() {
    var header = document.getElementById('site-header');
    var progress = document.querySelector('.progress');
    var ticking = false;

    function update() {
      var scrolled = window.scrollY > 12;
      if (header) header.classList.toggle('is-scrolled', scrolled);

      if (progress) {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
        progress.style.setProperty('--p', ratio.toFixed(4));
      }

      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------- Active nav link ---------- */
  function initActiveNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
    if (!links.length) return;

    var sections = links
      .map(function (link) {
        var id = link.getAttribute('href');
        return { link: link, section: id ? document.querySelector(id) : null };
      })
      .filter(function (pair) { return pair.section; });

    if (!sections.length) return;

    function update() {
      var marker = window.scrollY + window.innerHeight * 0.42;
      var current = null;

      sections.forEach(function (pair) {
        if (pair.section.offsetTop <= marker) current = pair;
      });

      if (!current && window.scrollY < 80) current = null;

      sections.forEach(function (pair) {
        pair.link.classList.toggle('is-active', pair === current);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(field);
      }
    });
  }

  var toastTimer;
  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('is-visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2000);
  }

  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-copy');
        var label = button.getAttribute('data-copy-label') || 'text';

        copyText(value).then(function () {
          showToast(label.charAt(0).toUpperCase() + label.slice(1) + ' copied');
        }).catch(function () {
          showToast('Press Ctrl + C to copy');
        });
      });
    });
  }

  /* ---------- Avatar tilt ---------- */
  function initTilt() {
    var stage = document.querySelector('[data-tilt]');
    if (!stage || reduceMotion || !finePointer) return;

    var max = 9;
    var frame = null;

    function apply(event) {
      var rect = stage.getBoundingClientRect();
      var px = (event.clientX - rect.left) / rect.width - 0.5;
      var py = (event.clientY - rect.top) / rect.height - 0.5;

      frame = requestAnimationFrame(function () {
        stage.style.setProperty('--ry', (px * max * 2).toFixed(2) + 'deg');
        stage.style.setProperty('--rx', (-py * max * 2).toFixed(2) + 'deg');
      });
    }

    stage.addEventListener('pointerenter', function () {
      stage.classList.add('is-tilting');
    });

    stage.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;
      if (frame) cancelAnimationFrame(frame);
      apply(event);
    });

    stage.addEventListener('pointerleave', function () {
      stage.classList.remove('is-tilting');
      if (frame) cancelAnimationFrame(frame);
      stage.style.setProperty('--ry', '0deg');
      stage.style.setProperty('--rx', '0deg');
    });
  }

  /* ---------- Card spotlight ---------- */
  function initSpotlight() {
    if (!finePointer || reduceMotion) return;

    document.querySelectorAll('[data-spotlight]').forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - rect.left).toFixed(0) + 'px');
        card.style.setProperty('--my', (event.clientY - rect.top).toFixed(0) + 'px');
      });
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var button = document.getElementById('to-top');
    if (!button) return;

    var ticking = false;

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        button.classList.toggle('is-visible', window.scrollY > 700);
        ticking = false;
      });
    }, { passive: true });

    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
})();
