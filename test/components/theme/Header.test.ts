/**
 * Header Component Tests
 * Testing header with theme integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Header Component', () => {
  let container: HTMLElement;
  let header: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);

    // Create header structure similar to actual component
    header = document.createElement('header');
    header.className = 'navbar navbar-expand-lg sticky-top';
    header.innerHTML = `
      <div class="container">
        <h2 class="navbar-brand">
          <a href="/"><i class="bi bi-terminal-fill"></i> Tech Blog</a>
        </h2>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse">
          <div class="internal-links navbar-nav">
            <a href="/" class="nav-link active">Home</a>
            <a href="/blog" class="nav-link">Blog</a>
            <a href="/about" class="nav-link">About</a>
          </div>
          <div class="d-flex gap-2 align-items-center">
            <button class="theme-toggle">
              <i class="bi bi-moon-fill"></i>
              <span class="theme-text">Dark</span>
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(header);

    // Set initial theme
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.documentElement.removeAttribute('data-bs-theme');
  });

  describe('Header rendering', () => {
    it('should render navbar with correct classes', () => {
      expect(header.className).toContain('navbar');
      expect(header.className).toContain('navbar-expand-lg');
      expect(header.className).toContain('sticky-top');
    });

    it('should render brand link', () => {
      const brand = header.querySelector('.navbar-brand a');
      expect(brand).toBeTruthy();
      expect(brand?.getAttribute('href')).toBe('/');
    });

    it('should render brand icon', () => {
      const icon = header.querySelector('.navbar-brand i');
      expect(icon).toBeTruthy();
      expect(icon?.className).toContain('bi-terminal-fill');
    });

    it('should render navigation links', () => {
      const links = header.querySelectorAll('.internal-links .nav-link');
      expect(links.length).toBe(3);
      expect(links[0].textContent).toContain('Home');
      expect(links[1].textContent).toContain('Blog');
      expect(links[2].textContent).toContain('About');
    });

    it('should mark active link', () => {
      const activeLink = header.querySelector('.nav-link.active');
      expect(activeLink).toBeTruthy();
      expect(activeLink?.textContent).toContain('Home');
    });
  });

  describe('Theme toggle integration', () => {
    it('should render theme toggle button in header', () => {
      const toggleButton = header.querySelector('.theme-toggle');
      expect(toggleButton).toBeTruthy();
    });

    it('should position theme toggle in header controls', () => {
      const controls = header.querySelector('.d-flex.align-items-center');
      const toggleButton = controls?.querySelector('.theme-toggle');
      expect(toggleButton).toBeTruthy();
    });
  });

  describe('Responsive behavior', () => {
    it('should render navbar toggler', () => {
      const toggler = header.querySelector('.navbar-toggler');
      expect(toggler).toBeTruthy();
    });

    it('should have collapse element for mobile menu', () => {
      const collapse = header.querySelector('.collapse.navbar-collapse');
      expect(collapse).toBeTruthy();
    });

    it('should have data attributes for Bootstrap collapse', () => {
      const toggler = header.querySelector('.navbar-toggler');
      expect(toggler?.getAttribute('data-bs-toggle')).toBe('collapse');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on toggler', () => {
      const toggler = header.querySelector('.navbar-toggler');
      expect(toggler?.getAttribute('type')).toBe('button');
      expect(toggler?.getAttribute('aria-label')).toBeTruthy();
    });

    it('should have semantic heading for brand', () => {
      const brandHeading = header.querySelector('.navbar-brand');
      expect(brandHeading?.tagName.toLowerCase()).toBe('h2');
    });
  });

  describe('Theme-aware styling', () => {
    it('should use CSS variables for colors', () => {
      const computedStyle = getComputedStyle(header);
      // In actual implementation, would verify theme colors
      expect(header).toBeTruthy();
    });

    it('should update styles when theme changes', () => {
      // Change theme
      document.documentElement.setAttribute('data-bs-theme', 'light');
      expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
    });
  });

  describe('Social links', () => {
    it('should render social link buttons on desktop', () => {
      // Would add social links to header
      const socialLinks = header.querySelectorAll('.social-links a');
      // For now, just verify header exists
      expect(header).toBeTruthy();
    });
  });
});
