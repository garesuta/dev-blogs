/**
 * Table of Contents Extension Unit Tests
 *
 * Tests for custom TableOfContents node extension.
 */

import { describe, it, expect } from 'vitest';
import { Node } from '@tiptap/core';
import TableOfContents from '../../../src/components/editor/extensions/table-of-contents';
import type { TocItem } from '../../../src/components/editor/extensions/table-of-contents';

// Mock DOM element for parseHTML tests
const mockElement = {
  querySelector: vi.fn(),
  getAttribute: vi.fn(),
  textContent: '',
};

mockElement.querySelector = vi.fn((selector) => {
  mockElement.textContent = '';
  mockElement.getAttribute = vi.fn((attr) => {
    if (attr === 'href') return '#my-link';
    return 'my-link';
  });
  return mockElement;
});

describe('TableOfContents Extension', () => {
  it('should create a toc-block node', () => {
    expect(TableOfContents.spec.name).toBe('tableOfContents');
    expect(TableOfContents.spec.group).toBe('block');
    expect(TableOfContents.spec.atom).toBe(true);
  });

  it('should create a div.toc-block in parseHTML', () => {
    const result = TableOfContents.spec.parseHTML?.();
    expect(result).toEqual([
      { tag: 'nav.toc-block' },
      { tag: 'div.toc-block' },
    ]);
  });

  it('should add attributes with defaults', () => {
    const { addAttributes } = TableOfContents.spec;

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
      const { addAttributes } = TableOfContents.spec;
      const parseHTML = addAttributes().items.parseHTML;

      const mockLi = mockElement;
      parseHTML({ element: mockLi });

      // Test that href only contains "#"
      expect(mockElement.getAttribute).toHaveBeenCalledWith('href');
      expect(parseHTML).toEqual([{
        level: 0,
        text: 'Test Link',
        id: 'my-link', // Should preserve the id
      }]);

      // Test it handles no link
      const mockLi2 = mockElement;
      mockLi2.querySelector = vi.fn(() => null);

      parseHTML({ element: mockLi2 });

      expect(mockElement.getAttribute).not.toHaveBeenCalled();
      expect(parseHTML).toEqual([{
        level: 0,
        text: 'No Link',
        id: null,
      }]);
    });

    it('should handle empty items array', () => {
      const { addAttributes } = TableOfContents.spec;

      expect(addAttributes().items.parseHTML?.(element: mockElement)).toEqual({
        default: [],
        parseHTML: expect.any(Function),
        renderHTML: expect.any(Function),
      });
    });

    it('should filter out external links (javascript:, data:, vbscript:)', () => {
      const mockLi = mockElement;
      const mockLink = mockElement;
      mockLink.getAttribute = vi.fn(() => 'javascript:alert(1)');
      mockLi.querySelector = vi.fn(() => mockLink);

      const { addAttributes } = TableOfContents.spec;
      parseHTML({ element: mockLi });

      // Should not include malicious link
      expect(parseHTML).toEqual([{
        level: 0,
        text: 'Test Link',
        id: null,
      }]);
    });

    it('should validate href only starts with #', () => {
      const mockLi = mockElement;
      const mockLink = mockElement;
      mockLink.getAttribute = vi.fn(() => '#heading-internal-link');
      mockLi.querySelector = vi.fn(() => mockLink);

      const { addAttributes } = TableOfContents.spec;
      parseHTML({ element: mockLi });

      expect(parseHTML).toEqual([{
        level: 0,
        text: 'Heading Internal Link',
        id: 'heading-internal-link',
      }]);
    });

    it('should reject invalid href formats', () => {
      const mockLi = mockElement;
      const mockLink = mockElement;
      mockLink.getAttribute = vi.fn(() => 'ftp://example.com');
      mockLi.querySelector = vi.fn(() => mockLink);

      const { addAttributes } = TableOfContents.spec;
      parseHTML({ element: mockLi });

      // Should reject non-internal/non-# links
      expect(parseHTML).toEqual([{
        level: 0,
        text: 'FTP Link',
        id: null,
      }]);
    });

    it('should escape text content (XSS prevention)', () => {
      const mockLi = mockElement;
      mockLi.textContent = '<script>alert("XSS")</script>Heading';
      mockLi.querySelector = vi.fn(() => null);

      const { addAttributes } = TableOfContents.spec;
      parseHTML({ element: mockLi });

      // Should escape script tags
      expect(parseHTML).toEqual([{
        level: 0,
        text: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;Heading',
        id: null,
      }]);
    });

    it('should escape HTML entities', () => {
      const mockLi = mockElement;
      mockLi.textContent = 'Heading & "test"';
      mockLi.querySelector = vi.fn(() => null);

      const { addAttributes } = TableOfContents.spec;
      parseHTML({ element: mockLi });

      // Should preserve entity
      expect(parseHTML).toEqual([{
        level: 0,
        text: 'Heading & "test"',
        id: null,
      }]);
    });
  });
});
