import { ref, computed } from 'vue'

// Security requirements from Phase 0.3
const MAX_QUERY_LENGTH = 200
const CHARACTER_WHITELIST = /^[a-zA-Z0-9\s\-_\.ก-ฮเ-๙]*$/u
const RATE_LIMIT_PER_MINUTE = 30

// Rate limiting tracking
const queryTimestamps = ref<number[]>([])

export function useSearchValidation() {
  const query = ref('')
  const error = ref<string | null>(null)
  const isValid = computed(() => {
    if (!query.value.trim()) return true
    return query.value.length <= MAX_QUERY_LENGTH && CHARACTER_WHITELIST.test(query.value)
  })

  function validate(queryValue: string): { valid: boolean; reason?: string } {
    // Check length
    if (queryValue.length > MAX_QUERY_LENGTH) {
      return {
        valid: false,
        reason: `Query exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
      }
    }

    // Check characters
    if (!CHARACTER_WHITELIST.test(queryValue)) {
      return {
        valid: false,
        reason: 'Query contains invalid characters',
      }
    }

    // Check rate limiting
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    const recentQueries = queryTimestamps.value.filter(t => t > oneMinuteAgo)
    queryTimestamps.value = [...recentQueries, now]

    if (recentQueries.length >= RATE_LIMIT_PER_MINUTE) {
      return {
        valid: false,
        reason: 'Too many search queries. Please wait a moment.',
      }
    }

    return { valid: true }
  }

  function updateQuery(newQuery: string) {
    const result = validate(newQuery)
    if (result.valid) {
      query.value = newQuery
      error.value = null
    } else {
      error.value = result.reason || 'Invalid query'
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    query,
    error,
    isValid,
    updateQuery,
    clearError,
    MAX_QUERY_LENGTH,
  }
}
