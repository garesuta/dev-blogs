# Zod Validation Fix - Empty String URL Fields

**Date:** 2026-01-15 21:10
**Type:** Fix
**Target:** Post editor page validation
**Executed By:** Claude Agent

---

## Summary

Fixed Zod validation errors when loading or saving posts with empty URL fields (heroImage, ogImage, canonicalUrl). Empty strings were failing URL validation instead of being treated as null.

## Issue

When accessing `/editor/posts/[id]`, the page would break due to Zod validation failing when URL fields contained empty strings. The schema expected either:
- A valid URL string
- `null`
- `undefined`

But the form was sending empty strings `""` which failed the `.url()` validation.

---

## Root Cause

In `src/lib/validations.ts`, the URL fields were defined as:

```typescript
heroImage: z.string().url().optional().nullable(),
ogImage: z.string().url().optional().nullable(),
canonicalUrl: z.string().url().optional().nullable(),
```

This schema:
- Accepts `null` ✓
- Accepts `undefined` ✓
- Accepts valid URLs ✓
- **Rejects empty strings** ✗

---

## Solution

Created a helper schema that transforms empty strings to `null` before URL validation:

```typescript
const optionalUrlSchema = z
  .string()
  .transform((val) => (val === "" ? null : val))
  .pipe(z.string().url().nullable())
  .optional()
  .nullable();
```

Applied to `createPostSchema` for:
- `heroImage`
- `ogImage`
- `canonicalUrl`

Also updated `autoSavePostSchema` with a similar pattern for consistency.

---

## Changes Made

| File | Action | Description |
|------|--------|-------------|
| `src/lib/validations.ts` | Modified | Added `optionalUrlSchema` helper and applied to URL fields |

---

## Testing

| Test Type | Status | Notes |
|-----------|--------|-------|
| Build | Pass | `pnpm build` completes without errors |
| Type check | Pass | No TypeScript errors |

---

## Technical Details

The fix uses Zod's `.transform()` and `.pipe()` methods:
1. `.transform()` - Converts empty string to null
2. `.pipe()` - Passes the transformed value to URL validation

This pattern ensures:
- Empty strings → `null` (valid)
- Valid URLs → unchanged (valid)
- Invalid URLs → error (correct behavior)
- `null` → `null` (valid)
- `undefined` → `undefined` (valid)
