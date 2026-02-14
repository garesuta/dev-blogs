/**
 * generateHeadingId Utility Unit Tests
 *
 * Tests for the heading ID generation utility.
 */

import { describe, it, expect } from 'vitest';
import { generateHeadingId } from '../../../src/lib/editor-utils/heading-id';

describe('generateHeadingId', () => {
  it('should convert simple text to slug', () => {
    expect(generateHeadingId('Hello World')).toBe('hello-world');
  });

  it('should convert to lowercase', () => {
    expect(generateHeadingId('HeLLo WOrLD')).toBe('hello-world');
  });

  it('should remove non-alphanumeric characters', () => {
    expect(generateHeadingId('Hello! @World #123')).toBe('hello-world-123');
  });

  it('should replace spaces with hyphens', () => {
    expect(generateHeadingId('   Multiple   Spaces   ')).toBe('multiple-spaces');
  });

  it('should remove multiple consecutive hyphens', () => {
    expect(generateHeadingId('---Test---')).toBe('test');
  });

  it('should trim leading/trailing hyphens', () => {
    expect(generateHeadingId('--Test--')).toBe('test');
  });

  it('should return empty string for empty input', () => {
    expect(generateHeadingId('')).toBe('');
  });

  it('should handle uppercase letters', () => {
    expect(generateHeadingId('ABC123')).toBe('abc123');
  });

  it('should handle numbers', () => {
    expect(generateHeadingId('Test 123')).toBe('test-123');
  });

  it('should preserve existing hyphen in words', () => {
    expect(generateHeadingId('test-phrase')).toBe('test-phrase');
  });

  it('should handle special characters correctly', () => {
    // Test with special chars that should be preserved
    expect(generateHeadingId('Test & special!')).toBe('test-special');
  });
});
