<!--
  BlockOptions Component

  Displays options for manipulating a block (delete, duplicate, turn into, etc.).
  Appears below the block handle when ⋮ is clicked.
-->
<script setup lang="ts">
import type { Ref } from 'vue';
import type { Editor } from '@tiptap/core';

interface BlockOptionsProps {
  isVisible: Ref<boolean>;
  currentBlockPos: Ref<number | null>;
  editor: Ref<Editor | null>;
}

const props = defineProps<BlockOptionsProps>();

const emit = defineEmits(['delete', 'duplicate', 'turnInto', 'insertImage', 'insertTable', 'insertDivider', 'insertToc', 'close']);

const blockTypes = [
  { id: 'paragraph', label: 'Text', icon: 'bi-type-paragraph' },
  { id: 'heading1', label: 'Heading 1', icon: 'bi-type-h1' },
  { id: 'heading2', label: 'Heading 2', icon: 'bi-type-h2' },
  { id: 'heading3', label: 'Heading 3', icon: 'bi-type-h3' },
  { id: 'bulletList', label: 'Bullet List', icon: 'bi-list-ul' },
  { id: 'orderedList', label: 'Numbered List', icon: 'bi-list-ol' },
  { id: 'blockquote', label: 'Quote', icon: 'bi-quote' },
  { id: 'codeBlock', label: 'Code Block', icon: 'bi-code-square' },
  { id: 'divider', label: 'Divider', icon: 'bi-hr' },
];
</script>

<template>
  <Teleport to="body">
    <Transition name="block-options-fade">
      <div
        v-if="props.isVisible.value"
        class="block-options-backdrop"
        @click.self="emit('close')"
      >
        <div class="block-options" @click.stop>
          <div class="block-options-header">Turn into</div>

          <div class="block-options-grid">
            <button
              v-for="type in blockTypes"
              :key="type.id"
              type="button"
              class="block-option"
              @click="emit('turnInto', type.id)"
            >
              <span :class="type.icon"></span>
              <span>{{ type.label }}</span>
            </button>
          </div>

          <div class="block-options-header">Insert</div>

          <div class="block-options-grid">
            <button
              type="button"
              class="block-option"
              @click="emit('insertImage')"
            >
              <span class="bi-image"></span>
              <span>Image</span>
            </button>
            <button
              type="button"
              class="block-option"
              @click="emit('insertTable')"
            >
              <span class="bi-table"></span>
              <span>Table</span>
            </button>
            <button
              type="button"
              class="block-option"
              @click="emit('insertDivider')"
            >
              <span class="bi-hr"></span>
              <span>Divider</span>
            </button>
            <button
              type="button"
              class="block-option"
              @click="emit('insertToc')"
            >
              <span class="bi-list-nested"></span>
              <span>Table of Contents</span>
            </button>
          </div>

          <div class="block-options-header">Actions</div>

          <div class="block-options-grid">
            <button
              type="button"
              class="block-option block-option-danger"
              @click="emit('delete')"
            >
              <span class="bi-trash"></span>
              <span>Delete Block</span>
            </button>
            <button
              type="button"
              class="block-option"
              @click="emit('duplicate')"
            >
              <span class="bi-copy"></span>
              <span>Duplicate</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.block-options-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.block-options {
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 280px;
  padding: 1rem;
}

.block-options-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cyber-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.block-options-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.block-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 4px;
  background: transparent;
  color: var(--cyber-editor-text);
  cursor: pointer;
  transition: all 0.15s;
}

.block-option:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--cyber-accent);
}

.block-option-danger {
  color: var(--cyber-danger);
}

.block-option-danger:hover {
  background: var(--cyber-danger);
  color: white;
  border-color: var(--cyber-danger);
}

@keyframes block-options-fade {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.block-options-fade-enter-active,
.block-options-fade-leave-active {
  transition: all 0.15s ease-out;
}

.block-options-fade-enter-from,
.block-options-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.block-options-fade-leave-from,
.block-options-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
