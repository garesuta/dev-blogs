import { ref, watch, onMounted } from 'vue'

export function useURLState<T extends Record<string, string | undefined>>(
  defaults: T
) {
  const params = new URLSearchParams(window.location.search)

  const state = ref<T>(
    Object.fromEntries(
      Object.keys(defaults).map(key => [
        key,
        params.get(key) ?? defaults[key as string]
      ])
    ) as T
  )

  // Update URL when state changes
  watch(state, (newState) => {
    const url = new URL(window.location.href)
    Object.entries(newState).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value)
      } else {
        url.searchParams.delete(key)
      }
    })
    window.history.replaceState({}, '', url.toString())
  }, { deep: true })

  return state
}
