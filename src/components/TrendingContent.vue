<script setup lang="ts">
import { computed } from 'vue'
import type { SearchDocument } from '@/types/search'
import useRelatedArticles from '@/composables/useRelatedArticles'

interface Props {
  currentArticle: SearchDocument
  allArticles?: SearchDocument[]
}

const props = withDefaults(defineProps<Props>(), {
  allArticles: () => [],
})

const {
  trendingArticles,
  hasTrending,
  recentlyUpdated,
  hasRecentlyUpdated,
} = useRelatedArticles(props.currentArticle, props.allArticles)

const formatDate = (date: Date | number) => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getDifficultyClass = (difficulty?: string) => {
  const classes: Record<string, string> = {
    beginner: 'bg-success',
    intermediate: 'bg-warning',
    advanced: 'bg-danger',
  }
  return classes[difficulty || ''] || 'bg-secondary'
}
</script>

<template>
  <div v-if="hasTrending || hasRecentlyUpdated" class="trending-section mt-5">
    <!-- Trending Content -->
    <div v-if="hasTrending" class="mb-5">
      <h3 class="mb-3">
        <i class="bi bi-fire"></i> Trending Now
      </h3>
      <div class="list-group list-group-flush shadow-sm rounded border-0">
        <a
          v-for="article in trendingArticles"
          :key="article.id"
          :href="`/blog/${article.id}/`"
          class="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
        >
          <div class="trending-number bg-primary text-white rounded-circle d-flex align-items-center justify-content-center">
            {{ trendingArticles.indexOf(article) + 1 }}
          </div>
          <div class="flex-grow-1">
            <h6 class="mb-1">{{ article.title }}</h6>
            <p class="mb-1 text-muted small">{{ article.description }}</p>
            <div class="d-flex gap-2 align-items-center">
              <span v-if="article.category" class="badge bg-info text-white small">
                {{ article.category }}
              </span>
              <span v-if="article.readingTime" class="text-muted small">
                {{ article.readingTime }} min read
              </span>
              <span class="text-muted small">
                {{ formatDate(article.pubDate) }}
              </span>
            </div>
          </div>
          <i class="bi bi-chevron-right text-muted"></i>
        </a>
      </div>
    </div>

    <!-- Recently Updated -->
    <div v-if="hasRecentlyUpdated" class="mb-5">
      <h3 class="mb-3">
        <i class="bi bi-clock-history"></i> Recently Updated
      </h3>
      <div class="list-group list-group-flush shadow-sm rounded border-0">
        <a
          v-for="article in recentlyUpdated"
          :key="article.id"
          :href="`/blog/${article.id}/`"
          class="list-group-item list-group-item-action py-3"
        >
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <h6 class="mb-1">
                <span class="badge bg-warning text-white small me-2">Updated</span>
                {{ article.title }}
              </h6>
              <p class="mb-1 text-muted small">{{ article.description }}</p>
              <div class="d-flex gap-2 align-items-center">
                <span v-if="article.category" class="badge bg-info text-white small">
                  {{ article.category }}
                </span>
                <span class="text-muted small">
                  Updated: {{ formatDate(article.updatedDate!) }}
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
.trending-number {
  width: 36px;
  height: 36px;
  font-size: 0.875rem;
  font-weight: bold;
}

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
