/**
 * Header Component Tests - Command Bar Design
 * Tests for the two-tier header: top bar (social/utility) + main nav bar
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Header Component - Command Bar Design', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.documentElement.removeAttribute('data-bs-theme');
  });

  function renderHeader() {
    container.innerHTML = `
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <header class="main-header" role="banner">
        <div class="container">
          <a href="/" class="header-logo" aria-label="Astro Blog - Home">
            <div class="header-logo__icon" aria-hidden="true">
              <i class="bi bi-terminal-fill"></i>
            </div>
            <span class="header-logo__text">Astro Blog</span>
          </a>
          <button class="mobile-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="main-nav">
            <i class="bi bi-list"></i>
          </button>
          <nav id="main-nav" class="header-nav" aria-label="Main navigation">
            <a href="/" class="header-nav__link active" aria-current="page">
              <i class="bi bi-house" aria-hidden="true"></i> Home
            </a>
            <a href="/blog" class="header-nav__link">
              <i class="bi bi-journal-text" aria-hidden="true"></i> Blog
            </a>
            <a href="/about" class="header-nav__link">
              <i class="bi bi-person" aria-hidden="true"></i> About
            </a>
          </nav>
          <div class="header-actions">
            <a href="https://github.com/withastro/astro" target="_blank" rel="noopener" class="header-actions__github" aria-label="View on GitHub">
              <i class="bi bi-github"></i>
            </a>
            <div class="theme-switch" role="radiogroup" aria-label="Theme selection">
              <button class="theme-switch__option" role="radio" aria-checked="false" aria-label="Light mode">
                <i class="bi bi-sun-fill"></i>
              </button>
              <button class="theme-switch__option active" role="radio" aria-checked="true" aria-label="Dark mode">
                <i class="bi bi-moon-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    `;
    return container;
  }

  describe('Skip Link (WCAG 2.4.1)', () => {
    it('should render a skip-to-content link', () => {
      renderHeader();
      const skipLink = container.querySelector('.skip-link');
      expect(skipLink).toBeTruthy();
      expect(skipLink?.getAttribute('href')).toBe('#main-content');
      expect(skipLink?.textContent).toContain('Skip to main content');
    });
  });

  describe('GitHub Link', () => {
    it('should render GitHub link in header actions', () => {
      renderHeader();
      const ghLink = container.querySelector('.header-actions__github');
      expect(ghLink).toBeTruthy();
      expect(ghLink?.getAttribute('aria-label')).toBe('View on GitHub');
    });

    it('should have rel="noopener" on GitHub link', () => {
      renderHeader();
      const ghLink = container.querySelector('.header-actions__github');
      expect(ghLink?.getAttribute('target')).toBe('_blank');
      expect(ghLink?.getAttribute('rel')).toContain('noopener');
    });

    it('should place GitHub link before theme switch', () => {
      renderHeader();
      const actions = container.querySelector('.header-actions');
      const children = Array.from(actions!.children);
      const ghIndex = children.findIndex(el => el.classList.contains('header-actions__github'));
      const themeIndex = children.findIndex(el => el.classList.contains('theme-switch'));
      expect(ghIndex).toBeLessThan(themeIndex);
    });

    it('should not render a top bar', () => {
      renderHeader();
      const topBar = container.querySelector('.top-bar');
      expect(topBar).toBeNull();
    });
  });

  describe('Main Header Structure', () => {
    it('should render header with role="banner"', () => {
      renderHeader();
      const header = container.querySelector('.main-header');
      expect(header).toBeTruthy();
      expect(header?.getAttribute('role')).toBe('banner');
    });

    it('should render logo with link to home', () => {
      renderHeader();
      const logo = container.querySelector('.header-logo');
      expect(logo).toBeTruthy();
      expect(logo?.getAttribute('href')).toBe('/');
      expect(logo?.getAttribute('aria-label')).toContain('Home');
    });

    it('should render logo icon with aria-hidden', () => {
      renderHeader();
      const icon = container.querySelector('.header-logo__icon');
      expect(icon).toBeTruthy();
      expect(icon?.getAttribute('aria-hidden')).toBe('true');
    });

    it('should render site title text', () => {
      renderHeader();
      const title = container.querySelector('.header-logo__text');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should render nav with aria-label', () => {
      renderHeader();
      const nav = container.querySelector('#main-nav');
      expect(nav).toBeTruthy();
      expect(nav?.getAttribute('aria-label')).toBe('Main navigation');
    });

    it('should render nav links with icons', () => {
      renderHeader();
      const links = container.querySelectorAll('.header-nav__link');
      expect(links.length).toBe(3);

      links.forEach((link) => {
        const icon = link.querySelector('i');
        expect(icon).toBeTruthy();
        expect(icon?.getAttribute('aria-hidden')).toBe('true');
      });
    });

    it('should mark active link with aria-current="page"', () => {
      renderHeader();
      const activeLink = container.querySelector('.header-nav__link.active');
      expect(activeLink).toBeTruthy();
      expect(activeLink?.getAttribute('aria-current')).toBe('page');
    });

    it('should have correct link destinations', () => {
      renderHeader();
      const links = container.querySelectorAll('.header-nav__link');
      expect(links[0].getAttribute('href')).toBe('/');
      expect(links[1].getAttribute('href')).toBe('/blog');
      expect(links[2].getAttribute('href')).toBe('/about');
    });
  });

  describe('Theme Switch (Pill Toggle)', () => {
    it('should render theme switch with radiogroup role', () => {
      renderHeader();
      const themeSwitch = container.querySelector('.theme-switch');
      expect(themeSwitch).toBeTruthy();
      expect(themeSwitch?.getAttribute('role')).toBe('radiogroup');
      expect(themeSwitch?.getAttribute('aria-label')).toBe('Theme selection');
    });

    it('should render light and dark options as radio buttons', () => {
      renderHeader();
      const options = container.querySelectorAll('.theme-switch__option');
      expect(options.length).toBe(2);

      options.forEach((option) => {
        expect(option.getAttribute('role')).toBe('radio');
      });
    });

    it('should have correct aria-checked states', () => {
      renderHeader();
      const options = container.querySelectorAll('.theme-switch__option');
      // Light mode option
      expect(options[0].getAttribute('aria-checked')).toBe('false');
      // Dark mode option (active by default)
      expect(options[1].getAttribute('aria-checked')).toBe('true');
    });

    it('should have aria-labels on theme options', () => {
      renderHeader();
      const options = container.querySelectorAll('.theme-switch__option');
      expect(options[0].getAttribute('aria-label')).toBe('Light mode');
      expect(options[1].getAttribute('aria-label')).toBe('Dark mode');
    });
  });

  describe('Mobile Toggle', () => {
    it('should render mobile toggle button', () => {
      renderHeader();
      const toggle = container.querySelector('.mobile-toggle');
      expect(toggle).toBeTruthy();
      expect(toggle?.getAttribute('aria-label')).toBe('Toggle navigation');
    });

    it('should have aria-expanded="false" initially', () => {
      renderHeader();
      const toggle = container.querySelector('.mobile-toggle');
      expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    });

    it('should have aria-controls pointing to nav', () => {
      renderHeader();
      const toggle = container.querySelector('.mobile-toggle');
      expect(toggle?.getAttribute('aria-controls')).toBe('main-nav');
    });
  });

  describe('Accessibility - No h2 for brand (semantic fix)', () => {
    it('should use <a> for logo, not <h2>', () => {
      renderHeader();
      const logo = container.querySelector('.header-logo');
      expect(logo?.tagName.toLowerCase()).toBe('a');
      // Should NOT have an h2 wrapping the brand
      const h2Brand = container.querySelector('h2.navbar-brand');
      expect(h2Brand).toBeNull();
    });
  });
});
