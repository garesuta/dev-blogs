import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useMessageTimeout } from '@/composables/useMessageTimeout'

describe('useMessageTimeout', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with empty message', () => {
    const { message, type } = useMessageTimeout()
    expect(message.value).toBe('')
    expect(type.value).toBe('success')
  })

  it('shows a success message', () => {
    const { message, type, show } = useMessageTimeout()
    show('Saved!')
    expect(message.value).toBe('Saved!')
    expect(type.value).toBe('success')
  })

  it('shows an error message', () => {
    const { message, type, show } = useMessageTimeout()
    show('Failed!', 'error')
    expect(message.value).toBe('Failed!')
    expect(type.value).toBe('error')
  })

  it('clears message after default duration (3000ms)', () => {
    const { message, show } = useMessageTimeout()
    show('Test')

    vi.advanceTimersByTime(2999)
    expect(message.value).toBe('Test')

    vi.advanceTimersByTime(1)
    expect(message.value).toBe('')
  })

  it('clears message after custom duration', () => {
    const { message, show } = useMessageTimeout(1000)
    show('Quick')

    vi.advanceTimersByTime(999)
    expect(message.value).toBe('Quick')

    vi.advanceTimersByTime(1)
    expect(message.value).toBe('')
  })

  it('resets timer when showing new message', () => {
    const { message, show } = useMessageTimeout(3000)
    show('First')

    vi.advanceTimersByTime(2000)
    show('Second')

    vi.advanceTimersByTime(2000)
    // Should still be visible - timer restarted
    expect(message.value).toBe('Second')

    vi.advanceTimersByTime(1000)
    expect(message.value).toBe('')
  })

  it('updates type when showing new message', () => {
    const { type, show } = useMessageTimeout()
    show('Error', 'error')
    expect(type.value).toBe('error')

    show('OK', 'success')
    expect(type.value).toBe('success')
  })
})
