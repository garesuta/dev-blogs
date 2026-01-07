<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import BlogEditor from "./BlogEditor.vue";
import SeoFields from "./SeoFields.vue";
import { generateSlug } from "../lib/validations";

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

const post = reactive<Partial<Post>>({
  title: "",
  slug: "",
  description: "",
  content: "",
  heroImage: null,
  status: "draft",
  scheduledDate: null,
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

// Refs
const editorRef = ref<InstanceType<typeof BlogEditor> | null>(null);

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

// Watch for changes to mark dirty
watch(
  () => [
    post.title,
    post.slug,
    post.description,
    post.heroImage,
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
onMounted(() => {
  loadPost();
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
          <!-- Title -->
          <div class="mb-3">
            <input
              type="text"
              class="form-control form-control-lg"
              :value="post.title"
              @input="handleTitleInput"
              placeholder="Post title"
            />
          </div>

          <!-- Description -->
          <div class="mb-3">
            <textarea
              class="form-control"
              v-model="post.description"
              placeholder="Brief description of your post..."
              rows="2"
            ></textarea>
          </div>

          <!-- Content editor -->
          <div class="mb-3">
            <BlogEditor
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
                <label for="heroImage" class="form-label">Hero Image URL</label>
                <input
                  type="url"
                  class="form-control"
                  id="heroImage"
                  v-model="post.heroImage"
                  placeholder="https://..."
                />
                <div v-if="post.heroImage" class="mt-2">
                  <img
                    :src="post.heroImage"
                    alt="Hero preview"
                    class="img-fluid rounded"
                    style="max-height: 150px;"
                  />
                </div>
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
              <a
                :href="`/editor/posts/${postId}/preview`"
                class="list-group-item list-group-item-action"
              >
                Preview
              </a>
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
  </div>
</template>

<style scoped>
.post-editor {
  min-height: calc(100vh - 200px);
}
</style>
