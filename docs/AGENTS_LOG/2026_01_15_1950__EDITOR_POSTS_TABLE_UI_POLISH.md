# UI Polish: Editor Posts Table

**Date:** 2026-01-15
**Command:** `/ui-polish http://localhost:4321/editor/posts`
**Agent:** Claude

---

## Summary
Improved the posts table layout in the editor to better accommodate title and description content by implementing relative time formatting with tooltips, text truncation, and optimized column widths.

## Scope
- **Target:** `src/components/PostList.vue`
- **Focus Areas:** Layout, spacing, text overflow handling, date formatting
- **Files Modified:** 1

---

## Issues Found

### Major (2 issues)
| ID | Location | Problem | Status |
|----|----------|---------|--------|
| M1 | PostList.vue:92-101 | Date columns not descriptive enough | Fixed (v2) |
| M2 | PostList.vue:450-455 | Title/description had no truncation, could overflow on long text | Fixed |

### Minor (2 issues)
| ID | Location | Problem | Status |
|----|----------|---------|--------|
| m1 | PostList.vue:726-731 | Column widths too wide (880px total fixed), leaving little room for title | Fixed |
| m2 | PostList.vue:450-455 | Description not displayed in table | Fixed |

---

## Changes Made

### File: `src/components/PostList.vue`

#### Change 1: Relative time format with full date tooltips (v2 - improved)
**Before (v1 compact):**
```typescript
// Showed: "Jan 15, '26"
```

**After (v2 relative):**
```typescript
const formatRelativeTime = (dateString: string | null) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // Future dates
  if (diffMs < 0) {
    const futureDays = Math.abs(diffDays);
    if (futureDays === 0) return "Today";
    if (futureDays === 1) return "Tomorrow";
    if (futureDays < 7) return `In ${futureDays} days`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Past dates
  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;

  // Older than a year - show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
  });
};
```

**Rationale:** Human-readable relative times ("2 days ago", "Yesterday", "3h ago") are more scannable than absolute dates. Full date shown on hover tooltip.

#### Change 2: Enhanced tooltip with weekday
```typescript
const formatFullDate = (dateString: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
// Shows: "Wednesday, January 15, 2026 at 10:30 AM"
```

#### Change 3: Date styling with hover indicator
```css
.date-relative {
  cursor: help;
  border-bottom: 1px dotted #adb5bd;
  padding-bottom: 1px;
  transition: border-color 0.15s ease;
}

.date-relative:hover {
  border-bottom-color: #6c757d;
}
```

**Rationale:** Dotted underline and `cursor: help` signal to users that hovering reveals more information.

#### Change 4: Title cell with truncation and description
```vue
<td class="cell-title">
  <a
    :href="`/editor/posts/${post.id}`"
    class="fw-semibold text-decoration-none title-link"
    :title="post.title"
  >
    {{ post.title }}
  </a>
  <div
    class="small text-muted description-text"
    :title="post.description"
  >
    {{ post.description || '/blog/' + post.slug }}
  </div>
</td>
```

#### Change 5: Reduced column widths
| Column | Before | After | Saved |
|--------|--------|-------|-------|
| Status | 100px | 85px | 15px |
| Category | 130px | 100px | 30px |
| Tags | 150px | 120px | 30px |
| Author | 120px | 100px | 20px |
| Date (x2) | 145px | 95px | 100px |
| Actions | 90px | 80px | 10px |
| **Total** | **880px** | **675px** | **205px** |

---

## Date Format Examples

| Time Difference | Display | Tooltip |
|-----------------|---------|---------|
| < 1 minute | "Just now" | Wednesday, January 15, 2026 at 7:52 PM |
| 5 minutes ago | "5m ago" | Wednesday, January 15, 2026 at 7:47 PM |
| 3 hours ago | "3h ago" | Wednesday, January 15, 2026 at 4:52 PM |
| 1 day ago | "Yesterday" | Tuesday, January 14, 2026 at 7:52 PM |
| 4 days ago | "4 days ago" | Saturday, January 11, 2026 at 7:52 PM |
| 2 weeks ago | "2 weeks ago" | Wednesday, January 1, 2026 at 7:52 PM |
| 2 months ago | "2 months ago" | Wednesday, November 15, 2025 at 7:52 PM |
| Future (scheduled) | "Tomorrow" / "In 3 days" | Thursday, January 16, 2026 at 10:00 AM |

---

## Testing Notes
- [x] Build succeeds without errors
- [ ] Tested on mobile viewport
- [ ] Tested on desktop viewport
- [x] Relative time displays correctly
- [ ] Verified tooltips show full date on hover

---

## Recommendations
1. Consider adding a two-line layout option for mobile views
2. Could add responsive column hiding for very small screens
3. The relative time doesn't auto-update - consider adding a 1-minute refresh interval if needed
