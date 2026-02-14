/**
 * useEditorState Composable
 *
 * Manages editor save state, auto-save functionality, and dirty tracking.
 *
 * Features:
 * - Auto-save with configurable interval
 * - Save status tracking (idle, saving, saved, error)
 * - Dirty flag for unsaved changes
 * - Clean up on component unmount
 */

import { type Ref, ref, computed, onMounted, onUnmounted, type ComputedRef } from 'vue';
import type { Editor } from '@tiptap/core';

interface UseEditorStateOptions {
  editor: ComputedRef<Editor | null>;
  disabled: ComputedRef<boolean>;
  autoSaveInterval: ComputedRef<number>;
  onSave: (content: string) => void | Promise<void>;
}

interface EditorStateReturn {
  saveStatus: Ref<"idle" | "saving" | "saved" | "error">;
  lastSavedAt: Ref<Date | null>;
  isDirty: Ref<boolean>;
  autoSaveTimer: Ref<ReturnType<typeof setInterval> | null>;
  saveStatusText: ComputedRef<string>;
  saveStatusClass: ComputedRef<string>;
  triggerSave: () => void;
}

export function useEditorState(options: UseEditorStateOptions): EditorStateReturn {
  const { editor, disabled, autoSaveInterval, onSave } = options;

  // State refs
  const saveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
  const lastSavedAt = ref<Date | null>(null);
  const isDirty = ref(false);
  const autoSaveTimer = ref<ReturnType<typeof setInterval> | null>(null);

  // Computed properties for save status display
  const saveStatusText = computed(() => {
    if (!editor.value) return "";
    switch (saveStatus.value) {
      case "saving": return "Saving...";
      case "saved":
        return lastSavedAt.value ? `Saved at ${lastSavedAt.value.toLocaleTimeString()}` : "Saved";
      case "error": return "Save failed";
      default:
        return isDirty.value ? "Unsaved changes" : "";
    }
  });

  const saveStatusClass = computed(() => {
    switch (saveStatus.value) {
      case "saving": return "text-muted";
      case "saved": return "text-success";
      case "error": return "text-danger";
      default:
        return isDirty.value ? "text-warning" : "text-muted";
    }
  });

  /**
   * Trigger save functionality
   * Validates editor state and calls the onSave callback
   */
  function triggerSave(): void {
    if (!editor.value || disabled.value || saveStatus.value === "saving") {
      return;
    }

    const content = editor.value.getHTML() || "";
    saveStatus.value = "saving";

    // Handle both sync and async save callbacks
    const result = onSave(content);
    if (result instanceof Promise) {
      result
        .then(() => {
          isDirty.value = false;
          saveStatus.value = "saved";
          lastSavedAt.value = new Date();
        })
        .catch((error) => {
          console.error("Save error:", error);
          saveStatus.value = "error";
        });
    } else {
      // Sync callback
      isDirty.value = false;
      saveStatus.value = "saved";
      lastSavedAt.value = new Date();
    }
  }

  /**
   * Setup auto-save on mount
   */
  onMounted(() => {
    if (autoSaveInterval.value && autoSaveInterval.value > 0) {
      autoSaveTimer.value = setInterval(() => {
        if (isDirty.value && !disabled.value) {
          triggerSave();
        }
      }, autoSaveInterval.value * 1000);
    }
  });

  /**
   * Clean up timer on unmount
   */
  onUnmounted(() => {
    if (autoSaveTimer.value) {
      clearInterval(autoSaveTimer.value);
      autoSaveTimer.value = null;
    }
  });

  return {
    saveStatus,
    lastSavedAt,
    isDirty,
    autoSaveTimer,
    saveStatusText,
    saveStatusClass,
    triggerSave,
  };
}
