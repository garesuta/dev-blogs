# ADR-004: Migration from Toast UI Editor to Tiptap

**Status:** Proposed
**Date:** 2026-01-15
**Decision Makers:** Project Team
**Optimization Context:** Blog post editor efficiency and extensibility

---

## Context

The current blog post editor uses **Toast UI Editor** (`@toast-ui/editor` v3.2.2), a markdown-first editor that provides both markdown and WYSIWYG modes. While functional, we want to migrate to **Tiptap** for better Vue integration, extensibility, and modern architecture.

### Current State

**File:** `src/components/BlogEditor.vue`

- Uses `@toast-ui/editor` with dynamic imports to avoid SSR issues
- Features:
  - Markdown + WYSIWYG modes
  - Image upload via presigned URLs to MinIO
  - Auto-save with configurable interval
  - Ctrl+S keyboard shortcut
  - Save status indicator
- Bundle includes both `@toast-ui/editor` (172KB) and unused `tui-editor-vue3`

### Pain Points

1. **Limited Vue Integration** - Toast UI is vanilla JS, requires manual DOM management
2. **Large Bundle Size** - Toast UI + CSS is ~300KB gzipped
3. **Limited Extensibility** - Hard to add custom formatting, mentions, embeds
4. **No Collaborative Editing** - No Yjs/Hocuspocus support
5. **Dated UI** - Toolbar doesn't match Bootstrap styling well
6. **Markdown-Centric** - Forces markdown mindset even in WYSIWYG mode

### Optimization Goals

1. Better Vue 3 integration with native component support
2. Smaller bundle size with tree-shaking
3. Extensible architecture for future features (mentions, embeds, comments)
4. Modern, customizable UI that matches Bootstrap theme
5. Potential for collaborative editing in future

---

## Decision

**Migrate from Toast UI Editor to Tiptap 2.x with ProseMirror foundation.**

### Why Tiptap

| Feature | Toast UI | Tiptap |
|---------|----------|--------|
| Vue 3 Support | Wrapper only | Native components |
| Bundle Size | ~300KB | ~50-100KB (tree-shakeable) |
| Extensibility | Limited | Excellent (extensions system) |
| Collaborative | No | Yes (Yjs integration) |
| Custom Nodes | Difficult | Easy |
| TypeScript | Partial | Full support |
| Maintenance | Slow updates | Active development |

### Implementation Approach

Tiptap with these extensions for feature parity:
- `@tiptap/starter-kit` - Basic formatting (bold, italic, headings, lists, etc.)
- `@tiptap/extension-image` - Image handling
- `@tiptap/extension-link` - Link support
- `@tiptap/extension-code-block-lowlight` - Syntax highlighted code blocks
- `@tiptap/extension-placeholder` - Placeholder text
- `@tiptap/extension-table` - Table support

---

## Migration Plan

### Phase 1: Setup & Dependencies (Day 1)

#### 1.1 Install Tiptap packages
```bash
pnpm add @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit \
  @tiptap/extension-image @tiptap/extension-link \
  @tiptap/extension-code-block-lowlight @tiptap/extension-placeholder \
  @tiptap/extension-table @tiptap/extension-table-row \
  @tiptap/extension-table-cell @tiptap/extension-table-header \
  lowlight
```

#### 1.2 Remove old dependencies
```bash
pnpm remove @toast-ui/editor tui-editor-vue3
```

### Phase 2: Create New Editor Component (Day 1-2)

#### 2.1 Create `src/components/TiptapEditor.vue`

```vue
<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { common, createLowlight } from 'lowlight'

const props = defineProps<{
  modelValue: string
  postId?: string | null
  placeholder?: string
  autoSaveInterval?: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save', content: string): void
}>()

const lowlight = createLowlight(common)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      codeBlock: false, // Use lowlight version instead
    }),
    Image.configure({
      allowBase64: false,
      HTMLAttributes: {
        class: 'img-fluid rounded',
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary',
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder || 'Write your post content here...',
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-lg focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})
</script>
```

#### 2.2 Create Toolbar Component `src/components/TiptapToolbar.vue`

Bootstrap-styled toolbar with formatting buttons.

#### 2.3 Create Bubble Menu Component (optional)

For inline formatting when text is selected.

### Phase 3: Image Upload Integration (Day 2)

#### 3.1 Migrate image upload logic

The existing `handleImageUpload` function from `BlogEditor.vue` will be adapted:

```typescript
// Create custom image upload extension
const CustomImage = Image.extend({
  addCommands() {
    return {
      ...this.parent?.(),
      uploadImage: (file: File) => ({ commands }) => {
        // Use existing presign → upload → confirm flow
        return handleImageUpload(file).then(url => {
          commands.setImage({ src: url, alt: file.name })
        })
      },
    }
  },
})
```

### Phase 4: Feature Parity (Day 2-3)

#### 4.1 Implement all current features

| Feature | Current (Toast UI) | New (Tiptap) |
|---------|-------------------|--------------|
| Bold/Italic/Strike | ✓ | StarterKit |
| Headings (H1-H6) | ✓ | StarterKit |
| Lists (ul/ol/task) | ✓ | StarterKit + TaskList |
| Blockquote | ✓ | StarterKit |
| Code block | ✓ | CodeBlockLowlight |
| Inline code | ✓ | StarterKit |
| Links | ✓ | Link extension |
| Images | ✓ | Image extension |
| Tables | ✓ | Table extension |
| Horizontal rule | ✓ | StarterKit |
| Auto-save | ✓ | Custom logic |
| Ctrl+S save | ✓ | Custom shortcut |
| Save status | ✓ | Computed property |

#### 4.2 Markdown import/export

Tiptap is HTML-native, but we can add markdown support:

```bash
pnpm add @tiptap/extension-markdown
# OR use marked for conversion
```

### Phase 5: Styling (Day 3)

#### 5.1 Create Bootstrap-compatible styles

```css
/* TiptapEditor styles matching Bootstrap theme */
.tiptap-editor {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.tiptap-toolbar {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tiptap-toolbar .btn {
  padding: 0.375rem 0.5rem;
}

.tiptap-toolbar .btn.is-active {
  background-color: #0d6efd;
  color: white;
}

.ProseMirror {
  padding: 1rem;
  min-height: 400px;
  outline: none;
}

.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
```

### Phase 6: Integration & Testing (Day 3-4)

#### 6.1 Update PostEditor.vue

Replace `BlogEditor` import with `TiptapEditor`:

```vue
<script setup lang="ts">
// Before
import BlogEditor from "./BlogEditor.vue";

// After
import TiptapEditor from "./TiptapEditor.vue";
</script>

<template>
  <!-- Before -->
  <BlogEditor
    :model-value="post.content || ''"
    @update:model-value="handleContentChange"
    @save="handleEditorSave"
    :post-id="postId"
    :auto-save-interval="30"
  />

  <!-- After -->
  <TiptapEditor
    :model-value="post.content || ''"
    @update:model-value="handleContentChange"
    @save="handleEditorSave"
    :post-id="postId"
    :auto-save-interval="30"
  />
</template>
```

#### 6.2 Handle content format migration

If existing posts are stored as Markdown:
- Option A: Convert to HTML on load, store as HTML
- Option B: Keep Markdown storage, convert on edit
- Option C: Migrate all content to HTML (recommended)

#### 6.3 Update preview component

The `PostEditor.vue` preview currently uses a custom `markdownToHtml()` function. With Tiptap's HTML output, this simplifies to direct rendering.

### Phase 7: Cleanup (Day 4)

#### 7.1 Remove old files
- Delete `src/components/BlogEditor.vue`
- Remove unused CSS imports

#### 7.2 Update documentation
- Update CLAUDE.md if needed
- Create AGENTS_LOG entry

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modify | Add Tiptap deps, remove Toast UI |
| `src/components/TiptapEditor.vue` | Create | New editor component |
| `src/components/TiptapToolbar.vue` | Create | Toolbar component |
| `src/components/BlogEditor.vue` | Delete | Remove old editor |
| `src/components/PostEditor.vue` | Modify | Update import |

---

## Rollback Plan

If issues arise after deployment:

```bash
# Revert to previous commit
git revert <tiptap-migration-commit>

# Reinstall old dependencies
pnpm add @toast-ui/editor@3.2.2 tui-editor-vue3@0.2.0
```

**Data considerations:**
- If content format changed (MD → HTML), need migration script
- Keep backup of posts table before migration

---

## Alternatives Considered

### 1. Keep Toast UI Editor
- **Pros:** No migration effort, known working
- **Cons:** Limited extensibility, large bundle, poor Vue integration
- **Rejected:** Doesn't meet future feature requirements

### 2. Use Quill Editor
- **Pros:** Popular, good docs
- **Cons:** Less extensible than Tiptap, larger bundle
- **Rejected:** Tiptap has better Vue 3 support

### 3. Use Milkdown
- **Pros:** Markdown-first, plugin system
- **Cons:** Smaller community, less mature
- **Rejected:** Tiptap has more extensions and support

### 4. Use Editor.js
- **Pros:** Block-based editing
- **Cons:** Different paradigm, no native Vue
- **Rejected:** Too different from current UX

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Editor bundle size | ~300KB | <100KB |
| Time to interactive | ~800ms | <400ms |
| Extensions available | ~10 | ~50+ |
| Vue 3 integration | Wrapper | Native |

---

## Timeline Estimate

| Phase | Effort |
|-------|--------|
| Phase 1: Setup | 1-2 hours |
| Phase 2: Base component | 3-4 hours |
| Phase 3: Image upload | 2-3 hours |
| Phase 4: Feature parity | 4-6 hours |
| Phase 5: Styling | 2-3 hours |
| Phase 6: Integration | 2-3 hours |
| Phase 7: Cleanup | 1 hour |
| **Total** | **15-22 hours** |

---

## References

- [Tiptap Documentation](https://tiptap.dev/)
- [Tiptap Vue 3 Guide](https://tiptap.dev/docs/editor/getting-started/install/vue3)
- [ProseMirror Guide](https://prosemirror.net/docs/guide/)
- [Toast UI Editor](https://ui.toast.com/tui-editor) (current)
