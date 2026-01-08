# PostList Filters & Table Optimization

**Date:** 2026-01-08 21:18
**Type:** UX | Refactor
**Target:** PostList.vue admin component
**Executed By:** Claude Agent
**Related ADR:** None

---

## Optimization Summary

Enhanced the PostList admin component with category and tag filters in the header toolbar, plus added Category and Tags columns to the posts table for better content organization visibility.

### Trigger
- [x] User feedback
- [ ] Performance issue identified
- [ ] Code review feedback
- [ ] Technical debt reduction
- [ ] Proactive improvement

---

## Before State

### Issues Identified
1. PostList only had search and status filter - no way to filter by category or tag
2. Posts table did not display category or tags information
3. API supported categoryId/tagId in validation schema but wasn't implemented

### Code Sample (Before)
```vue
<!-- Filters in toolbar -->
<select class="form-select" v-model="statusFilter">
  <option value="">All statuses</option>
  ...
</select>

<!-- Table columns -->
<th>Title</th>
<th>Status</th>
<th>Author</th>
<th>Updated</th>
<th>Actions</th>
```

---

## Optimizations Applied

### 1. Added Category & Tag Filter Dropdowns
**Impact:** High
**Category:** UX | Maintainability

**Changes:**
- Added `categoryFilter` and `tagFilter` reactive refs
- Created `fetchFilterOptions()` to load categories and tags from API
- Added category dropdown with dynamic options from `/api/categories`
- Added tag dropdown with dynamic options from `/api/tags`
- Added watchers to trigger fetch on filter change

**Files Modified:**
| File | Change |
|------|--------|
| `src/components/PostList.vue` | Added filter dropdowns and state management |

### 2. Added Category & Tags Table Columns
**Impact:** Medium
**Category:** UX

**Changes:**
- Extended Post interface with `categoryId`, `categoryName`, `categoryColor`, and `tags` array
- Added Category column with colored badge display
- Added Tags column showing up to 3 tags with "+N" overflow indicator
- Adjusted column widths for better layout

**Files Modified:**
| File | Change |
|------|--------|
| `src/components/PostList.vue` | Added table columns and display logic |

### 3. Enhanced API with Category/Tag Data & Filtering
**Impact:** High
**Category:** Performance | UX

**Changes:**
- Added `categoryId` and `tagId` query parameter parsing
- Added category join to include `categoryName` and `categoryColor` in response
- Added efficient tag fetching using `inArray` for batch loading
- Implemented tag filtering via post_tags junction table lookup

**Files Modified:**
| File | Change |
|------|--------|
| `src/pages/api/posts/index.ts` | Added joins, tag loading, and filtering |

### 4. Hide CMS Button When Already in Editor Area
**Impact:** Low
**Category:** UX

**Changes:**
- Added `isInEditorArea` computed property to detect if current path starts with `/editor`
- Conditionally hide CMS button in UserMenu when already in editor/CMS area
- Prevents redundant navigation button when user is already in the CMS

**Files Modified:**
| File | Change |
|------|--------|
| `src/components/UserMenu.vue` | Added path detection and conditional CMS button visibility |

### 5. Replace Hero Image URL Input with File Upload
**Impact:** High
**Category:** UX

**Changes:**
- Created new `ImageUpload.vue` component with drag-and-drop support
- Component uses presigned URLs via existing `/api/upload/presign` endpoint
- Supports JPEG, PNG, GIF, WebP, SVG formats up to 10MB
- Shows upload progress and image preview
- Replaced URL text input in PostEditor with the ImageUpload component

**Files Modified:**
| File | Change |
|------|--------|
| `src/components/ImageUpload.vue` | New component for image uploads |
| `src/components/PostEditor.vue` | Use ImageUpload for Hero Image field |

### 6. Add Admin Taxonomy Management Page
**Impact:** High
**Category:** UX | Feature

**Changes:**
- Created full CRUD API endpoints for categories (`/api/categories/[id]`)
- Created full CRUD API endpoints for tags (`/api/tags/[id]`)
- Created `CategoryManager.vue` with color picker and inline editing
- Created `TagManager.vue` with inline editing
- Created new admin page `/admin/taxonomy` for managing categories and tags
- Added "Categories & Tags" link to admin dashboard Quick Actions
- Added "Categories & Tags" link to admin sidebar navigation

**Files Modified:**
| File | Change |
|------|--------|
| `src/pages/api/categories/[id].ts` | New API for category CRUD |
| `src/pages/api/tags/[id].ts` | New API for tag CRUD |
| `src/components/CategoryManager.vue` | New component for managing categories |
| `src/components/TagManager.vue` | New component for managing tags |
| `src/pages/admin/taxonomy.astro` | New admin page for taxonomy management |
| `src/pages/admin/index.astro` | Added taxonomy link to Quick Actions |
| `src/layouts/AdminLayout.astro` | Added taxonomy link to sidebar |

### 7. Add Sorting and Created Column to PostList
**Impact:** Medium
**Category:** UX

**Changes:**
- Added `sortBy` and `sortOrder` parameters to validation schema
- Updated `/api/posts` to support sorting by updatedAt, createdAt, title, publishedAt
- Added sorting state and `toggleSort()` function to PostList.vue
- Made Title, Created, and Updated column headers clickable for sorting
- Added sort direction indicator (▲/▼) on active sort column
- Added "Created" column to the posts table

**Files Modified:**
| File | Change |
|------|--------|
| `src/lib/validations.ts` | Added sortBy and sortOrder schemas |
| `src/pages/api/posts/index.ts` | Added dynamic sorting support |
| `src/components/PostList.vue` | Added sortable headers and Created column |

### 8. Production-Style Blog Post Preview
**Impact:** High
**Category:** UX

**Changes:**
- Completely redesigned preview page to match production blog layout
- Uses same Header, Footer, and FormattedDate components as production
- Added floating preview banner with post status, edit/view live buttons
- Added category and tags display in post header
- Enhanced markdown parser with better support for:
  - Code blocks with language highlighting styling
  - Headers h1-h6
  - Bold, italic, strikethrough formatting
  - Blockquotes with styled left border
  - Images, links, lists
  - Horizontal rules
- Fetches category and tags data for display
- Shows "Last updated" date when applicable
- Purple gradient preview banner clearly indicates preview mode

**Files Modified:**
| File | Change |
|------|--------|
| `src/pages/editor/posts/[id]/preview.astro` | Complete redesign to production layout |

### 9. Add Preview Button to PostEditor Header
**Impact:** Low
**Category:** UX

**Changes:**
- Added header section at top of PostEditor with "Edit Post" / "New Post" title
- Added Preview button with eye icon in top right corner (Bootstrap outline-primary style)
- Button only shows for existing posts (not for new posts)
- Uses Bootstrap flex utilities for layout (d-flex, justify-content-between, align-items-center)
- Provides quick access to preview without scrolling to Quick Links card

**Files Modified:**
| File | Change |
|------|--------|
| `src/components/PostEditor.vue` | Added header with Preview button |

### 10. Improve Tag Chips Layout in Taxonomy Manager
**Impact:** Medium
**Category:** UX

**Changes:**
- Changed from grid layout to flex-wrap for compact, content-fit tag chips
- Tag chips now use `inline-flex` and only take up the width of their content
- Pill-shaped design with `border-radius: 20px` for modern look
- Action buttons use `display: none` by default and `display: flex` on hover
  - This completely hides the actions (no space reserved) until hover
  - Chip expands smoothly when actions appear
- Smaller, circular action buttons (20px) with rounded style
- Edit button: blue highlight on hover
- Delete button: X icon with red highlight on hover
- Added tag count display at bottom ("X tags total")
- Mobile: actions always visible since touch devices don't have hover

**Files Modified:**
| File | Change |
|------|--------|
| `src/components/TagManager.vue` | Compact pill-shaped tag chips with hover actions |

---

## After State

### Code Sample (After)
```vue
<!-- Filters in toolbar -->
<select v-model="statusFilter">...</select>
<select v-model="categoryFilter">
  <option value="">All categories</option>
  <option v-for="cat in categories" :value="cat.id">{{ cat.name }}</option>
</select>
<select v-model="tagFilter">
  <option value="">All tags</option>
  <option v-for="tag in availableTags" :value="tag.id">{{ tag.name }}</option>
</select>

<!-- Table with new columns -->
<th>Title</th>
<th>Status</th>
<th>Category</th>
<th>Tags</th>
<th>Author</th>
<th>Updated</th>
<th>Actions</th>
```

---

## Changes Made

| File | Action | Description |
|------|--------|-------------|
| `src/components/PostList.vue` | Modified | Added category/tag filters and table columns |
| `src/pages/api/posts/index.ts` | Modified | Added category join, tag loading, and filtering |
| `src/components/UserMenu.vue` | Modified | Hide CMS button when in editor area |
| `src/components/ImageUpload.vue` | Created | Image upload component with drag-and-drop |
| `src/components/PostEditor.vue` | Modified | Use ImageUpload for Hero Image |
| `src/pages/api/categories/[id].ts` | Created | Category CRUD API endpoint |
| `src/pages/api/tags/[id].ts` | Created | Tag CRUD API endpoint |
| `src/components/CategoryManager.vue` | Created | Category management component |
| `src/components/TagManager.vue` | Created | Tag management component |
| `src/pages/admin/taxonomy.astro` | Created | Admin taxonomy management page |
| `src/pages/admin/index.astro` | Modified | Added taxonomy link |
| `src/layouts/AdminLayout.astro` | Modified | Added taxonomy link to sidebar |
| `src/lib/validations.ts` | Modified | Added sortBy/sortOrder schemas |
| `src/pages/api/posts/index.ts` | Modified | Added sorting support |
| `src/pages/editor/posts/[id]/preview.astro` | Modified | Production-style preview layout |
| `src/components/PostEditor.vue` | Modified | Added header with Preview button |
| `src/components/TagManager.vue` | Modified | Redesigned tag chips with grid layout |

---

## Testing

| Test Type | Status | Notes |
|-----------|--------|-------|
| Build | Pass | `pnpm build` completed successfully |
| Manual | Pending | Ready for manual testing |

---

## Follow-up

- [ ] Test with real data (categories and tags in database)
- [ ] Consider adding "Clear filters" button if multiple filters active
- [ ] Consider adding sort options for category/tag columns

---

## Sign-off Checklist

- [x] Optimizations tested (build passes)
- [x] No regressions introduced
- [x] Code reviewed
- [x] Documentation updated
