<!--
  FloatingToolbar Component

  Appears on text selection with formatting options.
  Uses computed properties for active states to prevent unnecessary re-renders.
-->
<script setup lang="ts">
import type { Ref } from 'vue';

interface FloatingToolbarProps {
  editor: Ref<Editor | null>;
  isVisible: Ref<boolean>;
  position: Ref<{ top: number; left: number }>;
}

const props = defineProps<FloatingToolbarProps>();
const emit = defineEmits<{
  close: [];
}>();

// Computed properties for active states
// PERF: Compute once rather than calling editor.isActive() in template
// This prevents full re-renders on every keystroke
const isBold = computed(() => props.editor.value?.isActive('bold') ?? false);
const isItalic = computed(() => props.editor.value?.isActive('italic') ?? false);
const isStrike = computed(() => props.editor.value?.isActive('strike') ?? false);
const isHeading1 = computed(() => props.editor.value?.isActive('heading', { level: 1 }) ?? false);
const isHeading2 = computed(() => props.editor.value?.isActive('heading', { level: 2 }) ?? false);
const isHeading3 = computed(() => props.editor.value?.isActive('heading', { level: 3 }) ?? false);
const isBulletList = computed(() => props.editor.value?.isActive('bulletList') ?? false);
const isOrderedList = computed(() => props.editor.value?.isActive('orderedList') ?? false);
const isBlockquote = computed(() => props.editor.value?.isActive('blockquote') ?? false);
const isCode = computed(() => props.editor.value?.isActive('codeBlock') ?? false);
const isLink = computed(() => props.editor.value?.isActive('link') ?? false);

import type { Editor } from '@tiptap/core';
</script>

<template>
  <Transition name="toolbar-fade">
    <div
      v-if="props.isVisible"
      class="floating-toolbar"
      :style="{
        top: `${props.position.value.top}px`,
        left: `${props.position.value.left}px`
      }"
    >
      <!-- Text formatting -->
      <div class="toolbar-section">
        <button
          type="button"
          :class="{ 'is-active': isBold }"
          @click="props.editor?.chain().focus().toggleBold().run()"
          title="Bold (Ctrl+B)"
        >
          <span class="bi-type-bold"></span>
        </button>
        <button
          type="button"
          :class="{ 'is-active': isItalic }"
          @click="props.editor?.chain().focus().toggleItalic().run()"
          title="Italic (Ctrl+I)"
        >
          <span class="bi-type-italic"></span>
        </button>
        <button
          type="button"
          :class="{ 'is-active': isStrike }"
          @click="props.editor?.chain().focus().toggleStrike().run()"
          title="Strikethrough (Ctrl+Shift+S)"
        >
          <span class="bi-type-strikethrough"></span>
        </button>
      </div>

      <!-- Headings -->
      <div class="toolbar-section">
        <button
          type="button"
          :class="{ 'is-active': isHeading1 }"
          @click="props.editor?.chain().focus().toggleHeading({ level: 1 }).run()"
          title="Heading 1 (Ctrl+Alt+1)"
        >
          <span class="bi-type-h1"></span>
        </button>
        <button
          type="button"
          :class="{ 'is-active': isHeading2 }"
          @click="props.editor?.chain().focus().toggleHeading({ level: 2 }).run()"
          title="Heading 2 (Ctrl+Alt+2)"
        >
          <span class="bi-type-h2"></span>
        </button>
        <button
          type="button"
          :class="{ 'is-active': isHeading3 }"
          @click="props.editor?.chain().focus().toggleHeading({ level: 3 }).run()"
          title="Heading 3 (Ctrl+Alt+3)"
        >
          <span class="bi-type-h3"></span>
        </button>
      </div>

      <!-- Lists -->
      <div class="toolbar-section">
        <button
          type="button"
          :class="{ 'is-active': isBulletList }"
          @click="props.editor?.chain().focus().toggleBulletList().run()"
          title="Bullet List (Ctrl+Shift+8)"
        >
          <span class="bi-list-ul"></span>
        </button>
        <button
          type="button"
          :class="{ 'is-active': isOrderedList }"
          @click="props.editor?.chain().focus().toggleOrderedList().run()"
          title="Numbered List (Ctrl+Shift+7)"
        >
          <span class="bi-list-ol"></span>
        </button>
        <button
          type="button"
          :class="{ 'is-active': isBlockquote }"
          @click="props.editor?.chain().focus().toggleBlockquote().run()"
          title="Quote (Ctrl+Shift+9)"
        >
          <span class="bi-quote"></span>
        </button>
      </div>

      <!-- Blocks -->
      <div class="toolbar-section">
        <button
          type="button"
          :class="{ 'is-active': isCode }"
          @click="props.editor?.chain().focus().toggleCodeBlock().run()"
          title="Code Block (Ctrl+Shift+C)"
        >
          <span class="bi-code-square"></span>
        </button>
        <button
          type="button"
          @click="props.editor?.chain().focus().setHorizontalRule().run()"
          title="Horizontal Rule (Ctrl+Shift+H)"
        >
          <span class="bi-hr"></span>
        </button>
      </div>

      <!-- Link -->
      <div class="toolbar-section">
        <button
          type="button"
          :class="{ 'is-active': isLink }"
          @click="props.editor?.chain().focus().unsetLink().run()"
          title="Remove Link"
        >
          <span class="bi-link-break"></span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.floating-toolbar {
  position: fixed;
  z-index: 1000;
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  gap: 0.25rem;
  padding: 0.375rem;
  animation: slide-up 0.15s ease-out;
}

.toolbar-section {
  display: flex;
  gap: 0.25rem;
  padding-right: 0.5rem;
  border-right: 1px solid var(--cyber-editor-divider);
}

.toolbar-section:last-child {
  border-right: none;
}

.toolbar-section button {
  background: transparent;
  border: none;
  color: var(--cyber-editor-text);
  padding: 0.375rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.toolbar-section button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.toolbar-section button.is-active {
  background: rgba(0, 255, 255, 0.2);
  color: var(--cyber-accent);
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
