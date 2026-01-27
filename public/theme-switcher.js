/**
 * Theme Switcher for Cyber Tech Theme
 * Handles switching between light and dark themes
 * with smooth transitions and localStorage persistence
 */

(function() {
  'use strict';

  const THEME_KEY = 'cyber-theme-preference';
  const THEMES = {
    DARK: 'dark',
    LIGHT: 'light'
  };

  /**
   * Get the current theme from localStorage or system preference
   */
  function getPreferredTheme() {
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme) {
      return storedTheme;
    }

    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? THEMES.DARK
      : THEMES.LIGHT;
  }

  /**
   * Update all theme toggle buttons to reflect current theme
   */
  function updateToggleButtons(theme) {
    const toggleButtons = document.querySelectorAll('.theme-toggle');
    toggleButtons.forEach(button => {
      const icon = button.querySelector('i');
      const text = button.querySelector('.theme-text');

      if (theme === THEMES.DARK) {
        if (icon) icon.className = 'bi bi-moon-fill';
        if (text) text.textContent = 'Dark';
      } else {
        if (icon) icon.className = 'bi bi-sun-fill';
        if (text) text.textContent = 'Light';
      }
    });
  }

  /**
   * Set the theme on the document
   */
  function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    // Update toggle buttons if DOM is ready
    if (document.body) {
      updateToggleButtons(theme);
    }
  }

  /**
   * Toggle between themes
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    setTheme(newTheme);
  }

  /**
   * Initialize theme on page load
   */
  function initTheme() {
    const theme = getPreferredTheme();
    setTheme(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_KEY)) {
          setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
        }
      });
  }

  // Apply theme IMMEDIATELY to prevent flash of wrong theme
  // This runs before DOM is fully loaded
  initTheme();

  // Update buttons once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const theme = document.documentElement.getAttribute('data-bs-theme');
    updateToggleButtons(theme);

    // Add click listeners to all toggle buttons
    const toggleButtons = document.querySelectorAll('.theme-toggle');
    toggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
      });
    });
  });

  // Expose toggle function globally for onclick handlers
  window.toggleCyberTheme = toggleTheme;
})();
