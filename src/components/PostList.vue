<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

// Bootstrap Modal type (imported dynamically to avoid SSR issues)
type BootstrapModal = {
  show: () => void;
  hide: () => void;
};

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

// Delete modal state
const postToDelete = ref<Post | null>(null);
const isDeleting = ref(false);
const deleteModalRef = ref<HTMLElement | null>(null);
let deleteModal: BootstrapModal | null = null;

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

const formatRelativeTime = (dateString: string | null) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // Future dates
  if (diffMs < 0) {
    const futureDays = Math.abs(diffDays);
    if (futureDays === 0) return "Today";
    if (futureDays === 1) return "Tomorrow";
    if (futureDays < 7) return `In ${futureDays} days`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Past dates
  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;

  // Older than a year - show date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
  });
};

const formatFullDate = (dateString: string | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Computed property for truncated pagination
type PageItem = { type: "page"; page: number; key: string } | { type: "ellipsis"; key: string };
const visiblePages = computed<PageItem[]>(() => {
  const total = pagination.value.totalPages;
  const current = pagination.value.page;
  const delta = 2; // Number of pages to show around current page

  if (total <= 7) {
    // Show all pages if 7 or fewer
    return Array.from({ length: total }, (_, i) => ({
      type: "page" as const,
      page: i + 1,
      key: `page-${i + 1}`,
    }));
  }

  const pages: PageItem[] = [];
  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  // Always show first page
  pages.push({ type: "page", page: 1, key: "page-1" });

  // Show ellipsis if there's a gap after first page
  if (rangeStart > 2) {
    pages.push({ type: "ellipsis", key: "ellipsis-start" });
  }

  // Show pages around current
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push({ type: "page", page: i, key: `page-${i}` });
  }

  // Show ellipsis if there's a gap before last page
  if (rangeEnd < total - 1) {
    pages.push({ type: "ellipsis", key: "ellipsis-end" });
  }

  // Always show last page
  pages.push({ type: "page", page: total, key: `page-${total}` });

  return pages;
});

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

// Delete post - open confirmation modal
async function confirmDelete(post: Post) {
  postToDelete.value = post;
  if (!deleteModal && deleteModalRef.value) {
    // Dynamically import Bootstrap Modal to avoid SSR issues
    const { Modal } = await import("bootstrap");
    deleteModal = new Modal(deleteModalRef.value);
  }
  deleteModal?.show();
}

// Execute the delete after modal confirmation
async function executeDelete() {
  if (!postToDelete.value) return;

  isDeleting.value = true;

  try {
    const response = await fetch(`/api/posts/${postToDelete.value.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete post");
    }

    // Remove from list
    posts.value = posts.value.filter((p) => p.id !== postToDelete.value?.id);
    pagination.value.total -= 1;

    // Close modal
    deleteModal?.hide();
    postToDelete.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to delete post";
    deleteModal?.hide();
  } finally {
    isDeleting.value = false;
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
    <div class="toolbar d-flex flex-column flex-lg-row gap-3 mb-4">
      <!-- Filters group -->
      <div class="filters-group d-flex flex-wrap gap-2 flex-grow-1 align-items-center">
        <!-- Search -->
        <div class="search-wrapper">
          <input
            type="search"
            class="form-control"
            v-model="searchQuery"
            placeholder="Search posts..."
            aria-label="Search posts"
          />
        </div>

        <!-- Status filter -->
        <select class="form-select filter-select" v-model="statusFilter" aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>

        <!-- Category filter -->
        <select class="form-select filter-select" v-model="categoryFilter" aria-label="Filter by category">
          <option value="">All categories</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>

        <!-- Tag filter -->
        <select class="form-select filter-select" v-model="tagFilter" aria-label="Filter by tag">
          <option value="">All tags</option>
          <option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
            {{ tag.name }}
          </option>
        </select>
      </div>

      <!-- New post button -->
      <a href="/editor/posts/new" class="btn btn-primary new-post-btn">
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
            <th
              class="sortable"
              @click="toggleSort('title')"
              :aria-sort="sortBy === 'title' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
              role="columnheader"
            >
              <span class="sortable-content">
                Title
                <span class="sort-indicator" :class="{ active: sortBy === 'title' }">
                  {{ getSortIcon('title') || '⇅' }}
                </span>
              </span>
            </th>
            <th class="col-status">Status</th>
            <th class="col-category">Category</th>
            <th class="col-tags">Tags</th>
            <th class="col-author">Author</th>
            <th
              class="sortable col-date"
              @click="toggleSort('createdAt')"
              :aria-sort="sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
              role="columnheader"
            >
              <span class="sortable-content">
                Created
                <span class="sort-indicator" :class="{ active: sortBy === 'createdAt' }">
                  {{ getSortIcon('createdAt') || '⇅' }}
                </span>
              </span>
            </th>
            <th
              class="sortable col-date"
              @click="toggleSort('updatedAt')"
              :aria-sort="sortBy === 'updatedAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
              role="columnheader"
            >
              <span class="sortable-content">
                Updated
                <span class="sort-indicator" :class="{ active: sortBy === 'updatedAt' }">
                  {{ getSortIcon('updatedAt') || '⇅' }}
                </span>
              </span>
            </th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in posts" :key="post.id">
            <td class="cell-title">
              <a
                :href="`/editor/posts/${post.id}`"
                class="fw-semibold text-decoration-none title-link"
                :title="post.title"
              >
                {{ post.title }}
              </a>
              <div
                class="small text-muted description-text"
                :title="post.description"
              >
                {{ post.description || '/blog/' + post.slug }}
              </div>
            </td>
            <td>
              <span class="badge" :class="statusBadgeClass(post.status)">
                {{ post.status }}
              </span>
              <div v-if="post.status === 'scheduled' && post.scheduledDate" class="small text-muted" :title="formatFullDate(post.scheduledDate)">
                {{ formatRelativeTime(post.scheduledDate) }}
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
              <span class="small date-relative" :title="formatFullDate(post.createdAt)">
                {{ formatRelativeTime(post.createdAt) }}
              </span>
            </td>
            <td>
              <span class="small date-relative" :title="formatFullDate(post.updatedAt)">
                {{ formatRelativeTime(post.updatedAt) }}
              </span>
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
                    <button
                      class="dropdown-item text-danger"
                      @click="confirmDelete(post)"
                      :aria-label="`Delete post: ${post.title}`"
                    >
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

    <!-- Delete Confirmation Modal -->
    <div
      class="modal fade"
      id="deleteModal"
      tabindex="-1"
      aria-labelledby="deleteModalLabel"
      aria-hidden="true"
      ref="deleteModalRef"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title" id="deleteModalLabel">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="text-danger me-2" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              Delete Post
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-1">Are you sure you want to delete this post?</p>
            <p class="fw-semibold text-dark mb-0" v-if="postToDelete">
              "{{ postToDelete.title }}"
            </p>
            <p class="text-muted small mt-2 mb-0">This action cannot be undone.</p>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-danger" @click="executeDelete" :disabled="isDeleting">
              <span v-if="isDeleting" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              {{ isDeleting ? 'Deleting...' : 'Delete Post' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination.totalPages > 1"
      class="pagination-wrapper d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-4"
    >
      <small class="text-muted order-2 order-sm-1">
        Showing {{ (pagination.page - 1) * pagination.limit + 1 }} -
        {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
        of {{ pagination.total }} posts
      </small>

      <nav aria-label="Posts pagination" class="order-1 order-sm-2">
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: pagination.page === 1 }">
            <button
              class="page-link"
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page === 1"
              aria-label="Go to previous page"
            >
              <span aria-hidden="true">&laquo;</span>
              <span class="d-none d-md-inline ms-1">Previous</span>
            </button>
          </li>

          <!-- Truncated pagination -->
          <template v-for="item in visiblePages" :key="item.key">
            <li v-if="item.type === 'ellipsis'" class="page-item disabled">
              <span class="page-link">...</span>
            </li>
            <li
              v-else
              class="page-item"
              :class="{ active: item.page === pagination.page }"
            >
              <button
                class="page-link"
                @click="goToPage(item.page)"
                :aria-label="`Go to page ${item.page}`"
                :aria-current="item.page === pagination.page ? 'page' : undefined"
              >
                {{ item.page }}
              </button>
            </li>
          </template>

          <li
            class="page-item"
            :class="{ disabled: pagination.page === pagination.totalPages }"
          >
            <button
              class="page-link"
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page === pagination.totalPages"
              aria-label="Go to next page"
            >
              <span class="d-none d-md-inline me-1">Next</span>
              <span aria-hidden="true">&raquo;</span>
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

/* Toolbar styles */
.toolbar {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.search-wrapper {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.filter-select {
  width: auto;
  min-width: 140px;
}

.new-post-btn {
  white-space: nowrap;
  transition: all 0.2s ease;
}

.new-post-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(13, 110, 253, 0.25);
}

/* Table styles */
.table-responsive {
  flex: 1;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
  overflow: hidden;
}

.table {
  margin-bottom: 0;
}

.table thead th {
  border-bottom: 2px solid #dee2e6;
  background-color: #f8f9fa;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: #495057;
}

.table tbody tr {
  transition: all 0.15s ease;
  border-left: 3px solid transparent;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
  border-left-color: #0d6efd;
}

.table tbody tr:last-child td {
  border-bottom: none;
}

/* Column widths - compact to give more space to title/description */
.col-status { width: 85px; }
.col-category { width: 100px; }
.col-tags { width: 120px; }
.col-author { width: 100px; }
.col-date { width: 95px; }
.col-actions { width: 80px; }

/* Title cell with truncation */
.cell-title {
  max-width: 300px;
  min-width: 200px;
}

.title-link {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.description-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  font-size: 0.8rem;
  line-height: 1.3;
}

/* Relative date styling */
.date-relative {
  cursor: help;
  border-bottom: 1px dotted #adb5bd;
  padding-bottom: 1px;
  transition: border-color 0.15s ease;
}

.date-relative:hover {
  border-bottom-color: #6c757d;
}

/* Sortable headers */
.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;
}

.sortable:hover {
  background-color: #e9ecef;
}

.sortable-content {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sort-indicator {
  font-size: 0.75em;
  opacity: 0.3;
  transition: opacity 0.15s ease;
}

.sort-indicator.active {
  opacity: 1;
  color: #0d6efd;
}

.sortable:hover .sort-indicator {
  opacity: 0.6;
}

/* Pagination */
.pagination-wrapper {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.pagination .page-link {
  border-radius: 0.375rem;
  margin: 0 2px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.pagination .page-item.active .page-link {
  font-weight: 600;
}

.pagination .page-item:not(.disabled):not(.active) .page-link:hover {
  background-color: #e9ecef;
  transform: translateY(-1px);
}

/* Empty state enhancements */
.text-center.py-5 {
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  border: 1px dashed #dee2e6;
}

/* Modal enhancements */
.modal-content {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

/* Responsive adjustments */
@media (max-width: 991.98px) {
  .toolbar {
    padding: 0.75rem;
  }

  .search-wrapper {
    max-width: 100%;
  }

  .filter-select {
    flex: 1;
    min-width: 0;
  }
}

@media (max-width: 575.98px) {
  .filters-group {
    width: 100%;
  }

  .filter-select {
    width: 100% !important;
  }

  .new-post-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
