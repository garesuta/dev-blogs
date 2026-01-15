<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { common, createLowlight } from "lowlight";
import { Extension, Node, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// Custom Figure Node Extension (Image with caption)
const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'figcaption',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.querySelector('img')?.getAttribute('src'),
      },
      alt: {
        default: null,
        parseHTML: element => element.querySelector('img')?.getAttribute('alt'),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        contentElement: 'figcaption',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'figure',
      { class: 'image-figure', style: 'margin: 1.5rem 0; text-align: center; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem; overflow: hidden;' },
      [
        'img',
        mergeAttributes(HTMLAttributes, {
          src: node.attrs.src,
          alt: node.attrs.alt || '',
          style: 'max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto;',
          class: 'figure-image',
        }),
      ],
      ['figcaption', { class: 'figure-caption' }, 0],
    ];
  },
});

const Figcaption = Node.create({
  name: 'figcaption',
  group: 'block',
  content: 'inline*',
  draggable: false,
  selectable: false,

  parseHTML() {
    return [{ tag: 'figcaption' }];
  },

  renderHTML() {
    return [
      'figcaption',
      {
        class: 'figure-caption',
        style: 'margin-top: 0.75rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; color: #6b7280; text-align: center; background: #ffffff; border: 1px dashed #d1d5db; border-radius: 6px; min-height: 1.5rem; cursor: text;',
        'data-placeholder': 'Click to add caption...',
      },
      0,
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Enter in figcaption creates a new paragraph after the figure
      Enter: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        if ($from.parent.type.name === 'figcaption') {
          return editor.chain().focus().insertContentAt($from.after($from.depth - 1), { type: 'paragraph' }).run();
        }
        return false;
      },
    };
  },
});

// Custom TOC Node Extension
const TableOfContents = Node.create({
  name: 'tableOfContents',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      items: {
        default: [],
        parseHTML: element => {
          const items: { level: number; text: string; id: string }[] = [];
          element.querySelectorAll('li').forEach(li => {
            const link = li.querySelector('a');
            if (link) {
              const paddingLeft = li.style.paddingLeft || '0';
              let level = 0;
              if (paddingLeft.includes('3.75')) level = 3;
              else if (paddingLeft.includes('2.5')) level = 2;
              else if (paddingLeft.includes('1.25')) level = 1;
              items.push({
                level,
                text: link.textContent || '',
                id: link.getAttribute('href')?.replace('#', '') || '',
              });
            }
          });
          return items;
        },
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'nav.toc-block' },
      { tag: 'div.toc-block' },
    ];
  },

  renderHTML({ node }) {
    const items = node.attrs.items as { level: number; text: string; id: string }[];

    const levelStyles = [
      { indent: '0', bullet: '8px', bulletColor: '#37352f', fontWeight: '600', fontSize: '0.95rem', color: '#37352f' },
      { indent: '1.25rem', bullet: '6px', bulletColor: '#6b6b6b', fontWeight: '500', fontSize: '0.9rem', color: '#37352f' },
      { indent: '2.5rem', bullet: '5px', bulletColor: '#9b9a97', fontWeight: '400', fontSize: '0.875rem', color: '#6b6b6b' },
      { indent: '3.75rem', bullet: '4px', bulletColor: '#b4b4b4', fontWeight: '400', fontSize: '0.85rem', color: '#808080' },
    ];

    const listItems = items.map(item => {
      const style = levelStyles[Math.min(item.level, 3)];
      return [
        'li',
        { style: `padding: 0.35rem 0; padding-left: ${style.indent}; display: flex; align-items: center;` },
        [
          'span',
          { style: `display: inline-block; width: ${style.bullet}; height: ${style.bullet}; border-radius: 50%; background: ${style.bulletColor}; margin-right: 10px; flex-shrink: 0;` },
        ],
        [
          'a',
          {
            href: `#${item.id}`,
            'data-toc-link': item.id,
            style: `color: ${style.color}; text-decoration: none; font-weight: ${style.fontWeight}; font-size: ${style.fontSize}; cursor: pointer;`
          },
          item.text,
        ],
      ];
    });

    return [
      'div',
      mergeAttributes({ class: 'toc-block', style: 'background: #f7f6f3; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem 1.5rem; margin: 1rem 0;' }),
      [
        'p',
        { style: 'margin: 0 0 0.75rem 0; font-size: 0.95rem; color: #37352f;' },
        ['strong', {}, 'Table of Contents'],
      ],
      [
        'ul',
        { style: 'list-style: none; padding: 0; margin: 0;' },
        ...listItems,
      ],
    ];
  },
});

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

// Refs
const saveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
const lastSavedAt = ref<Date | null>(null);
const autoSaveTimer = ref<ReturnType<typeof setInterval> | null>(null);
const isDirty = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const linkUrl = ref("");
const showLinkModal = ref(false);

// Slash command menu state
const showSlashMenu = ref(false);
const slashMenuPosition = ref({ top: 0, left: 0 });
const slashMenuQuery = ref("");
const selectedSlashIndex = ref(0);
const slashMenuRef = ref<HTMLElement | null>(null);

// Floating toolbar state
const showFloatingToolbar = ref(false);
const floatingToolbarPosition = ref({ top: 0, left: 0 });
const floatingToolbarStyle = computed(() => ({
  top: `${floatingToolbarPosition.value.top}px`,
  left: `${floatingToolbarPosition.value.left}px`,
}));

// Table toolbar state
const showTableToolbar = ref(false);
const tableToolbarPosition = ref({ top: 0, left: 0 });

// Block handle state (+ and ⋮ buttons)
const showBlockHandle = ref(false);
const blockHandlePosition = ref({ top: 0 });
const currentBlockPos = ref<number | null>(null);
const showBlockOptions = ref(false);
const editorWrapperRef = ref<HTMLElement | null>(null);
const blockHandleRef = ref<HTMLElement | null>(null);
const isHoveringBlockHandle = ref(false);

// Table of Contents state
const showToc = ref(false);
interface TocItem {
  level: number;
  text: string;
  pos: number;
}
const tocItems = ref<TocItem[]>([]);

// Create lowlight instance
const lowlight = createLowlight(common);

// Helper to generate slug from text
function generateHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Slash command items
interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: () => void;
}

const slashCommands = computed<SlashCommandItem[]>(() => {
  if (!editor.value) return [];

  const items: SlashCommandItem[] = [
    {
      title: "Text",
      description: "Plain text paragraph",
      icon: "bi-text-paragraph",
      command: () => editor.value?.chain().focus().setParagraph().run(),
    },
    {
      title: "Heading 1",
      description: "Large section heading",
      icon: "bi-type-h1",
      command: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: "bi-type-h2",
      command: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: "bi-type-h3",
      command: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: "Bullet List",
      description: "Create a bullet list",
      icon: "bi-list-ul",
      command: () => editor.value?.chain().focus().toggleBulletList().run(),
    },
    {
      title: "Numbered List",
      description: "Create a numbered list",
      icon: "bi-list-ol",
      command: () => editor.value?.chain().focus().toggleOrderedList().run(),
    },
    {
      title: "Quote",
      description: "Capture a quote",
      icon: "bi-quote",
      command: () => editor.value?.chain().focus().toggleBlockquote().run(),
    },
    {
      title: "Code Block",
      description: "Display code with syntax highlighting",
      icon: "bi-code-square",
      command: () => editor.value?.chain().focus().toggleCodeBlock().run(),
    },
    {
      title: "Divider",
      description: "Visual divider line",
      icon: "bi-hr",
      command: () => editor.value?.chain().focus().setHorizontalRule().run(),
    },
    {
      title: "Image",
      description: "Upload or embed an image",
      icon: "bi-image",
      command: () => {
        closeSlashMenu();
        openImageUpload();
      },
    },
    {
      title: "Table",
      description: "Add a simple table",
      icon: "bi-table",
      command: () => editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      title: "Table of Contents",
      description: "Insert document outline",
      icon: "bi-list-nested",
      command: () => {
        closeSlashMenu();
        insertTocBlock();
      },
    },
  ];

  // Filter by query
  const query = slashMenuQuery.value.toLowerCase();
  if (!query) return items;

  return items.filter(item =>
    item.title.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );
});

// Slash command extension
const SlashCommands = Extension.create({
  name: "slashCommands",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("slashCommands"),
        props: {
          handleKeyDown(view, event) {
            // Open menu on "/"
            if (event.key === "/" && !showSlashMenu.value) {
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;

              // Only show at start of empty block or after space
              const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
              if (textBefore === "" || textBefore.endsWith(" ")) {
                // Get cursor position for menu
                const coords = view.coordsAtPos(selection.from);
                slashMenuPosition.value = {
                  top: coords.bottom + 8,
                  left: coords.left,
                };
                slashMenuQuery.value = "";
                selectedSlashIndex.value = 0;
                showSlashMenu.value = true;
                return false; // Let the "/" be typed
              }
            }

            // Handle menu navigation
            if (showSlashMenu.value) {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                selectedSlashIndex.value = Math.min(
                  selectedSlashIndex.value + 1,
                  slashCommands.value.length - 1
                );
                return true;
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                selectedSlashIndex.value = Math.max(selectedSlashIndex.value - 1, 0);
                return true;
              }
              if (event.key === "Enter") {
                event.preventDefault();
                executeSlashCommand(selectedSlashIndex.value);
                return true;
              }
              if (event.key === "Escape") {
                event.preventDefault();
                closeSlashMenu();
                return true;
              }
              if (event.key === "Backspace") {
                // Check if we should close menu
                const { state } = view;
                const { selection } = state;
                const { $from } = selection;
                const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);

                // Close if backspacing the "/"
                if (textBefore === "/" || !textBefore.includes("/")) {
                  closeSlashMenu();
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

// Computed
const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case "saving": return "Saving...";
    case "saved": return lastSavedAt.value ? `Saved at ${lastSavedAt.value.toLocaleTimeString()}` : "Saved";
    case "error": return "Save failed";
    default: return isDirty.value ? "Unsaved changes" : "";
  }
});

const saveStatusClass = computed(() => {
  switch (saveStatus.value) {
    case "saving": return "text-muted";
    case "saved": return "text-success";
    case "error": return "text-danger";
    default: return isDirty.value ? "text-warning" : "text-muted";
  }
});

// Initialize Tiptap editor
const editor = useEditor({
  content: props.modelValue || "",
  extensions: [
    StarterKit.configure({
      codeBlock: false,
      heading: false, // We use custom Heading extension below
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
    SlashCommands,
  ],
  editorProps: {
    attributes: { class: "notion-editor-content" },
    handleKeyDown: (view, event) => {
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
          view.state.doc.descendants((node, nodePos) => {
            if (node.type.name === 'heading' && node.attrs.id === headingId) {
              targetPos = nodePos;
              return false;
            }
          });

          if (targetPos !== null) {
            // Set selection to the heading
            const tr = view.state.tr.setSelection(
              view.state.selection.constructor.near(view.state.doc.resolve(targetPos + 1))
            );
            view.dispatch(tr);

            // Scroll the heading into view at the center of the viewport
            setTimeout(() => {
              const headingEl = view.dom.querySelector(`[id="${headingId}"]`);
              if (headingEl) {
                const editorWrapper = document.querySelector('.notion-content-wrapper');
                if (editorWrapper) {
                  const wrapperRect = editorWrapper.getBoundingClientRect();
                  const headingRect = headingEl.getBoundingClientRect();
                  const wrapperHeight = editorWrapper.clientHeight;
                  // Calculate scroll position to center the heading
                  const scrollTop = editorWrapper.scrollTop + (headingRect.top - wrapperRect.top) - (wrapperHeight / 2) + (headingRect.height / 2);
                  editorWrapper.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth'
                  });
                }
              }
            }, 50);
          }
          return true;
        }
      }
      return false;
    },
    handleDrop: (view, event, slice, moved) => {
      if (!moved && event.dataTransfer?.files.length) {
        const file = event.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          event.preventDefault();
          handleImageUpload(file);
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
            if (file) handleImageUpload(file);
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
    isDirty.value = true;
    saveStatus.value = "idle";

    // Update slash menu query
    if (showSlashMenu.value) {
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
  },
  onSelectionUpdate: ({ editor: ed }) => {
    // Close slash menu when selection changes significantly
    if (showSlashMenu.value) {
      const { state } = ed;
      const { selection } = state;
      const { $from } = selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      if (!textBefore.includes("/")) {
        closeSlashMenu();
      }
    }

    // Check if cursor is in a table
    const isInTable = ed.isActive('table');
    if (isInTable) {
      const { view } = ed;
      const { from } = ed.state.selection;
      const coords = view.coordsAtPos(from);
      tableToolbarPosition.value = {
        top: coords.top - 45,
        left: coords.left,
      };
      showTableToolbar.value = true;
    } else {
      showTableToolbar.value = false;
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

    // Position toolbar above the selection
    floatingToolbarPosition.value = {
      top: start.top - 45,
      left: (start.left + end.left) / 2 - 100,
    };
    showFloatingToolbar.value = true;
  },
});

// Slash menu functions
function closeSlashMenu() {
  showSlashMenu.value = false;
  slashMenuQuery.value = "";
  selectedSlashIndex.value = 0;
}

function executeSlashCommand(index: number) {
  const command = slashCommands.value[index];
  if (!command || !editor.value) return;

  // Delete the "/" and query text
  const { state } = editor.value;
  const { selection } = state;
  const { $from } = selection;
  const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
  const slashIndex = textBefore.lastIndexOf("/");

  if (slashIndex >= 0) {
    const deleteFrom = $from.pos - (textBefore.length - slashIndex);
    const deleteTo = $from.pos;
    editor.value.chain().focus().deleteRange({ from: deleteFrom, to: deleteTo }).run();
  }

  // Execute command
  command.command();
  closeSlashMenu();
}

// Image upload handler
async function handleImageUpload(file: File) {
  if (!file.type.startsWith("image/")) {
    alert("Please select an image file");
    return;
  }

  try {
    const presignResponse = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        postId: props.postId || null,
      }),
    });

    if (!presignResponse.ok) {
      const error = await presignResponse.json();
      throw new Error(error.error || "Failed to get upload URL");
    }

    const { presignedUrl, objectKey, publicUrl } = await presignResponse.json();

    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    if (!uploadResponse.ok) throw new Error("Upload failed");

    await fetch("/api/upload/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectKey,
        filename: objectKey.split("/").pop(),
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        url: publicUrl,
        postId: props.postId || null,
      }),
    });

    // Insert figure with caption (empty caption shows placeholder)
    editor.value?.chain().focus().insertContent({
      type: 'figure',
      attrs: { src: publicUrl, alt: file.name },
      content: [
        {
          type: 'figcaption',
        },
      ],
    }).run();
  } catch (error) {
    console.error("Image upload error:", error);
    alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function openImageUpload() {
  fileInputRef.value?.click();
}

function handleFileInputChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) handleImageUpload(file);
  target.value = "";
}

// Link modal functions
function openLinkModal() {
  const previousUrl = editor.value?.getAttributes("link").href || "";
  linkUrl.value = previousUrl;
  showLinkModal.value = true;
}

function closeLinkModal() {
  showLinkModal.value = false;
  linkUrl.value = "";
}

function setLink() {
  if (linkUrl.value) {
    editor.value?.chain().focus().extendMarkRange("link").setLink({ href: linkUrl.value }).run();
  } else {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
  }
  closeLinkModal();
}

function removeLink() {
  editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
  closeLinkModal();
}

// Table of Contents functions
function updateToc() {
  if (!editor.value) return;

  const items: TocItem[] = [];
  const { doc } = editor.value.state;

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      items.push({
        level: node.attrs.level,
        text: node.textContent,
        pos: pos,
      });
    }
  });

  tocItems.value = items;
}

function insertTocBlock() {
  if (!editor.value) return;

  // Collect all headings with their positions
  const headings: { level: number; text: string; id: string; pos: number }[] = [];
  const { doc } = editor.value.state;
  const usedIds = new Set<string>();

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading') {
      // Use existing ID or generate new one
      let id = node.attrs.id || generateHeadingId(node.textContent);
      // Ensure unique ID
      let uniqueId = id;
      let counter = 1;
      while (usedIds.has(uniqueId)) {
        uniqueId = `${id}-${counter}`;
        counter++;
      }
      usedIds.add(uniqueId);

      headings.push({
        level: node.attrs.level,
        text: node.textContent || 'Untitled',
        id: uniqueId,
        pos: pos,
      });
    }
  });

  if (headings.length === 0) {
    editor.value
      .chain()
      .focus()
      .insertContent('<p class="toc-placeholder"><em>Add headings to your document to generate a table of contents.</em></p>')
      .run();
    return;
  }

  // First, update all headings with their IDs using a transaction
  // Apply in reverse order to avoid position shifting issues
  const { tr } = editor.value.state;
  const reversedHeadings = [...headings].reverse();
  reversedHeadings.forEach((heading) => {
    const node = tr.doc.nodeAt(heading.pos);
    if (node && node.type.name === 'heading') {
      tr.setNodeMarkup(heading.pos, undefined, {
        ...node.attrs,
        id: heading.id,
      });
    }
  });
  editor.value.view.dispatch(tr);

  // Find the minimum heading level to normalize indentation
  const minLevel = Math.min(...headings.map(h => h.level));

  // Prepare TOC items with normalized levels
  const tocItems = headings.map(heading => ({
    level: Math.min(heading.level - minLevel, 3), // Normalize and cap at level 3
    text: heading.text,
    id: heading.id,
  }));

  // Insert the TOC block as a custom node
  editor.value.chain().focus().insertContent({
    type: 'tableOfContents',
    attrs: { items: tocItems },
  }).run();
}

// Handle TOC link clicks for smooth scrolling within editor
function handleTocLinkClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const link = target.closest('a[data-toc-link]') || target.closest('a[href^="#"]');
  if (!link || !editor.value) return;

  const href = link.getAttribute('href');
  const tocLink = link.getAttribute('data-toc-link');
  const headingId = tocLink || (href?.startsWith('#') ? href.slice(1) : null);

  if (!headingId) return;

  // Prevent default navigation
  event.preventDefault();
  event.stopPropagation();

  // Find the heading with this ID in the document
  const { doc } = editor.value.state;
  let targetPos: number | null = null;

  doc.descendants((node, pos) => {
    if (node.type.name === 'heading' && node.attrs.id === headingId) {
      targetPos = pos;
      return false; // Stop traversal
    }
  });

  if (targetPos !== null) {
    // Focus and scroll to the heading
    editor.value.chain().focus().setTextSelection(targetPos + 1).run();

    // Scroll using coordinates
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

function scrollToHeading(pos: number) {
  if (!editor.value) return;

  editor.value.chain().focus().setTextSelection(pos + 1).run();

  // Scroll the heading into view
  const { view } = editor.value;
  const coords = view.coordsAtPos(pos);
  window.scrollTo({
    top: coords.top - 100,
    behavior: 'smooth',
  });
}

function closeToc() {
  showToc.value = false;
}

// Block handle functions
function handleEditorMouseMove(event: MouseEvent) {
  if (!editor.value || !editorWrapperRef.value) return;

  // Don't update if hovering over block handle or options menu is open
  if (isHoveringBlockHandle.value || showBlockOptions.value) return;

  const editorRect = editorWrapperRef.value.getBoundingClientRect();
  const { view } = editor.value;
  const relativeX = event.clientX - editorRect.left;

  // Get position from mouse coordinates - use inside: -1 to get position even for empty blocks
  let pos = view.posAtCoords({ left: event.clientX, top: event.clientY });

  // If no position found, try with a position more to the right (inside the content area)
  if (!pos && relativeX < 200) {
    pos = view.posAtCoords({ left: editorRect.left + 100, top: event.clientY });
  }

  if (!pos) {
    // Don't hide if mouse is in the left gutter area (where block handle lives)
    if (relativeX < 56) return; // Keep handle visible in gutter area

    showBlockHandle.value = false;
    return;
  }

  // Resolve the position to get the node
  const resolvedPos = view.state.doc.resolve(pos.pos);
  const node = resolvedPos.parent;

  // Only show for block-level nodes
  if (node && resolvedPos.depth > 0) {
    const nodeStart = resolvedPos.before(resolvedPos.depth);
    const coords = view.coordsAtPos(nodeStart);

    // Position relative to editor wrapper
    blockHandlePosition.value = {
      top: coords.top - editorRect.top + editorWrapperRef.value.scrollTop,
    };
    currentBlockPos.value = nodeStart;
    showBlockHandle.value = true;
  } else {
    showBlockHandle.value = false;
  }
}

function handleEditorMouseLeave() {
  // Delay hiding to allow clicking on handle
  setTimeout(() => {
    if (!showBlockOptions.value && !isHoveringBlockHandle.value) {
      showBlockHandle.value = false;
    }
  }, 150);
}

function handleBlockHandleMouseEnter() {
  isHoveringBlockHandle.value = true;
}

function handleBlockHandleMouseLeave() {
  isHoveringBlockHandle.value = false;
  // Delay hiding to allow for menu interactions
  setTimeout(() => {
    if (!showBlockOptions.value && !isHoveringBlockHandle.value) {
      showBlockHandle.value = false;
    }
  }, 150);
}

function handleAddBlockClick() {
  if (!editor.value || currentBlockPos.value === null) return;

  // Insert a new paragraph after current block and focus it
  const { state } = editor.value;
  const resolvedPos = state.doc.resolve(currentBlockPos.value);
  const endOfBlock = resolvedPos.end(resolvedPos.depth);

  editor.value
    .chain()
    .focus()
    .insertContentAt(endOfBlock, { type: "paragraph" })
    .setTextSelection(endOfBlock + 1)
    .run();

  // Trigger slash menu
  setTimeout(() => {
    const { view, state } = editor.value!;
    const { selection } = state;
    const coords = view.coordsAtPos(selection.from);
    slashMenuPosition.value = {
      top: coords.bottom + 8,
      left: coords.left,
    };
    slashMenuQuery.value = "";
    selectedSlashIndex.value = 0;
    showSlashMenu.value = true;
  }, 50);

  showBlockHandle.value = false;
}

function toggleBlockOptions() {
  showBlockOptions.value = !showBlockOptions.value;
}

function closeBlockOptions() {
  showBlockOptions.value = false;
}

function deleteBlock() {
  if (!editor.value || currentBlockPos.value === null) return;

  const { state } = editor.value;
  const resolvedPos = state.doc.resolve(currentBlockPos.value);
  const start = resolvedPos.before(resolvedPos.depth);
  const end = resolvedPos.after(resolvedPos.depth);

  editor.value.chain().focus().deleteRange({ from: start, to: end }).run();
  closeBlockOptions();
  showBlockHandle.value = false;
}

function duplicateBlock() {
  if (!editor.value || currentBlockPos.value === null) return;

  const { state } = editor.value;
  const resolvedPos = state.doc.resolve(currentBlockPos.value);
  const node = resolvedPos.parent;
  const end = resolvedPos.after(resolvedPos.depth);

  if (node) {
    editor.value
      .chain()
      .focus()
      .insertContentAt(end, node.toJSON())
      .run();
  }

  closeBlockOptions();
  showBlockHandle.value = false;
}

function turnIntoBlock(blockType: string) {
  if (!editor.value || currentBlockPos.value === null) return;

  // Focus the block first
  editor.value.chain().focus().setTextSelection(currentBlockPos.value + 1).run();

  // Apply the transformation
  switch (blockType) {
    case 'paragraph':
      editor.value.chain().focus().setParagraph().run();
      break;
    case 'heading1':
      editor.value.chain().focus().setHeading({ level: 1 }).run();
      break;
    case 'heading2':
      editor.value.chain().focus().setHeading({ level: 2 }).run();
      break;
    case 'heading3':
      editor.value.chain().focus().setHeading({ level: 3 }).run();
      break;
    case 'bulletList':
      editor.value.chain().focus().toggleBulletList().run();
      break;
    case 'orderedList':
      editor.value.chain().focus().toggleOrderedList().run();
      break;
    case 'blockquote':
      editor.value.chain().focus().toggleBlockquote().run();
      break;
    case 'codeBlock':
      editor.value.chain().focus().toggleCodeBlock().run();
      break;
  }

  closeBlockOptions();
  showBlockHandle.value = false;
}

// Insert block functions
function insertBlockImage() {
  closeBlockOptions();
  showBlockHandle.value = false;
  openImageUpload();
}

function insertBlockTable() {
  if (!editor.value) return;
  editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  closeBlockOptions();
  showBlockHandle.value = false;
}

function insertBlockDivider() {
  if (!editor.value) return;
  editor.value.chain().focus().setHorizontalRule().run();
  closeBlockOptions();
  showBlockHandle.value = false;
}

function insertBlockToc() {
  closeBlockOptions();
  showBlockHandle.value = false;
  insertTocBlock();
}

// Trigger save
async function triggerSave() {
  if (props.disabled || saveStatus.value === "saving") return;
  const content = editor.value?.getHTML() || "";
  saveStatus.value = "saving";
  try {
    emit("save", content);
    isDirty.value = false;
    saveStatus.value = "saved";
    lastSavedAt.value = new Date();
  } catch (error) {
    console.error("Save error:", error);
    saveStatus.value = "error";
  }
}

// Watch for external value changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value) {
    const currentValue = editor.value.getHTML();
    if (newValue !== currentValue) {
      editor.value.commands.setContent(newValue || "", false);
    }
  }
});

// Handle click outside to close block options
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (showBlockOptions.value && !target.closest('.block-handle')) {
    closeBlockOptions();
  }
}

// Setup auto-save
onMounted(() => {
  if (props.autoSaveInterval && props.autoSaveInterval > 0) {
    autoSaveTimer.value = setInterval(() => {
      if (isDirty.value && !props.disabled) triggerSave();
    }, props.autoSaveInterval * 1000);
  }

  // Add click outside listener
  document.addEventListener('click', handleClickOutside);
});

// Cleanup
onUnmounted(() => {
  if (autoSaveTimer.value) clearInterval(autoSaveTimer.value);
  document.removeEventListener('click', handleClickOutside);
});

// Exposed methods
defineExpose({
  getContent: () => editor.value?.getHTML() || "",
  setContent: (content: string) => editor.value?.commands.setContent(content),
  focus: () => editor.value?.commands.focus(),
  triggerSave,
});
</script>

<template>
  <div class="notion-editor" :class="{ disabled: disabled }">
    <!-- Save status bar -->
    <div class="notion-status-bar">
      <small :class="saveStatusClass">
        <span v-if="saveStatus === 'saving'" class="spinner-border spinner-border-sm me-1"></span>
        {{ saveStatusText }}
      </small>
      <small class="text-muted">
        Type <kbd>/</kbd> for commands &bull; <kbd>Ctrl</kbd>+<kbd>S</kbd> to save
      </small>
    </div>

    <!-- Floating toolbar (appears on text selection) -->
    <div v-if="editor && showFloatingToolbar" class="floating-toolbar" :style="floatingToolbarStyle">
      <!-- Text formatting -->
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('bold') }"
        @click="editor.chain().focus().toggleBold().run()"
        title="Bold (Ctrl+B)"
      >
        <i class="bi bi-type-bold"></i>
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('italic') }"
        @click="editor.chain().focus().toggleItalic().run()"
        title="Italic (Ctrl+I)"
      >
        <i class="bi bi-type-italic"></i>
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('strike') }"
        @click="editor.chain().focus().toggleStrike().run()"
        title="Strikethrough"
      >
        <i class="bi bi-type-strikethrough"></i>
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('code') }"
        @click="editor.chain().focus().toggleCode().run()"
        title="Inline Code"
      >
        <i class="bi bi-code"></i>
      </button>

      <span class="divider"></span>

      <!-- Link -->
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('link') }"
        @click="openLinkModal"
        title="Add Link"
      >
        <i class="bi bi-link-45deg"></i>
      </button>

      <span class="divider"></span>

      <!-- Block type conversion -->
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        title="Heading 1"
      >
        <i class="bi bi-type-h1"></i>
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        title="Heading 2"
      >
        <i class="bi bi-type-h2"></i>
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        title="Heading 3"
      >
        <i class="bi bi-type-h3"></i>
      </button>

      <span class="divider"></span>

      <!-- Lists & blocks -->
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        @click="editor.chain().focus().toggleBulletList().run()"
        title="Bullet List"
      >
        <i class="bi bi-list-ul"></i>
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        @click="editor.chain().focus().toggleOrderedList().run()"
        title="Numbered List"
      >
        <i class="bi bi-list-ol"></i>
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        @click="editor.chain().focus().toggleBlockquote().run()"
        title="Quote"
      >
        <i class="bi bi-quote"></i>
      </button>
      <button
        type="button"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        title="Code Block"
      >
        <i class="bi bi-code-square"></i>
      </button>
    </div>

    <!-- Table toolbar (appears when cursor is in table) -->
    <div
      v-if="editor && showTableToolbar"
      class="table-toolbar"
      :style="{ top: `${tableToolbarPosition.top}px`, left: `${tableToolbarPosition.left}px` }"
    >
      <button
        type="button"
        @click="editor.chain().focus().addColumnBefore().run()"
        :disabled="!editor.can().addColumnBefore()"
        title="Add column before"
      >
        <i class="bi bi-arrow-bar-left"></i>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().addColumnAfter().run()"
        :disabled="!editor.can().addColumnAfter()"
        title="Add column after"
      >
        <i class="bi bi-arrow-bar-right"></i>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().deleteColumn().run()"
        :disabled="!editor.can().deleteColumn()"
        title="Delete column"
      >
        <i class="bi bi-x-circle"></i>
      </button>

      <span class="divider"></span>

      <button
        type="button"
        @click="editor.chain().focus().addRowBefore().run()"
        :disabled="!editor.can().addRowBefore()"
        title="Add row above"
      >
        <i class="bi bi-arrow-bar-up"></i>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().addRowAfter().run()"
        :disabled="!editor.can().addRowAfter()"
        title="Add row below"
      >
        <i class="bi bi-arrow-bar-down"></i>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().deleteRow().run()"
        :disabled="!editor.can().deleteRow()"
        title="Delete row"
      >
        <i class="bi bi-dash-circle"></i>
      </button>

      <span class="divider"></span>

      <button
        type="button"
        @click="editor.chain().focus().toggleHeaderRow().run()"
        :disabled="!editor.can().toggleHeaderRow()"
        title="Toggle header row"
      >
        <i class="bi bi-layout-text-window"></i>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeaderColumn().run()"
        :disabled="!editor.can().toggleHeaderColumn()"
        title="Toggle header column"
      >
        <i class="bi bi-layout-sidebar"></i>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().mergeCells().run()"
        :disabled="!editor.can().mergeCells()"
        title="Merge cells"
      >
        <i class="bi bi-arrows-collapse"></i>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().splitCell().run()"
        :disabled="!editor.can().splitCell()"
        title="Split cell"
      >
        <i class="bi bi-arrows-expand"></i>
      </button>

      <span class="divider"></span>

      <button
        type="button"
        class="btn-danger"
        @click="editor.chain().focus().deleteTable().run()"
        :disabled="!editor.can().deleteTable()"
        title="Delete table"
      >
        <i class="bi bi-trash"></i>
      </button>
    </div>

    <!-- Editor content with block handle -->
    <div
      ref="editorWrapperRef"
      class="notion-content-wrapper"
      :style="{ minHeight: height || '400px' }"
      @mousemove="handleEditorMouseMove"
      @mouseleave="handleEditorMouseLeave"
      @click="handleTocLinkClick"
    >
      <!-- Block handle (+ and ⋮ buttons) -->
      <div
        v-if="showBlockHandle"
        ref="blockHandleRef"
        class="block-handle"
        :style="{ top: `${blockHandlePosition.top}px` }"
        @mouseenter="handleBlockHandleMouseEnter"
        @mouseleave="handleBlockHandleMouseLeave"
      >
        <button
          type="button"
          class="block-handle-btn"
          @click="handleAddBlockClick"
          title="Add block below"
        >
          <i class="bi bi-plus"></i>
        </button>
        <button
          type="button"
          class="block-handle-btn"
          @click="toggleBlockOptions"
          title="Block options"
        >
          <i class="bi bi-grip-vertical"></i>
        </button>

        <!-- Block options dropdown -->
        <div v-if="showBlockOptions" class="block-options-menu">
          <div class="block-options-section">
            <div class="block-options-label">Actions</div>
            <button type="button" class="block-options-item" @click="deleteBlock">
              <i class="bi bi-trash me-2"></i>
              Delete
            </button>
            <button type="button" class="block-options-item" @click="duplicateBlock">
              <i class="bi bi-copy me-2"></i>
              Duplicate
            </button>
          </div>

          <div class="block-options-divider"></div>

          <div class="block-options-section">
            <div class="block-options-label">Insert</div>
            <button type="button" class="block-options-item" @click="insertBlockImage">
              <i class="bi bi-image me-2"></i>
              Image
            </button>
            <button type="button" class="block-options-item" @click="insertBlockTable">
              <i class="bi bi-table me-2"></i>
              Table
            </button>
            <button type="button" class="block-options-item" @click="insertBlockDivider">
              <i class="bi bi-hr me-2"></i>
              Divider
            </button>
            <button type="button" class="block-options-item" @click="insertBlockToc">
              <i class="bi bi-list-nested me-2"></i>
              Table of Contents
            </button>
          </div>

          <div class="block-options-divider"></div>

          <div class="block-options-section">
            <div class="block-options-label">Turn into</div>
            <button type="button" class="block-options-item" @click="turnIntoBlock('paragraph')">
              <i class="bi bi-text-paragraph me-2"></i>
              Text
            </button>
            <button type="button" class="block-options-item" @click="turnIntoBlock('heading1')">
              <i class="bi bi-type-h1 me-2"></i>
              Heading 1
            </button>
            <button type="button" class="block-options-item" @click="turnIntoBlock('heading2')">
              <i class="bi bi-type-h2 me-2"></i>
              Heading 2
            </button>
            <button type="button" class="block-options-item" @click="turnIntoBlock('heading3')">
              <i class="bi bi-type-h3 me-2"></i>
              Heading 3
            </button>
            <button type="button" class="block-options-item" @click="turnIntoBlock('bulletList')">
              <i class="bi bi-list-ul me-2"></i>
              Bullet List
            </button>
            <button type="button" class="block-options-item" @click="turnIntoBlock('orderedList')">
              <i class="bi bi-list-ol me-2"></i>
              Numbered List
            </button>
            <button type="button" class="block-options-item" @click="turnIntoBlock('blockquote')">
              <i class="bi bi-quote me-2"></i>
              Quote
            </button>
            <button type="button" class="block-options-item" @click="turnIntoBlock('codeBlock')">
              <i class="bi bi-code-square me-2"></i>
              Code Block
            </button>
          </div>
        </div>
      </div>

      <EditorContent :editor="editor" />
    </div>

    <!-- Slash Command Menu -->
    <Teleport to="body">
      <div
        v-if="showSlashMenu && slashCommands.length > 0"
        ref="slashMenuRef"
        class="slash-menu"
        :style="{ top: `${slashMenuPosition.top}px`, left: `${slashMenuPosition.left}px` }"
      >
        <div class="slash-menu-header">
          <span class="text-muted small">Basic blocks</span>
        </div>
        <div class="slash-menu-items">
          <button
            v-for="(item, index) in slashCommands"
            :key="item.title"
            type="button"
            class="slash-menu-item"
            :class="{ selected: index === selectedSlashIndex }"
            @click="executeSlashCommand(index)"
            @mouseenter="selectedSlashIndex = index"
          >
            <span class="slash-menu-icon">
              <i :class="['bi', item.icon]"></i>
            </span>
            <span class="slash-menu-text">
              <span class="slash-menu-title">{{ item.title }}</span>
              <span class="slash-menu-desc">{{ item.description }}</span>
            </span>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Hidden file input -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileInputChange"
    />

    <!-- Link Modal -->
    <div v-if="showLinkModal" class="modal-backdrop fade show"></div>
    <div v-if="showLinkModal" class="modal fade show d-block" tabindex="-1" @click.self="closeLinkModal">
      <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content">
          <div class="modal-header py-2">
            <h6 class="modal-title">Insert Link</h6>
            <button type="button" class="btn-close btn-close-sm" @click="closeLinkModal"></button>
          </div>
          <div class="modal-body py-2">
            <input
              type="url"
              class="form-control form-control-sm"
              v-model="linkUrl"
              placeholder="https://example.com"
              @keydown.enter="setLink"
              autofocus
            />
          </div>
          <div class="modal-footer py-2">
            <button v-if="editor?.isActive('link')" type="button" class="btn btn-sm btn-outline-danger me-auto" @click="removeLink">
              Remove
            </button>
            <button type="button" class="btn btn-sm btn-secondary" @click="closeLinkModal">Cancel</button>
            <button type="button" class="btn btn-sm btn-primary" @click="setLink">
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
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
}

.notion-editor.disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Status bar */
.notion-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #fafafa;
  border-bottom: 1px solid #eee;
  font-size: 0.8rem;
}

/* Content wrapper */
.notion-content-wrapper {
  overflow-y: auto;
}

/* Main editor content */
.notion-editor-content {
  padding: 1.5rem 2rem 1.5rem 0;
  outline: none;
  min-height: 100%;
  font-size: 1rem;
  line-height: 1.7;
  color: #37352f;
}

.notion-editor-content:focus {
  outline: none;
}

/* Placeholder */
.notion-editor-content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9b9a97;
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
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.notion-editor-content .figure-caption:focus-within {
  border-color: #3b82f6;
  border-style: solid;
  background-color: #ffffff;
  outline: none;
}

.notion-editor-content .figure-caption:empty::before {
  content: 'Click to add caption...';
  color: #9ca3af;
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
  border-left: 3px solid #37352f;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #37352f;
}

/* Code */
.notion-editor-content code {
  background-color: rgba(135, 131, 120, 0.15);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.85em;
  color: #eb5757;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
}

.notion-editor-content pre {
  background-color: #f7f6f3;
  color: #37352f;
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
  color: #37352f;
  text-decoration: underline;
  text-decoration-color: rgba(55, 53, 47, 0.4);
  transition: text-decoration-color 0.15s;
}

.notion-editor-content a:hover {
  text-decoration-color: #37352f;
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
  border: 1px solid #e0e0e0;
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.notion-editor-content th {
  background-color: #f7f6f3;
  font-weight: 500;
}

/* Horizontal rule */
.notion-editor-content hr {
  border: none;
  border-top: 1px solid #e0e0e0;
  margin: 1.5rem 0;
}

/* Table of Contents Block */
.notion-editor-content .toc-block {
  background: #f7f6f3;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1rem 0;
}

.notion-editor-content .toc-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  color: #37352f;
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
  background: #9b9a97;
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
  background: #37352f;
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
  background: #6b6b6b;
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
  background: #9b9a97;
}

.notion-editor-content .toc-list .toc-level-2 a {
  font-weight: 400;
  font-size: 0.875rem;
  color: #6b6b6b;
}

.notion-editor-content .toc-list .toc-level-3 {
  padding-left: 3.75rem;
}

.notion-editor-content .toc-list .toc-level-3::before {
  width: 4px;
  height: 4px;
  background: #b4b4b4;
}

.notion-editor-content .toc-list .toc-level-3 a {
  font-weight: 400;
  font-size: 0.85rem;
  color: #808080;
}

.notion-editor-content .toc-list a {
  color: #37352f;
  text-decoration: none;
  transition: color 0.15s;
  cursor: pointer;
}

.notion-editor-content .toc-list a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.notion-editor-content .toc-placeholder {
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: #92400e;
  font-size: 0.9rem;
}

/* Floating Toolbar */
.floating-toolbar {
  position: fixed;
  display: flex;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 4px;
  gap: 2px;
  z-index: 9998;
}

.floating-toolbar button {
  background: transparent;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: #37352f;
  transition: background-color 0.15s;
}

.floating-toolbar button:hover {
  background-color: #f1f1f0;
}

.floating-toolbar button.is-active {
  background-color: #e3e2e0;
}

.floating-toolbar .divider {
  width: 1px;
  background: #e0e0e0;
  margin: 4px 4px;
}

/* Table Toolbar */
.table-toolbar {
  position: fixed;
  display: flex;
  flex-wrap: wrap;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 4px;
  gap: 2px;
  z-index: 9997;
  max-width: 400px;
}

.table-toolbar button {
  background: transparent;
  border: none;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  color: #37352f;
  transition: background-color 0.15s;
  font-size: 0.85rem;
}

.table-toolbar button:hover:not(:disabled) {
  background-color: #f1f1f0;
}

.table-toolbar button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.table-toolbar button.btn-danger:hover:not(:disabled) {
  background-color: #fee2e2;
  color: #dc2626;
}

.table-toolbar .divider {
  width: 1px;
  background: #e0e0e0;
  margin: 4px 2px;
}

/* Slash Command Menu */
.slash-menu {
  position: fixed;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 9999;
}

.slash-menu-header {
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

.slash-menu-items {
  padding: 4px;
}

.slash-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  gap: 12px;
  transition: background-color 0.1s;
}

.slash-menu-item:hover,
.slash-menu-item.selected {
  background-color: #f1f1f0;
}

.slash-menu-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f6f3;
  border-radius: 4px;
  font-size: 1.1rem;
  color: #37352f;
  flex-shrink: 0;
}

.slash-menu-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.slash-menu-title {
  font-weight: 500;
  font-size: 0.9rem;
  color: #37352f;
}

.slash-menu-desc {
  font-size: 0.8rem;
  color: #9b9a97;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Keyboard shortcut styling */
kbd {
  background-color: #f7f6f3;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  color: #37352f;
  display: inline-block;
  font-size: 0.75em;
  font-weight: 500;
  line-height: 1;
  padding: 3px 5px;
  font-family: inherit;
}

/* Block Handle */
.notion-content-wrapper {
  position: relative;
  padding-left: 56px;
}

.block-handle {
  position: absolute;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
  z-index: 10;
  opacity: 0;
  animation: fadeIn 0.15s ease forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

.block-handle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #9b9a97;
  transition: all 0.15s;
}

.block-handle-btn:hover {
  background: #f1f1f0;
  color: #37352f;
}

.block-handle-btn i {
  font-size: 1rem;
}

/* Block Options Menu */
.block-options-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 180px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
  z-index: 100;
}

.block-options-section {
  padding: 4px 0;
}

.block-options-label {
  padding: 4px 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #9b9a97;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.block-options-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 8px;
}

.block-options-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #37352f;
  text-align: left;
  transition: background-color 0.1s;
}

.block-options-item:hover {
  background: #f1f1f0;
}

.block-options-item i {
  color: #9b9a97;
  width: 16px;
  text-align: center;
}

.block-options-section:first-child .block-options-item:first-of-type:hover i {
  color: #eb5757;
}

/* Responsive */
@media (max-width: 768px) {
  .notion-content-wrapper {
    padding-left: 40px;
  }

  .notion-editor-content {
    padding: 1rem 1rem 1rem 0;
  }

  .slash-menu {
    width: calc(100vw - 32px);
    max-width: 320px;
  }

  .block-handle {
    left: 4px;
  }
}
</style>
