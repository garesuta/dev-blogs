<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useSearch } from '@/composables/useSearch'
import { useLRUCache } from '@/composables/useLRUCache'
import { useSearchValidation } from '@/composables/useSearchValidation'

// Props - use type-based defineProps
interface Props {
  initialQuery?: string
  placeholder?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialQuery: '',
  placeholder: 'Search articles...',
  disabled: false,
})

// Emits - use type-based defineEmits
const emit = defineEmits<{
  search: [query: string]
  select: [result: any]
  clear: []
}>()

// Refs
const inputRef = ref<HTMLInputElement>()
const dropdownRef = ref<HTMLElement>()
const searchHistoryCache = useLRUCache<string, { query: string; timestamp: number }>(10)
const focusedIndex = ref(0)

// State
const { query, debouncedValue, results, isSearching, searchError, clear: clearSearch } = useSearch([])
const { isValid, updateQuery, clearError: clearValidationError } = useSearchValidation()

// Computed
const isDropdownOpen = computed(() => {
  return (query.value.length > 0 && results.value.length > 0) || searchHistoryCache.size > 0
})

const hasHistory = computed(() => searchHistoryCache.size > 0)

// Initialize query
onMounted(() => {
  if (props.initialQuery) {
    query.value = props.initialQuery
    updateQuery(props.initialQuery)
  }

  // Add keyboard shortcut listener
  window.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})

// Watch for search changes
watch(debouncedValue, (newQuery) => {
  if (isValid.value) {
    emit('search', newQuery)

    // Save to history
    if (newQuery.trim()) {
      searchHistoryCache.set(newQuery, {
        query: newQuery,
        timestamp: Date.now(),
      })
    }
  }
})

// Handlers
function handleGlobalKeydown(event: KeyboardEvent) {
  // Cmd/Ctrl + K to focus search
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    focus()
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const newQuery = target.value
  updateQuery(newQuery)
  focusedIndex.value = 0
}

function handleKeydown(event: KeyboardEvent) {
  if (!isDropdownOpen.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusedIndex.value = Math.min(focusedIndex.value + 1, displayItems.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      const item = displayItems.value[focusedIndex.value]
      if (item) {
        selectItem(item)
      }
      break
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
  }
}

function handleBlur(event: FocusEvent) {
  // Close dropdown if clicking outside
  setTimeout(() => {
    const dropdownEl = dropdownRef.value
    const relatedTarget = event.relatedTarget as Node
    if (dropdownEl && !dropdownEl.contains(relatedTarget)) {
      closeDropdown()
    }
  }, 150)
}

function selectItem(item: any) {
  emit('select', item)
  query.value = item.query || item.title || ''
  updateQuery(query.value)
  closeDropdown()
}

function closeDropdown() {
  focusedIndex.value = 0
}

function focus() {
  inputRef.value?.focus()
}

// Expose methods for parent refs
defineExpose({
  focus,
  clear: () => {
    clearSearch()
    clearValidationError()
  },
})
</script>

<template>
  <div
    ref="dropdownRef"
    class="search-container"
    @blur="handleBlur"
  >
    <div class="search-input-wrapper">
      <div class="search-icon">
        <i class="bi bi-search" />
      </div>
      <input
        ref="inputRef"
        v-model="query"
        :disabled="disabled"
        :placeholder="placeholder"
        type="search"
        class="form-control search-input"
        aria-label="Search articles"
        aria-autocomplete="list"
        aria-controls="search-results"
        aria-expanded="isDropdownOpen"
        @input="handleInput"
        @keydown="handleKeydown"
      >
      <button
        v-if="query"
        class="btn-clear"
        aria-label="Clear search"
        @click="() => { clear(); clearValidationError() }"
      >
        <i class="bi bi-x-lg" />
      </button>
    </div>

    <!-- Loading indicator -->
    <div
      v-if="isSearching"
      class="search-loading"
    >
      <div
        class="spinner-border spinner-border-sm"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Dropdown with results and history -->
    <div
      v-if="isDropdownOpen"
      class="search-dropdown"
      role="listbox"
    >
      <!-- Search history -->
      <div
        v-if="hasHistory"
        class="search-section"
      >
        <h6 class="search-section-title">
          Recent Searches
        </h6>
        <button
          v-for="(item, index) in searchHistoryEntries"
          :key="index"
          class="search-history-item"
          :aria-selected="focusedIndex === index"
          role="option"
          @click="() => selectItem(item)"
        >
          <i class="bi bi-clock-history me-2" />
          {{ item.query }}
        </button>
      </div>

      <!-- Search results -->
      <div
        v-if="results.length > 0"
        class="search-section"
      >
        <h6 class="search-section-title">
          Results ({{ results.length }})
        </h6>
        <button
          v-for="(result, index) in results"
          :key="result.id"
          class="search-result-item"
          :class="{ 'focused': focusedIndex === searchHistoryCache.size + index }"
          role="option"
          @click="() => selectItem(result)"
        >
          <div
            class="result-title"
            v-html="highlightText(result.title, query)"
          />
          <div class="result-meta">
            <span
              v-if="result.category"
              class="badge bg-secondary"
            >{{ result.category }}</span>
            <span
              v-if="result.readingTime"
              class="read-time"
            >
              <i class="bi bi-clock me-1" />
              {{ result.readingTime }} min
            </span>
          </div>
        </button>
      </div>

      <!-- No results -->
      <div
        v-if="results.length === 0 && !hasHistory"
        class="search-section"
      >
        <div class="search-empty-state">
          <i class="bi bi-search fs-1 text-muted mb-2" />
          <p class="text-muted">
            No results found. Try different keywords.
          </p>
        </div>
      </div>
    </div>

    <!-- Error message -->
    <div
      v-if="searchError"
      class="search-error"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle-fill me-2" />
      {{ searchError }}
    </div>
  </div>
</template>

<style scoped>
.search-container {
  position: relative;
  width: 100%;
  max-width: 600px;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #6c757d;
  pointer-events: none;
}

.search-input {
  padding-left: 40px;
  padding-right: 40px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: #0d6efd;
  outline: none;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.btn-clear {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
}

.btn-clear:hover {
  color: #0d6efd;
}

.search-loading {
  position: absolute;
  right: 50px;
  top: 50%;
  transform: translateY(-50%);
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.search-section {
  padding: 12px 0;
}

.search-section:first-child {
  padding-top: 12px;
}

.search-section:last-child {
  padding-bottom: 12px;
}

.search-section:not(:last-child)::after {
  content: '';
  display: block;
  height: 1px;
  background: #dee2e6;
  margin: 0 12px;
}

.search-section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6c757d;
  margin-bottom: 8px;
  padding: 0 16px;
}

.search-history-item,
.search-result-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-history-item:hover,
.search-result-item:hover {
  background-color: #f8f9fa;
}

.search-result-item.focused {
  background-color: #e9ecef;
}

.result-title {
  font-weight: 500;
  color: #212529;
  margin-bottom: 4px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
}

.read-time {
  color: #6c757d;
}

.search-empty-state {
  text-align: center;
  padding: 24px;
}

.search-error {
  margin-top: 8px;
  padding: 12px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Highlighted text */
:deep(.search-highlight) {
  background-color: #fff3cd;
  color: #212529;
  padding: 0 2px;
  border-radius: 2px;
}

/* Scrollbar styling */
.search-dropdown::-webkit-scrollbar {
  width: 8px;
}

.search-dropdown::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.search-dropdown::-webkit-scrollbar-thumb {
  background: #dee2e6;
  border-radius: 4px;
}

.search-dropdown::-webkit-scrollbar-thumb:hover {
  background: #adb5bd;
}
</style>
