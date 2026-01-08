<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

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
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  tags: { id: string; name: string }[];
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
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

// Filter options
const categories = ref<Category[]>([]);
const availableTags = ref<Tag[]>([]);

// Filters
const statusFilter = ref<string>("");
const categoryFilter = ref<string>("");
const tagFilter = ref<string>("");
const searchQuery = ref("");

// Sorting
const sortBy = ref<string>("updatedAt");
const sortOrder = ref<string>("desc");

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
    if (categoryFilter.value) {
      params.set("categoryId", categoryFilter.value);
    }
    if (tagFilter.value) {
      params.set("tagId", tagFilter.value);
    }
    if (searchQuery.value) {
      params.set("search", searchQuery.value);
    }
    if (sortBy.value) {
      params.set("sortBy", sortBy.value);
    }
    if (sortOrder.value) {
      params.set("sortOrder", sortOrder.value);
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

// Sorting
function toggleSort(column: string) {
  if (sortBy.value === column) {
    // Toggle order if same column
    sortOrder.value = sortOrder.value === "desc" ? "asc" : "desc";
  } else {
    // New column, default to desc
    sortBy.value = column;
    sortOrder.value = "desc";
  }
  pagination.value.page = 1;
  fetchPosts();
}

function getSortIcon(column: string) {
  if (sortBy.value !== column) return "";
  return sortOrder.value === "desc" ? "▼" : "▲";
}

// Fetch filter options
async function fetchFilterOptions() {
  try {
    const [catRes, tagRes] = await Promise.all([
      fetch("/api/categories"),
      fetch("/api/tags"),
    ]);

    if (catRes.ok) {
      const catData = await catRes.json();
      categories.value = catData.categories || [];
    }
    if (tagRes.ok) {
      const tagData = await tagRes.json();
      availableTags.value = tagData.tags || [];
    }
  } catch (err) {
    console.error("Error fetching filter options:", err);
  }
}

// Watch filters
watch(statusFilter, () => {
  pagination.value.page = 1;
  fetchPosts();
});

watch(categoryFilter, () => {
  pagination.value.page = 1;
  fetchPosts();
});

watch(tagFilter, () => {
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
  fetchFilterOptions();
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

      <!-- Category filter -->
      <select class="form-select" style="width: auto;" v-model="categoryFilter">
        <option value="">All categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>

      <!-- Tag filter -->
      <select class="form-select" style="width: auto;" v-model="tagFilter">
        <option value="">All tags</option>
        <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
          {{ tag.name }}
        </option>
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
            <th class="sortable" @click="toggleSort('title')">
              Title <span class="sort-icon">{{ getSortIcon('title') }}</span>
            </th>
            <th style="width: 100px;">Status</th>
            <th style="width: 130px;">Category</th>
            <th style="width: 150px;">Tags</th>
            <th style="width: 120px;">Author</th>
            <th class="sortable" style="width: 145px;" @click="toggleSort('createdAt')">
              Created <span class="sort-icon">{{ getSortIcon('createdAt') }}</span>
            </th>
            <th class="sortable" style="width: 145px;" @click="toggleSort('updatedAt')">
              Updated <span class="sort-icon">{{ getSortIcon('updatedAt') }}</span>
            </th>
            <th style="width: 80px;">Actions</th>
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
              <span
                v-if="post.categoryName"
                class="badge"
                :style="{ backgroundColor: post.categoryColor || '#6c757d' }"
              >
                {{ post.categoryName }}
              </span>
              <span v-else class="text-muted small">—</span>
            </td>
            <td>
              <div v-if="post.tags && post.tags.length > 0" class="d-flex flex-wrap gap-1">
                <span
                  v-for="tag in post.tags.slice(0, 3)"
                  :key="tag.id"
                  class="badge bg-light text-dark border"
                >
                  {{ tag.name }}
                </span>
                <span v-if="post.tags.length > 3" class="badge bg-light text-muted border">
                  +{{ post.tags.length - 3 }}
                </span>
              </div>
              <span v-else class="text-muted small">—</span>
            </td>
            <td>
              <span class="small">{{ post.authorName || post.authorEmail || "Unknown" }}</span>
            </td>
            <td>
              <span class="small">{{ formatDate(post.createdAt) }}</span>
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
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.table-responsive {
  flex: 1;
}

.table {
  margin-bottom: 0;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background-color: #e9ecef;
}

.sort-icon {
  font-size: 0.75em;
  margin-left: 4px;
  opacity: 0.7;
}
</style>
