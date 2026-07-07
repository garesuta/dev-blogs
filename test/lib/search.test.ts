import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fuse from 'fuse.js'
import DOMPurify from 'dompurify'
import {
  createSearchIndex,
  searchWithTimeout,
  highlightText,
  validateIndexSize,
  FUSE_CONFIG,
  type SearchResult,
} from '@/lib/search'
import type { SearchDocument } from '@/types/search'

// Mock DOMPurify
vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn((text: string) => text), // Return text unchanged for testing
  },
}))

const mockDOMPurify = vi.mocked(DOMPurify)

describe('search.ts', () => {
  const mockDocuments: SearchDocument[] = [
    {
      id: 'doc-1',
      title: 'React Hooks Tutorial',
      description: 'Learn React hooks',
      body: 'React hooks allow...',
      tags: ['react', 'hooks'],
      category: 'frontend',
      pubDate: new Date('2025-01-01'),
      readingTime: 10,
      difficulty: 'beginner',
    },
    {
      id: 'doc-2',
      title: 'Vue 3 Guide',
      description: 'Vue 3 Composition API',
      body: 'Vue 3 introduces...',
      tags: ['vue', 'composition'],
      category: 'frontend',
      pubDate: new Date('2025-01-15'),
      readingTime: 15,
      difficulty: 'intermediate',
    },
    {
      id: 'doc-3',
      title: 'TypeScript Best Practices',
      description: 'TS best practices',
      body: 'TypeScript is a...',
      tags: ['typescript', 'best-practices'],
      category: 'frontend',
      pubDate: new Date('2025-02-01'),
      readingTime: 20,
      difficulty: 'advanced',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('FUSE_CONFIG', () => {
    it('should have correct configuration', () => {
      expect(FUSE_CONFIG.keys).toEqual([
        { name: 'title', weight: 2 },
        { name: 'tags', weight: 1.5 },
        { name: 'description', weight: 1 },
      ])

      expect(FUSE_CONFIG.threshold).toBe(0.3)
      expect(FUSE_CONFIG.includeScore).toBe(true)
      expect(FUSE_CONFIG.minMatchCharLength).toBe(2)
      expect(FUSE_CONFIG.distance).toBe(100)
    })
  })

  describe('validateIndexSize', () => {
    it('should validate index under target size', () => {
      const size = 512 * 1024 // 512KB

      const result = validateIndexSize(size)

      expect(result.valid).toBe(true)
      expect(result.message).toBeUndefined()
    })

    it('should warn but accept index over target size', () => {
      const size = 1.5 * 1024 * 1024 // 1.5MB

      const result = validateIndexSize(size)

      expect(result.valid).toBe(true)
      expect(result.message).toContain('exceeds target of 1MB')
    })

    it('should reject index over maximum size', () => {
      const size = 6 * 1024 * 1024 // 6MB

      const result = validateIndexSize(size)

      expect(result.valid).toBe(false)
      expect(result.message).toContain('exceeds maximum of 5MB')
    })

    it('should reject index at exact maximum size', () => {
      const size = 5 * 1024 * 1024 // 5MB exactly

      const result = validateIndexSize(size)

      expect(result.valid).toBe(false)
      expect(result.message).toContain('exceeds maximum')
    })
  })

  describe('createSearchIndex', () => {
    it('should create Fuse.js instance', () => {
      const index = createSearchIndex(mockDocuments)

      expect(index).toBeInstanceOf(Fuse)
    })

    it('should use FUSE_CONFIG', () => {
      const index = createSearchIndex(mockDocuments)

      const results = index.search('react')

      expect(results).toBeInstanceOf(Array)
    })

    it('should handle empty documents array', () => {
      const index = createSearchIndex([])

      expect(index).toBeInstanceOf(Fuse)

      const results = index.search('react')

      expect(results).toEqual([])
    })

    it('should handle documents with missing optional fields', () => {
      const partialDocs: Partial<SearchDocument>[] = [
        {
          id: 'doc-1',
          title: 'Title',
          description: 'Description',
          body: 'Content',
          tags: [],
          category: '',
          pubDate: new Date(),
        },
      ]

      const index = createSearchIndex(partialDocs as SearchDocument[])

      expect(index).toBeInstanceOf(Fuse)

      const results = index.search('title')

      expect(results).toBeInstanceOf(Array)
    })
  })

  describe('searchWithTimeout', () => {
    it('should search with query', async () => {
      const index = createSearchIndex(mockDocuments)

      const results = await searchWithTimeout(index, 'react')

      expect(results).toBeInstanceOf(Array)
      expect(mockDOMPurify.sanitize).not.toHaveBeenCalled() // Highlight only
    })

    it('should return empty results for empty query', async () => {
      const index = createSearchIndex(mockDocuments)

      const results = await searchWithTimeout(index, '')

      expect(results).toEqual([])
    })

    it('should apply category filter', async () => {
      const index = createSearchIndex(mockDocuments)

      const results = await searchWithTimeout(index, 'react', {
        filters: { category: 'frontend' },
      })

      // Only doc-1 and doc-2 should match (they have 'frontend' category)
      expect(results.length).toBe(2)
    })

    it('should apply difficulty filter', async () => {
      const index = createSearchIndex(mockDocuments)

      const results = await searchWithTimeout(index, '', {
        filters: { difficulty: 'beginner' },
      })

      // Only doc-1 should match (beginner difficulty)
      expect(results.length).toBe(1)
      expect(results[0].item.id).toBe('doc-1')
    })

    it('should apply tags filter', async () => {
      const index = createSearchIndex(mockDocuments)

      const results = await searchWithTimeout(index, '', {
        filters: { tags: ['react'] },
      })

      // Only doc-1 should match (has 'react' tag)
      expect(results.length).toBe(1)
    })

    it('should apply multiple filters', async () => {
      const index = createSearchIndex(mockDocuments)

      const results = await searchWithTimeout(index, '', {
        filters: {
          category: 'frontend',
          difficulty: 'intermediate',
          tags: ['vue'],
        },
      })

      // Only doc-2 should match all filters
      expect(results.length).toBe(1)
      expect(results[0].item.id).toBe('doc-2')
    })

    it('should apply limit', async () => {
      const index = createSearchIndex(mockDocuments)

      const results = await searchWithTimeout(index, 'react', {
        limit: 2,
      })

      expect(results.length).toBeLessThanOrEqual(2)
    })

    it('should return empty results when no documents match filters', async () => {
      const index = createSearchIndex(mockDocuments)

      const results = await searchWithTimeout(index, '', {
        filters: {
          category: 'nonexistent',
          difficulty: 'advanced',
          tags: ['nonexistent'],
        },
      })

      expect(results).toEqual([])
    })

    it('should abort search after timeout', async () => {
      const index = createSearchIndex(mockDocuments)

      // Mock timeout behavior
      vi.useFakeTimers()

      const results = await searchWithTimeout(index, 'react', {
        timeout: 1, // 1ms timeout for testing
      })

      expect(results).toEqual([])

      vi.useRealTimers()
    })

    it('should handle search errors', async () => {
      // Mock Fuse to throw error
      const mockFuse = new Fuse(mockDocuments)
      vi.spyOn(mockFuse, 'search').mockImplementation(() => {
        throw new Error('Search error')
      })

      const results = await searchWithTimeout(mockFuse, 'react')

      expect(results).toBeInstanceOf(Array)
      vi.restoreAllMocks()
    })
  })

  describe('highlightText', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return original text when no query', () => {
      const result = highlightText('React Hooks Tutorial', '')

      expect(result).toBe('React Hooks Tutorial')
      expect(mockDOMPurify.sanitize).not.toHaveBeenCalled()
    })

    it('should highlight single word match', () => {
      const result = highlightText('React Hooks Tutorial', 'hooks')

      expect(mockDOMPurify.sanitize).toHaveBeenCalledWith(
        expect.stringContaining('mark'),
        expect.anything()
      )
      expect(result).toContain('hooks')
    })

    it('should highlight multiple word matches', () => {
      const result = highlightText('React Hooks Tutorial', 'react hooks')

      expect(mockDOMPurify.sanitize).toHaveBeenCalled()
      expect(result).toContain('react')
      expect(result).toContain('hooks')
    })

    it('should handle special regex characters in query', () => {
      const result = highlightText('React (Hooks) Tutorial', '(hooks)')

      expect(mockDOMPurify.sanitize).toHaveBeenCalled()
      expect(result).toContain('(hooks)')
    })

    it('should escape HTML in text', () => {
      const result = highlightText('React<script>alert(1)</script>Tutorial', 'script')

      expect(mockDOMPurify.sanitize).toHaveBeenCalled()
      expect(result).not.toContain('<script>')
    })

    it('should apply correct CSS class to highlights', () => {
      const result = highlightText('React Hooks', 'hooks')

      expect(result).toContain('class="search-highlight"')
    })

    it('should handle empty text', () => {
      const result = highlightText('', 'query')

      expect(result).toBe('')
    })

    it('should handle undefined text', () => {
      const result = highlightText(undefined as any, 'query')

      expect(result).toBe('')
    })
  })
})
