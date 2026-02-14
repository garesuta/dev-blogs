/**
 * Slash Commands Extension
 *
 * Provides a command palette interface triggered by "/" key.
 * Uses Tiptap's storage to avoid circular Vue dependency.
 *
 * Architecture: Uses editor.storage for state management instead of direct Vue refs
 * to maintain clean separation between Tiptap extensions and Vue components.
 */

import { Extension, Plugin, PluginKey } from "@tiptap/core";
import type { Editor } from "@tiptap/core";

/**
 * Plugin key for slash commands
 */
const SLASH_COMMANDS_PLUGIN_KEY = new PluginKey('slashCommands');

/**
 * Storage key for slash menu state in Tiptap editor
 */
const SLASH_MENU_STORAGE_KEY = 'slashMenu';

/**
 * Interface for slash menu state (stored in editor.storage)
 */
interface SlashMenuState {
  show: boolean;
  position: { top: number; left: number };
  query: string;
  selectedIndex: number;
}

/**
 * Get slash menu state from editor storage
 */
export function getSlashMenuState(editor: Editor): SlashMenuState {
  return (editor.storage as Record<string, SlashMenuState>)[SLASH_MENU_STORAGE_KEY] || {
    show: false,
    position: { top: 0, left: 0 },
    query: '',
    selectedIndex: 0,
  };
}

/**
 * Update slash menu state in editor storage
 */
export function updateSlashMenuState(editor: Editor, updates: Partial<SlashMenuState>): void {
  const current = getSlashMenuState(editor);
  const updated = { ...current, ...updates };
  (editor.storage as Record<string, SlashMenuState>)[SLASH_MENU_STORAGE_KEY] = updated;
}

/**
 * Reset slash menu state (close menu)
 */
export function resetSlashMenuState(editor: Editor): void {
  updateSlashMenuState(editor, {
    show: false,
    query: '',
    selectedIndex: 0,
  });
}

/**
 * Command item definition
 */
export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: () => void;
}

/**
 * Filter commands by query string
 */
export function filterSlashCommands(items: SlashCommandItem[], query: string): SlashCommandItem[] {
  const normalizedQuery = query.toLowerCase();
  if (!normalizedQuery) return items;

  return items.filter(item =>
    item.title.toLowerCase().includes(normalizedQuery) ||
    item.description.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Default slash commands available
 */
export const DEFAULT_SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: "Text",
    description: "Plain text paragraph",
    icon: "bi-text-paragraph",
    command: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: "bi-type-h1",
    command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: "bi-type-h2",
    command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "bi-type-h3",
    command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Create a bullet list",
    icon: "bi-list-ul",
    command: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: "bi-list-ol",
    command: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Quote",
    description: "Capture a quote",
    icon: "bi-quote",
    command: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Display code with syntax highlighting",
    icon: "bi-code-square",
    command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Divider",
    description: "Visual divider line",
    icon: "bi-hr",
    command: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Table",
    description: "Add a simple table",
    icon: "bi-table",
    command: (editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
];

/**
 * The Slash Commands Extension
 *
 * This extension manages the slash command palette without depending on Vue refs.
 * Vue components should read/write state via the helper functions above.
 */
export default Extension.create({
  name: 'slashCommands',

  addStorage() {
    return {
      [SLASH_MENU_STORAGE_KEY]: {
        default: {
          show: false,
          position: { top: 0, left: 0 },
          query: '',
          selectedIndex: 0,
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: SLASH_COMMANDS_PLUGIN_KEY,
        props: {
          handleKeyDown(view, event) {
            const editor = view.state as unknown as { editor?: Editor } | Editor;
            const editorInstance = 'editor' in editor ? editor.editor : (editor as Editor);
            const state = getSlashMenuState(editorInstance);

            // Open menu on "/"
            if (event.key === '/' && !state.show) {
              const { selection } = view.state;
              const { $from } = selection;

              // Only show at start of empty block or after space
              const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
              if (textBefore === "" || textBefore.endsWith(" ")) {
                // Get cursor position for menu
                const coords = view.coordsAtPos(selection.from);
                updateSlashMenuState(editorInstance, {
                  position: {
                    top: coords.bottom + 8,
                    left: coords.left,
                  },
                  query: '',
                  selectedIndex: 0,
                  show: true,
                });
                return false; // Let the "/" be typed
              }
            }

            // Handle menu navigation
            if (state.show) {
              const filteredCommands = filterSlashCommands(DEFAULT_SLASH_COMMANDS, state.query);

              if (event.key === "ArrowDown") {
                event.preventDefault();
                updateSlashMenuState(editorInstance, {
                  selectedIndex: Math.min(state.selectedIndex + 1, filteredCommands.length - 1),
                });
                return true;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                updateSlashMenuState(editorInstance, {
                  selectedIndex: Math.max(state.selectedIndex - 1, 0),
                });
                return true;
              }
              if (event.key === "Enter") {
                event.preventDefault();
                const command = filteredCommands[state.selectedIndex];
                if (command) {
                  command.command(editorInstance);
                  resetSlashMenuState(editorInstance);
                }
                return true;
              }
              if (event.key === "Escape") {
                event.preventDefault();
                resetSlashMenuState(editorInstance);
                return true;
              }
              if (event.key === "Backspace") {
                // Check if we should close menu
                const { selection } = view.state;
                const { $from } = selection;
                const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

                // Close if backspacing the "/"
                if (textBefore === "/" || !textBefore.includes("/")) {
                  resetSlashMenuState(editorInstance);
                }
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
