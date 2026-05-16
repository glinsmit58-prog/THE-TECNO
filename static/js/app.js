// TecnoGems V44 — app.js
// Disable submit button briefly on submit. Restore automatically so users
// never get stuck on "جارٍ المعالجة..." after a server-side validation error
// or when the browser restores the page from bfcache (back/forward cache).
document.addEventListener('submit', function (e) {
  var btn = e.target.querySelector('button[type="submit"]');
  if (btn && !btn.dataset.keep) {
    if (!btn.dataset._origText) btn.dataset._origText = btn.innerText;
    btn.disabled = true;
    var loadingText = btn.getAttribute('data-loading') || 'جارٍ المعالجة...';
    btn.innerText = loadingText;
    // Safety: if the navigation never happens (validation error reload, slow
    // network, server returns inline) re-enable after 12s so the UI is never
    // permanently stuck.
    setTimeout(function () {
      try {
        btn.disabled = false;
        if (btn.dataset._origText) btn.innerText = btn.dataset._origText;
      } catch (e) {}
    }, 12000);
  }
});

// Reset all submit buttons whenever the page is shown (covers bfcache restore
// after the browser navigates back, and also covers re-render after the
// server returns the same form with a flashed error).
function _tgResetSubmits() {
  document.querySelectorAll('button[type="submit"]').forEach(function (b) {
    b.disabled = false;
    if (b.dataset._origText) {
      b.innerText = b.dataset._origText;
    }
  });
}
window.addEventListener('pageshow', _tgResetSubmits);
document.addEventListener('DOMContentLoaded', _tgResetSubmits);

// Auto-dismiss flash alerts with close button
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.alert').forEach(function (el) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'alert-close';
    btn.innerHTML = '×';
    btn.onclick = function () { el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 400); };
    el.appendChild(btn);
    setTimeout(function () {
      el.style.transition = 'opacity .4s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 400);
    }, 6000);
  });
});

// Faster game search using data-name attribute
(function () {
  var input = document.getElementById('gameSearch');
  if (!input) return;
  var cards = Array.from(document.querySelectorAll('.searchable-game'));
  var names = cards.map(function (c) {
    return (c.getAttribute('data-name') || c.innerText || '').toLowerCase();
  });
  input.addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    var visible = 0;
    cards.forEach(function (card, i) {
      var show = !q || names[i].indexOf(q) >= 0;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    var noMsg = document.getElementById('no-games-msg');
    if (noMsg) noMsg.style.display = visible === 0 && q ? '' : 'none';
  });
})();


// V67: Live navbar balance refresh.
// The user complained that the new balance does not appear quickly after a
// successful operation (deposit approved, order placed, etc.). We now poll
// /api/wallet whenever the page becomes visible/focused, plus on a short
// interval, plus a public hook window.tgRefreshBalance() that other pages
// can call right after an AJAX action.
(function () {
  var el = document.getElementById('tg-nav-balance');
  if (!el) return;
  var inflight = false;
  var lastFmt = el.textContent;

  function fmt(v) {
    var n = Number(v);
    if (!isFinite(n)) return null;
    // Try to reuse existing formatter style: "12.34$" / "12.34 ل.س".
    // We just replace the number in the existing label, preserving suffix.
    return n;
  }

  function pulse() {
    el.classList.add('tg-balance-pulse');
    setTimeout(function () { el.classList.remove('tg-balance-pulse'); }, 1200);
  }

  function refresh() {
    if (inflight || document.hidden) return;
    inflight = true;
    fetch('/api/wallet', { credentials: 'same-origin', headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.ok) return;
        var newVal = Number(j.balance);
        if (!isFinite(newVal)) return;
        var oldVal = parseFloat(el.dataset.balance || '0');
        if (Math.abs(newVal - oldVal) < 0.001) return;
        // Preserve the trailing currency suffix of the existing label
        // (e.g. "12.34$" or "12.34 ل.س"). Strip the leading number.
        var suffix = (lastFmt || '').replace(/^[\s\d.,٫٬]+/, '').trim();
        el.textContent = newVal.toFixed(2) + (suffix ? ' ' + suffix : '');
        el.dataset.balance = newVal.toFixed(2);
        lastFmt = el.textContent;
        pulse();
      })
      .catch(function () {})
      .then(function () { inflight = false; });
  }

  // Public hook so checkout / wallet success handlers can force-refresh.
  window.tgRefreshBalance = refresh;

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) refresh();
  });
  window.addEventListener('focus', refresh);
  // Light polling: every 25s while the tab is active.
  setInterval(function () { if (!document.hidden) refresh(); }, 25000);
})();
