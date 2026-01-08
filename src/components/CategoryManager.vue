<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

// State
const categories = ref<Category[]>([]);
const isLoading = ref(true);
const error = ref("");
const successMessage = ref("");

// Form state
const showForm = ref(false);
const isEditing = ref(false);
const isSaving = ref(false);
const editingId = ref<string | null>(null);
const formData = ref({
  name: "",
  description: "",
  color: "#6c757d",
});

// Predefined colors
const colorOptions = [
  "#0d6efd", // primary blue
  "#6610f2", // indigo
  "#6f42c1", // purple
  "#d63384", // pink
  "#dc3545", // red
  "#fd7e14", // orange
  "#ffc107", // yellow
  "#198754", // green
  "#20c997", // teal
  "#0dcaf0", // cyan
  "#6c757d", // gray
];

// Load categories
async function loadCategories() {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await fetch("/api/categories");
    if (!response.ok) throw new Error("Failed to load categories");

    const data = await response.json();
    categories.value = data.categories;
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to load categories";
  } finally {
    isLoading.value = false;
  }
}

// Reset form
function resetForm() {
  formData.value = { name: "", description: "", color: "#6c757d" };
  isEditing.value = false;
  editingId.value = null;
  showForm.value = false;
}

// Open form for new category
function openNewForm() {
  resetForm();
  showForm.value = true;
}

// Open form for editing
function openEditForm(category: Category) {
  formData.value = {
    name: category.name,
    description: category.description || "",
    color: category.color || "#6c757d",
  };
  isEditing.value = true;
  editingId.value = category.id;
  showForm.value = true;
}

// Save category (create or update)
async function saveCategory() {
  if (!formData.value.name.trim()) {
    error.value = "Name is required";
    return;
  }

  isSaving.value = true;
  error.value = "";

  try {
    const url = isEditing.value ? `/api/categories/${editingId.value}` : "/api/categories";
    const method = isEditing.value ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.value.name.trim(),
        description: formData.value.description.trim() || null,
        color: formData.value.color,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to save category");
    }

    successMessage.value = isEditing.value ? "Category updated" : "Category created";
    setTimeout(() => (successMessage.value = ""), 3000);

    resetForm();
    await loadCategories();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to save category";
  } finally {
    isSaving.value = false;
  }
}

// Delete category
async function deleteCategory(category: Category) {
  if (!confirm(`Are you sure you want to delete "${category.name}"? This cannot be undone.`)) {
    return;
  }

  error.value = "";

  try {
    const response = await fetch(`/api/categories/${category.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to delete category");
    }

    successMessage.value = "Category deleted";
    setTimeout(() => (successMessage.value = ""), 3000);

    categories.value = categories.value.filter((c) => c.id !== category.id);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Failed to delete category";
  }
}

// Initialize
onMounted(() => {
  loadCategories();
});
</script>

<template>
  <div class="category-manager">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Categories</h5>
      <button class="btn btn-primary btn-sm" @click="openNewForm" :disabled="showForm">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="me-1" viewBox="0 0 16 16">
          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
        </svg>
        Add Category
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
        <h6 class="card-title">{{ isEditing ? "Edit Category" : "New Category" }}</h6>

        <div class="mb-3">
          <label class="form-label">Name *</label>
          <input
            type="text"
            class="form-control"
            v-model="formData.name"
            placeholder="Category name"
          />
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea
            class="form-control"
            v-model="formData.description"
            rows="2"
            placeholder="Optional description"
          ></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Color</label>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              class="color-swatch"
              :class="{ active: formData.color === color }"
              :style="{ backgroundColor: color }"
              @click="formData.color = color"
            ></button>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm" @click="saveCategory" :disabled="isSaving">
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
    <div v-else-if="categories.length === 0" class="text-center py-4 text-muted">
      <p class="mb-0">No categories yet</p>
      <small>Create your first category to organize your posts</small>
    </div>

    <!-- Categories list -->
    <div v-else class="list-group">
      <div
        v-for="category in categories"
        :key="category.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div class="d-flex align-items-center gap-2">
          <span
            class="badge"
            :style="{ backgroundColor: category.color || '#6c757d' }"
          >
            {{ category.name }}
          </span>
          <small v-if="category.description" class="text-muted">
            {{ category.description }}
          </small>
        </div>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" @click="openEditForm(category)">
            Edit
          </button>
          <button class="btn btn-outline-danger" @click="deleteCategory(category)">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.active {
  border-color: #212529;
  box-shadow: 0 0 0 2px white, 0 0 0 4px #212529;
}
</style>
