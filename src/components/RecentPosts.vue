<script setup lang="ts">
import { computed } from "vue";

interface Post {
  id: string;
  slug: string;
  title: string;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

const props = defineProps<{
  posts: Post[];
  totalCount: number;
}>();

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Draft";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const hasMorePosts = computed(() => props.totalCount > props.posts.length);
</script>

<template>
  <div class="recent-posts">
    <h5 class="posts-title">
      <i class="bi bi-file-earmark-text me-2"></i>
      Your Recent Posts
    </h5>

    <div v-if="posts.length === 0" class="empty-state">
      <i class="bi bi-journal-x"></i>
      <p>No published posts yet</p>
      <a href="/editor/posts/new" class="create-btn">
        <i class="bi bi-plus-lg me-1"></i>
        Create Your First Post
      </a>
    </div>

    <div v-else class="posts-list">
      <a
        v-for="post in posts"
        :key="post.id"
        :href="`/blog/${post.slug}`"
        class="post-item"
      >
        <div class="post-info">
          <h6 class="post-title">{{ post.title }}</h6>
          <div class="post-meta">
            <span v-if="post.status === 'published'" class="post-status status-published">
              <i class="bi bi-check-circle-fill me-1"></i>
              Published
            </span>
            <span class="post-date">
              <i class="bi bi-calendar3 me-1"></i>
              {{ formatDate(post.publishedAt) }}
            </span>
          </div>
        </div>
        <div class="post-actions">
          <a
            :href="`/editor/posts/${post.id}`"
            class="action-btn"
            title="Edit"
            @click.stop
          >
            <i class="bi bi-pencil"></i>
          </a>
        </div>
      </a>

      <div class="posts-footer" style="display: flex; justify-content: flex-end;">
        <a href="/editor/posts" class="see-all-btn">
          View All Posts
          <i class="bi bi-arrow-right"></i>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recent-posts {
  padding: 0;
}

.posts-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cyber-text-secondary);
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--cyber-neutral-200);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--cyber-text-muted);
}

.empty-state i {
  font-size: 3rem;
  opacity: 0.5;
  display: block;
  margin-bottom: 1rem;
}

.empty-state p {
  margin: 0 0 1rem;
  font-size: 0.95rem;
}

.create-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--cyber-secondary) 0%, var(--cyber-accent) 100%);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--cyber-shadow-md);
  color: #fff;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  background: var(--cyber-bg-tertiary);
  border-radius: 10px;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.post-item:hover {
  background: var(--cyber-surface);
  border-color: var(--cyber-secondary);
  transform: translateX(4px);
}

.post-info {
  flex: 1;
  min-width: 0;
}

.post-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--cyber-text-primary);
  margin: 0 0 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.post-status {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.status-published {
  background: var(--cyber-success-bg);
  color: var(--cyber-success-text);
}

.post-date {
  font-size: 0.8rem;
  color: var(--cyber-text-muted);
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: var(--cyber-surface);
  color: var(--cyber-text-muted);
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid var(--cyber-neutral-200);
}

.action-btn:hover {
  background: var(--cyber-secondary);
  color: #fff;
  border-color: var(--cyber-secondary);
}

.posts-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--cyber-neutral-200);
  text-align: right;
}

.see-all-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--cyber-secondary) 0%, var(--cyber-accent) 100%);
  border-radius: 10px;
  color: #fff;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.2s ease;
  min-width: 150px;
}

.see-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--cyber-shadow-md);
}
</style>
