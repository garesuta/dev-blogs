<script setup lang="ts">
import type { SearchDocument } from '@/types/search'

// Props - use type-based defineProps
interface Props {
  document: SearchDocument
  highlightedTitle?: string
  highlightedDescription?: string
  date?: string
}

const props = withDefaults(defineProps<Props>(), {
  highlightedTitle: '',
  highlightedDescription: '',
  date: '',
})

// Emits - use type-based defineEmits
const emit = defineEmits<{
  click: [document: SearchDocument]
}>()

// Computed
const articleUrl = computed(() => `/blog/${props.document.id}/`)

const displayDate = computed(() => {
  if (props.date) return props.date

  return props.document.pubDate
    ? new Date(props.document.pubDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''
})

const readingTimeText = computed(() => {
  if (!props.document.readingTime) return ''

  const mins = props.document.readingTime
  if (mins < 1) return '< 1 min read'
  if (mins === 1) return '1 min read'
  return `${mins} min read`
})

const difficultyBadgeClass = computed(() => {
  switch (props.document.difficulty) {
    case 'beginner':
      return 'bg-success'
    case 'intermediate':
      return 'bg-warning text-dark'
    case 'advanced':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
})
</script>

<template>
  <article
    class="result-card"
    :tabindex="0"
    @click="emit('click', document)"
    @keydown.enter="emit('click', document)"
  >
    <!-- Hero image if available -->
    <div
      v-if="document.heroImage"
      class="result-image"
    >
      <img
        :src="document.heroImage"
        :alt="document.title"
        loading="lazy"
        class="img-fluid rounded"
      >
    </div>

    <!-- Content -->
    <div class="result-content">
      <!-- Tags and difficulty -->
      <div class="result-meta mb-2">
        <span
          v-if="document.difficulty"
          class="badge"
          :class="difficultyBadgeClass"
        >
          {{ document.difficulty }}
        </span>
        <span
          v-if="document.category"
          class="badge bg-info text-dark"
        >
          {{ document.category }}
        </span>
      </div>

      <!-- Title with highlighting -->
      <h3 class="result-title">
        <a
          :href="articleUrl"
          class="text-decoration-none text-body"
        >
          <span v-html="highlightedTitle" />
        </a>
      </h3>

      <!-- Description with highlighting -->
      <p class="result-description text-muted">
        <span v-html="highlightedDescription" />
      </p>

      <!-- Tags -->
      <div
        v-if="document.tags && document.tags.length > 0"
        class="result-tags mb-3"
      >
        <span
          v-for="tag in document.tags"
          :key="tag"
          class="badge bg-light text-dark me-1"
        >
          <i class="bi bi-tag me-1" />{{ tag }}
        </span>
      </div>

      <!-- Footer -->
      <div class="result-footer">
        <div class="result-footer-item">
          <i class="bi bi-calendar3 me-2 text-muted" />
          <time class="text-muted">{{ displayDate }}</time>
        </div>
        <div
          v-if="document.readingTime"
          class="result-footer-item"
        >
          <i class="bi bi-clock me-2 text-muted" />
          <span class="text-muted">{{ readingTimeText }}</span>
        </div>
        <div class="result-footer-item ms-auto">
          <span class="read-more">
            Read More <i class="bi bi-arrow-right-circle ms-1" />
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.result-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.result-card:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

.result-image {
  flex-shrink: 0;
  min-height: 180px;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-content {
  flex-grow: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.result-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.result-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.result-title a {
  transition: color 0.2s ease;
}

.result-title a:hover {
  color: #0d6efd;
}

.result-description {
  flex-grow: 1;
  margin-bottom: 1rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-tags {
  font-size: 0.875rem;
}

.result-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  padding-top: auto;
}

.result-footer-item {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
}

.read-more {
  color: #0d6efd;
  font-weight: 500;
  transition: color 0.2s ease;
}

.read-more:hover {
  color: #0b5ed7;
}

/* Highlighted text */
:deep(.search-highlight) {
  background-color: #fff3cd;
  color: #212529;
  padding: 0.1em 0.2em;
  border-radius: 2px;
  font-weight: 500;
}
</style>
