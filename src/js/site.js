// Theme toggle + footnote hover bubbles. Loaded at the end of <body>.

// --- Theme toggle ---
(() => {
  const toggleCheckbox = document.getElementById('theme-toggle');
  if (toggleCheckbox) {
    const currentTheme =
      document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

    // Keep toggle UI in sync with the theme pre-applied in the head script (theme-init.js).
    toggleCheckbox.checked = currentTheme === 'dark';

    toggleCheckbox.addEventListener('change', (event) => {
      const newTheme = event.target.checked ? 'dark' : 'light';
      window.setTheme(newTheme);

      try {
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        // Ignore storage failures (private mode, blocked storage, etc.).
      }
    });
  }
})();

// --- Footnote hover bubbles ---
// Footnote markup is rendered in its final form at build time (see
// markdownItFootnoteStyle in .eleventy.js); this only drives the hover bubble.
// Listeners are delegated from `document` and the bubble is re-attached on
// demand, so it keeps working after the dev server's in-place hot reload
// (morphdom), which replaces nodes and removes ones not in the built markup.
(() => {
  const bubble = document.createElement('div');
  bubble.className = 'footnote-hover-bubble';

  const HIDE_DELAY_MS = 250;
  let hideTimer = null;

  function cancelHide() {
    clearTimeout(hideTimer);
    hideTimer = null;
  }

  function scheduleHide() {
    cancelHide();
    hideTimer = setTimeout(hideBubble, HIDE_DELAY_MS);
  }

  function hideBubble() {
    cancelHide();
    bubble.classList.remove('is-visible');
  }

  function getFootnoteItem(ref) {
    const href = ref.getAttribute('href') || '';
    if (!href.startsWith('#')) return null;
    return document.getElementById(decodeURIComponent(href.slice(1)));
  }

  function positionBubble(ref) {
    const r = ref.getBoundingClientRect();
    const b = bubble.getBoundingClientRect();
    let top = window.scrollY + r.top - b.height - 10;
    if (top < window.scrollY + 8) top = window.scrollY + r.bottom + 10;
    let left = window.scrollX + r.left + r.width / 2 - b.width / 2;
    left = Math.max(window.scrollX + 8, Math.min(left, window.scrollX + window.innerWidth - b.width - 8));
    bubble.style.top = `${top}px`;
    bubble.style.left = `${left}px`;
  }

  function showBubble(ref) {
    cancelHide();
    const item = getFootnoteItem(ref);
    if (!item) return;

    const clone = item.cloneNode(true);
    clone.querySelectorAll('.footnote-backref').forEach((el) => el.remove());

    // markdown-it-footnote wraps content in <p>; unwrap for cleaner bubble rendering.
    const firstP = clone.querySelector('p');
    const html = (firstP || clone).innerHTML.trim();
    if (!html) return;

    if (!bubble.isConnected) document.body.appendChild(bubble);
    bubble.innerHTML = html;
    bubble.classList.add('is-visible');
    positionBubble(ref);
  }

  const refFrom = (node) => (node instanceof Element ? node.closest('a.footnote-ref') : null);

  document.addEventListener('mouseover', (e) => {
    const ref = refFrom(e.target);
    if (ref && !ref.contains(e.relatedTarget)) showBubble(ref);
  });
  document.addEventListener('mouseout', (e) => {
    const ref = refFrom(e.target);
    if (ref && !ref.contains(e.relatedTarget)) scheduleHide();
  });
  document.addEventListener('focusin', (e) => {
    const ref = refFrom(e.target);
    if (ref) showBubble(ref);
  });
  document.addEventListener('focusout', (e) => {
    if (refFrom(e.target)) scheduleHide();
  });
  document.addEventListener('click', (e) => {
    const ref = refFrom(e.target);
    if (ref) {
      e.preventDefault();
      hideBubble();
      const target = getFootnoteItem(ref);
      if (target) {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    } else if (!e.target.closest('.footnote-hover-bubble')) {
      hideBubble();
    }
  });

  bubble.addEventListener('mouseenter', cancelHide);
  bubble.addEventListener('mouseleave', scheduleHide);

  // Hide on scroll/resize (do not reposition).
  document.addEventListener('scroll', hideBubble, { passive: true });
  window.addEventListener('resize', hideBubble);
})();
