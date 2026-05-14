/* ===========================================================================
 * TecnoGems V60.1 — Home page: minimal, mobile-friendly interactions only.
 * Removed legacy parallax, 3D-tilt, FAQ accordion (none of those elements
 * exist in the new design and the dead code burned CPU on every scroll).
 * =========================================================================== */
(function () {
  'use strict';

  // Smooth scroll for in-page anchor links (#games, #features, …)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#') return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
