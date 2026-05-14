/* ===========================================================================
 * TecnoGems V56 — Nebula Home Page Interactions
 * Scroll reveal, FAQ accordion, 3D card tilt, parallax, search
 * =========================================================================== */
(function() {
  'use strict';

  // ═══════ SCROLL REVEAL (IntersectionObserver) ═══════
  function initReveal() {
    var els = document.querySelectorAll('.nb-reveal');
    if (!els.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    els.forEach(function(el) { observer.observe(el); });
  }

  // ═══════ FAQ ACCORDION ═══════
  function initFAQ() {
    var items = document.querySelectorAll('.nb-faq-item');
    items.forEach(function(item) {
      var btn = item.querySelector('.nb-faq-q');
      if (!btn) return;
      btn.addEventListener('click', function() {
        var isOpen = item.classList.contains('open');
        // Close all others
        items.forEach(function(i) { i.classList.remove('open'); });
        // Toggle current
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ═══════ 3D CARD TILT (mouse follow) ═══════
  function initCardTilt() {
    var cards = document.querySelectorAll('.tg-popular-card');
    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var midX = rect.width / 2;
        var midY = rect.height / 2;
        var rotateX = ((y - midY) / midY) * -5;
        var rotateY = ((x - midX) / midX) * 5;
        card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-8px) scale(1.02)';
        card.style.setProperty('--mouse-x', x + 'px');
        card.style.setProperty('--mouse-y', y + 'px');
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });
  }

  // ═══════ HERO PARALLAX ═══════
  function initParallax() {
    var hero = document.querySelector('.tg-hero-content');
    if (!hero) return;
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          var scrolled = window.scrollY;
          if (scrolled < 800) {
            hero.style.transform = 'translateY(' + (scrolled * 0.15) + 'px)';
            hero.style.opacity = Math.max(0, 1 - scrolled / 700);
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ═══════ GAME SEARCH ═══════
  function initSearch() {
    var input = document.getElementById('gameSearch');
    if (!input) return;
    input.addEventListener('input', function() {
      var q = this.value.toLowerCase().trim();
      document.querySelectorAll('.tg-popular-card').forEach(function(card) {
        var name = card.getAttribute('data-name') || '';
        card.style.display = (!q || name.indexOf(q) !== -1) ? '' : 'none';
      });
    });
  }

  // ═══════ SCROLL BUTTONS ═══════
  function initScroller() {
    var scroller = document.getElementById('tg-popular-scroller');
    var grid = document.getElementById('tg-popular-grid');
    if (!scroller || !grid) return;

    var step = function() {
      var card = grid.querySelector('.tg-popular-card');
      return card ? (card.offsetWidth + 24) * 2 : 400;
    };
    var prev = scroller.querySelector('.tg-scroll-prev');
    var next = scroller.querySelector('.tg-scroll-next');
    if (prev) prev.addEventListener('click', function() { grid.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function() { grid.scrollBy({ left: step(), behavior: 'smooth' }); });

    var updateBtns = function() {
      var maxScroll = grid.scrollWidth - grid.clientWidth - 1;
      var atStart = Math.abs(grid.scrollLeft) < 2;
      var atEnd = Math.abs(grid.scrollLeft) >= maxScroll;
      scroller.classList.toggle('at-start', atStart);
      scroller.classList.toggle('at-end', atEnd);
      if (grid.scrollWidth <= grid.clientWidth + 2) {
        scroller.classList.add('no-overflow');
      } else {
        scroller.classList.remove('no-overflow');
      }
    };
    grid.addEventListener('scroll', updateBtns, { passive: true });
    window.addEventListener('resize', updateBtns);
    updateBtns();
  }

  // ═══════ SMOOTH SCROLL TO ANCHORS ═══════
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ═══════ INIT ALL ═══════
  document.addEventListener('DOMContentLoaded', function() {
    initReveal();
    initFAQ();
    initCardTilt();
    initParallax();
    initSearch();
    initScroller();
    initSmoothScroll();
  });

})();
