<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import { common, createLowlight } from "lowlight";
import { mergeAttributes } from "@tiptap/core";

// Extensions
import {
  Figure,
  Figcaption,
  TableOfContents,
  SlashCommandsExtension,
  DEFAULT_SLASH_COMMANDS,
  filterSlashCommands,
  getSlashMenuState,
  updateSlashMenuState,
  resetSlashMenuState,
  type SlashCommandItem,
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

// Utils
import { generateHeadingId } from "../../lib/editor-utils/heading-id";

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

// Use composables
const {
  saveStatus,
  lastSavedAt,
  isDirty,
  saveStatusText,
  saveStatusClass,
  triggerSave,
} = useEditorState({
  editor: computed(() => editor.value || null),
  disabled: computed(() => props.disabled ?? false),
  autoSaveInterval: computed(() => props.autoSaveInterval || 30),
  onSave: (content: string) => emit("save", content),
});

const {
  showSlashMenu,
  slashMenuPosition,
  query,
  selectedIndex,
  filteredCommands,
  closeSlashMenu,
  executeSlashCommand,
} = useSlashMenu({
  editor: computed(() => editor.value || null),
  onCommandExecuted: () => {
    // After executing command, trigger save with timeout to let user know something changed
    setTimeout(() => triggerSave(), 500);
  },
});

const {
  showFloatingToolbar,
  floatingStyle,
  showTable,
  tablePosition,
} = useToolbarPositioning({
  editor: computed(() => editor.value || null),
});

const {
  fileInputRef,
  handleImageUpload,
  openImageUpload,
} = useImageUpload({
  editor: computed(() => editor.value || null),
  postId: computed(() => props.postId ?? null),
});

const {
  showToc,
  items,
  update,
  insertBlock,
  handleLinkClick,
  scrollToHeading,
  close,
} = useTocGeneration({
  editor: computed(() => editor.value || null),
});

const {
  isValidUrl,
} = useLinkModal();

const {
  showBlockHandle,
  handlePosition,
  currentBlockPos,
  showOptions,
  isHoveringHandle,
  closeOptions,
  deleteBlock,
  duplicateBlock,
  turnInto,
  insertImage,
  insertTable,
  insertDivider,
  insertToc,
} = useBlockManipulation({
  editor: computed(() => editor.value || null),
});

const {
  show,
  url,
  open,
  setLink,
  removeLink,
} = useLinkModal();

const {
  show,
  url,
  open,
  setLink,
  removeLink,
  isValidUrl,
} = useLinkModal();

// Sub-components
import SaveStatusBar from "./editor/components/SaveStatusBar.vue";
import FloatingToolbar from "./editor/components/FloatingToolbar.vue";
import TableToolbar from "./editor/components/TableToolbar.vue";
import SlashMenu from "./editor/components/SlashMenu.vue";
import LinkModal from "./editor/components/LinkModal.vue";
import BlockHandle from "./editor/components/BlockHandle.vue";
import BlockOptions from "./editor/components/BlockOptions.vue";

// Create lowlight instance
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
      // Save shortcut (Ctrl+S)
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        triggerSave();
        return true;
      }
      return false;
    },
    handleClick: (view, pos, event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[data-toc-link]') || target.closest('a[href^="#"]');
      if (link) {
        const href = link.getAttribute('href');
        const tocLink = link.getAttribute('data-toc-link');
        const headingId = tocLink || (href?.startsWith('#') ? href.slice(1) : null);

        if (headingId) {
          event.preventDefault();
          event.stopPropagation();

          // Find the heading with this ID
          let targetPos: number | null = null;
          editor.value.state.doc.descendants((node, nodePos) => {
            if (node.type.name === 'heading' && node.attrs.id === headingId) {
              targetPos = nodePos;
              return false; // Stop traversal
            }
          });

          if (targetPos !== null) {
            // Focus and scroll to: heading
            editor.value.chain().focus().setTextSelection(targetPos + 1).run();

            // Scroll to: heading into view
            const { view } = editor.value;
            const coords = view.coordsAtPos(targetPos);
            const editorWrapper = document.querySelector('.notion-content-wrapper');
            if (editorWrapper) {
              const wrapperRect = editorWrapper.getBoundingClientRect();
              editorWrapper.scrollTo({
                top: editorWrapper.scrollTop + (coords.top - wrapperRect.top) - 20,
                behavior: 'smooth',
              });
            }
          }
        }
      }
    },
    handleDrop: (view, event, slice, moved) => {
      if (!moved && event.dataTransfer?.files.length) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          event.preventDefault();
          handleImageUpload(file);
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
            if (file) handleImageUpload(file);
          }
        }
      }
      return false;
    },
    onUpdate: ({ editor: ed }) => {
      const content = ed.getHTML();
      emit("update:modelValue", content);
      isDirty.value = true;
      saveStatus.value = "idle";

      // Update slash menu
      if (showSlashMenu) {
        const { state } = ed;
        const { selection } = state;
        const { $from } = selection;
        const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
        const slashIndex = textBefore.lastIndexOf("/");
        if (slashIndex >= 0) {
          slashMenuQuery.value = textBefore.slice(slashIndex + 1);
          selectedSlashIndex.value = 0;
        } else {
          closeSlashMenu();
        }
      }

      // Check if cursor is in a table
      const isInTable = ed.isActive('table');
      if (isInTable) {
        const { view } = ed;
        const { from } = ed.state.selection;
        tablePosition.value = {
          top: view.coordsAtPos(from).top - 45,
          left: view.coordsAtPos(from).left,
        };
        showTable.value = true;
      } else {
        showTable.value = false;
      }

      // Show floating toolbar on text selection
      const { state, view } = ed;
      const { selection } = state;
      const { from, to, empty } = selection;

      if (empty) {
        showFloatingToolbar.value = false;
        return;
      }

      // Get selection coordinates
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      // Position toolbar above selection centered
      floatingStyle.value = {
        top: `${Math.min(start.top, end.top) - 45}px`,
        left: `${(start.left + end.left) / 2 - 100}px`,
      };
      showFloatingToolbar.value = true;
    },
  },
  onMounted(() => {
    // Add click outside listener
    document.addEventListener('click', handleClickOutside);
  });
  },
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
});

// Exposed methods for parent component
defineExpose({
  getContent: () => editor.value?.getHTML() || "",
  setContent: (content: string) => editor.value?.commands.setContent(content),
  focus: () => editor.value?.commands.focus(),
  triggerSave,
});
</script>

<template>
  <div class="notion-editor" :class="{ disabled: disabled }">
    <!-- Save Status Bar -->
    <SaveStatusBar
      :save-status="saveStatus"
      :last-saved-at="lastSavedAt"
      :is-dirty="isDirty"
    />

    <!-- Editor Content -->
    <div ref="editorWrapperRef">
      <EditorContent :editor="editor" />
    </div>

    <!-- Floating Toolbar -->
    <Teleport to="body">
      <FloatingToolbar
        :editor="editor"
        :is-visible="showFloatingToolbar"
        :position="floatingPosition"
        @close="closeFloatingToolbar"
      />
    </Teleport>

    <!-- Table Toolbar -->
    <Teleport to="body">
      <TableToolbar
        :editor="editor"
        :is-visible="showTable"
        :position="tablePosition"
        @close="closeTableToolbar"
      />
    </Teleport>

    <!-- Slash Command Menu -->
    <Teleport to="body">
      <SlashMenu
        :editor="editor"
        :items="filteredCommands"
        :is-visible="showSlashMenu"
        :position="slashMenuPosition"
        :selected-index="selectedIndex"
        @select="executeSlashCommand"
        @close="closeSlashMenu"
        :filter-query="query"
        @keydown="handleSlashMenuKeydown"
      />
    </Teleport>

    <!-- Block Handle -->
    <BlockHandle
        :editor="editor"
        :is-visible="showBlockHandle"
        :position="{ top: handlePosition.top + 'px' }"
        @add-block="handleAddBlockClick"
        @toggle-options="toggleBlockOptionsClick"
      />

    <!-- Block Options Menu -->
    <Teleport to="body">
      <BlockOptions
        :editor="editor"
        :is-visible="showOptions"
        :current-block-pos="currentBlockPos"
        :delete="handleDeleteBlockClick"
        :duplicate="handleDuplicateBlockClick"
        :turn-into="handleTurnIntoClick"
        :insert-image="handleInsertImageClick"
        :insert-table="handleInsertTableClick"
        :insert-divider="handleInsertDividerClick"
        :insert-toc="handleInsertTocClick"
        @close="closeBlockOptions"
      />
    </Teleport>

    <!-- Link Modal -->
    <Teleport to="body">
      <LinkModal
        :is-visible="show"
        :current-url="url"
        :is-link-active="editor.value?.isActive('link') ?? false"
        @confirm="handleLinkConfirm"
        :remove="handleLinkRemove"
        @close="closeLinkModal"
      />
    </Teleport>
</template>

<style>
/* Editor wrapper - provides relative positioning for floating elements */
.editor-wrapper {
  position: relative;
  min-height: 400px;
}

/* Editor content area */
.notion-content-wrapper {
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 8px;
  background: var(--cyber-editor-bg);
  padding: 0;
  min-height: 400px;
}

/* Tiptap editor styles */
.ProseMirror-focused {
  outline: 2px solid var(--cyber-accent);
}

.ProseMirror p {
  outline: none;
}

.ProseMirror-selectednode {
  background: var(--cyber-accent-light);
}

.ProseMirror p.is-editorempty .is-editorempty::before {
  content: 'attr(data-placeholder)';
  color: var(--cyber-text-muted);
}

.ProseMirror-dropcursor {
  width: 1px;
  height: 1px;
  border-left: 3px solid transparent;
  border-top: 3px solid transparent;
}

.ProseMirror-dropcursor.active {
  background: var(--cyber-accent);
}

/* Images in editor */
.ProseMirror-selectednode img,
.ProseMirror-selectednode figure {
  display: block;
  margin: 1.5rem 0;
}

.ProseMirror-selectednode figure .ProseMirror-preserveWhitespaceonly img {
  white-space: normal;
}

/* Figure styles */
.image-figure {
  margin: 1.5rem 0;
  text-align: center;
  background: var(--cyber-bg-tertiary);
  border: 1px solid var(--cyber-neutral-200);
  border-radius: 12px;
  padding: 1rem;
  overflow: hidden;
}

.figure-caption {
  margin-top: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: var(--cyber-text-muted);
  text-align: center;
  background: var(--cyber-editor-bg);
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  min-height: 1.5rem;
  cursor: text;
}

/* TOC styles */
.toc-block {
  background: var(--cyber-bg-tertiary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1rem 0;
}

.toc-block p {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--cyber-editor-text);
  margin: 0 0 0.75rem;
}

.toc-block strong {
  font-weight: 600;
}

.toc-block .toc-block-item {
  padding: 0.35rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}

.toc-item:hover .toc-block-item {
  background: rgba(0, 255, 255, 0.05);
  border-radius: 4px;
}

.toc-bullet {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyber-text-muted);
}

/* Block handle styles */
.block-handle-wrapper {
  position: fixed;
  left: 24px;
  z-index: 1003;
}

.block-handle {
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem;
  animation: slide-in 0.1s ease-out;
}

.block-handle-button {
  background: transparent;
  border: none;
  color: var(--cyber-text-muted);
  padding: 0.375rem 0.5rem;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}

.block-handle-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cyber-editor-text);
}

.block-handle-add {
  margin-right: 0.25rem;
}

.block-handle-dots {
  font-size: 1.25rem;
}

/* Block options styles */
.block-options {
  position: fixed;
  z-index: 2001;
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 280px;
  max-width: 450px;
  padding: 1rem;
}

.block-options-header {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--cyber-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid var(--cyber-editor-divider);
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
  background: rgba(0, 255, 255, 0.05);
  border-color: var(--cyber-accent);
}

.block-option-danger {
  color: var(--cyber-danger);
}

.block-option-danger:hover {
  background: var(--cyber-danger);
  border-color: var(--cyber-danger);
}

/* Animations */
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

/* Save status bar */
.notion-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--cyber-bg-tertiary);
  border-bottom: 1px solid var(--cyber-editor-divider);
}

.spinner-border {
  display: inline-block;
  width: 1em;
  height: 1em;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-bottom-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Floating/Table toolbar styles */
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

.toolbar-section button:hover:not(:disabled) {
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

/* Slash menu styles */
.slash-menu {
  position: fixed;
  z-index: 1002;
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  max-height: 300px;
  overflow-y: auto;
  animation: slide-up 0.15s ease-out;
}

.slash-menu-list {
  padding: 0.5rem;
}

.slash-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.875rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
}

.slash-menu-item:hover,
.slash-menu-item.is-selected {
  background: rgba(0, 255, 255, 255, 0.15);
}

.slash-menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 1.25rem;
  color: var(--cyber-text-muted);
}

.slash-menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.slash-menu-title {
  font-weight: 600;
  color: var(--cyber-editor-text);
}

.slash-menu-description {
  font-size: 0.875rem;
  color: var(--cyber-text-muted);
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

/* Link modal styles */
.link-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.link-modal {
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-editor-divider);
  border-radius: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 450px;
  padding: 1rem;
}

.link-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--cyber-editor-divider);
}

.link-modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--cyber-editor-text);
}

.link-modal-close {
  background: transparent;
  border: none;
  color: var(--cyber-text-muted);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 4px;
  transition: all 0.15s;
}

.link-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--cyber-editor-text);
}

.link-modal-body {
  padding: 1rem 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--cyber-editor-text);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid var(--cyber-neutral-300);
  border-radius: 4px;
  font-size: 0.95rem;
  background: var(--cyber-bg-secondary);
  color: var(--cyber-editor-text);
  transition: all 0.15s;
}

.form-input:focus {
  outline: none;
  border-color: var(--cyber-accent);
  box-shadow: 0 0 3px rgba(var(--cyber-accent), 0, 0, 0.2);
}

.link-modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
  font-size: 0.95rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--cyber-accent);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid var(--cyber-danger);
  color: var(--cyber-danger);
}

.btn-outline-danger:hover {
  background: var(--cyber-danger);
  color: white;
}

.btn-secondary {
  background: var(--cyber-neutral-200);
  color: var(--cyber-editor-text);
}

.btn-secondary:hover {
  background: var(--cyber-neutral-300);
}

/* Modal animations */
@keyframes modal-fade {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.2s ease-out;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.modal-fade-leave-from,
.modal-fade-enter-to {
  opacity: 1;
  transform: scale(0);
}

/* Editor disabled state */
.notion-editor.disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Editor dark mode styles */
[data-theme="dark"] .notion-editor-content-wrapper {
  background: #0f0f0f1;
  border-color: var(--cyber-editor-divider);
}

[data-theme="dark"] .ProseMirror p.is-editorempty .is-editorempty::before {
  content: 'attr(data-placeholder)';
  color: var(--cyber-text-muted);
}

[data-theme="dark"] .ProseMirror-selectednode img,
.ProseMirror-selectednode figure {
  filter: grayscale(0.5);
}

/* Light mode styles */
[data-theme="light"] .notion-editor-content-wrapper {
  background: var(--cyber-editor-bg);
  border-color: var(--cyber-editor-divider);
}

[data-theme="light"] .ProseMirror p.is-editorempty .is-editorempty::before {
  content: 'attr(data-placeholder)';
  color: var(--cyber-text-muted);
}

[data-theme="light"] .ProseMirror-selectednode img,
.ProseMirror-selectednode figure {
  filter: none;
}
</style>
