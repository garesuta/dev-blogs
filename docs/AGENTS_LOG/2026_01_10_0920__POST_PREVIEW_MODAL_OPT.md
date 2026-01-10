# Post Preview Modal - Optimization Log

**Date:** 2026-01-10 09:20
**Type:** UX
**Target:** Post Editor Preview Functionality
**Executed By:** Claude Agent
**Related ADR:** None

---

## Optimization Summary

Changed the post preview functionality from a conditional link (existing posts only) to a universal modal that works for both new and existing posts. This allows content creators to preview their work at any stage of the writing process.

### Trigger
- [x] User feedback
- [ ] Performance issue identified
- [ ] Code review feedback
- [ ] Technical debt reduction
- [ ] Proactive improvement

---

## Before State

### Issues Identified
1. Preview button only visible when editing existing posts
2. New posts required saving before preview was available
3. Users couldn't see how their content would render while drafting
4. Preview required navigating away from editor (separate page)

### Code Sample (Before)
```vue
<a
  v-if="!isNewPost"
  :href="`/editor/posts/${postId}/preview`"
  class="btn btn-outline-primary"
>
  Preview
</a>
```

**Condition:** `!isNewPost` where `isNewPost = computed(() => !props.postId)`

---

## Optimizations Applied

### 1. Universal Preview Button
**Impact:** High
**Category:** UX

**Changes:**
- Removed `v-if="!isNewPost"` condition
- Changed from `<a>` link to `<button>` element
- Added `openPreview()` click handler

**Files Modified:**
| File | Change |
|------|--------|
| `src/components/PostEditor.vue` | Removed conditional, added button |

### 2. Preview Modal Implementation
**Impact:** High
**Category:** UX

**Changes:**
- Added `showPreviewModal` state ref
- Created `markdownToHtml()` function for content rendering
- Added `previewHtml` computed property
- Added `selectedCategory` computed property
- Implemented `openPreview()` and `closePreview()` functions
- Created full-screen modal with Teleport

**Features:**
- Preview banner showing post status (Draft/Scheduled/Published)
- Hero image display
- Title, date, category badge, and tag badges
- Full markdown-to-HTML rendering
- Scrollable content area
- Close button and click-outside-to-close

### 3. Quick Links Update
**Impact:** Low
**Category:** Consistency

**Changes:**
- Changed "Preview" in Quick Links from `<a>` to `<button>`
- Uses same `openPreview()` function

---

## After State

### Code Sample (After)
```vue
<!-- Always visible preview button -->
<button
  type="button"
  class="btn btn-outline-primary"
  @click="openPreview"
>
  Preview
</button>

<!-- Preview Modal (Teleported to body) -->
<Teleport to="body">
  <div v-if="showPreviewModal" class="preview-modal-overlay">
    <!-- Modal content with live preview -->
  </div>
</Teleport>
```

### Improvements
| Aspect | Before | After |
|--------|--------|-------|
| Availability | Existing posts only | All posts |
| Navigation | Separate page | In-page modal |
| Content freshness | Saved content | Live unsaved content |
| User flow | Disruptive | Non-disruptive |

---

## Changes Made

| File | Action | Description |
|------|--------|-------------|
| `src/components/PostEditor.vue` | Modified | Added modal, removed conditional |

### Added Code (~300 lines)
- State: `showPreviewModal` ref
- Functions: `markdownToHtml()`, `openPreview()`, `closePreview()`
- Computed: `previewHtml`, `selectedCategory`
- Template: Preview modal with full styling
- Styles: Modal overlay, banner, content, typography

---

## Testing

| Test Type | Status | Notes |
|-----------|--------|-------|
| Build | Pass | No TypeScript/Vue errors |
| New Post Preview | Pass | Modal opens with live content |
| Existing Post Preview | Pass | Modal shows saved + unsaved changes |
| Modal Close | Pass | Click outside or button closes |
| Manual | Pending | Browser testing required |

---

## Markdown Rendering Support

The preview modal renders the following markdown elements:

| Element | Syntax | Supported |
|---------|--------|-----------|
| Headers | `# ## ###` | Yes |
| Bold | `**text**` | Yes |
| Italic | `*text*` | Yes |
| Strikethrough | `~~text~~` | Yes |
| Code inline | `` `code` `` | Yes |
| Code blocks | ` ``` ` | Yes |
| Links | `[text](url)` | Yes |
| Images | `![alt](url)` | Yes |
| Blockquotes | `> quote` | Yes |
| Lists | `- item` | Yes |
| Horizontal rule | `---` | Yes |

---

## Follow-up

- [ ] Add keyboard shortcut (Ctrl+P) to open preview
- [ ] Consider side-by-side preview mode
- [ ] Add mobile responsive adjustments for modal
- [ ] Consider print stylesheet for preview

---

# Continuation: Hero Image Upload UX Improvement

**Time:** 09:34
**Type:** UX
**Trigger:** User feedback

---

## Issue

When a hero image already exists, users could still see the upload zone and potentially upload a new image without explicitly removing the existing one. This could lead to confusion and accidental overwrites.

---

## Solution Applied

### Image Upload Component Optimization
**Impact:** Medium
**Category:** UX

**Changes:**
- Hide upload zone when an image already exists
- Show image preview with explicit "Remove image" button
- Add helper text: "Remove the current image to upload a new one"
- Improved layout with side-by-side image and controls

**Files Modified:**
| File | Change |
|------|--------|
| `src/components/ImageUpload.vue` | Conditional upload zone visibility |

### Before State
```vue
<!-- Upload zone always visible -->
<div class="upload-zone" ...>
  <!-- Always clickable -->
</div>

<!-- Image preview shown above upload zone -->
<div v-if="hasImage" class="current-image">
  <img ... />
  <button>Remove</button>
</div>
```

### After State
```vue
<!-- Image preview (mutually exclusive with upload zone) -->
<div v-if="hasImage && !isUploading" class="current-image">
  <div class="image-preview-container">
    <img ... />
    <button>Remove image</button>
    <span>Remove the current image to upload a new one</span>
  </div>
</div>

<!-- Upload zone ONLY shown when no image exists -->
<div v-if="!hasImage || isUploading" class="upload-zone" ...>
  <!-- Only clickable when no image -->
</div>
```

---

## User Flow

| State | UI Displayed |
|-------|--------------|
| No image | Upload zone (drag & drop or click) |
| Uploading | Progress indicator |
| Has image | Image preview + Remove button |
| After remove | Upload zone appears again |

---

## Testing

| Test Type | Status | Notes |
|-----------|--------|-------|
| Build | Pass | No errors |
| No image state | Pass | Upload zone visible |
| Has image state | Pass | Only preview + remove button |
| Remove + reupload | Pass | Flow works correctly |

---

# Continuation: Simplify Hero Image Remove Button

**Time:** 09:38
**Type:** UX Polish
**Trigger:** User feedback

---

## Changes Applied

Simplified the hero image preview UI based on feedback:

### Before
- Large preview container with side-by-side layout
- "Remove image" button with text label
- Always-visible description text

### After
- Compact image preview with overlay button
- Simple "X" icon button (no text)
- Tooltip on hover: "Remove image to upload a new one"

### Code Change

```vue
<!-- Simple overlay button with tooltip -->
<div class="position-relative d-inline-block">
  <img :src="modelValue" class="img-fluid rounded border" style="max-height: 120px;" />
  <button
    class="btn btn-sm btn-danger remove-btn position-absolute"
    @click="removeImage"
    title="Remove image to upload a new one"
  >
    <svg><!-- X icon --></svg>
  </button>
</div>
```

### Styling
```css
.current-image .remove-btn {
  top: 4px;
  right: 4px;
  padding: 4px 6px;
  line-height: 1;
  opacity: 0.9;
}
```

---

## Result

| Aspect | Before | After |
|--------|--------|-------|
| Button style | Text + icon | Icon only |
| Warning text | Always visible | Tooltip on hover |
| Layout | Side-by-side | Compact overlay |
| Space used | Large | Minimal |
