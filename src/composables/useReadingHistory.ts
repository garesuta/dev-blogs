import { ref, computed, watch } from 'vue'
import { authClient } from '@/lib/auth-client'

const READING_HISTORY_KEY = 'reading_history'
const MAX_HISTORY_SIZE = 10

interface ReadingHistoryEntry {
  articleId: string
  readAt: number
}

export function useReadingHistory() {
  const history = ref<ReadingHistoryEntry[]>([])
  const isLoading = ref(false)
  const session = authClient.useSession()

  // Check if user is logged in
  const isLoggedIn = computed(() => !!session?.user)

  // Load history from localStorage
  function loadHistory() {
    try {
      const saved = localStorage.getItem(READING_HISTORY_KEY)
      if (saved) {
        const parsed: ReadingHistoryEntry[] = JSON.parse(saved)
        history.value = parsed
      }
    } catch (error) {
      console.error('Failed to load reading history:', error)
    }
  }

  // Save history to localStorage
  function saveHistory() {
    try {
      localStorage.setItem(READING_HISTORY_KEY, JSON.stringify(history.value))
    } catch (error) {
      console.error('Failed to save reading history:', error)
    }
  }

  // Load on mount if logged in
  watch(isLoggedIn, (loggedIn) => {
    if (loggedIn) {
      loadHistory()
    } else {
      history.value = []
    }
  })

  // Add article to history
  function addToHistory(articleId: string) {
    if (!isLoggedIn.value) return

    const entry: ReadingHistoryEntry = {
      articleId,
      readAt: Date.now(),
    }

    // Remove existing entry if same article
    const existingIndex = history.value.findIndex(h => h.articleId === articleId)
    if (existingIndex !== -1) {
      history.value[existingIndex] = entry
    }

    // Add new entry at beginning
    history.value.unshift(entry)

    // Keep max size
    if (history.value.length > MAX_HISTORY_SIZE) {
      history.value = history.value.slice(0, MAX_HISTORY_SIZE)
    }

    saveHistory()
  }

  function clearHistory() {
    history.value = []
    localStorage.removeItem(READING_HISTORY_KEY)
  }

  // Clear history on logout
  watch(session, () => {
    if (!session?.user) {
      clearHistory()
    }
  })

  // Get article history
  function getHistoryForArticle(articleId: string) {
    return history.value.filter(entry => entry.articleId === articleId)
  }

  return {
    history: computed(() => history.value),
    isLoading,
    isLoggedIn,
    hasHistory: computed(() => history.value.length > 0),
    addToHistory,
    clearHistory,
    getHistoryForArticle,
    MAX_HISTORY_SIZE,
  }
}
