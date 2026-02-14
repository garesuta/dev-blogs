/**
 * Table of Contents Node Extension
 *
 * Generates a navigable table of contents from document headings.
 *
 * Security: Validates href attributes to only allow internal anchors
 */

import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Interface for TOC items stored in the node
 */
export interface TocItem {
  level: number;
  text: string;
  id: string;
}

/**
 * Sanitize text content to prevent XSS
 */
function sanitizeText(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Validate href is internal anchor only
 */
function validateTocHref(href: string | null): string | null {
  if (!href) return null;
  // SECURITY: Only allow internal anchors starting with #
  if (!href.startsWith('#')) return null;
  const anchorId = href.slice(1);
  // Prevent empty or malicious anchor IDs
  return anchorId.match(/^[a-z0-9-]+$/i) ? href : null;
}

export default Node.create({
  name: 'tableOfContents',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: (element: HTMLElement) => {
          const items: TocItem[] = [];
          element.querySelectorAll('li').forEach((li) => {
            const link = li.querySelector('a');
            if (link) {
              const paddingLeft = li.style.paddingLeft || '0';
              let level = 0;
              if (paddingLeft.includes('3.75')) level = 3;
              else if (paddingLeft.includes('2.5')) level = 2;
              else if (paddingLeft.includes('1.25')) level = 1;

              const rawId = link.getAttribute('href');
              const href = validateTocHref(rawId);
              const text = link.textContent || '';

              // SECURITY: Only include valid internal anchors
              if (href) {
                items.push({
                  level,
                  text: sanitizeText(text),
                  id: rawId?.replace('#', '') || '',
                });
              }
            }
          });
          return items;
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'nav.toc-block' },
      { tag: 'div.toc-block' },
    ];
  },

  renderHTML({ node }) {
    const items = node.attrs.items as TocItem[];

    const levelStyles = [
      {
        indent: '0',
        bullet: '8px',
        bulletColor: 'var(--cyber-editor-text)',
        fontWeight: '600',
        fontSize: '0.95rem',
        color: 'var(--cyber-editor-text)',
      },
      {
        indent: '1.25rem',
        bullet: '6px',
        bulletColor: 'var(--cyber-text-muted)',
        fontWeight: '500',
        fontSize: '0.9rem',
        color: 'var(--cyber-editor-text)',
      },
      {
        indent: '2.5rem',
        bullet: '5px',
        bulletColor: 'var(--cyber-editor-text-muted)',
        fontWeight: '400',
        fontSize: '0.875rem',
        color: 'var(--cyber-text-muted)',
      },
      {
        indent: '3.75rem',
        bullet: '4px',
        bulletColor: 'var(--cyber-neutral-300)',
        fontWeight: '400',
        fontSize: '0.85rem',
        color: 'var(--cyber-text-muted)',
      },
    ];

    const listItems = items.map((item) => {
      const style = levelStyles[Math.min(item.level, 3)]!;
      return [
        'li',
        { style: `padding: 0.35rem 0; padding-left: ${style.indent}; display: flex; align-items: center;` },
        [
          'span',
          {
            style: `display: inline-block; width: ${style.bullet}; height: ${style.bullet}; border-radius: 50%; background: ${style.bulletColor}; margin-right: 10px; flex-shrink: 0;`,
          },
        ],
        [
          'a',
          {
            href: `#${item.id}`,
            'data-toc-link': item.id,
            style: `color: ${style.color}; text-decoration: none; font-weight: ${style.fontWeight}; font-size: ${style.fontSize}; cursor: pointer;`,
          },
          item.text,
        ],
      ];
    });

    return [
      'div',
      mergeAttributes({ class: 'toc-block', style: 'background: var(--cyber-bg-tertiary); border: 1px solid var(--cyber-editor-divider); border-radius: 8px; padding: 1rem 1.5rem; margin: 1rem 0;' }),
      [
        'p',
        { style: 'margin: 0 0 0.75rem 0; font-size: 0.95rem; color: var(--cyber-editor-text);' },
        ['strong', {}, 'Table of Contents'],
      ],
      [
        'ul',
        { style: 'list-style: none; padding: 0; margin: 0;' },
        ...listItems,
      ],
    ];
  },
});
