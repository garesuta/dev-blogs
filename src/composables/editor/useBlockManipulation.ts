/**
 * useBlockManipulation Composable
 *
 * Manages block handle (+ and ⋮ buttons) positioning and operations.
 *
 * Performance: Uses requestAnimationFrame for mouse position updates
 * to prevent layout thrashing and jank.
 */

import { ref, onUnmounted, type Ref } from 'vue';
import type { Editor } from '@tiptap/core';

interface UseBlockManipulationOptions {
  editor: Ref<Editor | null>;
  onCommandExecuted?: () => void;
}

interface BlockManipulationReturn {
  showHandle: Ref<boolean>;
  handlePosition: Ref<{ top: number; left: number; x: number; y: number }>;
  currentBlockPos: Ref<number | null>;
  showOptions: Ref<boolean>;
  isHoveringHandle: Ref<boolean>;
  closeOptions: () => void;
  deleteBlock: () => void;
  duplicateBlock: () => void;
  turnInto: (blockType: BlockType) => void;
  insertImage: () => void;
  insertTable: () => void;
  insertDivider: () => void;
  insertToc: () => void;
  // Event handlers
  handleEditorMouseMove: (event: MouseEvent) => void;
  handleEditorMouseLeave: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "orderedList"
  | "blockquote"
  | "codeBlock"
  | "divider"
  | "toc";

export function useBlockManipulation(options: UseBlockManipulationOptions): BlockManipulationReturn {
  const { editor, onCommandExecuted } = options;

  // Template refs
  const showHandle = ref(false);
  const handlePosition = ref({ top: 0, left: 0, x: 0, y: 0 });
  const currentBlockPos = ref<number | null>(null);
  const showOptions = ref(false);
  const isHoveringHandle = ref(false);

  // DOM refs (for layout calculations)
  const editorWrapperRef = ref<HTMLElement | null>(null);

  /**
   * Throttle state for requestAnimationFrame
   */
  let rafId: number | null = null;
  let pendingPosition = { top: 0, left: 0, x: 0, y: 0 };

  /**
   * Handle editor mouse move with throttling
   * PERF: Uses requestAnimationFrame to batch DOM reads
   * Prevents layout thrashing from excessive getBoundingClientRect calls
   */
  function handleEditorMouseMove(event: MouseEvent): void {
    if (!editor.value || !editorWrapperRef.value) {
      rafId = null;
      return;
    }

    // Don't update if hovering over block handle or options menu is open
    if (isHoveringHandle.value || showOptions.value) {
      return;
    }

    const editorRect = editorWrapperRef.value.getBoundingClientRect();
    const { view } = editor.value;
    const relativeX = event.clientX - editorRect.left;

    // Get position from mouse coordinates
    // PERF: Batch position calculation within RAF frame
    pendingPosition = {
      top: event.clientY,
      left: event.clientX,
      x: event.clientX,
      y: event.clientY,
    };

    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        // Get position from mouse coordinates
        let pos = view.posAtCoords({
          left: pendingPosition.x,
          top: pendingPosition.y,
        });

        // If no position found, try with position more to the right
        if (!pos && relativeX < 200) {
          pos = view.posAtCoords({
            left: editorRect.left + 100,
            top: pendingPosition.y,
          });
        }

        if (!pos) {
          // Don't hide if mouse is in: left gutter area (where block handle lives)
          if (relativeX < 56) {
            // Keep handle visible in gutter area
            rafId = null;
            return;
          }
          showHandle.value = false;
          currentBlockPos.value = null;
          rafId = null;
          return;
        }

        // Resolve position to get node
        const resolvedPos = view.state.doc.resolve(pos.pos);
        const node = resolvedPos.parent;

        // Only show for block-level nodes
        if (node && resolvedPos.depth > 0) {
          const nodeStart = resolvedPos.before(resolvedPos.depth);
          const coords = view.coordsAtPos(nodeStart);

          // Position relative to editor wrapper
          handlePosition.value = {
            top: coords.top - editorRect.top + window.scrollY,
            left: coords.left - editorRect.left,
            x: 0,
            y: 0,
          };
          currentBlockPos.value = nodeStart;
          showHandle.value = true;
        } else {
          showHandle.value = false;
          currentBlockPos.value = null;
        }

        rafId = null;
      });
    }
  }

  /**
   * Handle editor mouse leave
   * DELAY: Hides handle after 150ms to allow clicking
   */
  function handleEditorMouseLeave(): void {
    setTimeout(() => {
      if (!showOptions.value && !isHoveringHandle.value) {
        showHandle.value = false;
      }
    }, 150);
  }

  /**
   * Handle entering block handle
   */
  function handleMouseEnter(): void {
    isHoveringHandle.value = true;
  }

  /**
   * Handle leaving block handle
   * DELAY: Allows menu interactions before hiding
   */
  function handleMouseLeave(): void {
    isHoveringHandle.value = false;
    setTimeout(() => {
      if (!showOptions.value && !isHoveringHandle.value) {
        showHandle.value = false;
      }
    }, 150);
  }

  /**
   * Add a new block after current block
   */
  function handleAddBlock(): void {
    if (!editor.value || currentBlockPos.value === null) return;

    const { state } = editor.value;
    const resolvedPos = state.doc.resolve(currentBlockPos.value);
    const endOfBlock = resolvedPos.end(resolvedPos.depth);

    editor.value
      .chain()
      .focus()
      .insertContentAt(endOfBlock, { type: "paragraph" })
      .setTextSelection(endOfBlock + 1)
      .run();

    closeOptions();
    showHandle.value = false;
    onCommandExecuted?.();
  }

  /**
   * Toggle block options menu
   */
  function toggleOptions(): void {
    showOptions.value = !showOptions.value;
  }

  /**
   * Close block options
   */
  function closeOptions(): void {
    showOptions.value = false;
  }

  /**
   * Delete current block
   */
  function deleteBlock(): void {
    if (!editor.value || currentBlockPos.value === null) return;

    const { state } = editor.value;
    const resolvedPos = state.doc.resolve(currentBlockPos.value);
    const start = resolvedPos.before(resolvedPos.depth);
    const end = resolvedPos.after(resolvedPos.depth);

    editor.value.chain().focus().deleteRange({ from: start, to: end }).run();
    closeOptions();
    showHandle.value = false;
    onCommandExecuted?.();
  }

  /**
   * Duplicate current block
   */
  function duplicateBlock(): void {
    if (!editor.value || currentBlockPos.value === null) return;

    const { state } = editor.value;
    const resolvedPos = state.doc.resolve(currentBlockPos.value);
    const node = resolvedPos.parent;
    const end = resolvedPos.after(resolvedPos.depth);

    if (node) {
      editor.value
        .chain()
        .focus()
        .insertContentAt(end, node.toJSON())
        .run();
    }

    closeOptions();
    showHandle.value = false;
    onCommandExecuted?.();
  }

  /**
   * Turn current block into different type
   */
  function turnInto(blockType: BlockType): void {
    if (!editor.value || currentBlockPos.value === null) return;

    // Focus: block first
    editor.value.chain().focus().setTextSelection(currentBlockPos.value + 1).run();

    // Apply transformation
    const chain = editor.value.chain().focus();
    switch (blockType) {
      case "paragraph":
        chain.setParagraph();
        break;
      case "heading1":
        chain.setHeading({ level: 1 });
        break;
      case "heading2":
        chain.setHeading({ level: 2 });
        break;
      case "heading3":
        chain.setHeading({ level: 3 });
        break;
      case "bulletList":
        chain.toggleBulletList();
        break;
      case "orderedList":
        chain.toggleOrderedList();
        break;
      case "blockquote":
        chain.toggleBlockquote();
        break;
      case "codeBlock":
        chain.toggleCodeBlock();
        break;
      case "divider":
        chain.setHorizontalRule();
        break;
      case "toc":
        // TOC insertion is handled separately
        closeOptions();
        showHandle.value = false;
        return;
    }
    chain.run();

    closeOptions();
    showHandle.value = false;
    onCommandExecuted?.();
  }

  /**
   * Insert image block
   */
  function insertImage(): void {
    closeOptions();
    showHandle.value = false;
    // Image insertion handled by parent component's useImageUpload
  }

  /**
   * Insert table block
   */
  function insertTable(): void {
    if (!editor.value) return;

    editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    closeOptions();
    showHandle.value = false;
    onCommandExecuted?.();
  }

  /**
   * Insert divider
   */
  function insertDivider(): void {
    if (!editor.value) return;

    editor.value.chain().focus().setHorizontalRule().run();
    closeOptions();
    showHandle.value = false;
    onCommandExecuted?.();
  }

  /**
   * Insert TOC
   */
  function insertToc(): void {
    closeOptions();
    showHandle.value = false;
    // TOC insertion handled by parent component's useTocGeneration
  }

  /**
   * Clean up RAF on unmount
   */
  onUnmounted(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  return {
    showHandle,
    handlePosition,
    currentBlockPos,
    showOptions,
    isHoveringHandle,
    closeOptions,
    deleteBlock,
    duplicateBlock,
    turnInto,
    insertImage,
    insertTable,
    insertDivider,
    insertToc,
    // Event handlers
    handleEditorMouseMove,
    handleEditorMouseLeave,
    handleMouseEnter,
    handleMouseLeave,
  };
}
