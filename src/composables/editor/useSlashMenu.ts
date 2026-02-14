/**
 * useSlashMenu Composable
 *
 * Manages the slash command palette state and interactions.
 * Works with the SlashCommands extension which stores state in editor.storage.
 *
 * Security: All command executions are through Tiptap's chain API
 * which is safe from XSS.
 */

import { ref, computed, type Ref, type ComputedRef, watch } from 'vue';
import type { Editor } from '@tiptap/core';
import {
  getSlashMenuState,
  updateSlashMenuState,
  resetSlashMenuState,
  filterSlashCommands,
  DEFAULT_SLASH_COMMANDS,
  type SlashCommandItem,
} from '../components/editor/extensions/slash-commands';

interface UseSlashMenuOptions {
  editor: Ref<Editor | null>;
  onCommandExecuted?: () => void;
}

interface SlashMenuReturn {
  show: Ref<boolean>;
  position: Ref<{ top: number; left: number }>;
  query: Ref<string>;
  selectedIndex: Ref<number>;
  filteredCommands: ComputedRef<SlashCommandItem[]>;
  close: () => void;
  executeCommand: (command: SlashCommandItem) => void;
}

export function useSlashMenu(options: UseSlashMenuOptions): SlashMenuReturn {
  const { editor, onCommandExecuted } = options;

  // State refs
  const show = ref(false);
  const position = ref({ top: 0, left: 0 });
  const query = ref("");
  const selectedIndex = ref(0);

  /**
   * Sync state from editor storage
   * The extension stores menu state, we need to sync it to Vue refs
   */
  function syncFromEditor(): void {
    if (!editor.value) return;

    const editorState = getSlashMenuState(editor.value);
    show.value = editorState.show;
    position.value = editorState.position;
    query.value = editorState.query;
    selectedIndex.value = editorState.selectedIndex;
  }

  /**
   * Filter commands based on current query
   */
  const filteredCommands = computed<SlashCommandItem[]>(() => {
    return filterSlashCommands(DEFAULT_SLASH_COMMANDS, query.value);
  });

  /**
   * Update state back to editor
   */
  function updateEditorState(updates: {
    show?: boolean;
    position?: { top: number; left: number };
    query?: string;
    selectedIndex?: number;
  }): void {
    if (!editor.value) return;
    updateSlashMenuState(editor.value, updates);
    syncFromEditor();
  }

  /**
   * Close the slash menu
   */
  function close(): void {
    resetSlashMenuState(editor.value);
    syncFromEditor();
  }

  /**
   * Execute a slash command
   * Deletes the "/" prefix and executes the command
   */
  function executeCommand(command: SlashCommandItem): void {
    if (!editor.value) return;

    const { state } = editor.value;
    const { selection } = state;
    const { $from } = selection;

    // Delete the "/" and query text
    const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
    const slashIndex = textBefore.lastIndexOf("/");

    if (slashIndex >= 0) {
      const deleteFrom = $from.pos - (textBefore.length - slashIndex);
      const deleteTo = $from.pos;
      editor.value.chain().focus().deleteRange({ from: deleteFrom, to: deleteTo }).run();
    }

    // Execute the command
    command.command(editor.value);
    close();

    // Notify parent if callback provided
    onCommandExecuted?.();
  }

  /**
   * Watch for editor updates to sync menu state
   */
  watch(
    () => editor.value,
    () => {
      syncFromEditor();
    },
    { immediate: true }
  );

  return {
    show,
    position,
    query,
    selectedIndex,
    filteredCommands,
    close,
    executeCommand,
  };
}
