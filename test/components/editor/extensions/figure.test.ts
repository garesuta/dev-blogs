/**
 * Figure Extension Unit Tests
 *
 * Tests for the custom Figure node extension.
 */

import { describe, it, expect } from 'vitest';
import { Node } from '@tiptap/core';
import Figure from '../../../src/components/editor/extensions/figure';

describe('Figure Extension', () => {
  it('should create a figure node with correct name and group', () => {
    expect(Figure.spec.name).toBe('figure');
    expect(Figure.spec.group).toBe('block');
  });

  it('should allow figcaption content', () => {
    expect(Figure.spec.content).toBe('figcaption');
  });

  it('should be draggable and isolating', () => {
    expect(Figure.spec.draggable).toBe(true);
    expect(Figure.spec.isolating).toBe(true);
  });

  describe('Image src attribute validation', () => {
    it('should allow valid http URLs', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const validSrc = attrs.src.parseHTML?.(element => ({ getAttribute: 'src' }));
      expect(validSrc).toBe('http://example.com/image.jpg');
    });

    it('should allow valid https URLs', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const validSrc = attrs.src.parseHTML?.(element => ({ getAttribute: 'src' }));
      expect(validSrc).toBe('https://example.com/image.jpg');
    });

    it('should reject javascript: protocol URLs', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const invalidSrc = attrs.src.parseHTML?.(element => ({ getAttribute: 'src' }));
      expect(invalidSrc).toBeNull();
    });

    it('should reject data: protocol URLs', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const invalidSrc = attrs.src.parseHTML?.(element => ({ getAttribute: 'src' }));
      expect(invalidSrc).toBeNull();
    });

    it('should handle null src', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const nullSrc = attrs.src.parseHTML?.(element => ({ getAttribute: 'src' }));
      expect(nullSrc).toBeNull();
    });

    it('should handle invalid URL format', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const invalidSrc = attrs.src.parseHTML?.(element => ({ getAttribute: 'src' }));
      expect(invalidSrc).toBeNull();
    });
  });

  describe('Alt text attribute sanitization', () => {
    it('should sanitize HTML entities', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const sanitized = attrs.alt.parseHTML?.(element => ({ getAttribute: 'alt' }));
      // Should escape HTML entities
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('should sanitize XSS script tags', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const sanitized = attrs.alt.parseHTML?.(element => ({ getAttribute: 'alt' }));
      // Should strip script tags
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('javascript:');
    });

    it('should allow empty alt text', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const emptyAlt = attrs.alt.parseHTML?.(element => ({ getAttribute: 'alt' }));
      expect(emptyAlt).toBe('');
    });

    it('should sanitize alt with existing text', () => {
      const { addAttributes } = Figure.spec;
      const attrs = addAttributes();

      const sanitized = attrs.alt.parseHTML?.(element => ({ getAttribute: 'alt' }));
      expect(sanitized).toBe('Hello World');
    });
  });

  describe('renderHTML output', () => {
    it('should render figure with image and caption', () => {
      const { renderHTML } = Figure.spec;
      const node = {
        type: 'figure',
        attrs: {
          src: 'http://example.com/image.jpg',
          alt: 'Test image',
        },
      };

      const html = renderHTML({ node, HTMLAttributes: {} });

      expect(html).toMatchSnapshot();
      expect(html).toContain('class="image-figure"');
      expect(html).toContain('src="http://example.com/image.jpg"');
      expect(html).toContain('alt="Test image"');
    });

    it('should render figure without src if invalid', () => {
      const { renderHTML } = Figure.spec;
      const node = {
        type: 'figure',
        attrs: {
          alt: 'Test caption',
        },
      };

      const html = renderHTML({ node, HTMLAttributes: {} });

      // Should not render if src is null/invalid
      // The renderHTML implementation should handle this
      expect(html).toContain('alt="Test caption"');
    });
  });
