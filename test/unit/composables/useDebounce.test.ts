import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useDebouncedRef } from '@/composables/useDebounce'

describe('useDebouncedRef', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes both values with initial value', () => {
    const { value, debouncedValue } = useDebouncedRef('')
    expect(value.value).toBe('')
    expect(debouncedValue.value).toBe('')
  })

  it('updates value immediately', () => {
    const { value } = useDebouncedRef('')
    value.value = 'hello'
    expect(value.value).toBe('hello')
  })

  it('does not update debouncedValue immediately', async () => {
    const { value, debouncedValue } = useDebouncedRef('')
    value.value = 'hello'
    await nextTick()
    expect(debouncedValue.value).toBe('')
  })

  it('updates debouncedValue after delay', async () => {
    const { value, debouncedValue } = useDebouncedRef('', 300)
    value.value = 'hello'
    await nextTick()

    vi.advanceTimersByTime(300)
    expect(debouncedValue.value).toBe('hello')
  })

  it('uses default delay of 300ms', async () => {
    const { value, debouncedValue } = useDebouncedRef('')
    value.value = 'test'
    await nextTick()

    vi.advanceTimersByTime(299)
    expect(debouncedValue.value).toBe('')

    vi.advanceTimersByTime(1)
    expect(debouncedValue.value).toBe('test')
  })

  it('resets timer on rapid changes', async () => {
    const { value, debouncedValue } = useDebouncedRef('', 300)

    value.value = 'a'
    await nextTick()
    vi.advanceTimersByTime(200)

    value.value = 'ab'
    await nextTick()
    vi.advanceTimersByTime(200)

    // Should still be empty - timer restarted
    expect(debouncedValue.value).toBe('')

    vi.advanceTimersByTime(100)
    expect(debouncedValue.value).toBe('ab')
  })

  it('works with number type', async () => {
    const { value, debouncedValue } = useDebouncedRef(0, 100)
    value.value = 42
    await nextTick()

    vi.advanceTimersByTime(100)
    expect(debouncedValue.value).toBe(42)
  })

  it('accepts custom delay', async () => {
    const { value, debouncedValue } = useDebouncedRef('', 500)
    value.value = 'test'
    await nextTick()

    vi.advanceTimersByTime(499)
    expect(debouncedValue.value).toBe('')

    vi.advanceTimersByTime(1)
    expect(debouncedValue.value).toBe('test')
  })
})
