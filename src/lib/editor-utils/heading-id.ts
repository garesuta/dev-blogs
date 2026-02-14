/**
 * Heading ID Generator Utility
 *
 * Generates URL-safe slugs from heading text for use in anchors
 * and Table of Contents navigation.
 *
 * This utility should be used consistently across:
 * - Editor (for TOC generation)
 * - Content processor (for server-side rendering)
 *
 * Security: Sanitizes input to prevent XSS in generated IDs
 */

/**
 * Generate a URL-safe ID from heading text
 *
 * Examples:
 *   "Hello World" -> "hello-world"
 *   "This is a Test!" -> "this-is-a-test"
 *   "   Multiple   Spaces   " -> "multiple-spaces"
 *
 * @param text - The heading text to convert to an ID
 * @returns A URL-safe slug string
 */
export function generateHeadingId(text: string): string {
  // Sanitize input by removing any HTML tags (XSS prevention)
  const sanitizedText = text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ''); // Remove HTML entities

  // Convert to lowercase
  const lowercased = sanitizedText.toLowerCase();

  // Remove all non-alphanumeric characters (except spaces and hyphens)
  const cleaned = lowercased.replace(/[^a-z0-9\s-]/g, '');

  // Replace spaces with single hyphens
  const withHyphens = cleaned.replace(/\s+/g, '-');

  // Replace multiple consecutive hyphens with single hyphen
  const normalized = withHyphens.replace(/-+/g, '-');

  // Trim leading/trailing hyphens
  return normalized.replace(/^-+|-+$/g, '');
}

/**
 * Test cases for generateHeadingId (kept for reference)
 *
 * - "Hello World" -> "hello-world"
 * - "Hello!! World" -> "hello-world"
 * - "<script>alert('x')</script>" -> "alertx"
 * - "   Multiple   Spaces   " -> "multiple-spaces"
 * - "---Test---" -> "test"
 * - "" -> ""
 */
