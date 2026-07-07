<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSearch } from '@/composables/useSearch'
import { createSearchIndex, searchWithTimeout, highlightText, type SearchResult } from '@/lib/search'
import type { SearchDocument, SearchFilters } from '@/types/search'
import DOMPurify from 'dompurify'

// Props - use type-based defineProps
interface Props {
  query?: string
  filters?: SearchFilters
  pageSize?: number
  showVirtualScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  query: '',
  filters: undefined,
  pageSize: 20,
  showVirtualScroll: true,
})

// Emits - use type-based defineEmits
const emit = defineEmits<{
  select: [document: SearchDocument]
  loadMore: []
}>()

// State
const allResults = ref<SearchDocument[]>([])
const displayResults = ref<SearchDocument[]>([])
const visibleResults = ref<SearchDocument[]>([])
const isSearching = ref(false)
const searchError = ref<string | null>(null)
const currentPage = ref(0)
const containerRef = ref<HTMLElement>()
const loadedIndex = ref(new Set<number>())

// Computed for filtered results
const filteredResults = computed(() => {
  if (!props.filters) {
    return allResults.value
  }

  return allResults.value.filter(doc => {
    // Category filter
    if (props.filters.category && doc.category !== props.filters.category) {
      return false
    }

    // Difficulty filter
    if (props.filters.difficulty && doc.difficulty !== props.filters.difficulty) {
      return false
    }

    // Tags filter (intersection)
    if (props.filters.tags && props.filters.tags.length > 0) {
      const hasAllTags = props.filters.tags.every(tag =>
        doc.tags.includes(tag)
      )
      if (!hasAllTags) {
        return false
      }
    }

    return true
  })
})

const hasResults = computed(() => displayResults.value.length > 0)
const hasMore = computed(() => filteredResults.value.length > displayResults.value.length)
const totalCount = computed(() => filteredResults.value.length)

// Initialize search index
onMounted(async () => {
  try {
    // Load search index
    const response = await fetch('/search-index.json')
    if (!response.ok) {
      throw new Error('Failed to load search index')
    }

    const data = await response.json()
    if (data.documents && Array.isArray(data.documents)) {
      const index = createSearchIndex(data.documents)
      const { debouncedValue, clear } = useSearch(index)

      // Watch for query changes
      watch(() => props.query, async (newQuery) => {
        if (!newQuery || newQuery.trim().length === 0) {
          displayResults.value = []
          allResults.value = []
          visibleResults.value = []
          return
        }

        isSearching.value = true
        searchError.value = null

        try {
          const results = await searchWithTimeout(index, newQuery, {
            query: newQuery,
            limit: 100, // Get more results for filtering
            filters: props.filters,
          })

          allResults.value = results.map(r => r.item)
          currentPage.value = 0
          loadPage(0)
        } catch (err) {
          searchError.value = err instanceof Error ? err.message : 'Search failed'
          console.error('Search error:', err)
        } finally {
          isSearching.value = false
        }
      })

      // Watch for filter changes
      watch(() => props.filters, () => {
        currentPage.value = 0
        loadPage(0)
      }, { deep: true })

      // Expose methods
      return {
        clear,
        search: (q: string) => debouncedValue.value = q,
      }
    }
  } catch (error) {
    console.error('Failed to initialize search:', error)
    searchError.value = 'Failed to initialize search. Please refresh the page.'
  }
})

// Virtual scrolling helpers
function loadPage(page: number) {
  const startIndex = page * props.pageSize
  const endIndex = startIndex + props.pageSize
  const newResults = filteredResults.value.slice(startIndex, endIndex)

  // Append to visible results
  displayResults.value = [...newResults]

  // Update visible results for virtual scrolling
  if (props.showVirtualScroll) {
    visibleResults.value = newResults
    // Mark as loaded
    newResults.forEach(doc => {
      loadedIndex.value.add(doc.id)
    })
  }
}

function handleScroll() {
  if (!containerRef.value || !props.showVirtualScroll) return

  const { scrollTop, scrollHeight, clientHeight } = containerRef.value
  const scrollPercentage = scrollTop / (scrollHeight - clientHeight)

  // Load more when near bottom (80%)
  if (scrollPercentage > 0.8 && hasMore.value) {
    loadNextPage()
  }
}

function loadNextPage() {
  if (!hasMore.value) return
  currentPage.value++
  loadPage(currentPage.value)
  emit('loadMore')
}

function selectDocument(doc: SearchDocument) {
  emit('select', doc)
}

function getHighlightedTitle(title: string): string {
  return highlightText(title, props.query || '')
}

function getHighlightedDescription(description: string): string {
  return highlightText(description, props.query || '')
}

function getDocumentDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Add scroll listener
watch(containerRef, (el) => {
  if (el && props.showVirtualScroll) {
    el.addEventListener('scroll', handleScroll)
  }
}, { immediate: true })
</script>

<template>
  <!-- v-once for static container structure -->
  <div
    v-once
    class="search-results-container"
  >
    <!-- Loading state -->
    <div
      v-if="isSearching"
      class="search-loading-state"
    >
      <div
        class="spinner-border"
        role="status"
      >
        <span class="visually-hidden">Searching...</span>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-if="searchError"
      class="search-error-state"
      role="alert"
    >
      <i class="bi bi-exclamation-triangle-fill me-2" />
      <span>{{ searchError }}</span>
    </div>

    <!-- Empty state -->
    <div
      v-if="!isSearching && !hasResults && !searchError"
      class="search-empty-state"
    >
      <i class="bi bi-journal-x fs-1 text-muted mb-3 d-block" />
      <h5 class="text-muted">
        No results found
      </h5>
      <p class="text-muted">
        Try different keywords or
        <a
          href="/blog"
          class="link"
        >browse all articles</a>
      </p>
    </div>

    <!-- Results grid -->
    <div
      v-if="hasResults"
      ref="containerRef"
      class="search-results-grid"
      :class="{ 'virtual-scroll': showVirtualScroll }"
      role="region"
      :aria-label="`Search results: ${totalCount} articles found`"
    >
      <div class="results-info mb-3">
        <span class="text-muted">
          Showing <strong>{{ displayResults.length }}</strong> of
          <strong>{{ totalCount }}</strong> results
        </span>
        <span
          v-if="query"
          class="text-muted"
        >
          for "{{ query }}"
        </span>
      </div>

      <!-- Result cards with v-memo for performance -->
      <div
        v-for="doc in displayResults"
        :key="doc.id"
        v-memo="[doc.id, doc.title]"
        class="search-result-card"
        role="article"
        :tabindex="0"
        @click="() => selectDocument(doc)"
        @keydown.enter="() => selectDocument(doc)"
      >
        <SearchResultCard
          :document="doc"
          :highlighted-title="getHighlightedTitle(doc.title)"
          :highlighted-description="getHighlightedDescription(doc.description)"
          :date="getDocumentDate(doc.pubDate)"
        />
      </div>

      <!-- Load more button -->
      <div
        v-if="hasMore"
        class="load-more-container mt-4 text-center"
      >
        <button
          class="btn btn-outline-primary"
          :disabled="isSearching"
          @click="loadNextPage"
        >
          <span v-if="isSearching">
            <span
              class="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Loading...
          </span>
          <span v-else>
            Load More Results
            <i class="bi bi-chevron-down ms-2" />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-results-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.search-loading-state,
.search-error-state,
.search-empty-state {
  text-align: center;
  padding: 40px 20px;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.search-results-grid.virtual-scroll {
  max-height: 800px;
  overflow-y: auto;
  padding: 1rem;
}

.search-result-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
}

.search-result-card:hover {
  border-color: #0d6efd;
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.15);
  transform: translateY(-2px);
}

.search-result-card:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
}

.load-more-container button {
  min-width: 200px;
}

/* Highlighted text */
:deep(.search-highlight) {
  background-color: #fff3cd;
  color: #212529;
  padding: 0.1em 0.2em;
  border-radius: 2px;
  font-weight: 500;
}
</style>
