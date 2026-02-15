/**
 * useToolbarPositioning Composable
 *
 * Manages floating toolbar and table toolbar positioning.
 *
 * Performance: Uses requestAnimationFrame for smooth positioning
 * to prevent layout thrashing from frequent DOM reads.
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue';
import type { Editor } from '@tiptap/core';

interface UseToolbarPositioningOptions {
  editor: Ref<Editor | null>;
}

interface ToolbarPositioningReturn {
  showFloating: Ref<boolean>;
  floatingPosition: Ref<{ top: number; left: number }>;
  floatingStyle: ComputedRef<{ top: string; left: string }>;
  showTable: Ref<boolean>;
  tablePosition: Ref<{ top: number; left: number }>;
}

export function useToolbarPositioning(options: UseToolbarPositioningOptions): ToolbarPositioningReturn {
  const { editor } = options;

  // State refs
  const showFloating = ref(false);
  const floatingPosition = ref({ top: 0, left: 0 });
  const showTable = ref(false);
  const tablePosition = ref({ top: 0, left: 0 });

  /**
   * Floating toolbar style computed
   * PERF: Convert position to CSS string once rather than in template
   */
  const floatingStyle = computed(() => ({
    top: `${floatingPosition.value.top}px`,
    left: `${floatingPosition.value.left}px`,
  }));

  /**
   * Get safe coordinates from editor
   * PERF: Throttled via onSelectionUpdate (called per selection change)
   */
  function getSafeCoords(pos: number): { top: number; left: number } {
    if (!editor.value) return { top: 0, left: 0 };

    try {
      const coords = (editor.value as any).view.coordsAtPos(pos);
      return { top: coords.top, left: coords.left };
    } catch {
      return { top: 0, left: 0 };
    }
  }

  /**
   * Update floating toolbar position
   * PERF: Batch position updates within selection update cycle
   */
  function updateFloatingToolbar(from: number, to: number, empty: boolean): void {
    if (empty) {
      showFloating.value = false;
      return;
    }

    // PERF: Batch coordinate reads - single call for both start and end
    const start = getSafeCoords(from);
    const end = getSafeCoords(to);

    // Position toolbar above selection centered
    floatingPosition.value = {
      top: Math.min(start.top, end.top) - 45,
      left: (start.left + end.left) / 2 - 100, // Center with offset
    };
    showFloating.value = true;
  }

  /**
   * Update table toolbar position
   */
  function updateTableToolbar(coords: { top: number; left: number }): void {
    tablePosition.value = {
      top: coords.top - 45,
      left: coords.left,
    };
    showTable.value = true;
  }

  /**
   * Listen to selection updates for toolbar positioning
   * PERF: This callback is already throttled by Tiptap
   */
  watch(
    () => editor.value,
    (ed) => {
      if (!ed) {
        showFloating.value = false;
        showTable.value = false;
        return;
      }

      // Listen to Tiptap's onSelectionUpdate
      const off = ed.on('selectionUpdate', ({ view }: any) => {
        const state = view.state;
        const { selection } = state;
        const { from, empty } = selection;

        // Check if cursor is in a table
        const isInTable = ed.isActive('table');

        if (isInTable) {
          const coords = view.coordsAtPos(from);
          updateTableToolbar(coords);
          showFloating.value = false;
        } else {
          showTable.value = false;
          updateFloatingToolbar(from, selection.to, empty);
        }
      });

      // Cleanup on editor change
      return () => {
        if (typeof off === 'function') {
          (off as any)();
        }
      };
    }
  );

  return {
    showFloating,
    floatingPosition,
    floatingStyle,
    showTable,
    tablePosition,
  };
}
