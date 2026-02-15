/**
 * Figcaption Extension Unit Tests
 *
 * Tests for custom Figcaption node extension.
 */

import { describe, it, expect, vi } from 'vitest';
import Figcaption from '@/components/editor/extensions/figcaption';

// Type assertion for Tiptap extension internal structure
const figcaptionSpec = Figcaption as any;

describe('Figcaption Extension', () => {
  it('should create a figcaption node with correct name and group', () => {
    expect(figcaptionSpec.spec.name).toBe('figcaption');
    expect(figcaptionSpec.spec.group).toBe('block');
  });

  it('should be non-draggable and non-selectable', () => {
    expect(figcaptionSpec.spec.draggable).toBe(false);
    expect(figcaptionSpec.spec.selectable).toBe(false);
  });

  it('should allow inline content', () => {
    expect(figcaptionSpec.spec.content).toBe('inline*');
  });

  describe('Keyboard shortcuts', () => {
    it('should have keyboard shortcuts defined', () => {
      // Note: addKeyboardShortcuts returns keyboard shortcut mappings
      expect(typeof figcaptionSpec.spec.addKeyboardShortcuts).toBe('function');
    });
  });
});
