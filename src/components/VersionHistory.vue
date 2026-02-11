<script setup lang="ts">
import { ref, onMounted } from "vue";

// Types
interface Version {
  id: string;
  postId: string;
  versionNumber: number;
  title: string;
  description: string;
  changeSummary: string | null;
  createdAt: string;
  createdBy: string;
  creatorName: string | null;
  creatorEmail: string | null;
}

interface VersionDetail extends Version {
  content: string;
  heroImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
}

// Props
const props = defineProps<{
  postId: string;
}>();

// State
const versions = ref<Version[]>([]);
const selectedVersion = ref<VersionDetail | null>(null);
const isLoading = ref(true);
const isLoadingDetail = ref(false);
const isRestoring = ref(false);
const error = ref("");
const successMessage = ref("");

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Fetch versions list
async function fetchVersions() {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await fetch(`/api/posts/${props.postId}/versions`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to load versions");
    }

    const data = await response.json();
    versions.value = data.versions;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load versions";
  } finally {
    isLoading.value = false;
  }
}

// Fetch version details
async function viewVersion(version: Version) {
  if (selectedVersion.value?.id === version.id) {
    selectedVersion.value = null;
    return;
  }

  isLoadingDetail.value = true;

  try {
    const response = await fetch(
      `/api/posts/${props.postId}/versions/${version.id}`
    );
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to load version details");
    }

    const data = await response.json();
    selectedVersion.value = data.version;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load version";
  } finally {
    isLoadingDetail.value = false;
  }
}

// Restore version
async function restoreVersion(version: Version) {
  if (!confirm(`Are you sure you want to restore version ${version.versionNumber}? This will create a new version with the restored content.`)) {
    return;
  }

  isRestoring.value = true;
  error.value = "";

  try {
    const response = await fetch(
      `/api/posts/${props.postId}/versions/${version.id}/restore`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          changeSummary: `Restored from version ${version.versionNumber}`,
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to restore version");
    }

    const data = await response.json();
    successMessage.value = `Restored to version ${version.versionNumber}`;
    setTimeout(() => (successMessage.value = ""), 3000);

    // Refresh versions list
    await fetchVersions();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to restore version";
  } finally {
    isRestoring.value = false;
  }
}

// Initialize
onMounted(() => {
  fetchVersions();
});
</script>

<template>
  <div class="version-history">
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

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2 text-muted">Loading version history...</p>
    </div>

    <!-- Empty state -->
    <div v-else-if="versions.length === 0" class="text-center py-5">
      <p class="text-muted">No version history found</p>
    </div>

    <template v-else>
      <div class="row">
        <!-- Versions list -->
        <div class="col-md-4">
          <div class="list-group">
            <button
              v-for="version in versions"
              :key="version.id"
              type="button"
              class="list-group-item list-group-item-action"
              :class="{ active: selectedVersion?.id === version.id }"
              @click="viewVersion(version)"
            >
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <strong>Version {{ version.versionNumber }}</strong>
                  <div class="small">{{ formatDate(version.createdAt) }}</div>
                  <div class="small text-muted">
                    by {{ version.creatorName || version.creatorEmail || "Unknown" }}
                  </div>
                </div>
                <span
                  v-if="version.versionNumber === versions[0]?.versionNumber"
                  class="badge bg-primary"
                >
                  Current
                </span>
              </div>
              <div v-if="version.changeSummary" class="small mt-1 fst-italic">
                {{ version.changeSummary }}
              </div>
            </button>
          </div>
        </div>

        <!-- Version detail -->
        <div class="col-md-8">
          <div v-if="isLoadingDetail" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <div v-else-if="selectedVersion" class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Version {{ selectedVersion.versionNumber }}</h6>
              <button
                v-if="selectedVersion.versionNumber !== versions[0]?.versionNumber"
                type="button"
                class="btn btn-sm btn-outline-primary"
                @click="restoreVersion(selectedVersion)"
                :disabled="isRestoring"
              >
                <span v-if="isRestoring" class="spinner-border spinner-border-sm me-1"></span>
                Restore This Version
              </button>
            </div>
            <div class="card-body">
              <!-- Version metadata -->
              <div class="row mb-3">
                <div class="col-sm-6">
                  <small class="text-muted">Created</small>
                  <div>{{ formatDate(selectedVersion.createdAt) }}</div>
                </div>
                <div class="col-sm-6">
                  <small class="text-muted">By</small>
                  <div>
                    {{ selectedVersion.creatorName || selectedVersion.creatorEmail || "Unknown" }}
                  </div>
                </div>
              </div>

              <!-- Title -->
              <div class="mb-3">
                <small class="text-muted">Title</small>
                <div class="fw-semibold">{{ selectedVersion.title }}</div>
              </div>

              <!-- Description -->
              <div class="mb-3">
                <small class="text-muted">Description</small>
                <div>{{ selectedVersion.description }}</div>
              </div>

              <!-- Change summary -->
              <div v-if="selectedVersion.changeSummary" class="mb-3">
                <small class="text-muted">Change Summary</small>
                <div class="fst-italic">{{ selectedVersion.changeSummary }}</div>
              </div>

              <!-- Content preview -->
              <div class="mb-3">
                <small class="text-muted">Content Preview</small>
                <pre class="bg-light p-3 rounded small" style="max-height: 300px; overflow: auto;">{{ selectedVersion.content }}</pre>
              </div>

              <!-- SEO fields -->
              <div v-if="selectedVersion.metaTitle || selectedVersion.metaDescription" class="mb-3">
                <small class="text-muted">SEO</small>
                <div v-if="selectedVersion.metaTitle" class="small">
                  <strong>Meta Title:</strong> {{ selectedVersion.metaTitle }}
                </div>
                <div v-if="selectedVersion.metaDescription" class="small">
                  <strong>Meta Description:</strong> {{ selectedVersion.metaDescription }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-5 text-muted">
            <p>Select a version to view details</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.version-history {
  min-height: 400px;
}

.list-group-item.active {
  background-color: var(--cyber-primary);
  border-color: var(--cyber-primary);
  color: #000;
}

.list-group-item.active .text-muted {
  color: rgba(0, 0, 0, 0.6) !important;
}
</style>
