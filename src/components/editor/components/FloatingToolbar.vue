<!--
  FloatingToolbar Component

  Appears on text selection with formatting options.
  Uses computed properties for active states to prevent unnecessary re-renders.
-->
<script setup lang="ts">
import { computed, type Ref } from 'vue';
import type { Editor } from '@tiptap/core';

interface FloatingToolbarProps {
  editor: Ref<Editor | null>;
  isVisible: Ref<boolean>;
  position: Ref<{ top: number; left: number }>;
}

// Type assertion for Tiptap Editor - it has chain() method but type definitions are incomplete
type TiptapEditor = Editor & { chain(): any };

const props = defineProps<FloatingToolbarProps>();
const emit = defineEmits<{
  close: () => void;
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
          title="Bold (Ctrl+B)"
          @click="props.editor?.chain().focus().toggleBold().run()"
        >
          <span class="bi-type-bold" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': isItalic }"
          title="Italic (Ctrl+I)"
          @click="props.editor?.chain().focus().toggleItalic().run()"
        >
          <span class="bi-type-italic" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': isStrike }"
          title="Strikethrough (Ctrl+Shift+S)"
          @click="props.editor?.chain().focus().toggleStrike().run()"
        >
          <span class="bi-type-strikethrough" />
        </button>
      </div>

      <!-- Headings -->
      <div class="toolbar-section">
        <button
          type="button"
          :class="{ 'is-active': isHeading1 }"
          title="Heading 1 (Ctrl+Alt+1)"
          @click="props.editor?.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <span class="bi-type-h1" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': isHeading2 }"
          title="Heading 2 (Ctrl+Alt+2)"
          @click="props.editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <span class="bi-type-h2" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': isHeading3 }"
          title="Heading 3 (Ctrl+Alt+3)"
          @click="props.editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <span class="bi-type-h3" />
        </button>
      </div>

      <!-- Lists -->
      <div class="toolbar-section">
        <button
          type="button"
          :class="{ 'is-active': isBulletList }"
          title="Bullet List (Ctrl+Shift+8)"
          @click="props.editor?.chain().focus().toggleBulletList().run()"
        >
          <span class="bi-list-ul" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': isOrderedList }"
          title="Numbered List (Ctrl+Shift+7)"
          @click="props.editor?.chain().focus().toggleOrderedList().run()"
        >
          <span class="bi-list-ol" />
        </button>
        <button
          type="button"
          :class="{ 'is-active': isBlockquote }"
          title="Quote (Ctrl+Shift+9)"
          @click="props.editor?.chain().focus().toggleBlockquote().run()"
        >
          <span class="bi-quote" />
        </button>
      </div>

      <!-- Blocks -->
      <div class="toolbar-section">
        <button
          type="button"
          :class="{ 'is-active': isCode }"
          title="Code Block (Ctrl+Shift+C)"
          @click="props.editor?.chain().focus().toggleCodeBlock().run()"
        >
          <span class="bi-code-square" />
        </button>
        <button
          type="button"
          title="Horizontal Rule (Ctrl+Shift+H)"
          @click="props.editor?.chain().focus().setHorizontalRule().run()"
        >
          <span class="bi-hr" />
        </button>
      </div>

      <!-- Link -->
      <div class="toolbar-section">
        <button
          type="button"
          :class="{ 'is-active': isLink }"
          title="Remove Link"
          @click="props.editor?.chain().focus().unsetLink().run()"
        >
          <span class="bi-link-break" />
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
