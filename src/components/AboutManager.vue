<script setup lang="ts">
import { ref, onMounted } from "vue";

// State
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref("");
const successMessage = ref("");

// Form state
const formData = ref({
  title: "",
  description: "",
  content: "",
  heroImage: "",
});

// Load about settings
async function loadSettings() {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/settings/about");
    if (!response.ok) throw new Error("Failed to load about settings");

    const data = await response.json();
    const settings = data.settings || {};

    formData.value = {
      title: settings.about_title || "About Me",
      description: settings.about_description || "",
      content: settings.about_content || "",
      heroImage: settings.about_hero_image || "",
    };
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load settings";
  } finally {
    isLoading.value = false;
  }
}

// Save settings
async function saveSettings() {
  if (!formData.value.title.trim()) {
    error.value = "Title is required";
    return;
  }

  if (!formData.value.content.trim()) {
    error.value = "Content is required";
    return;
  }

  isSaving.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/settings/about", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.value.title.trim(),
        description: formData.value.description.trim(),
        content: formData.value.content.trim(),
        heroImage: formData.value.heroImage.trim(),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save settings");
    }

    successMessage.value = "About page settings saved successfully";
    setTimeout(() => (successMessage.value = ""), 3000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to save settings";
  } finally {
    isSaving.value = false;
  }
}

// Reset form
function resetForm() {
  loadSettings();
}

// Initialize
onMounted(() => {
  loadSettings();
});
</script>

<template>
  <div class="about-manager">
    <!-- Messages -->
    <div v-if="error" class="alert alert-danger py-2">
      {{ error }}
      <button type="button" class="btn-close btn-sm float-end" @click="error = ''"></button>
    </div>

    <div v-if="successMessage" class="alert alert-success py-2">
      <i class="bi bi-check-circle me-1"></i>
      {{ successMessage }}
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-2 text-muted">Loading settings...</p>
    </div>

    <!-- Form -->
    <div v-else class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <i class="bi bi-person-circle me-2"></i>
          About Page Content
        </h5>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label class="form-label">Page Title *</label>
          <input
            type="text"
            class="form-control"
            v-model="formData.title"
            placeholder="About Me"
          />
          <small class="text-muted">The main heading displayed on the about page</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Meta Description</label>
          <input
            type="text"
            class="form-control"
            v-model="formData.description"
            placeholder="A brief description for SEO"
            maxlength="160"
          />
          <small class="text-muted">{{ formData.description.length }}/160 characters - Used for SEO and social sharing</small>
        </div>

        <div class="mb-3">
          <label class="form-label">Hero Image URL</label>
          <input
            type="text"
            class="form-control"
            v-model="formData.heroImage"
            placeholder="https://example.com/image.jpg or /images/about.jpg"
          />
          <small class="text-muted">URL to the hero image displayed at the top of the page</small>

          <!-- Image preview -->
          <div v-if="formData.heroImage" class="mt-2">
            <img
              :src="formData.heroImage"
              alt="Hero preview"
              class="hero-preview"
              @error="($event.target as HTMLImageElement).style.display = 'none'"
            />
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label">Content * <span class="badge bg-secondary">HTML Supported</span></label>
          <textarea
            class="form-control font-monospace"
            v-model="formData.content"
            rows="15"
            placeholder="Write your about page content here. HTML tags are supported for formatting."
          ></textarea>
          <small class="text-muted">
            You can use HTML tags for formatting:
            <code>&lt;p&gt;</code>, <code>&lt;strong&gt;</code>, <code>&lt;em&gt;</code>,
            <code>&lt;a href=&quot;...&quot;&gt;</code>, <code>&lt;ul&gt;</code>, <code>&lt;li&gt;</code>
          </small>
        </div>

        <!-- Preview Section -->
        <div class="mb-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <label class="form-label mb-0">Content Preview</label>
          </div>
          <div class="preview-container p-3 border rounded bg-light">
            <div v-html="formData.content || '<p class=\'text-muted\'>No content yet...</p>'"></div>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" @click="saveSettings" :disabled="isSaving">
            <i :class="['bi', 'me-1', isSaving ? 'bi-hourglass-split' : 'bi-check-lg']"></i>
            {{ isSaving ? "Saving..." : "Save Changes" }}
          </button>
          <button class="btn btn-outline-secondary" @click="resetForm" :disabled="isSaving">
            <i class="bi bi-arrow-counterclockwise me-1"></i>
            Reset
          </button>
          <a href="/about" target="_blank" class="btn btn-outline-info ms-auto">
            <i class="bi bi-eye me-1"></i>
            View Page
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-preview {
  max-width: 300px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.preview-container {
  max-height: 300px;
  overflow-y: auto;
}

.preview-container :deep(p) {
  margin-bottom: 1rem;
}

.preview-container :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
