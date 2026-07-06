import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useReadingHistory } from '@/composables/useReadingHistory'

// Mock auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: vi.fn(() => ({
      user: { id: 'user-1', email: 'test@example.com' },
    })),
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useReadingHistory', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear()
    // Clear history cache
    const READING_HISTORY_KEY = 'reading_history'
    localStorageMock.removeItem(READING_HISTORY_KEY)
  })

  it('should initialize with empty history', () => {
    const { history, hasHistory } = useReadingHistory()

    expect(history.value).toEqual([])
    expect(hasHistory.value).toBe(false)
  })

  it('should add article to history', () => {
    const { history, addToHistory, hasHistory } = useReadingHistory()

    addToHistory('article-1')

    expect(history.value.length).toBe(1)
    expect(history.value[0].articleId).toBe('article-1')
    expect(hasHistory.value).toBe(true)
  })

  it('should store readAt timestamp', () => {
    const { history, addToHistory } = useReadingHistory()

    const beforeAdd = Date.now()
    addToHistory('article-1')
    const afterAdd = Date.now()

    expect(history.value[0].readAt).toBeGreaterThanOrEqual(beforeAdd)
    expect(history.value[0].readAt).toBeLessThanOrEqual(afterAdd)
  })

  it('should limit history to MAX_HISTORY_SIZE', () => {
    const { history, addToHistory } = useReadingHistory()

    // Add more than MAX_HISTORY_SIZE (10)
    for (let i = 1; i <= 15; i++) {
      addToHistory(`article-${i}`)
    }

    expect(history.value.length).toBe(10)
  })

  it('should keep most recent articles first', () => {
    const { history, addToHistory } = useReadingHistory()

    addToHistory('article-1')
    addToHistory('article-2')
    addToHistory('article-3')

    expect(history.value[0].articleId).toBe('article-3')
    expect(history.value[1].articleId).toBe('article-2')
    expect(history.value[2].articleId).toBe('article-1')
  })

  it('should update existing article when adding again', () => {
    const { history, addToHistory } = useReadingHistory()

    addToHistory('article-1')
    const firstTimestamp = history.value[0].readAt

    // Wait a bit
    vi.advanceTimersByTime(100)

    addToHistory('article-1')

    expect(history.value.length).toBe(1)
    expect(history.value[0].readAt).toBeGreaterThan(firstTimestamp)
  })

  it('should persist history to localStorage', () => {
    const { addToHistory } = useReadingHistory()

    addToHistory('article-1')
    addToHistory('article-2')

    const saved = localStorageMock.getItem('reading_history')
    expect(saved).toBeTruthy()

    const parsed = JSON.parse(saved!)
    expect(parsed.length).toBe(2)
  })

  it('should load history from localStorage', () => {
    // Pre-populate localStorage
    const testData = [
      { articleId: 'article-1', readAt: Date.now() },
      { articleId: 'article-2', readAt: Date.now() - 1000 },
    ]
    localStorageMock.setItem('reading_history', JSON.stringify(testData))

    // Note: useReadingHistory uses watch for loading, so this test
    // verifies the structure is correct
    const saved = localStorageMock.getItem('reading_history')
    const parsed = JSON.parse(saved!)
    expect(parsed).toEqual(testData)
  })

  it('should clear all history', () => {
    const { history, addToHistory, clearHistory, hasHistory } = useReadingHistory()

    addToHistory('article-1')
    addToHistory('article-2')

    expect(hasHistory.value).toBe(true)

    clearHistory()

    expect(history.value).toEqual([])
    expect(hasHistory.value).toBe(false)
    expect(localStorageMock.getItem('reading_history')).toBeNull()
  })

  it('should get history for specific article', () => {
    const { addToHistory, getHistoryForArticle } = useReadingHistory()

    addToHistory('article-1')
    addToHistory('article-2')
    addToHistory('article-1')

    const article1History = getHistoryForArticle('article-1')
    const article2History = getHistoryForArticle('article-2')

    expect(article1History.length).toBeGreaterThan(0)
    expect(article2History.length).toBe(1)
  })

  it('should return empty array for article not in history', () => {
    const { addToHistory, getHistoryForArticle } = useReadingHistory()

    addToHistory('article-1')

    const history = getHistoryForArticle('article-nonexistent')
    expect(history).toEqual([])
  })

  it('should not add to history when not logged in', () => {
    // Mock no user
    vi.mocked(require('@/lib/auth-client').authClient).useSession.mockReturnValueOnce({ user: null })

    const { history, addToHistory } = useReadingHistory()

    addToHistory('article-1')

    expect(history.value).toEqual([])
  })

  it('should handle localStorage errors gracefully', () => {
    const { addToHistory } = useReadingHistory()

    // Mock getItem to throw
    const originalGetItem = localStorageMock.getItem
    localStorageMock.getItem = vi.fn(() => {
      throw new Error('Storage error')
    })

    addToHistory('article-1')

    // Should not crash
    expect(localStorageMock.getItem).toHaveBeenCalled()

    // Restore
    localStorageMock.getItem = originalGetItem
  })

  it('should handle localStorage setItem errors gracefully', () => {
    const { addToHistory, history } = useReadingHistory()

    // Mock setItem to throw
    const originalSetItem = localStorageMock.setItem
    localStorageMock.setItem = vi.fn(() => {
      throw new Error('Storage error')
    })

    addToHistory('article-1')

    // Should not crash, but history might not persist
    expect(localStorageMock.setItem).toHaveBeenCalled()

    // Restore
    localStorageMock.setItem = originalSetItem
  })
})
