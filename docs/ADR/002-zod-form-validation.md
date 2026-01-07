# ADR-002: Zod + Bootstrap Form Validation

**Status:** Accepted
**Date:** 2026-01-07
**Decision Makers:** Project Team

---

## Context

The project needs a consistent approach for client-side form validation across Vue components. Options considered:

1. **Native HTML5 validation** - Browser-based, limited customization
2. **Vuelidate** - Vue-specific validation library
3. **VeeValidate** - Another Vue validation library
4. **Zod** - TypeScript-first schema validation

## Decision

**Use Zod for validation logic combined with Bootstrap validation classes for UI feedback.**

### Implementation

- Validation schemas defined in `src/lib/validations.ts`
- Schemas are reusable across components and can be shared with server-side validation
- Bootstrap's `is-valid`, `is-invalid`, `valid-feedback`, and `invalid-feedback` classes for visual feedback
- "Touched" state tracking to show errors only after user interaction

### Validation Pattern

```typescript
// src/lib/validations.ts
import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});
```

### Component Integration

```vue
<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { loginSchema, getFieldError } from "../lib/validations";
import type { z } from "zod";

const email = ref("");
const validationErrors = ref<z.ZodIssue[]>([]);
const touched = reactive({ email: false });

function validate() {
  const result = loginSchema.safeParse({ email: email.value });
  validationErrors.value = result.success ? [] : result.error.issues;
  return result.success;
}

function handleBlur(field: string) {
  touched[field] = true;
  validate();
}

const emailError = computed(() => {
  if (!touched.email) return undefined;
  return getFieldError(validationErrors.value, "email");
});
</script>

<template>
  <input
    v-model="email"
    :class="{ 'is-invalid': emailError, 'is-valid': touched.email && !emailError }"
    @blur="handleBlur('email')"
  />
  <div v-if="emailError" class="invalid-feedback">{{ emailError }}</div>
</template>
```

## Rationale

### Pros

1. **Type Safety** - Zod provides TypeScript inference for form data
2. **Reusability** - Same schemas work client-side and server-side
3. **Composability** - Schemas can be combined and extended
4. **Bootstrap Integration** - Works seamlessly with existing Bootstrap styling (ADR-001)
5. **Already Installed** - Zod is already a project dependency
6. **User Experience** - "Touched" pattern prevents showing errors before user interaction

### Cons

1. **Bundle Size** - Zod adds ~12KB gzipped (acceptable for validation benefits)
2. **Learning Curve** - Team needs to learn Zod API

## Consequences

### Must Do

- Define all validation schemas in `src/lib/validations.ts`
- Use Bootstrap validation classes (`is-valid`, `is-invalid`, `invalid-feedback`)
- Track "touched" state per field to show errors only after blur
- Export TypeScript types from schemas using `z.infer<>`

### Must Not Do

- Do not use native HTML5 `required` attribute alone (use Zod + Bootstrap instead)
- Do not create custom validation error styling when Bootstrap provides it
- Do not show validation errors before user has interacted with the field

### File Structure

```
src/lib/
  validations.ts    # All Zod schemas and helper functions
```

### Helper Functions

```typescript
// Get first error for a field from Zod issues
export function getFieldError(
  errors: z.ZodIssue[],
  field: string
): string | undefined {
  const error = errors.find((e) => e.path[0] === field);
  return error?.message;
}
```

## Future Considerations

1. **Server-Side Validation** - Same schemas can be used in API routes
2. **Custom Error Messages** - Zod supports custom error maps for i18n
3. **Async Validation** - Zod supports async refinements for server checks

## References

- [Zod Documentation](https://zod.dev/)
- [Bootstrap Form Validation](https://getbootstrap.com/docs/5.3/forms/validation/)
- [ADR-001: Bootstrap-First Styling](./001-bootstrap-first-styling.md)
