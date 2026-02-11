<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import TiptapEditor from "./TiptapEditor.vue";
import SeoFields from "./SeoFields.vue";
import ImageUpload from "./ImageUpload.vue";
import { generateSlug } from "../lib/validations";
import { processContentForDisplay } from "../lib/content-processor";

// Types
interface Post {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  heroImage: string | null;
  status: "draft" | "published" | "scheduled";
  scheduledDate: string | null;
  categoryId: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

// Props
const props = defineProps<{
  postId?: string;
}>();

// State
const isLoading = ref(true);
const isSaving = ref(false);
const isPublishing = ref(false);
const error = ref("");
const successMessage = ref("");
const showPreviewModal = ref(false);

const post = reactive<Partial<Post>>({
  title: "",
  slug: "",
  description: "",
  content: "",
  heroImage: null,
  status: "draft",
  scheduledDate: null,
  categoryId: null,
  metaTitle: null,
  metaDescription: null,
  ogTitle: null,
  ogDescription: null,
  ogImage: null,
  canonicalUrl: null,
});

const originalUpdatedAt = ref<string | null>(null);
const lastSavedAt = ref<Date | null>(null);
const isDirty = ref(false);

// Categories and tags
const allCategories = ref<Category[]>([]);
const allTags = ref<Tag[]>([]);
const selectedTags = ref<Tag[]>([]);
const newTagInput = ref("");
const isLoadingCategories = ref(false);
const isLoadingTags = ref(false);

// Refs
const editorRef = ref<InstanceType<typeof TiptapEditor> | null>(null);
const previewContentRef = ref<HTMLElement | null>(null);

// Computed
const isNewPost = computed(() => !props.postId);
const canPublish = computed(() => {
  return post.title && post.slug && post.description && post.content;
});

const statusBadgeClass = computed(() => {
  switch (post.status) {
    case "published":
      return "bg-success";
    case "scheduled":
      return "bg-info";
    default:
      return "bg-secondary";
  }
});

// Load categories
async function loadCategories() {
  isLoadingCategories.value = true;
  try {
    const response = await fetch("/api/categories");
    if (response.ok) {
      const data = await response.json();
      allCategories.value = data.categories;
    }
  } catch (err) {
    console.error("Failed to load categories:", err);
  } finally {
    isLoadingCategories.value = false;
  }
}

// Load tags
async function loadTags() {
  isLoadingTags.value = true;
  try {
    const response = await fetch("/api/tags");
    if (response.ok) {
      const data = await response.json();
      allTags.value = data.tags;
    }
  } catch (err) {
    console.error("Failed to load tags:", err);
  } finally {
    isLoadingTags.value = false;
  }
}

// Load existing post
async function loadPost() {
  if (!props.postId) {
    isLoading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/posts/${props.postId}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to load post");
    }

    const data = await response.json();
    Object.assign(post, data.post);
    originalUpdatedAt.value = data.post.updatedAt;

    // Load tags for this post
    if (data.tags) {
      selectedTags.value = data.tags;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load post";
  } finally {
    isLoading.value = false;
  }
}

// Save post (create or update)
async function savePost(showSuccess = true) {
  if (isSaving.value) return;

  isSaving.value = true;
  error.value = "";
  successMessage.value = "";

  try {
    const url = isNewPost.value ? "/api/posts" : `/api/posts/${props.postId}`;
    const method = isNewPost.value ? "POST" : "PUT";

    const body: Record<string, unknown> = {
      title: post.title,
      slug: post.slug,
      description: post.description,
      content: post.content,
      heroImage: post.heroImage,
      categoryId: post.categoryId,
      tagIds: selectedTags.value.map((t) => t.id),
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
      ogTitle: post.ogTitle,
      ogDescription: post.ogDescription,
      ogImage: post.ogImage,
      canonicalUrl: post.canonicalUrl,
    };

    // Add optimistic locking for updates
    if (!isNewPost.value && originalUpdatedAt.value) {
      body.expectedUpdatedAt = originalUpdatedAt.value;
    }

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || data.message || "Failed to save post");
    }

    const data = await response.json();

    // Update local state with server response
    Object.assign(post, data.post);
    originalUpdatedAt.value = data.post.updatedAt;
    lastSavedAt.value = new Date();
    isDirty.value = false;

    if (showSuccess) {
      successMessage.value = "Post saved successfully";
      setTimeout(() => (successMessage.value = ""), 3000);
    }

    // Redirect to edit page if this was a new post
    if (isNewPost.value && data.post.id) {
      window.history.replaceState({}, "", `/editor/posts/${data.post.id}`);
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to save post";
  } finally {
    isSaving.value = false;
  }
}

// Publish post
async function publishPost() {
  if (!canPublish.value || isPublishing.value) return;

  // Save first if needed
  if (isNewPost.value || isDirty.value) {
    await savePost(false);
    if (error.value) return;
  }

  isPublishing.value = true;
  error.value = "";

  try {
    const response = await fetch(`/api/posts/${post.id || props.postId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduledDate: post.scheduledDate || null,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to publish post");
    }

    const data = await response.json();
    Object.assign(post, data.post);
    successMessage.value = data.message || "Post published successfully";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to publish post";
  } finally {
    isPublishing.value = false;
  }
}

// Unpublish post
async function unpublishPost() {
  if (isPublishing.value) return;

  isPublishing.value = true;
  error.value = "";

  try {
    const response = await fetch(`/api/posts/${post.id || props.postId}/unpublish`, {
      method: "POST",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to unpublish post");
    }

    const data = await response.json();
    Object.assign(post, data.post);
    successMessage.value = "Post unpublished";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to unpublish post";
  } finally {
    isPublishing.value = false;
  }
}

// Handle editor content changes
function handleContentChange(content: string) {
  post.content = content;
  isDirty.value = true;
}

// Handle auto-save from editor
function handleEditorSave(content: string) {
  post.content = content;
  if (!isNewPost.value) {
    savePost(false);
  }
}

// Auto-generate slug from title
function handleTitleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  post.title = target.value;
  isDirty.value = true;

  // Auto-generate slug for new posts
  if (isNewPost.value && !post.slug) {
    post.slug = generateSlug(target.value);
  }
}

// Add tag to selection
function addTag(tag: Tag) {
  if (!selectedTags.value.find((t) => t.id === tag.id)) {
    selectedTags.value.push(tag);
    isDirty.value = true;
  }
  newTagInput.value = "";
}

// Remove tag from selection
function removeTag(tagId: string) {
  selectedTags.value = selectedTags.value.filter((t) => t.id !== tagId);
  isDirty.value = true;
}

// Create new tag and add to selection
async function createAndAddTag() {
  const tagName = newTagInput.value.trim();
  if (!tagName) return;

  try {
    const response = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: tagName }),
    });

    if (response.ok) {
      const data = await response.json();
      addTag(data.tag);
      // Refresh all tags list
      if (!data.exists) {
        allTags.value.push(data.tag);
      }
    }
  } catch (err) {
    console.error("Failed to create tag:", err);
  }
}

// Filter tags for dropdown (exclude already selected)
const availableTags = computed(() => {
  const selectedIds = selectedTags.value.map((t) => t.id);
  return allTags.value.filter((t) => !selectedIds.includes(t.id));
});

// Markdown to HTML converter for preview
function markdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="img-fluid rounded my-3">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/___(.+?)___/g, '<strong><em>$1</em></strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^(-{3,}|\*{3,}|_{3,})$/gim, '<hr>')
    .replace(/^\s*[-*+] (.+)$/gim, '<li>$1</li>')
    .replace(/^\s*\d+\. (.+)$/gim, '<li>$1</li>')
    .replace(/\n\n+/g, '</p><p>')
    .replace(/\n/g, '<br>');

  html = '<p>' + html + '</p>';
  html = html
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h[1-6]>)/g, '$1')
    .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
    .replace(/<p>(<pre>)/g, '$1')
    .replace(/(<\/pre>)<\/p>/g, '$1')
    .replace(/<p>(<blockquote>)/g, '$1')
    .replace(/(<\/blockquote>)<\/p>/g, '$1')
    .replace(/<p>(<hr>)/g, '$1')
    .replace(/(<hr>)<\/p>/g, '$1')
    .replace(/<p>(<li>)/g, '<ul>$1')
    .replace(/(<\/li>)<\/p>/g, '$1</ul>')
    .replace(/<\/li><br><li>/g, '</li><li>')
    .replace(/<p><br>/g, '<p>')
    .replace(/<br><\/p>/g, '</p>')
    .replace(/<\/blockquote><blockquote>/g, '<br>');

  return html;
}

// Computed preview HTML - process content to add heading IDs for TOC links
const previewHtml = computed(() => processContentForDisplay(post.content || ''));

// Get selected category details
const selectedCategory = computed(() => {
  return allCategories.value.find(c => c.id === post.categoryId) || null;
});

// Open preview
function openPreview() {
  showPreviewModal.value = true;
  document.body.style.overflow = 'hidden';
}

// Close preview
function closePreview() {
  showPreviewModal.value = false;
  document.body.style.overflow = '';
}

// Handle TOC link clicks in preview modal
function handlePreviewTocClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  const link = target.closest('a[href^="#"]');
  if (!link) return;

  const href = link.getAttribute('href');
  if (!href?.startsWith('#')) return;

  event.preventDefault();
  const headingId = CSS.escape(href.slice(1));

  // Find the heading element and scroll to center it in the viewport
  const headingElement = previewContentRef.value?.querySelector(`#${headingId}`) as HTMLElement;
  if (headingElement && previewContentRef.value) {
    const containerRect = previewContentRef.value.getBoundingClientRect();
    const headingRect = headingElement.getBoundingClientRect();
    const containerHeight = previewContentRef.value.clientHeight;
    // Calculate scroll position to center the heading
    const scrollTop = previewContentRef.value.scrollTop + (headingRect.top - containerRect.top) - (containerHeight / 2) + (headingRect.height / 2);

    previewContentRef.value.scrollTo({
      top: scrollTop,
      behavior: 'smooth'
    });
  }
}

// Watch for changes to mark dirty
watch(
  () => [
    post.title,
    post.slug,
    post.description,
    post.heroImage,
    post.categoryId,
    post.metaTitle,
    post.metaDescription,
    post.ogTitle,
    post.ogDescription,
    post.ogImage,
    post.canonicalUrl,
  ],
  () => {
    isDirty.value = true;
  },
  { deep: true }
);

// Initialize
onMounted(async () => {
  console.log("[PostEditor] Mounted, starting to load data...");

  // Load all data in parallel
  await Promise.all([
    loadCategories().then(() => console.log("[PostEditor] Categories loaded")),
    loadTags().then(() => console.log("[PostEditor] Tags loaded")),
    loadPost().then(() => console.log("[PostEditor] Post loaded, isLoading:", isLoading.value)),
  ]);

  console.log("[PostEditor] All data loaded, isLoading:", isLoading.value);
});
</script>

<template>
  <div class="post-editor">
    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading post...</p>
    </div>

    <template v-else>
      <!-- Header with title and Preview button -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">{{ isNewPost ? 'New Post' : 'Edit Post' }}</h4>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-outline-primary"
            @click="openPreview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-1" viewBox="0 0 16 16">
              <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
              <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            </svg>
            Preview
          </button>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="alert alert-danger alert-dismissible" role="alert">
        {{ error }}
        <button type="button" class="btn-close" @click="error = ''"></button>
      </div>

      <!-- Success message -->
      <div v-if="successMessage" class="alert alert-success alert-dismissible" role="alert">
        {{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = ''"></button>
      </div>

      <div class="row">
        <!-- Main editor column -->
        <div class="col-lg-8">
          <!-- Content editor -->
          <div class="mb-3">
            <TiptapEditor
              ref="editorRef"
              :model-value="post.content || ''"
              @update:model-value="handleContentChange"
              @save="handleEditorSave"
              :post-id="postId"
              :auto-save-interval="30"
              height="500px"
            />
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Post settings card -->
          <div class="card mb-3">
            <div class="card-header">
              <h6 class="mb-0">Post Settings</h6>
            </div>
            <div class="card-body">
              <!-- Title -->
              <div class="mb-3">
                <label for="postTitle" class="form-label">Title</label>
                <input
                  type="text"
                  class="form-control"
                  id="postTitle"
                  :value="post.title"
                  @input="handleTitleInput"
                  placeholder="Post title"
                />
              </div>

              <!-- Description -->
              <div class="mb-3">
                <label for="postDescription" class="form-label">Description</label>
                <textarea
                  class="form-control"
                  id="postDescription"
                  v-model="post.description"
                  placeholder="Brief description..."
                  rows="2"
                ></textarea>
              </div>

              <!-- Status -->
              <div class="mb-3">
                <label class="form-label">Status</label>
                <div>
                  <span class="badge" :class="statusBadgeClass">
                    {{ post.status || "draft" }}
                  </span>
                </div>
              </div>

              <!-- Hero image -->
              <div class="mb-3">
                <ImageUpload
                  v-model="post.heroImage"
                  label="Hero Image"
                  placeholder="Upload a hero image for your post"
                />
              </div>

              <!-- Category -->
              <div class="mb-3">
                <label for="category" class="form-label">Category</label>
                <select
                  class="form-select"
                  id="category"
                  v-model="post.categoryId"
                  :disabled="isLoadingCategories"
                >
                  <option :value="null">No category</option>
                  <option
                    v-for="category in allCategories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Tags -->
              <div class="mb-3">
                <label class="form-label">Tags</label>
                <!-- Selected tags -->
                <div v-if="selectedTags.length > 0" class="mb-2">
                  <span
                    v-for="tag in selectedTags"
                    :key="tag.id"
                    class="badge bg-secondary me-1 mb-1"
                  >
                    {{ tag.name }}
                    <button
                      type="button"
                      class="btn-close btn-close-white ms-1"
                      style="font-size: 0.6em;"
                      @click="removeTag(tag.id)"
                    ></button>
                  </span>
                </div>
                <!-- Add tag dropdown -->
                <div class="input-group input-group-sm">
                  <input
                    type="text"
                    class="form-control"
                    v-model="newTagInput"
                    placeholder="Add tag..."
                    list="available-tags"
                    @keydown.enter.prevent="createAndAddTag"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="createAndAddTag"
                    :disabled="!newTagInput.trim()"
                  >
                    Add
                  </button>
                </div>
                <datalist id="available-tags">
                  <option v-for="tag in availableTags" :key="tag.id" :value="tag.name" />
                </datalist>
                <div class="form-text">Press Enter or click Add to create a new tag</div>
              </div>

              <!-- Schedule date (for scheduled posts) -->
              <div v-if="post.status !== 'published'" class="mb-3">
                <label for="scheduledDate" class="form-label">Schedule For</label>
                <input
                  type="datetime-local"
                  class="form-control"
                  id="scheduledDate"
                  v-model="post.scheduledDate"
                />
                <div class="form-text">Leave empty to publish immediately</div>
              </div>

              <!-- Action buttons -->
              <div class="d-grid gap-2">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  @click="savePost(true)"
                  :disabled="isSaving"
                >
                  <span v-if="isSaving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isSaving ? "Saving..." : "Save Draft" }}
                </button>

                <button
                  v-if="post.status !== 'published'"
                  type="button"
                  class="btn btn-success"
                  @click="publishPost"
                  :disabled="!canPublish || isPublishing"
                >
                  <span v-if="isPublishing" class="spinner-border spinner-border-sm me-1"></span>
                  {{ post.scheduledDate ? "Schedule" : "Publish" }}
                </button>

                <button
                  v-else
                  type="button"
                  class="btn btn-warning"
                  @click="unpublishPost"
                  :disabled="isPublishing"
                >
                  <span v-if="isPublishing" class="spinner-border spinner-border-sm me-1"></span>
                  Unpublish
                </button>
              </div>

              <!-- Last saved info -->
              <div v-if="lastSavedAt" class="mt-3 text-center">
                <small class="text-muted">
                  Last saved: {{ lastSavedAt.toLocaleTimeString() }}
                </small>
              </div>
            </div>
          </div>

          <!-- SEO card -->
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">SEO Settings</h6>
            </div>
            <div class="card-body">
              <SeoFields
                :title="post.title || ''"
                :slug="post.slug || ''"
                :description="post.description || ''"
                :hero-image="post.heroImage"
                :meta-title="post.metaTitle"
                :meta-description="post.metaDescription"
                :og-title="post.ogTitle"
                :og-description="post.ogDescription"
                :og-image="post.ogImage"
                :canonical-url="post.canonicalUrl"
                @update:slug="post.slug = $event"
                @update:meta-title="post.metaTitle = $event"
                @update:meta-description="post.metaDescription = $event"
                @update:og-title="post.ogTitle = $event"
                @update:og-description="post.ogDescription = $event"
                @update:og-image="post.ogImage = $event"
                @update:canonical-url="post.canonicalUrl = $event"
              />
            </div>
          </div>

          <!-- Links card (for existing posts) -->
          <div v-if="!isNewPost" class="card mt-3">
            <div class="card-header">
              <h6 class="mb-0">Quick Links</h6>
            </div>
            <div class="list-group list-group-flush">
              <button
                type="button"
                class="list-group-item list-group-item-action text-start"
                @click="openPreview"
              >
                Preview
              </button>
              <a
                :href="`/editor/posts/${postId}/history`"
                class="list-group-item list-group-item-action"
              >
                Version History
              </a>
              <a
                v-if="post.status === 'published'"
                :href="`/blog/${post.slug}`"
                class="list-group-item list-group-item-action"
                target="_blank"
              >
                View Live Post
              </a>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Preview Modal -->
    <Teleport to="body">
      <div v-if="showPreviewModal" class="preview-modal-overlay" @click.self="closePreview">
        <div class="preview-modal">
          <!-- Preview Banner -->
          <div class="preview-banner">
            <div class="preview-banner-left">
              <span class="preview-badge">PREVIEW</span>
              <span class="preview-status">
                Status: <strong>{{ (post.status || 'draft').charAt(0).toUpperCase() + (post.status || 'draft').slice(1) }}</strong>
                <template v-if="post.status === 'draft' || !post.status"> - Not yet published</template>
                <template v-if="post.status === 'scheduled'"> - Scheduled for publishing</template>
              </span>
            </div>
            <div class="preview-banner-right">
              <button type="button" class="btn btn-light btn-sm" @click="closePreview">
                <i class="bi bi-x-lg me-1"></i>
                Close Preview
              </button>
            </div>
          </div>

          <!-- Preview Content -->
          <div class="preview-content" ref="previewContentRef" @click="handlePreviewTocClick">
            <article class="preview-article">
              <!-- Hero Image -->
              <div v-if="post.heroImage" class="preview-hero">
                <img :src="post.heroImage" :alt="post.title" />
              </div>

              <div class="preview-prose">
                <div class="preview-title">
                  <div class="preview-date">
                    {{ new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                  </div>
                  <h1>{{ post.title || 'Untitled Post' }}</h1>

                  <!-- Category and Tags -->
                  <div class="preview-meta">
                    <span
                      v-if="selectedCategory"
                      class="category-badge"
                      :style="{ backgroundColor: selectedCategory.color || '#6c757d' }"
                    >
                      {{ selectedCategory.name }}
                    </span>
                    <span
                      v-for="tag in selectedTags"
                      :key="tag.id"
                      class="tag-badge"
                    >
                      {{ tag.name }}
                    </span>
                  </div>

                  <hr />
                </div>

                <!-- Description -->
                <p v-if="post.description" class="preview-description">
                  {{ post.description }}
                </p>

                <!-- Content -->
                <div class="post-content" v-html="previewHtml"></div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.post-editor {
  min-height: calc(100vh - 200px);
}
</style>

<!-- Global styles for preview modal (not scoped) -->
<style>
.preview-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem;
  overflow-y: auto;
}

.preview-modal {
  background: var(--cyber-editor-bg);
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: calc(100vh - 4rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.preview-banner {
  background: linear-gradient(135deg, var(--cyber-secondary) 0%, var(--cyber-accent) 100%);
  color: white;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.preview-banner-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.preview-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.preview-status {
  font-size: 0.875rem;
  opacity: 0.9;
}

.preview-banner-right .btn-light {
  background: var(--cyber-editor-bg);
  color: var(--cyber-secondary);
  border: none;
}

.preview-banner-right .btn-light:hover {
  background: var(--cyber-bg-tertiary);
}

.preview-content {
  overflow-y: auto;
  flex: 1;
  scroll-behavior: smooth;
}

.preview-article {
  padding-bottom: 2rem;
}

.preview-hero {
  width: 100%;
}

.preview-hero img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.preview-prose {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem;
}

.preview-title {
  text-align: center;
  margin-bottom: 1.5rem;
}

.preview-title h1 {
  margin: 0.5rem 0;
  font-size: 2rem;
}

.preview-date {
  color: var(--cyber-text-muted);
  font-size: 0.875rem;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}

.preview-meta .category-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
}

.preview-meta .tag-badge {
  background: var(--cyber-bg-tertiary);
  color: var(--cyber-text-secondary);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.preview-description {
  color: var(--cyber-text-muted);
  font-size: 1.1rem;
  text-align: center;
  margin-bottom: 1.5rem;
  font-style: italic;
}

/* Post content styles */
.preview-modal .post-content {
  line-height: 1.8;
  font-size: 1.1rem;
}

.preview-modal .post-content h1,
.preview-modal .post-content h2,
.preview-modal .post-content h3,
.preview-modal .post-content h4,
.preview-modal .post-content h5,
.preview-modal .post-content h6 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.preview-modal .post-content h1 { font-size: 2rem; }
.preview-modal .post-content h2 { font-size: 1.75rem; }
.preview-modal .post-content h3 { font-size: 1.5rem; }
.preview-modal .post-content h4 { font-size: 1.25rem; }

.preview-modal .post-content pre {
  background-color: var(--cyber-editor-code-bg);
  color: var(--cyber-editor-text);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.preview-modal .post-content code {
  background-color: var(--cyber-bg-tertiary);
  color: var(--cyber-text-primary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.9em;
}

.preview-modal .post-content pre code {
  background-color: transparent;
  color: inherit;
  padding: 0;
}

.preview-modal .post-content img {
  max-width: 100%;
  height: auto;
  margin: 1.5rem auto;
  display: block;
  border-radius: 0.5rem;
}

.preview-modal .post-content blockquote {
  border-left: 4px solid var(--cyber-secondary);
  padding-left: 1.5rem;
  margin: 1.5rem 0;
  color: var(--cyber-text-muted);
  font-style: italic;
}

.preview-modal .post-content ul,
.preview-modal .post-content ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.preview-modal .post-content li {
  margin-bottom: 0.5rem;
}

.preview-modal .post-content a {
  color: var(--cyber-secondary);
  text-decoration: underline;
}

.preview-modal .post-content a:hover {
  color: var(--cyber-accent);
}

.preview-modal .post-content hr {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid var(--cyber-neutral-200);
}

.preview-modal .post-content p {
  margin-bottom: 1rem;
}

/* Table of Contents styles for preview */
.preview-modal .post-content .toc-block {
  background: var(--cyber-bg-tertiary);
  border: 1px solid var(--cyber-neutral-200);
  border-radius: 8px;
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
}

.preview-modal .post-content .toc-title {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: var(--cyber-text-secondary);
}

.preview-modal .post-content .toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.preview-modal .post-content .toc-list li {
  padding: 0.35rem 0;
  display: flex;
  align-items: center;
}

.preview-modal .post-content .toc-list li::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyber-editor-text-muted);
  margin-right: 10px;
  flex-shrink: 0;
}

/* Level-based cascading styles */
.preview-modal .post-content .toc-list .toc-level-0 {
  padding-left: 0;
}

.preview-modal .post-content .toc-list .toc-level-0::before {
  width: 8px;
  height: 8px;
  background: var(--cyber-text-secondary);
}

.preview-modal .post-content .toc-list .toc-level-0 a {
  font-weight: 600;
  font-size: 1rem;
}

.preview-modal .post-content .toc-list .toc-level-1 {
  padding-left: 1.25rem;
}

.preview-modal .post-content .toc-list .toc-level-1::before {
  width: 6px;
  height: 6px;
  background: var(--cyber-text-muted);
}

.preview-modal .post-content .toc-list .toc-level-1 a {
  font-weight: 500;
  font-size: 0.95rem;
}

.preview-modal .post-content .toc-list .toc-level-2 {
  padding-left: 2.5rem;
}

.preview-modal .post-content .toc-list .toc-level-2::before {
  width: 5px;
  height: 5px;
  background: var(--cyber-neutral-300);
}

.preview-modal .post-content .toc-list .toc-level-2 a {
  font-weight: 400;
  font-size: 0.9rem;
  color: var(--cyber-text-muted);
}

.preview-modal .post-content .toc-list .toc-level-3 {
  padding-left: 3.75rem;
}

.preview-modal .post-content .toc-list .toc-level-3::before {
  width: 4px;
  height: 4px;
  background: var(--cyber-neutral-300);
}

.preview-modal .post-content .toc-list .toc-level-3 a {
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--cyber-text-muted);
}

.preview-modal .post-content .toc-list a {
  color: var(--cyber-text-secondary);
  text-decoration: none;
}

.preview-modal .post-content .toc-list a:hover {
  color: var(--cyber-secondary);
  text-decoration: underline;
}

.preview-modal .post-content .toc-placeholder {
  background: var(--cyber-warning-bg);
  border: 1px solid var(--cyber-warning);
  border-radius: 4px;
  padding: 0.75rem 1rem;
  color: var(--cyber-warning-text);
}
</style>
