// Applies the saved/preferred theme before first paint. Loaded synchronously in <head>.
(function () {
  var root = document.documentElement;
  var theme = 'light';

  try {
    var storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      theme = storedTheme;
    } else {
      theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
  } catch (error) {
    theme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function apply() {
    if (root.getAttribute('data-theme') !== theme) {
      root.setAttribute('data-theme', theme);
    }
    if (root.style.colorScheme !== theme) {
      root.style.colorScheme = theme;
    }
    var toggle = document.getElementById('theme-toggle');
    if (toggle && toggle.checked !== (theme === 'dark')) {
      toggle.checked = theme === 'dark';
    }
  }

  // Called by the theme toggle (site.js).
  window.setTheme = function (newTheme) {
    theme = newTheme;
    apply();
  };

  apply();

  // The dev server's hot reload (morphdom) resets <html> attributes and form state
  // to the freshly built markup; re-apply the current theme when that happens.
  new MutationObserver(apply).observe(root, {
    attributes: true,
    attributeFilter: ['data-theme', 'style'],
  });
})();
