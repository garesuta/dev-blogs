<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

// State
const tags = ref<Tag[]>([]);
const isLoading = ref(true);
const error = ref("");
const successMessage = ref("");

// Form state
const showForm = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const formName = ref("");

// Load tags
async function loadTags() {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/tags");
    if (!response.ok) throw new Error("Failed to load tags");

    const data = await response.json();
    tags.value = data.tags;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load tags";
  } finally {
    isLoading.value = false;
  }
}

// Reset form
function resetForm() {
  formName.value = "";
  isEditing.value = false;
  editingId.value = null;
  showForm.value = false;
}

// Open form for new tag
function openNewForm() {
  resetForm();
  showForm.value = true;
}

// Open form for editing
function openEditForm(tag: Tag) {
  formName.value = tag.name;
  isEditing.value = true;
  editingId.value = tag.id;
  showForm.value = true;
}

// Save tag (create or update)
async function saveTag() {
  if (!formName.value.trim()) {
    error.value = "Name is required";
    return;
  }

  isSaving.value = true;
  error.value = "";

  try {
    const url = isEditing.value ? `/api/tags/${editingId.value}` : "/api/tags";
    const method = isEditing.value ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formName.value.trim() }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save tag");
    }

    successMessage.value = isEditing.value ? "Tag updated" : "Tag created";
    setTimeout(() => (successMessage.value = ""), 3000);

    resetForm();
    await loadTags();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to save tag";
  } finally {
    isSaving.value = false;
  }
}

// Delete tag
async function deleteTag(tag: Tag) {
  if (!confirm(`Are you sure you want to delete "${tag.name}"? This will remove it from all posts.`)) {
    return;
  }

  error.value = "";

  try {
    const response = await fetch(`/api/tags/${tag.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete tag");
    }

    successMessage.value = "Tag deleted";
    setTimeout(() => (successMessage.value = ""), 3000);

    tags.value = tags.value.filter((t) => t.id !== tag.id);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to delete tag";
  }
}

// Initialize
onMounted(() => {
  loadTags();
});
</script>

<template>
  <div class="tag-manager">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Tags</h5>
      <button class="btn btn-primary btn-sm" @click="openNewForm" :disabled="showForm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-1" viewBox="0 0 16 16">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Add Tag
      </button>
    </div>

    <!-- Messages -->
    <div v-if="error" class="alert alert-danger py-2 small">
      {{ error }}
      <button type="button" class="btn-close btn-sm float-end" @click="error = ''"></button>
    </div>

    <div v-if="successMessage" class="alert alert-success py-2 small">
      {{ successMessage }}
    </div>

    <!-- Form -->
    <div v-if="showForm" class="card mb-3">
      <div class="card-body">
        <h6 class="card-title">{{ isEditing ? "Edit Tag" : "New Tag" }}</h6>

        <div class="mb-3">
          <label class="form-label">Name *</label>
          <input
            type="text"
            class="form-control"
            v-model="formName"
            placeholder="Tag name"
            @keydown.enter="saveTag"
          />
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" @click="saveTag" :disabled="isSaving">
            {{ isSaving ? "Saving..." : isEditing ? "Update" : "Create" }}
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="resetForm">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-4">
      <div class="spinner-border spinner-border-sm text-primary"></div>
      <span class="ms-2 text-muted">Loading...</span>
    </div>

    <!-- Empty state -->
    <div v-else-if="tags.length === 0" class="text-center py-4 text-muted">
      <p class="mb-0">No tags yet</p>
      <small>Create your first tag to label your posts</small>
    </div>

    <!-- Tags list -->
    <div v-else class="tags-container">
      <div
        v-for="tag in tags"
        :key="tag.id"
        class="tag-chip"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="tag-icon" viewBox="0 0 16 16">
          <path d="M2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2zm3.5 4a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
        </svg>
        <span class="tag-name">{{ tag.name }}</span>
        <div class="tag-actions">
          <button
            class="tag-action-btn edit"
            @click="openEditForm(tag)"
            title="Edit tag"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
            </svg>
          </button>
          <button
            class="tag-action-btn delete"
            @click="deleteTag(tag)"
            title="Delete tag"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="currentColor" viewBox="0 0 16 16">
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Tag count -->
    <div v-if="tags.length > 0" class="mt-3 text-muted small">
      {{ tags.length }} tag{{ tags.length === 1 ? '' : 's' }} total
    </div>
  </div>
</template>

<style scoped>
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: var(--cyber-bg-tertiary);
  border: 1px solid var(--cyber-neutral-200);
  border-radius: 20px;
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  transition: all 0.2s ease;
  cursor: default;
}

.tag-chip:hover {
  background: var(--cyber-neutral-200);
  border-color: var(--cyber-neutral-300);
  padding-right: 0.5rem;
}

.tag-icon {
  color: var(--cyber-neutral-400);
  flex-shrink: 0;
}

.tag-name {
  font-weight: 500;
  color: var(--cyber-text-secondary);
  white-space: nowrap;
}

.tag-actions {
  display: flex;
  align-items: center;
  gap: 0.125rem;
  margin-left: 0.25rem;
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-width 0.2s ease, opacity 0.2s ease;
}

.tag-chip:hover .tag-actions {
  max-width: 50px;
  opacity: 1;
}

.tag-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.tag-action-btn.edit {
  color: var(--cyber-neutral-400);
}

.tag-action-btn.edit:hover {
  background: var(--cyber-info-bg);
  color: var(--cyber-secondary);
}

.tag-action-btn.delete {
  color: var(--cyber-neutral-400);
}

.tag-action-btn.delete:hover {
  background: var(--cyber-danger-bg);
  color: var(--cyber-danger);
}

/* Mobile: always show actions */
@media (max-width: 576px) {
  .tag-chip {
    padding-right: 0.5rem;
  }

  .tag-actions {
    max-width: 50px;
    opacity: 1;
  }
}
</style>
