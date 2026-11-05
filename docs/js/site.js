// Theme toggle + footnote handling. Loaded at the end of <body>.

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
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.style.colorScheme = newTheme;

      try {
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        // Ignore storage failures (private mode, blocked storage, etc.).
      }
    });
  }
})();

// --- Footnotes ---
// Footnote processing (supports legacy [1] + [1]: ... and markdown-it-footnote)
(() => {
  const main = document.querySelector('main');
  if (!main) return;

  const refSelector = [
    'a.footnote-ref[href^="#footnote-"]',
    'a.footnote-ref[href^="#fn"]',
    'sup.footnote-ref > a[href^="#fn"]'
  ].join(', ');

  function findRefs() {
    return Array.from(main.querySelectorAll(refSelector));
  }

  function buildLegacyFootnotes() {
    const footnotes = Array.from(main.querySelectorAll('sup'))
      .map((sup) => {
        const match = sup.textContent.trim().match(/^\[(\d+)\]$/);
        return match ? { number: match[1], element: sup } : null;
      })
      .filter(Boolean);

    if (!footnotes.length) return;

    // Parse definitions from paragraph HTML so inline links are preserved.
    const footnoteDefs = {};
    const defNodesToRemove = [];

    Array.from(main.querySelectorAll('p')).forEach((p) => {
      const html = p.innerHTML.trim();
      const match = html.match(/^\[(\d+)\]:\s*/);
      if (!match) return;

      footnoteDefs[match[1]] = html.slice(match[0].length).trim();
      defNodesToRemove.push(p);
    });

    defNodesToRemove.forEach((node) => node.remove());

    const footnotesSection = main.querySelector('.footnotes-section');
    footnotesSection.innerHTML = '';

    const footnotesTitle = document.createElement('h3');
    footnotesTitle.textContent = 'Footnotes';
    footnotesSection.appendChild(footnotesTitle);

    const footnotesList = document.createElement('ol');
    footnotesList.className = 'footnotes-list';

    footnotes.forEach(({ number, element }) => {
      const footnoteLink = document.createElement('a');
      footnoteLink.href = `#footnote-${number}`;
      footnoteLink.className = 'footnote-ref';
      footnoteLink.id = `ref-${number}`;
      footnoteLink.textContent = number;

      element.innerHTML = '';
      element.appendChild(footnoteLink);

      const footnoteItem = document.createElement('li');
      footnoteItem.id = `footnote-${number}`;
      footnoteItem.setAttribute('data-footnote-number', number);

      const content = footnoteDefs[number] || `<em>Footnote ${number} content goes here</em>`;
      footnoteItem.innerHTML = `${content} <a href="#ref-${number}" class="footnote-backref">↩</a>`;
      footnotesList.appendChild(footnoteItem);
    });

    footnotesSection.appendChild(footnotesList);
    if (!footnotesSection.parentNode) main.appendChild(footnotesSection);
  }

  function getFootnoteItem(ref) {
    const href = ref.getAttribute('href') || '';
    if (!href.startsWith('#')) return null;
    return document.getElementById(decodeURIComponent(href.slice(1)));
  }

  let refs = findRefs();
  if (!refs.length) {
    buildLegacyFootnotes();
    refs = findRefs();
  }
  if (!refs.length) return;

  const bubble = document.createElement('div');
  bubble.className = 'footnote-hover-bubble';
  document.body.appendChild(bubble);

  let hideTimer = null;

  function cancelHide() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  let hideDelayMs = 250;
  function scheduleHide() {
    cancelHide();
    hideTimer = setTimeout(() => {
      bubble.classList.remove('is-visible');
      hideTimer = null;
    }, hideDelayMs);
  }

  function hideBubble() {
    cancelHide();
    bubble.classList.remove('is-visible');
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
    const item = getFootnoteItem(ref);
    if (!item) return;

    const clone = item.cloneNode(true);
    clone.querySelectorAll('.footnote-backref, .reversefootnote').forEach((el) => el.remove());

    // markdown-it-footnote wraps content in <p>; unwrap for cleaner bubble rendering
    const firstP = clone.querySelector('p');
    bubble.innerHTML = firstP ? firstP.innerHTML.trim() : clone.innerHTML.trim();
    if (!bubble.innerHTML) return;

    bubble.classList.add('is-visible');
    positionBubble(ref);
  }

  refs.forEach((ref, i) => {
    if (!ref.id) ref.id = `ref-${i + 1}`;

    // In markdown-it output the <sup> has class="footnote-ref"; move styling to the <a>
    // so the full circular area is hoverable/clickable.
    const supWrapper = ref.closest('sup.footnote-ref');
    if (supWrapper && supWrapper.firstElementChild === ref) {
      supWrapper.classList.remove('footnote-ref');
    }
    ref.classList.add('footnote-ref');

    // Normalize markdown-it default "[1]" label to "1".
    let label = ref.textContent.trim();
    const labelMatch = label.match(/^\[(.+)\]$/);
    if (labelMatch) {
      label = labelMatch[1];
      ref.textContent = label;
    }

    // markdown-it can emit secondary refs like "1:1", "1:2".
    // For bottom list numbering, keep only the primary index ("1").
    const primaryLabel = label.split(':')[0];

    const item = getFootnoteItem(ref);
    if (item) {
      // Show explicit index marker in bottom list (same style as legacy mode).
      item.setAttribute('data-footnote-number', primaryLabel);
    }
    if (item && !item.querySelector('.footnote-backref, .reversefootnote')) {
      const back = document.createElement('a');
      back.href = `#${ref.id}`;
      back.className = 'footnote-backref';
      back.textContent = '↩';
      item.appendChild(document.createTextNode(' '));
      item.appendChild(back);
    }

    ref.addEventListener('mouseenter', () => {
      cancelHide();
      showBubble(ref);
    });
    ref.addEventListener('mouseleave', scheduleHide);
    ref.addEventListener('focus', () => {
      cancelHide();
      showBubble(ref);
    });
    ref.addEventListener('blur', scheduleHide);
    ref.addEventListener('click', (e) => {
      e.preventDefault();
      hideBubble();
      const target = getFootnoteItem(ref);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  bubble.addEventListener('mouseenter', cancelHide);
  bubble.addEventListener('mouseleave', scheduleHide);

  document.addEventListener('click', (e) => {
    if (!e.target.closest('a.footnote-ref, .footnote-hover-bubble')) hideBubble();
  });

  // Hide on scroll/resize (do not reposition)
  document.addEventListener('scroll', hideBubble, { passive: true });
  window.addEventListener('resize', hideBubble);
})();
