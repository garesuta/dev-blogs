<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { generateSlug } from "../lib/validations";

// Props
const props = defineProps<{
  title: string;
  slug: string;
  description: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  canonicalUrl?: string | null;
  heroImage?: string | null;
  disabled?: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:slug", value: string): void;
  (e: "update:metaTitle", value: string | null): void;
  (e: "update:metaDescription", value: string | null): void;
  (e: "update:ogTitle", value: string | null): void;
  (e: "update:ogDescription", value: string | null): void;
  (e: "update:ogImage", value: string | null): void;
  (e: "update:canonicalUrl", value: string | null): void;
}>();

// Local state
const showAdvanced = ref(false);
const slugEdited = ref(false);

// Computed
const effectiveMetaTitle = computed(() => props.metaTitle || props.title || "");
const effectiveMetaDescription = computed(() => props.metaDescription || props.description || "");
const effectiveOgTitle = computed(() => props.ogTitle || effectiveMetaTitle.value);
const effectiveOgDescription = computed(() => props.ogDescription || effectiveMetaDescription.value);
const effectiveOgImage = computed(() => props.ogImage || props.heroImage || "");

const metaTitleLength = computed(() => effectiveMetaTitle.value.length);
const metaDescriptionLength = computed(() => effectiveMetaDescription.value.length);

const metaTitleStatus = computed(() => {
  const len = metaTitleLength.value;
  if (len === 0) return { class: "text-muted", text: "Not set" };
  if (len <= 60) return { class: "text-success", text: `${len}/60 - Good` };
  if (len <= 70) return { class: "text-warning", text: `${len}/70 - Acceptable` };
  return { class: "text-danger", text: `${len}/70 - Too long` };
});

const metaDescriptionStatus = computed(() => {
  const len = metaDescriptionLength.value;
  if (len === 0) return { class: "text-muted", text: "Not set" };
  if (len >= 120 && len <= 160) return { class: "text-success", text: `${len}/160 - Optimal` };
  if (len < 120) return { class: "text-warning", text: `${len}/160 - Could be longer` };
  return { class: "text-danger", text: `${len}/160 - Too long` };
});

// Auto-generate slug from title (only if not manually edited)
watch(
  () => props.title,
  (newTitle) => {
    if (!slugEdited.value && newTitle) {
      emit("update:slug", generateSlug(newTitle));
    }
  }
);

// Mark slug as edited when user types
function handleSlugInput(event: Event) {
  const target = event.target as HTMLInputElement;
  slugEdited.value = true;
  emit("update:slug", target.value);
}

// Generate slug from title
function regenerateSlug() {
  if (props.title) {
    emit("update:slug", generateSlug(props.title));
    slugEdited.value = false;
  }
}
</script>

<template>
  <div class="seo-fields">
    <!-- URL Slug -->
    <div class="mb-3">
      <label for="slug" class="form-label">
        URL Slug
        <small class="text-muted ms-1">(appears in URL)</small>
      </label>
      <div class="input-group">
        <span class="input-group-text">/blog/</span>
        <input
          type="text"
          class="form-control"
          id="slug"
          :value="slug"
          @input="handleSlugInput"
          :disabled="disabled"
          placeholder="my-post-url"
          pattern="[a-z0-9-]+"
        />
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="regenerateSlug"
          :disabled="disabled || !title"
          title="Regenerate from title"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
          </svg>
        </button>
      </div>
      <div class="form-text">
        Use lowercase letters, numbers, and hyphens only
      </div>
    </div>

    <!-- SEO Preview -->
    <div class="card mb-3">
      <div class="card-header py-2">
        <small class="fw-semibold">Search Engine Preview</small>
      </div>
      <div class="card-body py-2">
        <div class="seo-preview">
          <div class="seo-title text-primary">{{ effectiveMetaTitle || "Post Title" }}</div>
          <div class="seo-url text-success small">
            yourdomain.com/blog/{{ slug || "post-url" }}
          </div>
          <div class="seo-description text-muted small">
            {{ effectiveMetaDescription || "Post description will appear here..." }}
          </div>
        </div>
      </div>
    </div>

    <!-- Basic SEO Fields -->
    <div class="mb-3">
      <label for="metaTitle" class="form-label d-flex justify-content-between">
        <span>Meta Title</span>
        <small :class="metaTitleStatus.class">{{ metaTitleStatus.text }}</small>
      </label>
      <input
        type="text"
        class="form-control"
        id="metaTitle"
        :value="metaTitle"
        @input="emit('update:metaTitle', ($event.target as HTMLInputElement).value || null)"
        :disabled="disabled"
        :placeholder="title || 'Leave blank to use post title'"
        maxlength="70"
      />
    </div>

    <div class="mb-3">
      <label for="metaDescription" class="form-label d-flex justify-content-between">
        <span>Meta Description</span>
        <small :class="metaDescriptionStatus.class">{{ metaDescriptionStatus.text }}</small>
      </label>
      <textarea
        class="form-control"
        id="metaDescription"
        :value="metaDescription"
        @input="emit('update:metaDescription', ($event.target as HTMLTextAreaElement).value || null)"
        :disabled="disabled"
        :placeholder="description || 'Leave blank to use post description'"
        maxlength="160"
        rows="2"
      ></textarea>
    </div>

    <!-- Advanced SEO (collapsible) -->
    <div class="mb-3">
      <button
        type="button"
        class="btn btn-link p-0 text-decoration-none"
        @click="showAdvanced = !showAdvanced"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          viewBox="0 0 16 16"
          :class="{ 'rotate-90': showAdvanced }"
          style="transition: transform 0.2s"
        >
          <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
        <span class="ms-1">Advanced SEO Options</span>
      </button>
    </div>

    <div v-show="showAdvanced" class="advanced-seo-fields">
      <!-- Open Graph Preview -->
      <div class="card mb-3">
        <div class="card-header py-2">
          <small class="fw-semibold">Social Media Preview</small>
        </div>
        <div class="card-body py-2">
          <div class="og-preview border rounded overflow-hidden">
            <div
              v-if="effectiveOgImage"
              class="og-image bg-light"
              :style="{ backgroundImage: `url(${effectiveOgImage})` }"
            ></div>
            <div v-else class="og-image-placeholder bg-light d-flex align-items-center justify-content-center text-muted">
              No image set
            </div>
            <div class="p-2">
              <div class="og-title fw-semibold small">{{ effectiveOgTitle || "Post Title" }}</div>
              <div class="og-description text-muted small">
                {{ effectiveOgDescription || "Post description..." }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- OG Fields -->
      <div class="mb-3">
        <label for="ogTitle" class="form-label">
          Open Graph Title
          <small class="text-muted ms-1">(for social sharing)</small>
        </label>
        <input
          type="text"
          class="form-control"
          id="ogTitle"
          :value="ogTitle"
          @input="emit('update:ogTitle', ($event.target as HTMLInputElement).value || null)"
          :disabled="disabled"
          :placeholder="effectiveMetaTitle || 'Leave blank to use meta title'"
          maxlength="70"
        />
      </div>

      <div class="mb-3">
        <label for="ogDescription" class="form-label">Open Graph Description</label>
        <textarea
          class="form-control"
          id="ogDescription"
          :value="ogDescription"
          @input="emit('update:ogDescription', ($event.target as HTMLTextAreaElement).value || null)"
          :disabled="disabled"
          :placeholder="effectiveMetaDescription || 'Leave blank to use meta description'"
          maxlength="200"
          rows="2"
        ></textarea>
      </div>

      <div class="mb-3">
        <label for="ogImage" class="form-label">
          Open Graph Image URL
          <small class="text-muted ms-1">(1200x630 recommended)</small>
        </label>
        <input
          type="url"
          class="form-control"
          id="ogImage"
          :value="ogImage"
          @input="emit('update:ogImage', ($event.target as HTMLInputElement).value || null)"
          :disabled="disabled"
          :placeholder="heroImage || 'Leave blank to use hero image'"
        />
      </div>

      <div class="mb-3">
        <label for="canonicalUrl" class="form-label">
          Canonical URL
          <small class="text-muted ms-1">(for duplicate content)</small>
        </label>
        <input
          type="url"
          class="form-control"
          id="canonicalUrl"
          :value="canonicalUrl"
          @input="emit('update:canonicalUrl', ($event.target as HTMLInputElement).value || null)"
          :disabled="disabled"
          placeholder="Leave blank for default URL"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.seo-preview {
  font-family: Arial, sans-serif;
}

.seo-title {
  font-size: 18px;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seo-url {
  font-size: 13px;
}

.seo-description {
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.og-preview {
  max-width: 400px;
}

.og-image {
  height: 200px;
  background-size: cover;
  background-position: center;
}

.og-image-placeholder {
  height: 200px;
}

.og-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.og-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rotate-90 {
  transform: rotate(90deg);
}
</style>
