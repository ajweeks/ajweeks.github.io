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
      window.setTheme(newTheme);

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
  // Re-queried on each setup pass in case hot reload replaced it.
  let main = document.querySelector('main');
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
    if (!footnotesSection) return;
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

  const bubble = document.createElement('div');
  bubble.className = 'footnote-hover-bubble';

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

    // The dev server's hot reload (morphdom) removes nodes not in the built markup.
    if (!bubble.isConnected) document.body.appendChild(bubble);

    const clone = item.cloneNode(true);
    clone.querySelectorAll('.footnote-backref, .reversefootnote').forEach((el) => el.remove());

    // markdown-it-footnote wraps content in <p>; unwrap for cleaner bubble rendering
    const firstP = clone.querySelector('p');
    bubble.innerHTML = firstP ? firstP.innerHTML.trim() : clone.innerHTML.trim();
    if (!bubble.innerHTML) return;

    bubble.classList.add('is-visible');
    positionBubble(ref);
  }

  // Idempotent: safe to re-run after the DOM is patched (e.g. dev-server hot reload).
  // Only writes when something differs, so it doesn't retrigger the observer below.
  function setupFootnotes() {
    main = document.querySelector('main');
    if (!main) return;

    let refs = findRefs();
    if (!refs.length) {
      buildLegacyFootnotes();
      refs = findRefs();
    }
    if (!refs.length) return;

    if (!bubble.isConnected) document.body.appendChild(bubble);

    refs.forEach((ref, i) => {
      if (!ref.id) ref.id = `ref-${i + 1}`;

      // In markdown-it output the <sup> has class="footnote-ref"; move styling to the <a>
      // so the full circular area is hoverable/clickable.
      const supWrapper = ref.closest('sup.footnote-ref');
      if (supWrapper && supWrapper.firstElementChild === ref) {
        supWrapper.classList.remove('footnote-ref');
      }
      if (!ref.classList.contains('footnote-ref')) ref.classList.add('footnote-ref');

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
      if (item && item.getAttribute('data-footnote-number') !== primaryLabel) {
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
    });
  }

  setupFootnotes();

  // Delegated listeners so refs replaced/patched by hot reload keep working.
  const refFrom = (node) => (node instanceof Element ? node.closest('a.footnote-ref') : null);

  document.addEventListener('mouseover', (e) => {
    const ref = refFrom(e.target);
    if (ref && !ref.contains(e.relatedTarget)) {
      cancelHide();
      showBubble(ref);
    }
  });
  document.addEventListener('mouseout', (e) => {
    const ref = refFrom(e.target);
    if (ref && !ref.contains(e.relatedTarget)) scheduleHide();
  });
  document.addEventListener('focusin', (e) => {
    const ref = refFrom(e.target);
    if (ref) {
      cancelHide();
      showBubble(ref);
    }
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
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (!e.target.closest('.footnote-hover-bubble')) hideBubble();
  });

  bubble.addEventListener('mouseenter', cancelHide);
  bubble.addEventListener('mouseleave', scheduleHide);

  // Hide on scroll/resize (do not reposition)
  document.addEventListener('scroll', hideBubble, { passive: true });
  window.addEventListener('resize', hideBubble);

  // Re-run setup when the page content is patched in place (dev-server hot reload).
  let setupQueued = false;
  new MutationObserver((records) => {
    if (setupQueued) return;
    if (records.every((r) => bubble.contains(r.target))) return;
    setupQueued = true;
    requestAnimationFrame(() => {
      setupQueued = false;
      setupFootnotes();
    });
  }).observe(document.body, { childList: true, characterData: true, subtree: true });
})();
