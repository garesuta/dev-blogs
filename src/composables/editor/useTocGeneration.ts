/**
 * useTocGeneration Composable
 *
 * Manages Table of Contents generation, insertion, and navigation.
 *
 * Performance: Debounces TOC updates to avoid excessive processing
 */

import { ref, watch, type Ref } from 'vue';
import type { Editor } from '@tiptap/core';
import { generateHeadingId } from '../../lib/editor-utils/heading-id';

/**
 * TOC item interface (for display)
 */
export interface TocItem {
  level: number;
  text: string;
  id: string;
}

/**
 * Internal TOC item (with position tracking)
 */
interface TocItemWithPos extends TocItem {
  pos: number;
}

interface UseTocGenerationOptions {
  editor: Ref<Editor | null>;
}

interface TocGenerationReturn {
  show: Ref<boolean>;
  items: Ref<TocItemWithPos[]>;
  update: () => void;
  insertBlock: () => void;
  handleLinkClick: (event: MouseEvent) => void;
  scrollToHeading: (pos: number) => void;
  close: () => void;
}

export function useTocGeneration(options: UseTocGenerationOptions): TocGenerationReturn {
  const { editor } = options;

  // State refs
  const show = ref(false);
  const items = ref<TocItemWithPos[]>([]);

  /**
   * Update TOC items from document
   * PERF: Debounced in the main component, this is the core logic
   */
  function update(): void {
    if (!editor.value) {
      items.value = [];
      return;
    }

    const newItems: TocItemWithPos[] = [];
    const { doc } = editor.value.state;
    const usedIds = new Set<string>();

    // Collect all headings
    doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        // Use existing ID or generate new one
        let id = node.attrs.id || generateHeadingId(node.textContent);

        // Ensure unique ID
        let uniqueId = id;
        let counter = 1;
        while (usedIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }
        usedIds.add(uniqueId);

        newItems.push({
          level: node.attrs.level,
          text: node.textContent || 'Untitled',
          id: uniqueId,
          pos,
        });
      }
    });

    items.value = newItems;
  }

  /**
   * Insert TOC block into editor
   * 1. Updates all headings with IDs
   * 2. Inserts TOC node at cursor position
   */
  function insertBlock(): void {
    if (!editor.value) return;

    // Collect all headings with their positions
    const headings: { level: number; text: string; id: string; pos: number }[] = [];
    const { doc } = editor.value.state;
    const usedIds = new Set<string>();

    doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        let id = node.attrs.id || generateHeadingId(node.textContent);

        // Ensure unique ID
        let uniqueId = id;
        let counter = 1;
        while (usedIds.has(uniqueId)) {
          uniqueId = `${id}-${counter}`;
          counter++;
        }
        usedIds.add(uniqueId);

        headings.push({
          level: node.attrs.level,
          text: node.textContent || 'Untitled',
          id: uniqueId,
          pos,
        });
      }
    });

    if (headings.length === 0) {
      editor.value
        .chain()
        .focus()
        .insertContent('<p class="toc-placeholder"><em>Add headings to your document to generate a table of contents.</em></p>')
        .run();
      return;
    }

    // Find minimum heading level to normalize indentation
    const minLevel = Math.min(...headings.map(h => h.level));

    // First, update all headings with their IDs using a transaction
    // Apply in reverse order to avoid position shifting issues
    const { tr } = editor.value.state;
    const reversedHeadings = [...headings].reverse();
    reversedHeadings.forEach((heading) => {
      const node = tr.doc.nodeAt(heading.pos);
      if (node && node.type.name === 'heading') {
        tr.setNodeMarkup(heading.pos, undefined, {
          ...node.attrs,
          id: heading.id,
        });
      }
    });
    editor.value.view.dispatch(tr);

    // Prepare TOC items with normalized levels (cap at 3)
    const tocItems = headings.map((heading) => ({
      level: Math.min(heading.level - minLevel, 3),
      text: heading.text,
      id: heading.id,
    }));

    // Insert: TOC block
    editor.value.chain().focus().insertContent({
      type: 'tableOfContents',
      attrs: { items: tocItems },
    }).run();
  }

  /**
   * Handle TOC link clicks for smooth scrolling within editor
   */
  function handleLinkClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const link = target.closest('a[data-toc-link]') || target.closest('a[href^="#"]');
    if (!link || !editor.value) return;

    const href = link.getAttribute('href');
    const tocLink = link.getAttribute('data-toc-link');
    const headingId = tocLink || (href?.startsWith('#') ? href.slice(1) : null);

    if (!headingId) return;

    // Prevent default navigation
    event.preventDefault();
    event.stopPropagation();

    // Find: heading with this ID in: document
    const { doc } = editor.value.state;
    let targetPos: number | null = null;

    doc.descendants((node, pos) => {
      if (node.type.name === 'heading' && node.attrs.id === headingId) {
        targetPos = pos;
        return false; // Stop traversal
      }
    });

    if (targetPos !== null) {
      // Focus and scroll to: heading
      editor.value.chain().focus().setTextSelection(targetPos + 1).run();

      // Scroll using coordinates
      const { view } = editor.value;
      const coords = view.coordsAtPos(targetPos);
      const editorWrapper = document.querySelector('.notion-content-wrapper');
      if (editorWrapper) {
        const wrapperRect = editorWrapper.getBoundingClientRect();
        editorWrapper.scrollTo({
          top: editorWrapper.scrollTop + (coords.top - wrapperRect.top) - 20,
          behavior: 'smooth',
        });
      }
    }
  }

  /**
   * Scroll to: heading at specific position
   */
  function scrollToHeading(pos: number): void {
    if (!editor.value) return;

    editor.value.chain().focus().setTextSelection(pos + 1).run();

    // Scroll: heading into view
    const { view } = editor.value;
    const coords = view.coordsAtPos(pos);
    window.scrollTo({
      top: coords.top - 100,
      behavior: 'smooth',
    });
  }

  /**
   * Close TOC
   */
  function close(): void {
    show.value = false;
  }

  return {
    show,
    items,
    update,
    insertBlock,
    handleLinkClick,
    scrollToHeading,
    close,
  };
}
