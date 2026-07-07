import { ref, computed, watch, onMounted } from 'vue'
import Fuse from 'fuse.js'
import { useDebouncedRef } from './useDebounce'
import type { SearchDocument } from '@/types/search'

export interface SearchResult {
  item: SearchDocument
  refIndex: number
  score: number
}

export function useSearch(initialIndex: SearchDocument[]) {
  // Use existing debounce pattern from codebase
  const { value: query, debouncedValue } = useDebouncedRef('', 300)

  const results = ref<SearchDocument[]>([])
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)

  // shallowRef for large index (performance optimization)
  const searchIndex = ref(initialIndex)

  // Computed Fuse.js instance (lazy creation)
  const fuse = computed(() => new Fuse(searchIndex.value, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'tags', weight: 1.5 },
      { name: 'description', weight: 1 },
    ],
    threshold: 0.3,
    includeScore: true,
    minMatchCharLength: 2,
    distance: 100,
  }))

  watch(debouncedValue, async (newQuery) => {
    if (!newQuery.trim()) {
      results.value = []
      searchError.value = null
      return
    }

    isSearching.value = true
    searchError.value = null

    try {
      // Simulate async for better UX with loading state
      await Promise.resolve()

      const searchResults = fuse.value.search(newQuery)

      results.value = searchResults.map(r => r.item)
    } catch (err) {
      searchError.value = err instanceof Error ? err.message : 'Search failed'
      console.error('Search error:', err)
    } finally {
      isSearching.value = false
    }
  })

  function clear() {
    query.value = ''
    results.value = []
    searchError.value = null
  }

  function updateIndex(newIndex: SearchDocument[]) {
    searchIndex.value = newIndex
  }

  return {
    query,
    debouncedValue,
    results,
    isSearching,
    searchError,
    clear,
    updateIndex,
  }
}
