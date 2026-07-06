<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import SearchInput from './SearchInput.vue'
import SearchResults from './SearchResults.vue'
import useSearch from '@/composables/useSearch'

const isOpen = ref(false)
const searchInputRef = ref<InstanceType<typeof SearchInput> | null>(null)

const {
  query,
  results,
  isSearching,
  hasResults,
  error,
  filters,
  loading,
  clearResults,
  search,
  setFilter,
  clearFilter,
} = useSearch()

const openSearch = () => {
  isOpen.value = true
  setTimeout(() => {
    searchInputRef.value?.focus()
  }, 100)
}

const closeSearch = () => {
  isOpen.value = false
  clearResults()
}

// Handle keyboard shortcut
const handleKeydown = (e: KeyboardEvent) => {
  // Cmd/Ctrl + K to open search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    if (isOpen.value) {
      closeSearch()
    } else {
      openSearch()
    }
  }

  // Escape to close
  if (e.key === 'Escape' && isOpen.value) {
    closeSearch()
  }
}

// Focus trap when modal is open
const trapFocus = (e: KeyboardEvent) => {
  if (!isOpen.value) return

  const modal = e.target as HTMLElement
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  if (e.key === 'Tab') {
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// Expose open/close methods for external use
defineExpose({
  openSearch,
  closeSearch,
})

// Add global keyboard listener
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Watch for changes and search
watch(query, (newQuery) => {
  if (newQuery.trim()) {
    search(newQuery, filters.value)
  } else {
    clearResults()
  }
})
</script>

<template>
  <!-- Search Button in Header -->
  <button
    class="search-trigger-btn"
    @click="openSearch"
    aria-label="Open search"
    title="Search (Cmd/Ctrl + K)"
  >
    <i class="bi bi-search"></i>
  </button>

  <!-- Search Modal Overlay -->
  <Teleport to="body">
    <Transition name="search-modal">
      <div
        v-if="isOpen"
        class="search-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        @click.self="closeSearch"
        @keydown="trapFocus"
      >
        <div class="search-modal-content">
          <!-- Modal Header -->
          <div class="search-modal-header">
            <h2 id="search-modal-title" class="search-modal-title">
              <i class="bi bi-search me-2"></i>Search
            </h2>
            <button
              class="search-modal-close"
              @click="closeSearch"
              aria-label="Close search"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="search-modal-body">
            <!-- Search Input -->
            <SearchInput
              ref="searchInputRef"
              v-model="query"
              placeholder="Search articles..."
              @keydown.escape="closeSearch"
            />

            <!-- Loading State -->
            <div v-if="loading" class="search-loading">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2 text-muted">Searching...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="search-error alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ error }}
            </div>

            <!-- Search Results -->
            <div v-else-if="hasResults" class="search-results-container">
              <SearchResults
                :results="results"
                :query="query"
                @select-result="closeSearch"
              />
            </div>

            <!-- Empty State -->
            <div v-else-if="query.trim()" class="search-empty">
              <i class="bi bi-search mb-3" style="font-size: 3rem; opacity: 0.3;"></i>
              <p class="text-muted">No results found for "{{ query }}"</p>
              <p class="text-muted small">Try different keywords or check your spelling</p>
            </div>

            <!-- Initial State -->
            <div v-else class="search-placeholder">
              <i class="bi bi-lightbulb mb-3" style="font-size: 3rem; opacity: 0.3;"></i>
              <p class="text-muted">Start typing to search articles</p>
              <div class="search-hints mt-3">
                <span class="badge bg-light text-muted">Try: "React"</span>
                <span class="badge bg-light text-muted">Try: "TypeScript"</span>
                <span class="badge bg-light text-muted">Try: "Astro"</span>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="search-modal-footer">
            <small class="text-muted">
              <kbd class="bg-light border">Esc</kbd> to close
              <kbd class="bg-light border">↑↓</kbd> to navigate
              <kbd class="bg-light border">Enter</kbd> to select
            </small>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* --- Search Trigger Button --- */
.search-trigger-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--cyber-border-color);
  background: transparent;
  color: var(--cyber-text-secondary);
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s, background 0.2s, border-color 0.2s;
}

.search-trigger-btn:hover {
  color: var(--cyber-primary);
  border-color: var(--cyber-primary);
  background: rgba(0, 255, 136, 0.1);
}

/* --- Search Modal Overlay --- */
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  z-index: 9999;
}

/* --- Search Modal Content --- */
.search-modal-content {
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  background: var(--cyber-bg-primary);
  border: 1px solid var(--cyber-border-color);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* --- Modal Header --- */
.search-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--cyber-border-color);
}

.search-modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.search-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--cyber-text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.search-modal-close:hover {
  color: var(--cyber-text-primary);
  background: var(--cyber-bg-secondary);
}

/* --- Modal Body --- */
.search-modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* --- Search Results Container --- */
.search-results-container {
  margin-top: 20px;
}

/* --- Loading State --- */
.search-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

/* --- Error State --- */
.search-error {
  margin: 20px 0;
}

/* --- Empty State --- */
.search-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

/* --- Placeholder State --- */
.search-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.search-hints {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

/* --- Modal Footer --- */
.search-modal-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--cyber-border-color);
  background: var(--cyber-bg-secondary);
}

.search-modal-footer kbd {
  padding: 2px 6px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 4px;
  margin: 0 2px;
}

/* --- Transitions --- */
.search-modal-enter-active,
.search-modal-leave-active {
  transition: opacity 0.3s ease;
}

.search-modal-enter-from,
.search-modal-leave-to {
  opacity: 0;
}

/* --- Reduced Motion --- */
@media (prefers-reduced-motion: reduce) {
  .search-modal-enter-active,
  .search-modal-leave-active {
    transition: none;
  }

  .search-trigger-btn,
  .search-modal-close {
    transition: none;
  }
}

/* --- Mobile --- */
@media (max-width: 768px) {
  .search-modal-content {
    max-width: 95%;
    max-height: 85vh;
  }

  .search-modal-header {
    padding: 12px 16px;
  }

  .search-modal-body {
    padding: 16px;
  }

  .search-modal-footer {
    padding: 10px 16px;
    font-size: 0.875rem;
  }

  .search-hints {
    flex-direction: column;
    align-items: center;
  }
}
</style>
