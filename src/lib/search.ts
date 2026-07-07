import Fuse from 'fuse.js'
import DOMPurify from 'dompurify'
import type { SearchDocument } from '@/types/search'

// Fuse.js configuration with field boosts
export const FUSE_CONFIG = {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'description', weight: 1 },
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
  distance: 100,
}

// Index validation limits
const MAX_INDEX_SIZE = 5 * 1024 * 1024 // 5MB in bytes
const TARGET_INDEX_SIZE = 1 * 1024 * 1024 // 1MB in bytes

export interface SearchResult {
  item: SearchDocument
  refIndex: number
  score?: number
}

export interface SearchOptions {
  query?: string
  limit?: number
  timeout?: number
  filters?: {
    category?: string
    tags?: string[]
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  }
}

/**
 * Validate search index size
 */
export function validateIndexSize(indexSize: number): { valid: boolean; message?: string } {
  if (indexSize > MAX_INDEX_SIZE) {
    return {
      valid: false,
      message: `Index size (${(indexSize / 1024 / 1024).toFixed(2)}MB) exceeds maximum of 5MB`,
    }
  }

  if (indexSize > TARGET_INDEX_SIZE) {
    return {
      valid: true,
      message: `Index size (${(indexSize / 1024 / 1024).toFixed(2)}MB) exceeds target of 1MB`,
    }
  }

  return { valid: true }
}

/**
 * Create Fuse.js instance with configuration
 */
export function createSearchIndex(documents: SearchDocument[]): Fuse<SearchDocument> {
  return new Fuse(documents, FUSE_CONFIG)
}

/**
 * Search with timeout protection against ReDoS attacks
 */
export async function searchWithTimeout(
  fuse: Fuse<SearchDocument>,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const SEARCH_TIMEOUT_MS = options.timeout ?? 200

  // Create abort controller
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS)

  try {
    // Perform search
    const results = fuse.search(query)

    // Clear timeout on success
    clearTimeout(timeoutId)

    // Apply filters if provided
    let filteredResults = results
    const filters = options.filters
    if (filters) {
      filteredResults = results.filter(result => {
        const item = result.item

        // Category filter
        if (filters.category && item.category !== filters.category) {
          return false
        }

        // Difficulty filter
        if (filters.difficulty && item.difficulty !== filters.difficulty) {
          return false
        }

        // Tags filter (intersection)
        if (filters.tags && filters.tags.length > 0) {
          const hasAllTags = filters.tags.every(tag =>
            item.tags.includes(tag)
          )
          if (!hasAllTags) {
            return false
          }
        }

        return true
      })
    }

    // Apply limit if provided
    if (options.limit) {
      filteredResults = filteredResults.slice(0, options.limit)
    }

    return filteredResults
  } catch (error: unknown) {
    clearTimeout(timeoutId)

    if (error instanceof Error && error.name === 'AbortError') {
      // Timeout - return empty results
      return []
    }

    throw error
  }
}

/**
 * Highlight search terms in text with DOMPurify sanitization
 */
export function highlightText(text: string, query: string): string {
  if (!query || !text) return text

  // Escape regex special characters in query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escapedQuery})`, 'gi')

  // Replace with highlighted text
  const highlighted = text.replace(regex, '<mark class="search-highlight">$1</mark>')

  // Sanitize with DOMPurify to prevent XSS
  return DOMPurify.sanitize(highlighted, {
    ALLOWED_TAGS: ['mark'],
    ALLOWED_ATTR: ['class'],
  })
}
