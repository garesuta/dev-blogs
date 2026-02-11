<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  modelValue: string | null;
  label?: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

// State
const isUploading = ref(false);
const uploadProgress = ref(0);
const error = ref("");
const isDragging = ref(false);

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null);

// Computed
const hasImage = computed(() => !!props.modelValue);

// Allowed MIME types
const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
const maxSizeBytes = 10 * 1024 * 1024; // 10MB

// Validate file
function validateFile(file: File): string | null {
  if (!allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed: ${allowedTypes.map(t => t.split("/")[1]).join(", ")}`;
  }
  if (file.size > maxSizeBytes) {
    return `File too large. Maximum size: ${maxSizeBytes / 1024 / 1024}MB`;
  }
  return null;
}

// Upload file using presigned URL
async function uploadFile(file: File) {
  error.value = "";
  isUploading.value = true;
  uploadProgress.value = 0;

  try {
    // Step 1: Get presigned URL from our API
    const presignResponse = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      }),
    });

    if (!presignResponse.ok) {
      const data = await presignResponse.json();
      throw new Error(data.error || "Failed to get upload URL");
    }

    const { presignedUrl, publicUrl } = await presignResponse.json();

    // Step 2: Upload directly to MinIO using presigned URL
    uploadProgress.value = 10;

    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file");
    }

    uploadProgress.value = 100;

    // Step 3: Update the value with the public URL
    emit("update:modelValue", publicUrl);
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Upload failed";
    console.error("Upload error:", err);
  } finally {
    isUploading.value = false;
    uploadProgress.value = 0;
  }
}

// Handle file selection
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const validationError = validateFile(file);
  if (validationError) {
    error.value = validationError;
    return;
  }

  uploadFile(file);

  // Reset input so same file can be selected again
  target.value = "";
}

// Handle drop
function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;

  const file = event.dataTransfer?.files?.[0];
  if (!file) return;

  const validationError = validateFile(file);
  if (validationError) {
    error.value = validationError;
    return;
  }

  uploadFile(file);
}

// Handle drag events
function handleDragOver(event: DragEvent) {
  event.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

// Trigger file input click
function triggerFileInput() {
  fileInputRef.value?.click();
}

// Remove current image
function removeImage() {
  emit("update:modelValue", null);
}
</script>

<template>
  <div class="image-upload">
    <label v-if="label" class="form-label">{{ label }}</label>

    <!-- Error message -->
    <div v-if="error" class="alert alert-danger py-2 small mb-2">
      {{ error }}
      <button type="button" class="btn-close btn-sm float-end" @click="error = ''"></button>
    </div>

    <!-- Current image preview (shown when image exists) -->
    <div v-if="hasImage && !isUploading" class="current-image">
      <div class="position-relative d-inline-block">
        <img
          :src="modelValue!"
          alt="Current image"
          class="img-fluid rounded border"
          style="max-height: 120px;"
        />
        <button
          type="button"
          class="btn btn-sm btn-danger remove-btn position-absolute"
          @click="removeImage"
          title="Remove image to upload a new one"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Upload zone (only shown when NO image exists) -->
    <div
      v-if="!hasImage || isUploading"
      class="upload-zone border rounded p-3 text-center"
      :class="{
        'border-primary bg-light': isDragging,
        'border-dashed': !isDragging,
      }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="triggerFileInput"
    >
      <!-- Uploading state -->
      <div v-if="isUploading" class="py-2">
        <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        <span class="text-muted">Uploading... {{ uploadProgress }}%</span>
        <div class="progress mt-2" style="height: 4px;">
          <div
            class="progress-bar"
            role="progressbar"
            :style="{ width: uploadProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Default state -->
      <div v-else class="py-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="text-muted mb-2" viewBox="0 0 16 16">
          <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
          <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
        </svg>
        <div class="text-muted small">
          {{ placeholder || "Drag & drop an image here, or click to browse" }}
        </div>
        <div class="text-muted small mt-1">
          JPEG, PNG, GIF, WebP, SVG (max 10MB)
        </div>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        class="d-none"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        @change="handleFileSelect"
      />
    </div>
  </div>
</template>

<style scoped>
.upload-zone {
  cursor: pointer;
  transition: all 0.2s ease;
}

.upload-zone:hover {
  background-color: var(--cyber-surface-hover);
  border-color: var(--cyber-primary) !important;
}

.border-dashed {
  border-style: dashed !important;
}

.current-image .remove-btn {
  top: 4px;
  right: 4px;
  padding: 4px 6px;
  line-height: 1;
  opacity: 0.9;
}

.current-image .remove-btn:hover {
  opacity: 1;
}
</style>
