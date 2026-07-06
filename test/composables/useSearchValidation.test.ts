import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSearchValidation } from '@/composables/useSearchValidation'

describe('useSearchValidation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should initialize with empty query', () => {
    const { query } = useSearchValidation()

    expect(query.value).toBe('')
  })

  it('should initialize with no error', () => {
    const { error } = useSearchValidation()

    expect(error.value).toBeNull()
  })

  it('should initialize with valid state for empty query', () => {
    const { isValid } = useSearchValidation()

    expect(isValid.value).toBe(true)
  })

  it('should accept valid queries', () => {
    const { updateQuery, isValid, error } = useSearchValidation()

    updateQuery('react hooks')
    expect(isValid.value).toBe(true)
    expect(error.value).toBeNull()
  })

  it('should reject queries exceeding max length', () => {
    const { updateQuery, isValid, error } = useSearchValidation()

    const longQuery = 'a'.repeat(201)
    updateQuery(longQuery)

    expect(isValid.value).toBe(false)
    expect(error.value).toContain('exceeds maximum length')
  })

  it('should accept queries at max length', () => {
    const { updateQuery, isValid, error } = useSearchValidation()

    const maxQuery = 'a'.repeat(200)
    updateQuery(maxQuery)

    expect(isValid.value).toBe(true)
    expect(error.value).toBeNull()
  })

  it('should reject queries with invalid characters', () => {
    const { updateQuery, isValid, error } = useSearchValidation()

    updateQuery('react<script>alert(1)</script>')

    expect(isValid.value).toBe(false)
    expect(error.value).toContain('invalid characters')
  })

  it('should accept valid Thai characters', () => {
    const { updateQuery, isValid, error } = useSearchValidation()

    updateQuery('การเขียนโปรแกรม')

    expect(isValid.value).toBe(true)
    expect(error.value).toBeNull()
  })

  it('should enforce rate limiting', () => {
    const { updateQuery, isValid, error } = useSearchValidation()

    // Make 30 rapid queries
    for (let i = 0; i < 35; i++) {
      updateQuery(`query${i}`)
    }

    // First 30 should be valid
    expect(isValid.value).toBe(false)
    expect(error.value).toContain('too many search queries')
  })

  it('should clear error when requested', () => {
    const { updateQuery, clearError, error } = useSearchValidation()

    updateQuery('invalid<script>')
    expect(error.value).not.toBeNull()

    clearError()
    expect(error.value).toBeNull()
  })

  it('should provide MAX_QUERY_LENGTH constant', () => {
    const { MAX_QUERY_LENGTH } = useSearchValidation()

    expect(MAX_QUERY_LENGTH).toBe(200)
  })
})
