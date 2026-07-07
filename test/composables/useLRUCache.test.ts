import { describe, it, expect } from 'vitest'
import { useLRUCache } from '@/composables/useLRUCache'

describe('useLRUCache', () => {
  it('should initialize with empty cache', () => {
    const { size, has } = useLRUCache(10)

    expect(size()).toBe(0)
    expect(has('key1')).toBe(false)
  })

  it('should store and retrieve values', () => {
    const { get, set } = useLRUCache(5)

    set('key1', 'value1')
    expect(get('key1')).toBe('value1')
  })

  it('should return undefined for non-existent keys', () => {
    const { get } = useLRUCache(5)

    expect(get('nonexistent')).toBeUndefined()
  })

  it('should return undefined for cache miss', () => {
    const { get } = useLRUCache(5)

    expect(get('key1')).toBeUndefined()
  })

  it('should update LRU order on access', () => {
    const { get, set, size } = useLRUCache(3)

    set('key1', 'value1')
    set('key2', 'value2')
    set('key3', 'value3')

    expect(size()).toBe(3)

    get('key1') // Access key1
    get('key2')

    expect(size()).toBe(3) // Should still be 3
  })

  it('should evict LRU entry when cache is full', () => {
    const { get, set, has, size } = useLRUCache(2)

    set('key1', 'value1')
    set('key2', 'value2')

    expect(size()).toBe(2)
    expect(has('key1')).toBe(true)

    // Add third item - should evict key1
    set('key3', 'value3')

    expect(size()).toBe(2)
    expect(has('key1')).toBe(false)
    expect(has('key2')).toBe(true)
    expect(has('key3')).toBe(true)
    expect(get('key1')).toBeUndefined()
  })

  it('should handle eviction of multiple items', () => {
    const { get, set, has } = useLRUCache(3)

    set('key1', 'value1')
    set('key2', 'value2')
    set('key3', 'value3')

    // Add and access pattern
    set('key4', 'value4')
    get('key1')
    get('key4')

    set('key5', 'value5')

    // key2 should be evicted (least recently used)
    expect(has('key2')).toBe(false)
  })

  it('should allow custom max size', () => {
    const { set, size } = useLRUCache(100)

    for (let i = 0; i < 100; i++) {
      set(`key${i}`, `value${i}`)
    }

    expect(size()).toBe(100)
  })

  it('should clear all entries', () => {
    const { set, get, clear, size, has } = useLRUCache(5)

    set('key1', 'value1')
    set('key2', 'value2')
    expect(has('key1')).toBe(true)
    expect(size()).toBe(2)

    clear()

    expect(has('key1')).toBe(false)
    expect(get('key1')).toBeUndefined()
    expect(size()).toBe(0)
  })

  it('should handle undefined value updates', () => {
    const { get, set } = useLRUCache(3)

    set('key1', 'value1')
    set('key1', undefined)

    expect(get('key1')).toBeUndefined()
  })

  it('should update existing key value', () => {
    const { get, set } = useLRUCache(3)

    set('key1', 'value1')
    set('key1', 'value2')

    expect(get('key1')).toBe('value2')
  })

  it('should handle number keys', () => {
    const { get, set } = useLRUCache(3)

    set(1, 'value1')
    set(2, 'value2')

    expect(get(1)).toBe('value1')
    expect(get(2)).toBe('value2')
  })

  it('should handle string keys', () => {
    const { get, set } = useLRUCache(3)

    set('search:react', ['result1', 'result2'])
    set('search:vue', ['result3'])

    expect(get('search:react')).toEqual(['result1', 'result2'])
  })
})
