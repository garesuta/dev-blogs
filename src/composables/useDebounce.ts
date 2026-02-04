import { ref, watch, type Ref } from 'vue'

export function useDebouncedRef<T>(initialValue: T, delay = 300) {
  const value = ref(initialValue) as Ref<T>
  const debouncedValue = ref(initialValue) as Ref<T>
  let timeout: ReturnType<typeof setTimeout> | null = null

  watch(value, (newVal) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      debouncedValue.value = newVal
    }, delay)
  })

  return { value, debouncedValue }
}
