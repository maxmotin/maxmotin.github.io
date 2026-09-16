/* Max Motin — portfolio behaviour.
   Header scroll-reveal, full-screen menu + scroll lock, autoplay/looping video. */
(function () {
  'use strict';

  /* ---- sticky header: hidden until the user scrolls UP past 50vh ---- */
  var head = document.querySelector('.mm-head');
  var lastY = window.scrollY || 0;
  function onScroll() {
    if (!head) return;
    var y = window.scrollY || document.documentElement.scrollTop || 0;
    var vh = window.innerHeight || 800;
    var up = y < lastY;
    var menuOpen = document.body.classList.contains('mm-locked');
    head.classList.toggle('is-shown', up && y > vh * 0.5 && !menuOpen);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- full-screen menu overlay ---- */
  var menu = document.querySelector('.mm-menu');
  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open');
    document.body.classList.add('mm-locked');
    if (head) head.classList.remove('is-shown');
  }
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    document.body.classList.remove('mm-locked');
  }
  Array.prototype.forEach.call(document.querySelectorAll('.mm-open'), function (b) {
    b.addEventListener('click', openMenu);
  });
  Array.prototype.forEach.call(document.querySelectorAll('.mm-close'), function (b) {
    b.addEventListener('click', closeMenu);
  });
  if (menu) {
    Array.prototype.forEach.call(menu.querySelectorAll('a.mm-nav'), function (a) {
      a.addEventListener('click', closeMenu);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.keyCode === 27) closeMenu();
  });

  /* ---- muted, looping videos: play/pause purely by viewport visibility,
         so nothing autoplays off-screen at page load (Safari/iOS friendly) ---- */
  function prep(v) {
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
  }
  function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }

  var autoVids = document.querySelectorAll('video[data-autoplay]');
  Array.prototype.forEach.call(autoVids, prep);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) play(e.target); else e.target.pause(); });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(autoVids, function (v) { io.observe(v); });
  } else {
    Array.prototype.forEach.call(autoVids, play);
  }
  // Safari Low-Power / strict autoplay: on first interaction, (re)start any in-view video
  var kicked = false;
  function kick() {
    if (kicked) return; kicked = true;
    var vh = window.innerHeight || 800;
    Array.prototype.forEach.call(autoVids, function (v) {
      var r = v.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) play(v);
    });
  }
  ['touchstart', 'pointerdown', 'click', 'scroll', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, kick, { once: true, passive: true });
  });

  /* ---- hover-to-play thumbnails (desktop): poster at rest, play on card hover;
         touch devices have no hover, so they just keep the still poster ---- */
  Array.prototype.forEach.call(document.querySelectorAll('video[data-hover]'), function (v) {
    prep(v);
    var card = v.closest('a') || v.parentElement;
    card.addEventListener('mouseenter', function () { try { v.currentTime = 0; } catch (e) {} v.style.opacity = '1'; play(v); });
    card.addEventListener('mouseleave', function () { v.style.opacity = '0'; v.pause(); });
  });

  /* ---- film player (Honda case): custom poster/play overlay, then native controls ---- */
  Array.prototype.forEach.call(document.querySelectorAll('.mm-film'), function (film) {
    var v = film.querySelector('video');
    var btn = film.querySelector('.mm-film-play');
    if (!v || !btn) return;
    btn.addEventListener('click', function () {
      film.classList.add('is-playing');
      v.controls = true;              // native controls only once the film starts
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    });
    // if playback starts by any means, drop the overlay + show controls
    v.addEventListener('play', function () { film.classList.add('is-playing'); v.controls = true; });
  });

  /* ---- contact backdrop: pick ONE of three at random per load, loop it ---- */
  var cv = document.querySelector('video[data-contact]');
  if (cv) {
    var base = cv.getAttribute('data-contact') || '';
    var list = [base + 'contact-house.mp4', base + 'contact-wheel.mp4', base + 'contact-lift.mp4'];
    cv.muted = true; cv.defaultMuted = true; cv.playsInline = true; // set BEFORE src for Safari
    cv.src = list[Math.floor(Math.random() * list.length)];
    cv.load();
    autoplay(cv);
  }
})();
