# Tiptap Editor Migration

**Date:** 2026-01-15 21:15
**Type:** Refactor (Architectural)
**Target:** Blog post editor
**Executed By:** Claude Agent
**Related ADR:** [ADR-004-tiptap-editor-migration.md](../ADR/004-tiptap-editor-migration.md)

---

## Summary

Migrated the blog post editor from Toast UI Editor to Tiptap for better Vue 3 integration, extensibility, and modern architecture.

### Trigger
- [x] Proactive improvement
- [x] Technical debt reduction
- [ ] Performance issue identified
- [ ] User feedback

---

## Before State

- **Editor:** Toast UI Editor (`@toast-ui/editor` v3.2.2)
- **Component:** `src/components/BlogEditor.vue`
- **Integration:** Vanilla JS wrapper with manual DOM management
- **Bundle:** ~300KB (editor + CSS)

---

## Changes Made

### Dependencies

**Added:**
- `@tiptap/vue-3` - Vue 3 integration
- `@tiptap/pm` - ProseMirror adapter
- `@tiptap/starter-kit` - Core formatting extensions
- `@tiptap/extension-image` - Image support
- `@tiptap/extension-link` - Link support
- `@tiptap/extension-code-block-lowlight` - Syntax highlighted code blocks
- `@tiptap/extension-placeholder` - Placeholder text
- `@tiptap/extension-table` - Table support (includes row, cell, header)
- `lowlight` - Syntax highlighting

**Removed:**
- `@toast-ui/editor`
- `tui-editor-vue3`

### Files

| File | Action | Description |
|------|--------|-------------|
| `src/components/TiptapEditor.vue` | Created | New Tiptap-based editor with toolbar |
| `src/components/PostEditor.vue` | Modified | Updated to use TiptapEditor |
| `src/components/BlogEditor.vue` | Deleted | Replaced by TiptapEditor |
| `package.json` | Modified | Updated dependencies |
| `docs/ADR/004-tiptap-editor-migration.md` | Created | Architecture decision record |
| `docs/plans/2026/01/tiptap-editor-migration.md` | Created | Migration plan |

---

## TiptapEditor Features

### Toolbar Groups
1. **Text Formatting:** Bold, Italic, Strikethrough, Inline Code
2. **Headings:** H1, H2, H3, H4
3. **Lists:** Bullet list, Numbered list
4. **Block Elements:** Blockquote, Code block, Horizontal rule
5. **Insert:** Link, Image, Table
6. **History:** Undo, Redo

### Editor Features
- Bootstrap-styled toolbar with active state indicators
- Keyboard shortcut: `Ctrl+S` to save
- Auto-save with configurable interval
- Save status indicator (idle, saving, saved, error)
- Image upload via presigned URLs to MinIO
- Drag-and-drop image upload
- Paste image upload
- Link modal for inserting/editing links
- Syntax-highlighted code blocks
- Table support with resizable columns

---

## After State

- **Editor:** Tiptap 3.15.x
- **Component:** `src/components/TiptapEditor.vue`
- **Integration:** Native Vue 3 composition API
- **Bundle:** ~622KB (includes ProseMirror)

### Bundle Note
The initial bundle size increased due to ProseMirror's comprehensive editing framework. However, Tiptap offers:
- Better tree-shaking potential
- More extensions without additional size
- Collaborative editing capability (future)

---

## Testing

| Test Type | Status | Notes |
|-----------|--------|-------|
| Build | Pass | `pnpm build` completes |
| Type Check | Pass | No TypeScript errors |
| Manual | Pending | Requires browser testing |

---

## Notion-like Features Added

### Slash Commands (type "/" to trigger)
- **Text** - Plain text paragraph
- **Heading 1/2/3** - Section headings
- **Bullet List** - Create bullet lists
- **Numbered List** - Create numbered lists
- **Quote** - Blockquote
- **Code Block** - Syntax-highlighted code
- **Divider** - Horizontal rule
- **Image** - Upload images
- **Table** - Insert tables

### Floating Toolbar
- Appears when text is selected
- Quick access to: Bold, Italic, Strikethrough, Code, Link

### Block Handle (+ and ⋮ buttons)
- Appears on the left when hovering over any block
- **+ Button:** Adds a new paragraph below and opens the slash command menu
- **⋮ Button:** Opens options menu with:
  - Delete block
  - Duplicate block
- Smooth fade-in animation
- Click outside to close options menu

### Clean UI
- Notion-style typography and spacing
- Minimal chrome, content-focused
- Placeholder text: "Type '/' for commands..."

---

## Follow-up Tasks

- [x] Add block handle with insert (+) and options (⋮) buttons
- [ ] Add drag-and-drop block reordering
- [ ] Consider lazy loading editor to reduce initial bundle
- [ ] Test collaborative editing with Yjs

---

## Rollback

If issues arise:
```bash
git revert <commit-hash>
pnpm add @toast-ui/editor@3.2.2 tui-editor-vue3@0.2.0
```
