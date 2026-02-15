<!--
  TiptapEditor Component

  Main Notion-style rich text editor with slash commands,
  block manipulation, image upload, and table of contents.

  Architecture: Modular composition using:
  - Extensions from ./editor/extensions
  - Composables from ../composables/editor
  - Sub-components from ./editor/components
-->
<script setup lang="ts">
import { computed, watch } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import type { Editor } from "@tiptap/core";
import { common, createLowlight } from "lowlight";

// Custom extensions
import {
  Figure,
  Figcaption,
  TableOfContents,
  SlashCommandsExtension,
} from "./editor/extensions";

// Standard Tiptap extensions (re-exported from extensions/index)
import {
  StarterKit,
  Heading,
  Image,
  Link,
  Placeholder,
  CodeBlockLowlight,
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "./editor/extensions";

// Composables
import {
  useEditorState,
  useSlashMenu,
  useToolbarPositioning,
  useImageUpload,
  useTocGeneration,
  useBlockManipulation,
  useLinkModal,
} from "../composables/editor";

// Sub-components
import BlockHandle from "./editor/components/BlockHandle.vue";
import FloatingToolbar from "./editor/components/FloatingToolbar.vue";
import SaveStatusBar from "./editor/components/SaveStatusBar.vue";
import TableToolbar from "./editor/components/TableToolbar.vue";
import SlashMenu from "./editor/components/SlashMenu.vue";
import LinkModal from "./editor/components/LinkModal.vue";
import BlockOptions from "./editor/components/BlockOptions.vue";

// Props
const props = defineProps<{
  modelValue: string;
  postId?: string | null;
  placeholder?: string;
  height?: string;
  autoSaveInterval?: number;
  disabled?: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "save", content: string): void;
}>();

// Create lowlight instance for code highlighting
const lowlight = createLowlight(common);

// Initialize Tiptap editor
const editor = useEditor({
  content: props.modelValue || "",
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      heading: false,
    }),
    Heading.extend({
      addAttributes() {
        return {
          ...this.parent?.(),
          id: {
            default: null,
            parseHTML: element => element.getAttribute('id'),
            renderHTML: attributes => {
              if (!attributes.id) return {};
              return { id: attributes.id };
            },
          },
        };
      },
    }).configure({
      levels: [1, 2, 3, 4],
    }),
    Image.configure({
      allowBase64: false,
      HTMLAttributes: { class: "img-fluid rounded my-3" },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: "text-primary", rel: "noopener noreferrer", target: "_blank" },
    }),
    Placeholder.configure({
      placeholder: props.placeholder || "Type '/' for commands...",
    }),
    CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: { class: "code-block" },
    }),
    Table.configure({ resizable: true, HTMLAttributes: { class: "table table-bordered" } }),
    TableRow,
    TableCell.configure({ HTMLAttributes: { class: "border" } }),
    TableHeader.configure({ HTMLAttributes: { class: "border bg-light fw-bold" } }),
    Figure,
    Figcaption,
    TableOfContents,
    SlashCommandsExtension,
  ],
  editorProps: {
    attributes: { class: "notion-editor-content" },
    handleKeyDown: (view, event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        editorState.triggerSave();
        return true;
      }
      return false;
    },
    handleClick: (view, pos, event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[data-toc-link]') || target.closest('a[href^="#"]');
      if (!link || !editor) return false;

      const href = link.getAttribute('href');
      const tocLink = link.getAttribute('data-toc-link');
      const headingId = tocLink || (href?.startsWith('#') ? href.slice(1) : null);

      if (!headingId) return false;

      event.preventDefault();
      event.stopPropagation();
      tocGeneration.handleLinkClick(event as MouseEvent);
      return true;
    },
    handleDrop: (view, event, slice, moved) => {
      if (!moved && event.dataTransfer?.files) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          event.preventDefault();
          imageUpload.handleImageUpload(file);
          return true;
        }
      }
      return false;
    },
    handlePaste: (view, event) => {
      const items = event.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) imageUpload.handleImageUpload(file);
            return true;
          }
        }
      }
      return false;
    },
  },
  onUpdate: ({ editor: ed }) => {
    const content = ed.getHTML();
    emit("update:modelValue", content);
    editorState.isDirty.value = true;
    editorState.saveStatus.value = "idle";
  },
  onSelectionUpdate: ({ editor: ed }) => {
    // TOC link handling
    if (slashMenu.show.value) {
      const { state } = ed;
      const { selection } = state;
      const { $from } = selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      if (!textBefore.includes("/")) {
        slashMenu.close();
      }
    }
  },
});

// Editor computed for composables
const editorComputed = computed(() => editor);

// Use composables
const editorState = useEditorState({
  editor: editorComputed,
  disabled: computed(() => !!props.disabled),
  autoSaveInterval: computed(() => props.autoSaveInterval ?? 0),
  onSave: (content: string) => emit("save", content),
});

const slashMenu = useSlashMenu({
  editor: editorComputed,
  onCommandExecuted: () => {
    editorState.isDirty.value = true;
  },
});

const toolbarPositioning = useToolbarPositioning({
  editor: editorComputed,
});

const imageUpload = useImageUpload({
  editor: editorComputed,
  postId: props.postId || null,
});

const tocGeneration = useTocGeneration({
  editor: editorComputed,
});

const blockManipulation = useBlockManipulation({
  editor: editorComputed,
  onCommandExecuted: () => {
    editorState.isDirty.value = true;
  },
});

const linkModal = useLinkModal({
  editor: editorComputed,
});

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (editor) {
    const currentValue = editor.getHTML();
    if (newValue !== currentValue) {
      editor.commands.setContent(newValue || "", false);
    }
  }
});

// Exposed methods
defineExpose({
  getContent: () => editor?.getHTML() || "",
  setContent: (content: string) => editor?.commands.setContent(content),
  focus: () => editor?.commands.focus(),
  triggerSave: editorState.triggerSave,
});
</script>

<template>
  <div class="notion-editor" :class="{ disabled: disabled }">
    <!-- Save status bar -->
    <SaveStatusBar
      :save-status="editorState.saveStatus"
      :last-saved-at="editorState.lastSavedAt"
      :is-dirty="editorState.isDirty"
    />

    <!-- Floating toolbar (appears on text selection) -->
    <FloatingToolbar
      :editor="editorComputed"
      :is-visible="toolbarPositioning.showFloating"
      :position="toolbarPositioning.floatingPosition"
    />

    <!-- Table toolbar (appears when cursor is in table) -->
    <TableToolbar
      :editor="editorComputed"
      :is-visible="toolbarPositioning.showTable"
      :position="toolbarPositioning.tablePosition"
    />

    <!-- Editor content with block handle -->
    <div
      ref="blockManipulation.editorWrapperRef"
      class="notion-content-wrapper"
      :style="{ minHeight: height || '400px' }"
      @mousemove="blockManipulation.handleEditorMouseMove"
      @mouseleave="blockManipulation.handleEditorMouseLeave"
    >
      <!-- Block handle (+ and ⋮ buttons) -->
      <BlockHandle
        :is-visible="blockManipulation.showHandle"
        :position="blockManipulation.handlePosition"
        @add-block="blockManipulation.turnInto('paragraph')"
        @toggle-options="blockManipulation.showOptions = !blockManipulation.showOptions"
      />

      <!-- Block options dropdown -->
      <BlockOptions
        :is-visible="blockManipulation.showOptions"
        :current-block-pos="blockManipulation.currentBlockPos"
        :editor="editorComputed"
        @delete="blockManipulation.deleteBlock"
        @duplicate="blockManipulation.duplicateBlock"
        @turn-into="blockManipulation.turnInto"
        @insert-image="imageUpload.openImageUpload"
        @insert-table="blockManipulation.insertTable"
        @insert-divider="blockManipulation.insertDivider"
        @insert-toc="tocGeneration.insertBlock"
        @close="blockManipulation.closeOptions"
      />

      <EditorContent :editor="editor" />
    </div>

    <!-- Slash Command Menu -->
    <SlashMenu
      :items="slashMenu.filteredCommands"
      :is-visible="slashMenu.show"
      :position="slashMenu.position"
      :selected-index="slashMenu.selectedIndex"
      @select="slashMenu.executeCommand"
      @hover="(idx: number) => slashMenu.selectedIndex = idx"
      @close="slashMenu.close"
    />

    <!-- Hidden file input for image upload -->
    <input
      ref="imageUpload.fileInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="imageUpload.handleFileInputChange"
    />

    <!-- Link Modal -->
    <div v-if="linkModal.show" class="modal-backdrop fade show"></div>
    <div v-if="linkModal.show" class="modal fade show d-block" tabindex="-1" @click.self="linkModal.close">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header py-2">
            <h6 class="modal-title">Insert Link</h6>
            <button type="button" class="btn-close btn-close-sm" @click="linkModal.close"></button>
          </div>
          <div class="modal-body py-2">
            <input
              type="url"
              class="form-control form-control-sm"
              :value="linkModal.url.value"
              @input="linkModal.url.value = ($event.target as HTMLInputElement).value"
              placeholder="https://example.com"
              @keydown.enter="linkModal.setLink(linkModal.url.value)"
              autofocus
            />
          </div>
          <div class="modal-footer py-2">
            <button v-if="editor?.isActive('link')" type="button" class="btn btn-sm btn-outline-danger me-auto" @click="linkModal.removeLink">
              Remove
            </button>
            <button type="button" class="btn btn-sm btn-secondary" @click="linkModal.close">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" @click="linkModal.setLink(linkModal.url.value)">
              {{ editor?.isActive('link') ? 'Update' : 'Insert' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Notion-like Editor Styles */
.notion-editor {
  background: var(--cyber-editor-bg);
  border-radius: 0.5rem;
  overflow: hidden;
}

.notion-editor.disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Content wrapper */
.notion-content-wrapper {
  overflow-y: auto;
  position: relative;
  padding-left: 56px;
}

/* Main editor content */
.notion-editor-content {
  padding: 1.5rem 2rem 1.5rem 0;
  outline: none;
  min-height: 100%;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--cyber-editor-text);
}

.notion-editor-content:focus {
  outline: none;
}

/* Placeholder */
.notion-editor-content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--cyber-editor-text-muted);
  pointer-events: none;
  height: 0;
}

/* Typography - Notion style */
.notion-editor-content h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.notion-editor-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.75rem;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.notion-editor-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.25rem;
  line-height: 1.3;
}

.notion-editor-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.25rem;
}

.notion-editor-content p {
  margin-bottom: 0.5rem;
}

/* Figure with caption */
.notion-editor-content .image-figure {
  position: relative;
}

.notion-editor-content .figure-caption {
  transition: border-color 0.2s, background-color 0.2s;
}

.notion-editor-content .figure-caption:hover {
  border-color: var(--cyber-neutral-400);
  background-color: var(--cyber-bg-tertiary);
}

.notion-editor-content .figure-caption:focus-within {
  border-color: var(--cyber-primary);
  border-style: solid;
  background-color: var(--cyber-editor-bg);
  outline: none;
}

.notion-editor-content .figure-caption:empty::before {
  content: 'Click to add caption...';
  color: var(--cyber-neutral-400);
  font-style: italic;
  pointer-events: none;
}

.notion-editor-content .figure-caption:focus:empty::before {
  content: 'Type your caption here...';
}

/* Lists */
.notion-editor-content ul,
.notion-editor-content ol {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}

.notion-editor-content li {
  margin-bottom: 0.125rem;
}

.notion-editor-content li p {
  margin-bottom: 0;
}

/* Blockquote */
.notion-editor-content blockquote {
  border-left: 3px solid var(--cyber-editor-text);
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: var(--cyber-editor-text);
}

/* Code */
.notion-editor-content code {
  background-color: var(--cyber-editor-highlight);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.85em;
  color: var(--cyber-editor-code-text);
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
}

.notion-editor-content pre {
  background-color: var(--cyber-bg-tertiary);
  color: var(--cyber-editor-text);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0.5rem 0;
  font-size: 0.85rem;
}

.notion-editor-content pre code {
  background: none;
  padding: 0;
  color: inherit;
}

/* Syntax highlighting */
.notion-editor-content pre .hljs-keyword { color: #0550ae; }
.notion-editor-content pre .hljs-string { color: #0a3069; }
.notion-editor-content pre .hljs-number { color: #0550ae; }
.notion-editor-content pre .hljs-comment { color: #6e7781; }
.notion-editor-content pre .hljs-function { color: #8250df; }
.notion-editor-content pre .hljs-class { color: #953800; }
.notion-editor-content pre .hljs-variable { color: #24292f; }

/* Links */
.notion-editor-content a {
  color: var(--cyber-editor-text);
  text-decoration: underline;
  text-decoration-color: rgba(55, 53, 47, 0.4);
  transition: text-decoration-color 0.15s;
}

.notion-editor-content a:hover {
  text-decoration-color: var(--cyber-editor-text);
}

/* Images */
.notion-editor-content img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1rem 0;
  border-radius: 4px;
}

/* Tables */
.notion-editor-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.notion-editor-content th,
.notion-editor-content td {
  border: 1px solid var(--cyber-editor-divider);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.notion-editor-content th {
  background-color: var(--cyber-bg-tertiary);
  font-weight: 500;
}

/* Horizontal rule */
.notion-editor-content hr {
  border: none;
  border-top: 1px solid var(--cyber-editor-divider);
  margin: 1.5rem 0;
}

/* Table of Contents Block */
.notion-editor-content .toc-block {
  background: var(--cyber-bg-tertiary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1rem 0;
}

.notion-editor-content .toc-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: var(--cyber-editor-text);
}

.notion-editor-content .toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notion-editor-content .toc-list li {
  padding: 0.35rem 0;
  font-size: 0.9rem;
  position: relative;
  display: flex;
  align-items: center;
}

.notion-editor-content .toc-list li::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyber-editor-text-muted);
  margin-right: 10px;
  flex-shrink: 0;
}

/* Level-based indentation and styling */
.notion-editor-content .toc-list .toc-level-0 {
  padding-left: 0;
}

.notion-editor-content .toc-list .toc-level-0::before {
  width: 8px;
  height: 8px;
  background: var(--cyber-editor-text);
}

.notion-editor-content .toc-list .toc-level-0 a {
  font-weight: 600;
  font-size: 0.95rem;
}

.notion-editor-content .toc-list .toc-level-1 {
  padding-left: 1.25rem;
}

.notion-editor-content .toc-list .toc-level-1::before {
  width: 6px;
  height: 6px;
  background: var(--cyber-text-muted);
}

.notion-editor-content .toc-list .toc-level-1 a {
  font-weight: 500;
  font-size: 0.9rem;
}

.notion-editor-content .toc-list .toc-level-2 {
  padding-left: 2.5rem;
}

.notion-editor-content .toc-list .toc-level-2::before {
  width: 5px;
  height: 5px;
  background: var(--cyber-editor-text-muted);
}

.notion-editor-content .toc-list .toc-level-2 a {
  font-weight: 400;
  font-size: 0.875rem;
  color: var(--cyber-text-muted);
}

.notion-editor-content .toc-list .toc-level-3 {
  padding-left: 3.75rem;
}

.notion-editor-content .toc-list .toc-level-3::before {
  width: 4px;
  height: 4px;
  background: var(--cyber-neutral-300);
}

.notion-editor-content .toc-list .toc-level-3 a {
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--cyber-text-muted);
}

.notion-editor-content .toc-list a {
  color: var(--cyber-editor-text);
  text-decoration: none;
  transition: color 0.15s;
  cursor: pointer;
}

.notion-editor-content .toc-list a:hover {
  color: var(--cyber-editor-link);
  text-decoration: underline;
}

.notion-editor-content .toc-placeholder {
  background: var(--cyber-warning-bg);
  border: 1px solid #f59e0b;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: var(--cyber-warning-text);
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .notion-content-wrapper {
    padding-left: 40px;
  }

  .notion-editor-content {
    padding: 1rem 1rem 1rem 0;
  }
}
</style>
