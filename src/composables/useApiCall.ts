import { ref, type Ref } from 'vue'

export function useApiCall<T>() {
  const data: Ref<T | null> = ref(null)
  const error: Ref<string | null> = ref(null)
  const isLoading = ref(false)

  async function execute(fn: () => Promise<T>) {
    isLoading.value = true
    error.value = null
    data.value = null
    try {
      data.value = await fn()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred'
    } finally {
      isLoading.value = false
    }
  }

  return { data, error, isLoading, execute }
}
