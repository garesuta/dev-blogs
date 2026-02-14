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
import type { Transaction, EditorState } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/core";

// Type declaration for extension storage
declare module "@tiptap/core" {
  interface Storage {
    [key: string]: unknown;
  }

  // Types for the Plugin props
  interface PluginProps {
    handleKeyDown(view, event): boolean;
  }
}

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
  const storage = editor.storage as Record<string, SlashMenuState> | undefined;
  return storage?.[SLASH_MENU_STORAGE_KEY] || {
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
  const storage = editor.storage as Record<string, SlashMenuState>;
  storage[SLASH_MENU_STORAGE_KEY] = updated;
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
 * Command item definition
 */
export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (editor: Editor) => void;
}

/**
 * Default slash commands available
 */
export const DEFAULT_SLASH_COMMANDS: SlashCommandItem[] = [
  {
    title: "Text",
    description: "Plain text paragraph",
    icon: "bi-text-paragraph",
    command: (editor: Editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: "bi-type-h1",
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: "bi-type-h2",
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "bi-type-h3",
    command: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    title: "Bullet List",
    description: "Create a bullet list",
    icon: "bi-list-ul",
    command: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: "bi-list-ol",
    command: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: "Quote",
    description: "Capture a quote",
    icon: "bi-quote",
    command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Display code with syntax highlighting",
    icon: "bi-code-square",
    command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    title: "Divider",
    description: "Visual divider line",
    icon: "bi-hr",
    command: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    title: "Table",
    description: "Add a simple table",
    icon: "bi-table",
    command: (editor: Editor) => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
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

  addStorage(): Record<string, unknown> {
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
          handleKeyDown(view, event): boolean {
            const editor = view.state;
            const { selection } = editor;

            // Open menu on "/"
            if (event.key === "/" && !getSlashMenuState(editor).show) {
              const { selection } = state;
              const { $from } = selection;

              // Only show at start of empty block or after space
              const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
              if (textBefore === "" || textBefore.endsWith(" ")) {
                // Get cursor position for menu
                const coords = view.coordsAtPos(selection.from);
                updateSlashMenuState(editor, {
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
            const slashState = getSlashMenuState(editor);
            if (slashState.show) {
              const filteredCommands = filterSlashCommands(DEFAULT_SLASH_COMMANDS, slashState.query);

              if (event.key === "ArrowDown") {
                event.preventDefault();
                updateSlashMenuState(editor, {
                  selectedIndex: Math.min(slashState.selectedIndex + 1, filteredCommands.length - 1),
                });
                return true;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                updateSlashMenuState(editor, {
                  selectedIndex: Math.max(slashState.selectedIndex - 1, 0),
                });
                return true;
              }
              if (event.key === "Enter") {
                event.preventDefault();
                const command = filteredCommands[slashState.selectedIndex];
                if (command) {
                  command.command(editor);
                  resetSlashMenuState(editor);
                }
                return true;
              }
              if (event.key === "Escape") {
                event.preventDefault();
                resetSlashMenuState(editor);
                return true;
              }
              if (event.key === "Backspace") {
                // Check if we should close menu
                const { selection } = state;
                const { $from } = selection;
                const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

                // Close if backspacing the "/"
                if (textBefore === "/" || !textBefore.includes("/")) {
                  resetSlashMenuState(editor);
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
