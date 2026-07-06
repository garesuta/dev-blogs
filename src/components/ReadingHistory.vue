<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { SearchDocument } from '@/types/search'
import useReadingHistory from '@/composables/useReadingHistory'

interface Props {
  allArticles: SearchDocument[]
}

const props = defineProps<Props>()

const {
  history,
  isLoading,
  isLoggedIn,
  hasHistory,
  clearHistory,
} = useReadingHistory()

const formatDate = (timestamp: number) => {
  const d = new Date(timestamp)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getArticleById = (articleId: string) => {
  return props.allArticles.find(article => article.id === articleId)
}

const clearHistoryHandler = () => {
  if (confirm('Are you sure you want to clear your reading history?')) {
    clearHistory()
  }
}
</script>

<template>
  <div class="reading-history-section">
    <div v-if="!isLoggedIn" class="alert alert-info">
      <i class="bi bi-info-circle me-2"></i>
      Please <a href="/login" class="alert-link">log in</a> to view your reading history.
    </div>

    <div v-else-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">Loading reading history...</p>
    </div>

    <div v-else-if="!hasHistory" class="alert alert-secondary">
      <i class="bi bi-bookmark me-2"></i>
      You haven't read any articles yet. Start exploring!
    </div>

    <div v-else>
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="mb-0">Reading History</h3>
        <button
          class="btn btn-sm btn-outline-danger"
          @click="clearHistoryHandler"
        >
          <i class="bi bi-trash me-1"></i> Clear History
        </button>
      </div>

      <div class="list-group list-group-flush shadow-sm rounded border-0">
        <a
          v-for="entry in history"
          :key="entry.articleId"
          :href="`/blog/${entry.articleId}/`"
          class="list-group-item list-group-item-action py-3"
        >
          <div v-if="getArticleById(entry.articleId)" class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="mb-1">{{ getArticleById(entry.articleId)!.title }}</h6>
              <p class="mb-1 text-muted small">{{ getArticleById(entry.articleId)!.description }}</p>
              <div class="d-flex gap-2 align-items-center">
                <span v-if="getArticleById(entry.articleId)!.category" class="badge bg-info text-white small">
                  {{ getArticleById(entry.articleId)!.category }}
                </span>
                <span v-if="getArticleById(entry.articleId)!.difficulty" :class="['badge', 'text-white', 'small', 'bg-' + (getArticleById(entry.articleId)!.difficulty === 'beginner' ? 'success' : getArticleById(entry.articleId)!.difficulty === 'intermediate' ? 'warning' : 'danger')]">
                  {{ getArticleById(entry.articleId)!.difficulty }}
                </span>
                <span class="text-muted small">
                  <i class="bi bi-clock me-1"></i> {{ formatDate(entry.readAt) }}
                </span>
              </div>
            </div>
            <i class="bi bi-arrow-right-circle text-muted"></i>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-group-item {
  transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.list-group-item:hover {
  background-color: #f8f9fa !important;
  transform: translateX(4px);
}

.list-group-item:active {
  background-color: #e9ecef !important;
}
</style>
