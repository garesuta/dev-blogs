import { ref } from 'vue'

export function useLRUCache<K, V>(maxSize = 50) {
  const cache = ref<Map<K, V>>(new Map())

  function get(key: K): V | undefined {
    const value = cache.value.get(key)
    if (value !== undefined) {
      // Move to end (most recently used)
      cache.value.delete(key)
      cache.value.set(key, value)
    }
    return value
  }

  function set(key: K, value: V): void {
    if (cache.value.size >= maxSize) {
      // Remove least recently used (first entry)
      const lruKey = cache.value.keys().next().value
      if (lruKey !== undefined) {
        cache.value.delete(lruKey)
      }
    }
    cache.value.set(key, value)
  }

  function has(key: K): boolean {
    return cache.value.has(key)
  }

  function clear(): void {
    cache.value.clear()
  }

  const size = () => cache.value.size

  return { get, set, has, clear, size }
}
