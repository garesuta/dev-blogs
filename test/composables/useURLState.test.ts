import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useURLState } from '@/composables/useURLState'

// Mock window.history and window.location
const mockHistory = {
  replaceState: vi.fn(),
  pushState: vi.fn(),
}

const mockURLSearchParams = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  toString: vi.fn(() => 'http://example.com?'),
}

beforeEach(() => {
  Object.defineProperty(window, 'history', {
    value: mockHistory,
    writable: true,
  })
  Object.defineProperty(window, 'location', {
    value: { href: 'http://example.com', search: '' },
    writable: true,
  })
  Object.defineProperty(URLSearchParams.prototype, 'get', {
    value: mockURLSearchParams.get,
    writable: true,
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useURLState', () => {
  it('should initialize with default values', () => {
    const defaults = {
      category: 'ai',
      tags: 'react',
    }

    mockURLSearchParams.get.mockImplementation((key: string) => defaults[key as keyof typeof defaults])

    const state = useURLState(defaults)

    expect(state.value).toEqual(defaults)
  })

  it('should parse URL parameters correctly', () => {
    const defaults = {
      category: '',
      tags: '',
    }

    mockURLSearchParams.get.mockImplementation((key: string) => {
      if (key === 'category') return 'webdev'
      if (key === 'tags') return 'vue'
      return undefined
    })

    const state = useURLState(defaults)

    expect(state.value.category).toBe('webdev')
    expect(state.value.tags).toBe('vue')
  })

  it('should update URL when state changes', () => {
    const defaults = {
      category: '',
      tags: '',
    }

    mockURLSearchParams.get.mockReturnValue('')

    const state = useURLState(defaults)

    state.value.category = 'ai'
    state.value.tags = 'react'

    expect(mockURLSearchParams.set).toHaveBeenCalledWith('category', 'ai')
    expect(mockURLSearchParams.set).toHaveBeenCalledWith('tags', 'react')
    expect(mockHistory.replaceState).toHaveBeenCalled()
  })

  it('should remove URL parameter when value is set to undefined', () => {
    const defaults: Record<string, string | undefined> = {
      category: 'ai',
      tags: 'react',
    }

    mockURLSearchParams.get.mockReturnValue('')

    const state = useURLState(defaults)

    state.value.category = undefined

    expect(mockURLSearchParams.delete).toHaveBeenCalledWith('category')
    expect(mockURLSearchParams.set).toHaveBeenCalledWith('tags', 'react')
  })

  it('should handle deep object changes', () => {
    const defaults: Record<string, string | string[] | undefined> = {
      category: '',
      tags: undefined,
      difficulty: undefined,
    }

    mockURLSearchParams.get.mockReturnValue('')

    const state = useURLState(defaults)

    // Update nested object
    state.value = {
      category: 'ai',
      tags: ['react', 'vue'],
      difficulty: 'intermediate',
    }

    // All params should be set
    expect(mockURLSearchParams.set).toHaveBeenCalledTimes(5)
  })

  it('should support optional parameters', () => {
    const defaults: Record<string, string | undefined> = {
      category: '',
      tags: '',
    }

    mockURLSearchParams.get.mockReturnValue('')

    const state = useURLState(defaults)

    // Update with undefined optional
    state.value.category = 'ai'
    state.value.tags = undefined

    expect(mockURLSearchParams.set).toHaveBeenCalledWith('category', 'ai')
    expect(mockURLSearchParams.delete).toHaveBeenCalledWith('tags')
  })

  it('should not trigger watch on initialization', () => {
    const defaults = { category: '', tags: '' }

    mockURLSearchParams.get.mockReturnValue('')

    useURLState(defaults)

    // Should not replaceState during initialization
    expect(mockHistory.replaceState).not.toHaveBeenCalled()
  })
})
