/**
 * Table of Contents Extension Unit Tests
 *
 * Tests for custom TableOfContents node extension.
 */

import { describe, it, expect, vi } from 'vitest';
import TableOfContents from '@/components/editor/extensions/table-of-contents';

// Type assertion for Tiptap extension internal structure
const tocSpec = TableOfContents as any;

// Mock DOM element for parseHTML tests
const mockElement = {
  querySelector: vi.fn(),
  getAttribute: vi.fn(),
  textContent: '',
};

describe('TableOfContents Extension', () => {
  it('should create a toc-block node', () => {
    expect(tocSpec.spec.name).toBe('tableOfContents');
    expect(tocSpec.spec.group).toBe('block');
    expect(tocSpec.spec.atom).toBe(true);
  });

  it('should create a div.toc-block in parseHTML', () => {
    const result = tocSpec.spec.parseHTML?.();
    expect(result).toEqual([
      { tag: 'nav.toc-block' },
      { tag: 'div.toc-block' },
    ]);
  });

  it('should add attributes with defaults', () => {
    const addAttributes = tocSpec.spec.addAttributes;

    expect(addAttributes()).toEqual({
      items: {
        default: [],
        parseHTML: expect.any(Function),
        renderHTML: expect.any(Function),
      },
    });
  });

  describe('Items attribute parsing (SECURITY)', () => {
    it('should sanitize href to internal anchors only', () => {
      const addAttributes = tocSpec.spec.addAttributes;
      const attrs = addAttributes();

      mockElement.querySelector = vi.fn(() => mockElement);
      mockElement.getAttribute = vi.fn((attr: string) => {
        if (attr === 'href') return '#my-link';
        return 'my-link';
      });
      mockElement.textContent = 'Test Link';

      if (attrs.items && attrs.items.parseHTML) {
        const result = attrs.items.parseHTML(mockElement);
        expect(result).toEqual([{
          level: 0,
          text: 'Test Link',
          id: 'my-link',
        }]);
      }
    });

    it('should handle empty items array', () => {
      const addAttributes = tocSpec.spec.addAttributes;
      const attrs = addAttributes();

      expect(attrs.items.default).toEqual([]);
    });

    it('should filter out external links (javascript:, data:, vbscript:)', () => {
      const mockLink = {
        getAttribute: vi.fn(() => 'javascript:alert(1)'),
      };

      mockElement.querySelector = vi.fn(() => mockLink);
      mockElement.textContent = 'Test Link';

      const addAttributes = tocSpec.spec.addAttributes;
      const attrs = addAttributes();

      if (attrs.items && attrs.items.parseHTML) {
        const result = attrs.items.parseHTML(mockElement);
        expect(result[0]?.id).toBeNull();
      }
    });

    it('should validate href only starts with #', () => {
      const mockLink = {
        getAttribute: vi.fn(() => '#heading-internal-link'),
      };

      mockElement.querySelector = vi.fn(() => mockLink);
      mockElement.textContent = 'Heading Internal Link';

      const addAttributes = tocSpec.spec.addAttributes;
      const attrs = addAttributes();

      if (attrs.items && attrs.items.parseHTML) {
        const result = attrs.items.parseHTML(mockElement);
        expect(result).toEqual([{
          level: 0,
          text: 'Heading Internal Link',
          id: 'heading-internal-link',
        }]);
      }
    });

    it('should escape text content (XSS prevention)', () => {
      mockElement.querySelector = vi.fn(() => null);
      mockElement.textContent = '<script>alert("XSS")</script>Heading';

      const addAttributes = tocSpec.spec.addAttributes;
      const attrs = addAttributes();

      if (attrs.items && attrs.items.parseHTML) {
        const result = attrs.items.parseHTML(mockElement);
        expect(result[0]?.text).toContain('&lt;script&gt;');
      }
    });
  });
});
