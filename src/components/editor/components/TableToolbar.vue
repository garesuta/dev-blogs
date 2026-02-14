<!--
  TableToolbar Component

  Appears when cursor is inside a table with table editing options.
  Uses computed properties for active states to prevent unnecessary re-renders.
-->
<script setup lang="ts">
import { computed, type Ref, type ComputedRef } from 'vue';
import type { Editor } from '@tiptap/core';

interface TableToolbarProps {
  editor: Ref<Editor | null>;
  isVisible: Ref<boolean>;
  position: Ref<{ top: number; left: number }>;
}

const props = defineProps<TableToolbarProps>();

// Computed properties for active states
// PERF: Cache results of editor.can() to prevent unnecessary re-evaluation
const canAddRowBefore = computed(() => props.editor.value?.can().addRowBefore() ?? false);
const canAddRowAfter = computed(() => props.editor.value?.can().addRowAfter() ?? false);
const canDeleteRow = computed(() => props.editor.value?.can().deleteRow() ?? false);
const canAddColBefore = computed(() => props.editor.value?.can().addColumnBefore() ?? false);
const canAddColAfter = computed(() => props.editor.value?.can().addColumnAfter() ?? false);
const canDeleteCol = computed(() => props.editor.value?.can().deleteColumn() ?? false);
const canMergeCells = computed(() => props.editor.value?.can().mergeCells() ?? false);
const canSplitCell = computed(() => props.editor.value?.can().splitCell() ?? false);
const canToggleHeader = computed(() => props.editor.value?.can().toggleHeaderRow() ?? false);
const canToggleColumn = computed(() => props.editor.value?.can().toggleHeaderColumn() ?? false);
</script>

<template>
  <Transition name="toolbar-fade">
    <div
      v-if="props.isVisible"
      class="table-toolbar"
      :style="{
        top: `${props.position.value.top}px`,
        left: `${props.position.value.left}px`
      }"
    >
      <!-- Row operations -->
      <div class="toolbar-section">
        <span class="toolbar-label">Row</span>
        <div class="toolbar-buttons">
          <button
            type="button"
            @click="props.editor?.chain().focus().addRowBefore().run()"
            :disabled="!canAddRowBefore"
            title="Add row before"
          >
            <span class="bi-arrow-up-short"></span>
          </button>
          <button
            type="button"
            @click="props.editor?.chain().focus().addRowAfter().run()"
            :disabled="!canAddRowAfter"
            title="Add row after"
          >
            <span class="bi-arrow-down-short"></span>
          </button>
          <button
            type="button"
            @click="props.editor?.chain().focus().deleteRow().run()"
            :disabled="!canDeleteRow"
            title="Delete row"
          >
            <span class="bi-trash"></span>
          </button>
        </div>
      </div>

      <!-- Column operations -->
      <div class="toolbar-section">
        <span class="toolbar-label">Column</span>
        <div class="toolbar-buttons">
          <button
            type="button"
            @click="props.editor?.chain().focus().addColumnBefore().run()"
            :disabled="!canAddColBefore"
            title="Add column before"
          >
            <span class="bi-arrow-left-short"></span>
          </button>
          <button
            type="button"
            @click="props.editor?.chain().focus().addColumnAfter().run()"
            :disabled="!canAddColAfter"
            title="Add column after"
          >
            <span class="bi-arrow-right-short"></span>
          </button>
          <button
            type="button"
            @click="props.editor?.chain().focus().deleteColumn().run()"
            :disabled="!canDeleteCol"
            title="Delete column"
          >
            <span class="bi-trash"></span>
          </button>
        </div>
      </div>

      <!-- Cell operations -->
      <div class="toolbar-section">
        <span class="toolbar-label">Cell</span>
        <div class="toolbar-buttons">
          <button
            type="button"
            @click="props.editor?.chain().focus().mergeCells().run()"
            :disabled="!canMergeCells"
            title="Merge cells"
          >
            <span class="bi-table"></span>
          </button>
          <button
            type="button"
            @click="props.editor?.chain().focus().splitCell().run()"
            :disabled="!canSplitCell"
            title="Split cell"
          >
            <span class="bi-table"></span>
          </button>
        </div>
      </div>

      <!-- Header/Toggle operations -->
      <div class="toolbar-section">
        <span class="toolbar-label">Toggle</span>
        <div class="toolbar-buttons">
          <button
            type="button"
            @click="props.editor?.chain().focus().toggleHeaderRow().run()"
            :disabled="!canToggleHeader"
            title="Toggle header row"
          >
            <span class="bi-table"></span>
          </button>
          <button
            type="button"
            @click="props.editor?.chain().focus().toggleHeaderColumn().run()"
            :disabled="!canToggleColumn"
            title="Toggle header column"
          >
            <span class="bi-table"></span>
          </button>
        </div>
      </div>

      <!-- Delete table -->
      <div class="toolbar-section">
        <button
          type="button"
          @click="props.editor?.chain().focus().deleteTable().run()"
          title="Delete table"
        >
          <span class="bi-trash"></span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.table-toolbar {
  position: fixed;
  z-index: 1001;
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem;
  animation: slide-up 0.15s ease-out;
}

.toolbar-section {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.toolbar-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cyber-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toolbar-buttons {
  display: flex;
  gap: 0.25rem;
}

.toolbar-section button {
  background: transparent;
  border: 1px solid var(--cyber-editor-divider);
  color: var(--cyber-editor-text);
  padding: 0.375rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-section button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--cyber-accent);
}

.toolbar-section button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toolbar-fade-enter-active,
.toolbar-fade-leave-active {
  transition: all 0.15s;
}

.toolbar-fade-enter-from,
.toolbar-fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

.toolbar-fade-leave-from,
.toolbar-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
