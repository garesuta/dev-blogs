<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";

// Types
interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroImage: string | null;
  status: "draft" | "published" | "scheduled";
  scheduledDate: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  authorId: string;
  authorName: string | null;
  authorEmail: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// State
const posts = ref<Post[]>([]);
const pagination = ref<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
const isLoading = ref(true);
const error = ref("");

// Filters
const statusFilter = ref<string>("");
const searchQuery = ref("");

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed
const statusBadgeClass = (status: string) => {
  switch (status) {
    case "published":
      return "bg-success";
    case "scheduled":
      return "bg-info";
    default:
      return "bg-secondary";
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Fetch posts
async function fetchPosts() {
  isLoading.value = true;
  error.value = "";

  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
    });

    if (statusFilter.value) {
      params.set("status", statusFilter.value);
    }
    if (searchQuery.value) {
      params.set("search", searchQuery.value);
    }

    const response = await fetch(`/api/posts?${params}`);

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to fetch posts");
    }

    const data = await response.json();
    posts.value = data.posts;
    pagination.value = data.pagination;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load posts";
    console.error("Error fetching posts:", err);
  } finally {
    isLoading.value = false;
  }
}

// Delete post
async function deletePost(post: Post) {
  if (!confirm(`Are you sure you want to delete "${post.title}"?`)) {
    return;
  }

  try {
    const response = await fetch(`/api/posts/${post.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete post");
    }

    // Remove from list
    posts.value = posts.value.filter((p) => p.id !== post.id);
    pagination.value.total -= 1;
  } catch (err) {
    alert(err instanceof Error ? err.message : "Failed to delete post");
  }
}

// Pagination
function goToPage(page: number) {
  if (page < 1 || page > pagination.value.totalPages) return;
  pagination.value.page = page;
  fetchPosts();
}

// Watch filters
watch(statusFilter, () => {
  pagination.value.page = 1;
  fetchPosts();
});

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    pagination.value.page = 1;
    fetchPosts();
  }, 300);
});

// Initialize
onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <div class="post-list">
    <!-- Toolbar -->
    <div class="d-flex flex-wrap gap-3 mb-4 align-items-center">
      <!-- Search -->
      <div class="flex-grow-1" style="min-width: 200px; max-width: 400px;">
        <input
          type="search"
          class="form-control"
          v-model="searchQuery"
          placeholder="Search posts..."
        />
      </div>

      <!-- Status filter -->
      <select class="form-select" style="width: auto;" v-model="statusFilter">
        <option value="">All statuses</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="scheduled">Scheduled</option>
      </select>

      <!-- New post button -->
      <a href="/editor/posts/new" class="btn btn-primary ms-auto">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-1" viewBox="0 0 16 16">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        New Post
      </a>
    </div>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger" role="alert">
      {{ error }}
      <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="fetchPosts">
        Retry
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading posts...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="posts.length === 0" class="text-center py-5">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="text-muted mb-3" viewBox="0 0 16 16">
        <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
        <path d="M4.5 12.5A.5.5 0 0 1 5 12h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0-2A.5.5 0 0 1 5 10h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm1.639-3.708 1.33.886 1.854-1.855a.25.25 0 0 1 .289-.047l1.888.974V8.5a.5.5 0 0 1-.5.5H5a.5.5 0 0 1-.5-.5V8s1.54-1.274 1.639-1.208zM6.25 6a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z"/>
      </svg>
      <h5 class="text-muted">No posts found</h5>
      <p class="text-muted" v-if="searchQuery || statusFilter">
        Try adjusting your filters
      </p>
      <a v-else href="/editor/posts/new" class="btn btn-primary mt-2">
        Create your first post
      </a>
    </div>

    <!-- Posts table -->
    <div v-else class="table-responsive">
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>Title</th>
            <th style="width: 100px;">Status</th>
            <th style="width: 150px;">Author</th>
            <th style="width: 180px;">Updated</th>
            <th style="width: 100px;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id">
            <td>
              <a :href="`/editor/posts/${post.id}`" class="fw-semibold text-decoration-none">
                {{ post.title }}
              </a>
              <div class="small text-muted">/blog/{{ post.slug }}</div>
            </td>
            <td>
              <span class="badge" :class="statusBadgeClass(post.status)">
                {{ post.status }}
              </span>
              <div v-if="post.status === 'scheduled' && post.scheduledDate" class="small text-muted">
                {{ formatDate(post.scheduledDate) }}
              </div>
            </td>
            <td>
              <span class="small">{{ post.authorName || post.authorEmail || "Unknown" }}</span>
            </td>
            <td>
              <span class="small">{{ formatDate(post.updatedAt) }}</span>
            </td>
            <td>
              <div class="dropdown">
                <button
                  class="btn btn-sm btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Actions
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li>
                    <a class="dropdown-item" :href="`/editor/posts/${post.id}`">
                      Edit
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" :href="`/editor/posts/${post.id}/preview`">
                      Preview
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" :href="`/editor/posts/${post.id}/history`">
                      Version History
                    </a>
                  </li>
                  <li v-if="post.status === 'published'">
                    <a class="dropdown-item" :href="`/blog/${post.slug}`" target="_blank">
                      View Live
                    </a>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <button class="dropdown-item text-danger" @click="deletePost(post)">
                      Delete
                    </button>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="d-flex justify-content-between align-items-center mt-4"
    >
      <small class="text-muted">
        Showing {{ (pagination.page - 1) * pagination.limit + 1 }} -
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
        of {{ pagination.total }} posts
      </small>

      <nav aria-label="Posts pagination">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: pagination.page === 1 }">
            <button class="page-link" @click="goToPage(pagination.page - 1)">
              Previous
            </button>
          </li>
          <li
            v-for="page in pagination.totalPages"
            :key="page"
            class="page-item"
            :class="{ active: page === pagination.page }"
          >
            <button class="page-link" @click="goToPage(page)">
              {{ page }}
            </button>
          </li>
          <li
            class="page-item"
            :class="{ disabled: pagination.page === pagination.totalPages }"
          >
            <button class="page-link" @click="goToPage(pagination.page + 1)">
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.post-list {
  min-height: 400px;
}
</style>
