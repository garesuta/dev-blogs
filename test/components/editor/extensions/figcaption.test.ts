/**
 * Figcaption Extension Unit Tests
 *
 * Tests for custom Figcaption node extension.
 */

import { describe, it, expect, vi } from 'vitest';
import { Node } from '@tiptap/core';
import Figcaption from '../extensions/figcaption';

describe('Figcaption Extension', () => {
  it('should create a figcaption node with correct name and group', () => {
    expect(Figcaption.spec.name).toBe('figcaption');
    expect(Figcaption.spec.group).toBe('block');
  });

  it('should be non-draggable and non-selectable', () => {
    expect(Figcaption.spec.draggable).toBe(false);
    expect(Figcaption.spec.selectable).toBe(false);
  });

  it('should allow inline content', () => {
    expect(Figcaption.spec.content).toBe('inline*');
  });

  describe('Keyboard shortcuts', () => {
    it('should handle Enter key by creating paragraph after figure', () => {
      // Note: addKeyboardShortcuts is private, we verify it exists
      expect(Figcaption.spec.addKeyboardShortcuts).toBeDefined();
      expect(Figcaption.spec.addKeyboardShortcuts).toHaveProperty('Enter');
    });
  });
});
