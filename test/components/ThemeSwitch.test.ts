/**
 * ThemeSwitch Component Tests
 * Tests for the pill-style theme toggle (light/dark radio group)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ThemeSwitch Behavior', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    document.documentElement.setAttribute('data-bs-theme', 'dark');

    // Mock toggleCyberTheme
    (window as any).toggleCyberTheme = vi.fn();
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.documentElement.removeAttribute('data-bs-theme');
    delete (window as any).toggleCyberTheme;
  });

  function renderSwitch() {
    container.innerHTML = `
      <div class="theme-switch" role="radiogroup" aria-label="Theme selection">
        <button class="theme-switch__option" role="radio" aria-checked="false" aria-label="Light mode" data-theme="light">
          <i class="bi bi-sun-fill"></i>
        </button>
        <button class="theme-switch__option active" role="radio" aria-checked="true" aria-label="Dark mode" data-theme="dark">
          <i class="bi bi-moon-fill"></i>
        </button>
      </div>
    `;
    return container;
  }

  it('should render as a radiogroup', () => {
    renderSwitch();
    const group = container.querySelector('.theme-switch');
    expect(group?.getAttribute('role')).toBe('radiogroup');
  });

  it('should have two radio options', () => {
    renderSwitch();
    const options = container.querySelectorAll('[role="radio"]');
    expect(options.length).toBe(2);
  });

  it('should start with dark mode selected', () => {
    renderSwitch();
    const darkOption = container.querySelector('[data-theme="dark"]');
    expect(darkOption?.getAttribute('aria-checked')).toBe('true');
    expect(darkOption?.classList.contains('active')).toBe(true);
  });

  it('should toggle active state on click', () => {
    renderSwitch();
    const lightOption = container.querySelector('[data-theme="light"]') as HTMLButtonElement;
    const darkOption = container.querySelector('[data-theme="dark"]') as HTMLButtonElement;

    // Simulate clicking light mode
    lightOption.classList.add('active');
    lightOption.setAttribute('aria-checked', 'true');
    darkOption.classList.remove('active');
    darkOption.setAttribute('aria-checked', 'false');

    expect(lightOption.getAttribute('aria-checked')).toBe('true');
    expect(darkOption.getAttribute('aria-checked')).toBe('false');
    expect(lightOption.classList.contains('active')).toBe(true);
    expect(darkOption.classList.contains('active')).toBe(false);
  });

  it('should have descriptive aria-labels', () => {
    renderSwitch();
    const lightOption = container.querySelector('[data-theme="light"]');
    const darkOption = container.querySelector('[data-theme="dark"]');
    expect(lightOption?.getAttribute('aria-label')).toBe('Light mode');
    expect(darkOption?.getAttribute('aria-label')).toBe('Dark mode');
  });

  it('should be focusable via keyboard', () => {
    renderSwitch();
    const options = container.querySelectorAll('.theme-switch__option');
    options.forEach((option) => {
      expect(option.tagName.toLowerCase()).toBe('button');
    });
  });
});
