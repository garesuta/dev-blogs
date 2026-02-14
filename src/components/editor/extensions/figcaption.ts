/**
 * Figcaption Node Extension
 *
 * Caption element for the Figure node.
 * Handles keyboard shortcuts for exiting the caption.
 *
 * Keyboard Shortcuts:
 * - Enter: Creates a new paragraph after the figure block
 */

import { Node } from "@tiptap/core";

export default Node.create({
  name: 'figcaption',
  group: 'block',
  content: 'inline*',
  draggable: false,
  selectable: false,

  parseHTML() {
    return [{ tag: 'figcaption' }];
  },

  renderHTML() {
    return [
      'figcaption',
      {
        class: 'figure-caption',
        style: 'margin-top: 0.75rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: var(--cyber-text-muted); text-align: center; background: var(--cyber-editor-bg); border: 1px dashed #d1d5db; border-radius: 6px; min-height: 1.5rem; cursor: text;',
        'data-placeholder': 'Click to add caption...',
      },
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Enter in figcaption creates a new paragraph after the figure block
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type.name === 'figcaption') {
          return editor.chain().focus().insertContentAt($from.after($from.depth - 1), { type: 'paragraph' }).run();
        }
        return false;
      },
    };
  },
});
