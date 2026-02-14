/**
 * Figure Node Extension
 *
 * Custom Tiptap node for images with captions.
 * Wraps an <img> and <figcaption> in a <figure> element.
 *
 * Security: Validates src and alt attributes to prevent XSS
 */

import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Allowed URI protocols for image sources
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * Validate and sanitize image source URL
 */
function validateImageSrc(src: string | null | undefined): string | null {
  if (!src) return null;

  try {
    const url = new URL(src, window.location.href);
    return ALLOWED_PROTOCOLS.includes(url.protocol) ? src : null;
  } catch {
    return null; // Invalid URL format
  }
}

/**
 * Sanitize alt text to prevent XSS
 */
function sanitizeAltText(alt: string | null | undefined): string {
  if (!alt) return '';
  // Escape HTML entities
  const div = document.createElement('div');
  div.textContent = alt;
  return div.innerHTML;
}

export default Node.create({
  name: 'figure',
  group: 'block',
  content: 'figcaption',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const rawSrc = element.querySelector('img')?.getAttribute('src');
          // SECURITY: Validate protocol before allowing
          return validateImageSrc(rawSrc);
        },
      },
      alt: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const rawAlt = element.querySelector('img')?.getAttribute('alt');
          // SECURITY: Sanitize alt text
          return sanitizeAltText(rawAlt);
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { src, alt } = node.attrs;

    // SECURITY: Don't render if src is invalid
    if (!src) {
      return ['figure', mergeAttributes({ class: 'image-figure', style: 'margin: 1.5rem 0; text-align: center; background: var(--cyber-bg-tertiary); border: 1px solid var(--cyber-neutral-200); border-radius: 12px; padding: 1rem; overflow: hidden;' }), 0];
    }

    return [
      'figure',
      mergeAttributes({ class: 'image-figure', style: 'margin: 1.5rem 0; text-align: center; background: var(--cyber-bg-tertiary); border: 1px solid var(--cyber-neutral-200); border-radius: 12px; padding: 1rem; overflow: hidden;' }),
      [
        'img',
        mergeAttributes(HTMLAttributes, {
          src,
          alt: alt || '',
          style: 'max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto;',
          class: 'figure-image',
        }),
      ],
      ['figcaption', { class: 'figure-caption' }, 0],
    ];
  },
});
