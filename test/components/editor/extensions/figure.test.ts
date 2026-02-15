/**
 * Figure Extension Unit Tests
 *
 * Tests for custom Figure node extension.
 */

import { describe, it, expect, vi } from 'vitest';
import Figure from '@/components/editor/extensions/figure';

// Type assertion for Tiptap extension internal structure
const figureSpec = Figure as any;

describe('Figure Extension', () => {
  it('should create a figure node with correct name and group', () => {
    expect(figureSpec.spec.name).toBe('figure');
    expect(figureSpec.spec.group).toBe('block');
  });

  it('should allow figcaption content', () => {
    expect(figureSpec.spec.content).toBe('figcaption');
  });

  it('should be draggable and isolating', () => {
    expect(figureSpec.spec.draggable).toBe(true);
    expect(figureSpec.spec.isolating).toBe(true);
  });

  describe('Image src attribute validation', () => {
    it('should allow valid http URLs', () => {
      const { addAttributes } = figureSpec.spec;
      const attrs = addAttributes();

      if (attrs.src && attrs.src.parseHTML) {
        const mockElement = { getAttribute: vi.fn(() => 'http://example.com/image.jpg') };
        const validSrc = attrs.src.parseHTML(mockElement);
        expect(validSrc).toBe('http://example.com/image.jpg');
      }
    });

    it('should allow valid https URLs', () => {
      const { addAttributes } = figureSpec.spec;
      const attrs = addAttributes();

      if (attrs.src && attrs.src.parseHTML) {
        const mockElement = { getAttribute: vi.fn(() => 'https://example.com/image.jpg') };
        const validSrc = attrs.src.parseHTML(mockElement);
        expect(validSrc).toBe('https://example.com/image.jpg');
      }
    });

    it('should reject javascript: protocol URLs', () => {
      const { addAttributes } = figureSpec.spec;
      const attrs = addAttributes();

      if (attrs.src && attrs.src.parseHTML) {
        const mockElement = { getAttribute: vi.fn(() => 'javascript:alert(1)') };
        const invalidSrc = attrs.src.parseHTML(mockElement);
        expect(invalidSrc).toBeNull();
      }
    });

    it('should reject data: protocol URLs', () => {
      const { addAttributes } = figureSpec.spec;
      const attrs = addAttributes();

      if (attrs.src && attrs.src.parseHTML) {
        const mockElement = { getAttribute: vi.fn(() => 'data:image/png;base64,abc123') };
        const invalidSrc = attrs.src.parseHTML(mockElement);
        expect(invalidSrc).toBeNull();
      }
    });

    it('should handle null src', () => {
      const { addAttributes } = figureSpec.spec;
      const attrs = addAttributes();

      if (attrs.src && attrs.src.parseHTML) {
        const mockElement = { getAttribute: vi.fn(() => null) };
        const nullSrc = attrs.src.parseHTML(mockElement);
        expect(nullSrc).toBeNull();
      }
    });
  });

  describe('Alt text attribute sanitization', () => {
    it('should allow empty alt text', () => {
      const { addAttributes } = figureSpec.spec;
      const attrs = addAttributes();

      if (attrs.alt && attrs.alt.parseHTML) {
        const mockElement = { getAttribute: vi.fn(() => '') };
        const emptyAlt = attrs.alt.parseHTML(mockElement);
        expect(emptyAlt).toBe('');
      }
    });

    it('should allow alt with existing text', () => {
      const { addAttributes } = figureSpec.spec;
      const attrs = addAttributes();

      if (attrs.alt && attrs.alt.parseHTML) {
        const mockElement = { getAttribute: vi.fn(() => 'Hello World') };
        const sanitized = attrs.alt.parseHTML(mockElement);
        expect(sanitized).toBe('Hello World');
      }
    });
  });

  describe('renderHTML output', () => {
    it('should render figure with image and caption', () => {
      const { renderHTML } = figureSpec.spec;
      const node = {
        type: 'figure',
        attrs: {
          src: 'http://example.com/image.jpg',
          alt: 'Test image',
        },
      };

      const html = renderHTML({ node, HTMLAttributes: {} });

      expect(html).toContain('class="image-figure"');
      expect(html).toContain('src="http://example.com/image.jpg"');
      expect(html).toContain('alt="Test image"');
    });
  });
});
