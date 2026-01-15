# /ui-polish - UI Polish & Visual Refinement Command

## Purpose
Systematically improve UI quality by analyzing and fixing spacing, gaps, layout consistency, and visual effects across components and pages.

## Usage
```
/ui-polish <target> [--scope=<component|page|section>] [--focus=<spacing|layout|effects|all>] [--severity=<critical|all>]
```

### Arguments
- `<target>`: File path, component name, or page route to analyze
- `--scope`: Limit analysis scope (default: `component`)
- `--focus`: Specific area to focus on (default: `all`)
- `--severity`: Only show critical issues or all (default: `all`)

### Examples
```bash
/ui-polish src/components/BookingCard.tsx
/ui-polish src/app/checkout --scope=page --focus=spacing
/ui-polish src/components/ui --scope=section --focus=effects
```

---

## Execution Flow

### Phase 1: Discovery & Analysis

#### 1.1 Load Target Files
```
Action: Read target file(s) and identify:
- Component structure
- Tailwind classes used
- Parent/child relationships
- Responsive breakpoints
- RTL/LTR considerations
```

#### 1.2 Spacing Analysis
Evaluate all spacing-related properties:

| Category | What to Check | Common Issues |
|----------|---------------|---------------|
| **Gaps** | `gap-*`, `space-x-*`, `space-y-*` | Inconsistent gap values, missing gaps in flex/grid |
| **Padding** | `p-*`, `px-*`, `py-*`, `pt/pb/pl/pr-*` | Asymmetric padding, insufficient touch targets |
| **Margins** | `m-*`, `mx-*`, `my-*`, `mt/mb/ml/mr-*` | Margin collapse issues, inconsistent spacing |
| **Container** | `max-w-*`, `container`, `w-full` | Content overflow, improper centering |

#### 1.3 Layout Analysis
Evaluate structural layout:

| Category | What to Check | Common Issues |
|----------|---------------|---------------|
| **Flexbox** | `flex`, `flex-col`, `items-*`, `justify-*` | Alignment inconsistencies, missing flex-wrap |
| **Grid** | `grid`, `grid-cols-*`, `col-span-*` | Broken grid at breakpoints, uneven columns |
| **Positioning** | `relative`, `absolute`, `fixed`, `sticky` | Z-index conflicts, overflow clipping |
| **Overflow** | `overflow-*`, `truncate`, `line-clamp-*` | Hidden content, scroll issues |

#### 1.4 Visual Effects Analysis
Evaluate animations and visual feedback:

| Category | What to Check | Common Issues |
|----------|---------------|---------------|
| **Transitions** | `transition-*`, `duration-*`, `ease-*` | Missing transitions, janky animations |
| **Hover States** | `hover:*`, `focus:*`, `active:*` | Missing feedback, inconsistent states |
| **Shadows** | `shadow-*`, `ring-*` | Harsh shadows, missing elevation hierarchy |
| **Colors** | `bg-*`, `text-*`, `border-*` | Low contrast, inconsistent color usage |
| **Borders** | `border-*`, `rounded-*`, `divide-*` | Inconsistent radius, missing borders |

---

### Phase 2: Issue Detection

#### 2.1 Generate Issue Report
For each issue found, document:

```markdown
## Issue: [ISSUE_ID]
- **Severity**: Critical | Major | Minor | Enhancement
- **Category**: Spacing | Layout | Effects
- **Location**: File path and line number
- **Current**: Current implementation
- **Problem**: What's wrong
- **Impact**: User experience impact
- **Suggested Fix**: Recommended solution
```

#### 2.2 Severity Classification

| Severity | Criteria |
|----------|----------|
| **Critical** | Broken layout, content overflow, unusable on mobile/RTL |
| **Major** | Significant visual inconsistency, poor UX, accessibility issues |
| **Minor** | Small visual imperfections, polish opportunities |
| **Enhancement** | Optimization suggestions, best practice improvements |

---

### Phase 3: Implementation

#### 3.1 Fix Application Order
1. **Critical issues first** - Layout breaking problems
2. **Major issues** - Significant visual problems
3. **Minor issues** - Polish and refinement
4. **Enhancements** - Optional improvements

#### 3.2 Fix Patterns

**Spacing Fixes:**
```tsx
// Before: Inconsistent spacing
<div className="p-2 md:p-4 lg:p-8">

// After: Consistent scale
<div className="p-4 md:p-6 lg:p-8">
```

**Layout Fixes:**
```tsx
// Before: Missing responsive handling
<div className="flex gap-4">

// After: Proper responsive layout
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
```

**Effect Fixes:**
```tsx
// Before: No transition
<button className="bg-blue-500 hover:bg-blue-600">

// After: Smooth transition
<button className="bg-blue-500 hover:bg-blue-600 transition-colors duration-200">
```

#### 3.3 RTL Considerations
Always verify RTL compatibility:
```tsx
// Use logical properties where possible
className="ps-4 pe-2"  // Instead of pl-4 pr-2
className="ms-auto"    // Instead of ml-auto
className="start-0"    // Instead of left-0
```

---

### Phase 4: Validation

#### 4.1 Visual Checklist
- [ ] Spacing is consistent across similar components
- [ ] Layout works at all breakpoints (sm, md, lg, xl, 2xl)
- [ ] RTL layout mirrors correctly
- [ ] Hover/focus states provide clear feedback
- [ ] Transitions are smooth (no janky animations)
- [ ] Touch targets meet minimum size (44x44px)
- [ ] Text is readable (sufficient contrast)
- [ ] No content overflow or clipping

#### 4.2 Technical Validation
```bash
# Run type check
npx tsc --noEmit

# Run linter
npm run lint

# Visual regression (if available)
npm run test:visual
```

---

### Phase 5: Documentation

#### 5.1 Create Agent Log Entry
Create documentation in `docs/AGENT_LOGS/`:

**Filename Format:** `YYYY-MM-DD_ui-polish_<target-name>.md`

**Template:**
```markdown
# UI Polish: [Target Name]

**Date:** YYYY-MM-DD
**Command:** `/ui-polish <target> [options]`
**Agent:** Claude

---

## Summary
Brief description of what was analyzed and improved.

## Scope
- **Target:** [file/component/page path]
- **Focus Areas:** [spacing, layout, effects]
- **Files Modified:** [count]

---

## Issues Found

### Critical (X issues)
| ID | Location | Problem | Status |
|----|----------|---------|--------|
| C1 | file:line | Description | ✅ Fixed |

### Major (X issues)
| ID | Location | Problem | Status |
|----|----------|---------|--------|
| M1 | file:line | Description | ✅ Fixed |

### Minor (X issues)
| ID | Location | Problem | Status |
|----|----------|---------|--------|
| m1 | file:line | Description | ✅ Fixed |

---

## Changes Made

### File: `path/to/file.tsx`

#### Change 1: [Brief description]
**Before:**
\`\`\`tsx
// Old code
\`\`\`

**After:**
\`\`\`tsx
// New code
\`\`\`

**Rationale:** Why this change improves the UI.

---

## Visual Comparison
[Before/after screenshots or descriptions]

---

## Testing Notes
- [ ] Tested on mobile viewport
- [ ] Tested on desktop viewport
- [ ] Tested RTL layout
- [ ] Tested hover/focus states
- [ ] No visual regressions

---

## Recommendations
Any follow-up improvements or related issues to address.
```

---

## Spacing Scale Reference

Use consistent Tailwind spacing scale:

| Token | Value | Use Case |
|-------|-------|----------|
| `1` | 4px | Tight spacing, icons |
| `2` | 8px | Compact elements |
| `3` | 12px | Small gaps |
| `4` | 16px | Standard padding/gaps |
| `5` | 20px | Medium spacing |
| `6` | 24px | Section padding |
| `8` | 32px | Large gaps |
| `10` | 40px | Section margins |
| `12` | 48px | Page sections |
| `16` | 64px | Hero sections |

---

## Common Patterns

### Card Component
```tsx
<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm 
               transition-shadow duration-200 hover:shadow-md">
  <div className="flex flex-col gap-3">
    {/* Card content */}
  </div>
</div>
```

### Button with States
```tsx
<button className="rounded-md bg-primary px-4 py-2 text-white
                   transition-all duration-200
                   hover:bg-primary-dark hover:shadow-md
                   focus:outline-none focus:ring-2 focus:ring-primary/50
                   active:scale-[0.98]
                   disabled:cursor-not-allowed disabled:opacity-50">
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 gap-4 
                sm:grid-cols-2 sm:gap-5
                lg:grid-cols-3 lg:gap-6">
```

### Form Layout
```tsx
<div className="flex flex-col gap-4">
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-medium">Label</label>
    <input className="rounded-md border px-3 py-2 
                      transition-colors duration-200
                      focus:border-primary focus:ring-1 focus:ring-primary" />
  </div>
</div>
```

---

## Integration with Other Commands

This command works well with:
- `/ux-improve` - For broader UX analysis
- `/optimize` - For performance after visual changes
- `/exec` - For implementing larger refactors

---

## Output
Upon completion, provide:
1. Summary of issues found by severity
2. List of files modified
3. Link to generated agent log
4. Any follow-up recommendations

It will be stored in this folder with the current pattern: `docs/AGENTS_LOG/YYYY_MM_DD_HHmm__*.md`
