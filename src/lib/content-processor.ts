/**
 * Content processor for blog posts
 * Processes HTML content to add heading IDs for TOC navigation
 */

/**
 * Generate a slug ID from text
 */
function generateSlugId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim() || 'heading';
}

/**
 * Process HTML content to add IDs to headings
 * This enables Table of Contents navigation to work properly
 */
export function processContentForDisplay(html: string): string {
  if (!html) return '';

  const usedIds = new Set<string>();

  // Add IDs to all heading tags (h1-h6)
  const processedHtml = html.replace(
    /<(h[1-6])([^>]*)>(.*?)<\/h[1-6]>/gi,
    (match, tag, attrs, content) => {
      // Check if heading already has an ID
      if (attrs.includes('id=')) {
        return match;
      }

      // Generate ID from content (strip HTML tags)
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      let id = generateSlugId(textContent);

      // Ensure unique ID
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      usedIds.add(uniqueId);

      // Return heading with ID attribute
      return `<${tag}${attrs} id="${uniqueId}">${content}</${tag}>`;
    }
  );

  return processedHtml;
}

/**
 * Extract headings from HTML content for generating TOC
 */
export function extractHeadings(html: string): { level: number; text: string; id: string }[] {
  if (!html) return [];

  const headings: { level: number; text: string; id: string }[] = [];
  const usedIds = new Set<string>();

  // Match all heading tags
  const headingRegex = /<h([1-6])(?:[^>]*id="([^"]*)")?[^>]*>(.*?)<\/h[1-6]>/gi;
  let match;

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const existingId = match[2];
    const content = match[3].replace(/<[^>]*>/g, '').trim();

    let id = existingId;
    if (!id) {
      id = generateSlugId(content);
      // Ensure unique ID
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      id = uniqueId;
    }
    usedIds.add(id);

    headings.push({
      level,
      text: content || 'Untitled',
      id,
    });
  }

  return headings;
}
