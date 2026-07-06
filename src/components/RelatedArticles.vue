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
  relatedArticles,
  hasRelated,
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
  <div v-if="hasRelated" class="related-articles-section mt-5">
    <h3 class="mb-3">You Might Also Like</h3>
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
      <div
        v-for="article in relatedArticles"
        :key="article.id"
        class="col"
      >
        <a
          :href="`/blog/${article.id}/`"
          class="text-decoration-none related-article-card"
        >
          <div v-if="article.heroImage" class="card h-100 border-0 shadow-sm">
            <img
              :src="article.heroImage"
              :alt="article.title"
              class="card-img-top"
              style="height: 150px; object-fit: cover;"
            >
            <div class="card-body">
              <h5 class="card-title">{{ article.title }}</h5>
              <p class="card-text text-muted small">{{ article.description }}</p>
              <div class="d-flex gap-2 mb-2">
                <span v-if="article.difficulty" :class="['badge', 'text-white', getDifficultyClass(article.difficulty)]">
                  {{ article.difficulty }}
                </span>
                <span v-if="article.category" class="badge bg-info text-white">
                  {{ article.category }}
                </span>
                <span v-if="article.readingTime" class="badge bg-light text-dark">
                  {{ article.readingTime }} min
                </span>
              </div>
              <small class="text-muted">{{ formatDate(article.pubDate) }}</small>
            </div>
          </div>
          <div v-else class="card h-100 border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">{{ article.title }}</h5>
              <p class="card-text text-muted small">{{ article.description }}</p>
              <div class="d-flex gap-2 mb-2">
                <span v-if="article.difficulty" :class="['badge', 'text-white', getDifficultyClass(article.difficulty)]">
                  {{ article.difficulty }}
                </span>
                <span v-if="article.category" class="badge bg-info text-white">
                  {{ article.category }}
                </span>
                <span v-if="article.readingTime" class="badge bg-light text-dark">
                  {{ article.readingTime }} min
                </span>
              </div>
              <small class="text-muted">{{ formatDate(article.pubDate) }}</small>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.related-article-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.related-article-card:hover .card {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.related-article-card:active .card {
  transform: translateY(-2px);
}
</style>
