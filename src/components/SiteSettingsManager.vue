<script setup lang="ts">
import { ref, onMounted } from "vue";

// State
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref("");
const successMessage = ref("");

// Form state
const formData = ref({
  siteTitle: "",
  siteDescription: "",
  githubUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  footerDescription: "",
});

// Load site settings
async function loadSettings() {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/settings/site");
    if (!response.ok) throw new Error("Failed to load site settings");

    const data = await response.json();
    const settings = data.settings || {};

    formData.value = {
      siteTitle: settings.site_title || "",
      siteDescription: settings.site_description || "",
      githubUrl: settings.github_url || "",
      twitterUrl: settings.twitter_url || "",
      linkedinUrl: settings.linkedin_url || "",
      footerDescription: settings.footer_description || "",
    };
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load settings";
  } finally {
    isLoading.value = false;
  }
}

// Save settings
async function saveSettings() {
  if (!formData.value.siteTitle.trim()) {
    error.value = "Site title is required";
    return;
  }

  isSaving.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/settings/site", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        siteTitle: formData.value.siteTitle.trim(),
        siteDescription: formData.value.siteDescription.trim(),
        githubUrl: formData.value.githubUrl.trim(),
        twitterUrl: formData.value.twitterUrl.trim(),
        linkedinUrl: formData.value.linkedinUrl.trim(),
        footerDescription: formData.value.footerDescription.trim(),
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save settings");
    }

    successMessage.value = "Site settings saved successfully";
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
  <div class="site-settings-manager">
    <!-- Messages -->
    <div
      v-if="error"
      class="alert alert-danger py-2"
    >
      {{ error }}
      <button
        type="button"
        class="btn-close btn-sm float-end"
        @click="error = ''"
      />
    </div>

    <div
      v-if="successMessage"
      class="alert alert-success py-2"
    >
      <i class="bi bi-check-circle me-1" />
      {{ successMessage }}
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="text-center py-5"
    >
      <div class="spinner-border text-primary" />
      <p class="mt-2 text-muted">
        Loading settings...
      </p>
    </div>

    <!-- Form -->
    <form
      v-else
      @submit.prevent="saveSettings"
    >
      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-globe me-2" />Site Identity
          </h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label
              for="siteTitle"
              class="form-label"
            >Site Title <span class="text-danger">*</span></label>
            <input
              id="siteTitle"
              v-model="formData.siteTitle"
              type="text"
              class="form-control"
              :disabled="isSaving"
              maxlength="100"
            >
            <div class="form-text">
              Shown in the header logo, footer, and page titles.
            </div>
          </div>

          <div class="mb-0">
            <label
              for="siteDescription"
              class="form-label"
            >Site Description</label>
            <textarea
              id="siteDescription"
              v-model="formData.siteDescription"
              class="form-control"
              :disabled="isSaving"
              rows="2"
              maxlength="300"
            />
            <div class="form-text">
              Used for SEO meta tags and the RSS feed.
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-link-45deg me-2" />Social Links
          </h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label
              for="githubUrl"
              class="form-label"
            >GitHub URL</label>
            <input
              id="githubUrl"
              v-model="formData.githubUrl"
              type="url"
              class="form-control"
              :disabled="isSaving"
              placeholder="https://github.com/username"
            >
            <div class="form-text">
              Shown as the GitHub icon in the header. Leave empty to hide the icon.
            </div>
          </div>

          <div class="mb-3">
            <label
              for="twitterUrl"
              class="form-label"
            >Twitter / X URL</label>
            <input
              id="twitterUrl"
              v-model="formData.twitterUrl"
              type="url"
              class="form-control"
              :disabled="isSaving"
              placeholder="https://x.com/username"
            >
          </div>

          <div class="mb-0">
            <label
              for="linkedinUrl"
              class="form-label"
            >LinkedIn URL</label>
            <input
              id="linkedinUrl"
              v-model="formData.linkedinUrl"
              type="url"
              class="form-control"
              :disabled="isSaving"
              placeholder="https://linkedin.com/in/username"
            >
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="bi bi-layout-text-window-reverse me-2" />Footer
          </h5>
        </div>
        <div class="card-body">
          <div class="mb-0">
            <label
              for="footerDescription"
              class="form-label"
            >Footer Description</label>
            <textarea
              id="footerDescription"
              v-model="formData.footerDescription"
              class="form-control"
              :disabled="isSaving"
              rows="3"
              maxlength="300"
            />
            <div class="form-text">
              Short blurb shown under the logo in the footer.
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex gap-2">
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="isSaving"
        >
          <span v-if="isSaving">
            <span
              class="spinner-border spinner-border-sm me-2"
              role="status"
            />
            Saving...
          </span>
          <span v-else>
            <i class="bi bi-check-lg me-1" />Save Settings
          </span>
        </button>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="isSaving"
          @click="resetForm"
        >
          Reset
        </button>
      </div>
    </form>
  </div>
</template>
