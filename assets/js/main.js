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

  /* ---- muted, looping autoplay (Safari/iOS friendly) ---- */
  function autoplay(v) {
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    var go = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
    go();
    v.addEventListener('canplay', go, { once: true });
    v.addEventListener('loadeddata', go, { once: true });
    // Fallback for strict autoplay / Low Power Mode: start on the first user interaction.
    var kick = function () { go(); };
    ['touchstart', 'pointerdown', 'click', 'scroll', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, kick, { once: true, passive: true });
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('video[data-autoplay]'), autoplay);

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
