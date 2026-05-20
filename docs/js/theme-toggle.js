document.addEventListener('DOMContentLoaded', () => {
  const toggleCheckbox = document.getElementById('theme-toggle');
  if (!toggleCheckbox) {
    return;
  }

  const currentTheme =
    document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

  // Keep toggle UI in sync with the theme pre-applied in the inline head script.
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
});
