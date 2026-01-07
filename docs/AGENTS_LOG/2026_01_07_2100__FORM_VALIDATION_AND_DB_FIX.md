# Agent Log: Form Validation & Database Fix

**Date:** 2026-01-07
**Session Duration:** ~30 minutes
**Agent:** Claude Opus 4.5

---

## Summary

Fixed SSR warning on login page, added Zod-based form validation with Bootstrap styling to login and register forms, resolved database migration issues with Neon, and fixed post-auth redirect behavior.

---

## Changes Made

### 1. Fixed SSR Warning on Login Page

**File:** `src/pages/login.astro`

**Problem:** Warning about `Astro.request.headers` being used on a prerendered page.

**Solution:** Added `export const prerender = false;` to make the page server-rendered.

```astro
---
export const prerender = false;
// ... rest of imports
---
```

---

### 2. Added Zod Form Validation

**New File:** `src/lib/validations.ts`

Created shared validation schemas using Zod:

- `emailSchema` - Required, valid email format
- `passwordSchema` - Required, minimum 8 characters
- `nameSchema` - Required, minimum 2 characters
- `loginSchema` - Combines email + password
- `registerSchema` - Combines name + email + password + confirmPassword with password match validation
- `getFieldError()` - Helper to extract field errors from Zod issues

**Updated Files:**
- `src/components/LoginForm.vue`
- `src/components/RegisterForm.vue`

**Features Added:**
- Zod schema validation on form submit and field blur
- "Touched" state tracking - errors only show after user interacts with field
- Bootstrap validation classes (`is-valid`, `is-invalid`)
- `invalid-feedback` divs for error messages
- Real-time validation feedback

---

### 3. Created ADR for Form Validation

**New File:** `docs/ADR/002-zod-form-validation.md`

Documents the decision to use Zod + Bootstrap for form validation, including:
- Implementation patterns
- Component integration examples
- Must do / must not do guidelines

---

### 4. Fixed Database Migration Issues

**Problem:** `@neondatabase/serverless` driver only works via WebSocket in serverless environments, causing migration failures locally.

**Solution:**
1. Installed `postgres` package for migrations: `pnpm add postgres`
2. Removed incorrect `driver: "pglite"` from drizzle config
3. Drizzle-kit now auto-detects and uses `postgres` driver

**File:** `drizzle.config.ts` (reverted to default, no driver specified)

**Database Reset:**
- Dropped all existing tables (accounts, sessions, verifications, users, drizzle schema)
- Re-ran migrations successfully with `pnpm drizzle-kit migrate`

---

### 5. Fixed Post-Auth Redirect

**Files:**
- `src/components/LoginForm.vue`
- `src/components/RegisterForm.vue`

**Problem:** After successful login/register, user stayed on the auth page instead of redirecting.

**Solution:** Added explicit redirect on success:

```typescript
// LoginForm.vue
if (result.error) {
  error.value = result.error.message || "Sign in failed";
} else {
  window.location.href = getRedirectUrl(); // Redirects to "/" or ?redirect param
}

// RegisterForm.vue
if (result.error) {
  error.value = result.error.message || "Registration failed";
} else {
  window.location.href = "/";
}
```

Also removed unused `callbackURL` parameter from auth client calls.

---

## Files Changed

| File | Action | Description |
|------|--------|-------------|
| `src/pages/login.astro` | Modified | Added `prerender = false` |
| `src/lib/validations.ts` | Created | Zod validation schemas |
| `src/components/LoginForm.vue` | Modified | Added Zod validation + redirect |
| `src/components/RegisterForm.vue` | Modified | Added Zod validation + redirect |
| `docs/ADR/002-zod-form-validation.md` | Created | ADR documentation |
| `drizzle.config.ts` | Modified | Removed incorrect driver setting |
| `package.json` | Modified | Added `postgres` dependency |

---

## Dependencies Added

```json
{
  "postgres": "^3.4.8"
}
```

---

## Commands Used

```bash
pnpm add postgres                    # Install postgres driver
pnpm drizzle-kit migrate            # Apply database migrations
pnpm drizzle-kit introspect         # Check existing tables
pnpm drizzle-kit generate           # Generate migrations (verification)
```

---

## Testing Notes

- Form validation shows errors only after field blur (touched state)
- Green checkmark appears for valid fields
- Red border + error message for invalid fields
- Successful auth redirects to `/`
- Failed auth stays on page with error alert
