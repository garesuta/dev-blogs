# Feature: Vue Best Practices Optimization

## 1. Overview

- **Goal**: Audit and optimize all 18 Vue components against Vue 3 best practices, fix security issues, extract reusable composables, and improve SSR safety
- **Value**: Reduce code duplication, improve security posture, standardize patterns, and improve maintainability across the codebase
- **In Scope**:
  - Security fixes (XSS via v-html, SSR window access)
  - Composable extraction for repeated patterns
  - Standardized error/loading/message handling
  - TypeScript type improvements
  - Performance optimizations in forms and lists
- **Out of Scope**:
  - Feature changes or UI redesign
  - Migration to Pinia (not needed at current scale)
  - Component library extraction
  - Test coverage improvements (separate effort)

## 2. Requirements Summary

| Requirement | Detail | Priority |
|-------------|--------|----------|
| Fix v-html XSS risk | Sanitize content in AboutManager.vue | P0 |
| SSR window guards | Add guards in LoginForm, RegisterForm | P0 |
| useApiCall composable | Extract loading/error/data pattern | P1 |
| useDebounce composable | Replace manual setTimeout debounce | P1 |
| useMessageTimeout composable | Standardize auto-dismiss messages | P1 |
| useBootstrapModal composable | Encapsulate modal initialization | P2 |
| useFormValidation composable | Consolidate Zod validation pattern | P2 |
| Type definitions extraction | Shared interfaces for Post, Tag, Category | P2 |
| PostEditor dirty tracking | Replace manual isDirty with computed | P3 |
| Validation debouncing | Debounce keystroke validation in ProfileEditor | P3 |

## 3. Current State Analysis

### Component Inventory (18 components, all using `<script setup>` + TypeScript)

| Component | Lines | Reactivity | Issues Found |
|-----------|-------|------------|--------------|
| TiptapEditor.vue | 2303 | ref, watch | Largest component, well-structured |
| PostList.vue | 924 | ref, computed | Manual debounce via setTimeout |
| PostEditor.vue | 850+ | reactive, ref | Manual dirty tracking, many watchers |
| ProfileEditor.vue | 724 | ref, computed | 6 validation computeds per keystroke |
| SeoFields.vue | 351 | ref, computed, watch | Good v-model pattern |
| TagManager.vue | 334 | ref | Clean CRUD pattern |
| CategoryManager.vue | 289+ | ref | Manual tooltip positioning |
| VersionHistory.vue | 303 | ref | Clean accordion pattern |
| ImageUpload.vue | 263 | ref | Good drag-drop + v-model |
| RecentPosts.vue | 261 | computed | Presentational, clean |
| AboutManager.vue | 233 | ref | **v-html XSS risk** |
| UserList.vue | 223 | ref | Direct ref object mutation |
| RegisterForm.vue | 206 | ref, reactive, computed | **SSR window access** |
| UserMenu.vue | 179 | ref, computed | SSR-safe (good) |
| LoginForm.vue | 156 | ref, reactive, computed | **SSR window access** |
| AuthorStats.vue | 111 | computed | Presentational, clean |
| CategoryManager.vue | 100+ | ref | Manual DOM tooltip |
| RoleSelector.vue | 81 | ref | Clean emit pattern |
| GoogleButton.vue | 67 | ref | Minimal, correct |

### Patterns in Use

- **State**: All local component state (no Pinia, no global store)
- **Auth**: better-auth client library for session management
- **Validation**: Zod schemas with touched-field pattern
- **SSR**: Mixed awareness (some guard, some don't)
- **Modals**: Dynamic Bootstrap import in onMounted

### Repeated Patterns Identified

1. **API call pattern** (12 components): `isLoading.value = true; try { fetch(...) } catch { error.value = ... } finally { isLoading.value = false }`
2. **Message auto-dismiss** (6 components): `setTimeout(() => { message.value = '' }, 2000-3000)`
3. **Bootstrap modal init** (3 components): Dynamic import + ref + onMounted init
4. **Zod validation** (4 components): Schema + touched tracking + computed error messages
5. **Debounced search** (2 components): Manual setTimeout + clearTimeout

## 4. Implementation Plan

### Phase 1: Security Fixes (P0)

#### 4.1 Sanitize v-html in AboutManager.vue

**Problem**: `v-html="formData.content"` renders unsanitized HTML, creating XSS risk.

**Solution**: Install DOMPurify and sanitize before rendering.

**Files to modify**:
- `src/components/AboutManager.vue` - Add DOMPurify sanitization

**Changes**:
```vue
<!-- Before -->
<div v-html="formData.content"></div>

<!-- After -->
<div v-html="sanitizedContent"></div>
```
```ts
import DOMPurify from 'dompurify'

const sanitizedContent = computed(() =>
  DOMPurify.sanitize(formData.value.content || '')
)
```

**Reference**: [v-html-xss-security](/.claude/skills/vue-best-practices/reference/v-html-xss-security.md)

#### 4.2 Add SSR Guards to LoginForm and RegisterForm

**Problem**: Both components call `window.location.href` outside of lifecycle hooks, which breaks during SSR.

**Solution**: Wrap `window.location` access in browser-only checks.

**Files to modify**:
- `src/components/LoginForm.vue` - Guard window.location in signIn callback
- `src/components/RegisterForm.vue` - Guard window.location in signUp callback

**Changes**: Wrap redirect logic:
```ts
// Before
window.location.href = redirectUrl

// After
if (typeof window !== 'undefined') {
  window.location.href = redirectUrl
}
```

**Reference**: [ssr-platform-specific-apis](/.claude/skills/vue-best-practices/reference/ssr-platform-specific-apis.md)

---

### Phase 2: Composable Extraction (P1)

#### 4.3 Create `useApiCall` Composable

**Problem**: 12 components repeat the same loading/error/try-catch pattern for API calls.

**Solution**: Create a generic composable that manages loading, error, and data state.

**Files to create**:
- `src/composables/useApiCall.ts`

**API**:
```ts
export function useApiCall<T>() {
  const data = ref<T | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  async function execute(fn: () => Promise<T>) {
    isLoading.value = true
    error.value = null
    try {
      data.value = await fn()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
    } finally {
      isLoading.value = false
    }
  }

  return { data, error, isLoading, execute }
}
```

**Components to refactor** (incremental, not all at once):
- UserList.vue, PostList.vue, TagManager.vue, CategoryManager.vue, AboutManager.vue, VersionHistory.vue

**Reference**: [composable-naming-return-pattern](/.claude/skills/vue-best-practices/reference/composable-naming-return-pattern.md)

#### 4.4 Create `useDebounce` Composable

**Problem**: PostList.vue uses manual `setTimeout`/`clearTimeout` for search debouncing.

**Solution**: Extract a reusable debounce composable.

**Files to create**:
- `src/composables/useDebounce.ts`

**API**:
```ts
export function useDebouncedRef<T>(initialValue: T, delay = 300) {
  const value = ref(initialValue) as Ref<T>
  const debouncedValue = ref(initialValue) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(value, (newVal) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newVal
    }, delay)
  })

  return { value, debouncedValue }
}
```

**Files to modify**:
- `src/components/PostList.vue` - Replace manual debounce with composable

**Reference**: [composable-composition-pattern](/.claude/skills/vue-best-practices/reference/composable-composition-pattern.md)

#### 4.5 Create `useMessageTimeout` Composable

**Problem**: 6 components use varying timeout durations (2000-3000ms) for auto-dismissing success/error messages.

**Solution**: Standardize with a composable.

**Files to create**:
- `src/composables/useMessageTimeout.ts`

**API**:
```ts
export function useMessageTimeout(duration = 3000) {
  const message = ref('')
  const type = ref<'success' | 'error'>('success')
  let timeout: ReturnType<typeof setTimeout> | null = null

  function show(text: string, msgType: 'success' | 'error' = 'success') {
    if (timeout) clearTimeout(timeout)
    message.value = text
    type.value = msgType
    timeout = setTimeout(() => { message.value = '' }, duration)
  }

  return { message, type, show }
}
```

**Components to refactor**:
- ProfileEditor.vue, RoleSelector.vue, TagManager.vue, CategoryManager.vue, AboutManager.vue, PostEditor.vue

---

### Phase 3: Code Quality Improvements (P2)

#### 4.6 Create `useBootstrapModal` Composable

**Problem**: Multiple components dynamically import and initialize Bootstrap modals with similar boilerplate.

**Files to create**:
- `src/composables/useBootstrapModal.ts`

**API**:
```ts
export function useBootstrapModal(modalRef: Ref<HTMLElement | null>) {
  const modalInstance = shallowRef<InstanceType<typeof Modal> | null>(null)

  onMounted(async () => {
    const { Modal } = await import('bootstrap')
    if (modalRef.value) {
      modalInstance.value = new Modal(modalRef.value)
    }
  })

  function show() { modalInstance.value?.show() }
  function hide() { modalInstance.value?.hide() }

  return { show, hide, modalInstance }
}
```

**Reference**: [reactivity-markraw-for-non-reactive](/.claude/skills/vue-best-practices/reference/reactivity-markraw-for-non-reactive.md) - Use `shallowRef` for library instances.

#### 4.7 Extract Shared Type Definitions

**Problem**: Post, Tag, Category, User types are inferred from API responses rather than shared definitions.

**Files to create**:
- `src/types/content.ts` - Post, Tag, Category interfaces
- `src/types/user.ts` - User, UserRole types (consolidate with existing)

**Components to update**: Any component fetching these entities can import typed interfaces.

#### 4.8 Create `useFormValidation` Composable

**Problem**: LoginForm, RegisterForm, and ProfileEditor each implement their own Zod + touched-field pattern.

**Files to create**:
- `src/composables/useFormValidation.ts`

**API**:
```ts
export function useFormValidation<T extends z.ZodObject<any>>(schema: T) {
  const touched = reactive<Record<string, boolean>>({})

  function getFieldError(field: string, value: unknown): string | null {
    if (!touched[field]) return null
    const result = schema.shape[field]?.safeParse(value)
    return result?.success ? null : result?.error.issues[0]?.message ?? null
  }

  function touch(field: string) { touched[field] = true }
  function touchAll() { /* mark all fields touched */ }

  return { touched, getFieldError, touch, touchAll }
}
```

---

### Phase 4: Performance Improvements (P3)

#### 4.9 Improve PostEditor Dirty Tracking

**Problem**: PostEditor manually sets `isDirty.value = true` on every field change instead of computing it.

**Solution**: Use a computed property comparing current state to initial snapshot.

**Reference**: [reactivity-computed-over-watcheffect-mutations](/.claude/skills/vue-best-practices/reference/reactivity-computed-over-watcheffect-mutations.md)

#### 4.10 Consider Debounced Validation in ProfileEditor

**Problem**: 6 computed validation properties re-evaluate on every keystroke.

**Solution**: For expensive validations, debounce the input or use `watchDebounced` pattern. For this case, the computeds are lightweight string checks, so the current approach is acceptable. **No change needed** unless profiling shows issues.

**Reference**: [computed-vs-methods-caching](/.claude/skills/vue-best-practices/reference/computed-vs-methods-caching.md) - Computed caching is efficient for this use case.

## 5. Composables Directory Structure

```
src/composables/
  useApiCall.ts          # Generic loading/error/data pattern
  useDebounce.ts         # Debounced ref values
  useMessageTimeout.ts   # Auto-dismiss success/error messages
  useBootstrapModal.ts   # Bootstrap modal lifecycle management
  useFormValidation.ts   # Zod schema + touched-field pattern
```

## 6. Migration Strategy

- **Incremental adoption**: Composables are created first, then components are refactored one at a time
- **No big-bang rewrite**: Each component refactor is a standalone PR
- **Testing**: Each composable gets unit tests before component integration
- **Order**: Security fixes (Phase 1) first, then composables (Phase 2), then quality (Phase 3), then perf (Phase 4)

## 7. Risk Assessment

| Risk | Mitigation |
|------|------------|
| Breaking SSR hydration with guards | Test with `pnpm build && pnpm preview` |
| DOMPurify bundle size (~7KB gzipped) | Tree-shakeable, only imported where needed |
| Composable extraction changing behavior | Unit test composables before refactoring components |
| Bootstrap modal lifecycle issues | Test modal show/hide/dispose in composable |

## 8. Acceptance Criteria

- [ ] No `v-html` usage without DOMPurify sanitization
- [ ] All `window`/`document` access wrapped in SSR guards or `onMounted`
- [ ] At least 3 composables extracted and used (useApiCall, useDebounce, useMessageTimeout)
- [ ] All composables have unit tests
- [ ] No regression in existing functionality (manual testing of all forms/editors)
- [ ] `pnpm build` succeeds without warnings
- [ ] `pnpm test:run` passes
