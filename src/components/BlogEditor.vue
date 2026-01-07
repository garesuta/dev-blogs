<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import Editor from "@toast-ui/editor";
import "@toast-ui/editor/dist/toastui-editor.css";

// Props
const props = defineProps<{
  modelValue: string;
  postId?: string | null;
  initialMode?: "markdown" | "wysiwyg";
  placeholder?: string;
  height?: string;
  autoSaveInterval?: number; // in seconds
  disabled?: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "save", content: string): void;
  (e: "imageUpload", file: File): Promise<string>;
}>();

// Refs
const editorRef = ref<HTMLDivElement | null>(null);
const editorInstance = ref<Editor | null>(null);
const saveStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
const lastSavedAt = ref<Date | null>(null);
const autoSaveTimer = ref<ReturnType<typeof setInterval> | null>(null);
const isDirty = ref(false);

// Computed
const saveStatusText = computed(() => {
  switch (saveStatus.value) {
    case "saving":
      return "Saving...";
    case "saved":
      return lastSavedAt.value
        ? `Saved at ${lastSavedAt.value.toLocaleTimeString()}`
        : "Saved";
    case "error":
      return "Save failed";
    default:
      return isDirty.value ? "Unsaved changes" : "";
  }
});

const saveStatusClass = computed(() => {
  switch (saveStatus.value) {
    case "saving":
      return "text-muted";
    case "saved":
      return "text-success";
    case "error":
      return "text-danger";
    default:
      return isDirty.value ? "text-warning" : "text-muted";
  }
});

// Image upload handler
async function handleImageUpload(
  blob: Blob | File,
  callback: (url: string, altText: string) => void
) {
  try {
    // Request presigned URL
    const presignResponse = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: blob instanceof File ? blob.name : "image.png",
        mimeType: blob.type,
        sizeBytes: blob.size,
        postId: props.postId || null,
      }),
    });

    if (!presignResponse.ok) {
      const error = await presignResponse.json();
      throw new Error(error.error || "Failed to get upload URL");
    }

    const { presignedUrl, objectKey, publicUrl } = await presignResponse.json();

    // Upload to MinIO
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": blob.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error("Upload failed");
    }

    // Confirm upload
    const confirmResponse = await fetch("/api/upload/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectKey,
        filename: objectKey.split("/").pop(),
        originalName: blob instanceof File ? blob.name : "image.png",
        mimeType: blob.type,
        sizeBytes: blob.size,
        url: publicUrl,
        postId: props.postId || null,
      }),
    });

    if (!confirmResponse.ok) {
      console.warn("Failed to confirm upload:", await confirmResponse.text());
    }

    // Insert image into editor
    callback(publicUrl, blob instanceof File ? blob.name : "Uploaded image");
  } catch (error) {
    console.error("Image upload error:", error);
    alert(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Initialize editor
onMounted(() => {
  if (!editorRef.value) return;

  editorInstance.value = new Editor({
    el: editorRef.value,
    initialValue: props.modelValue || "",
    initialEditType: props.initialMode || "markdown",
    previewStyle: "vertical",
    height: props.height || "500px",
    placeholder: props.placeholder || "Write your post content here...",
    toolbarItems: [
      ["heading", "bold", "italic", "strike"],
      ["hr", "quote"],
      ["ul", "ol", "task", "indent", "outdent"],
      ["table", "image", "link"],
      ["code", "codeblock"],
      ["scrollSync"],
    ],
    hooks: {
      addImageBlobHook: handleImageUpload,
    },
    usageStatistics: false,
  });

  // Listen for changes
  editorInstance.value.on("change", () => {
    const content = editorInstance.value?.getMarkdown() || "";
    emit("update:modelValue", content);
    isDirty.value = true;
    saveStatus.value = "idle";
  });

  // Setup auto-save
  if (props.autoSaveInterval && props.autoSaveInterval > 0) {
    autoSaveTimer.value = setInterval(() => {
      if (isDirty.value && !props.disabled) {
        triggerSave();
      }
    }, props.autoSaveInterval * 1000);
  }

  // Keyboard shortcuts
  editorRef.value.addEventListener("keydown", handleKeydown);
});

// Cleanup
onUnmounted(() => {
  if (editorInstance.value) {
    editorInstance.value.destroy();
  }
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value);
  }
  if (editorRef.value) {
    editorRef.value.removeEventListener("keydown", handleKeydown);
  }
});

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (editorInstance.value) {
      const currentValue = editorInstance.value.getMarkdown();
      if (newValue !== currentValue) {
        editorInstance.value.setMarkdown(newValue || "");
      }
    }
  }
);

// Watch for disabled state
watch(
  () => props.disabled,
  (disabled) => {
    // Toast UI Editor doesn't have a built-in disable method
    // We'll handle this through the UI
  }
);

// Keyboard shortcut handler
function handleKeydown(event: KeyboardEvent) {
  // Ctrl+S / Cmd+S to save
  if ((event.ctrlKey || event.metaKey) && event.key === "s") {
    event.preventDefault();
    triggerSave();
  }
}

// Trigger save
async function triggerSave() {
  if (props.disabled || saveStatus.value === "saving") return;

  const content = editorInstance.value?.getMarkdown() || "";
  saveStatus.value = "saving";

  try {
    emit("save", content);
    isDirty.value = false;
    saveStatus.value = "saved";
    lastSavedAt.value = new Date();
  } catch (error) {
    console.error("Save error:", error);
    saveStatus.value = "error";
  }
}

// Exposed methods
defineExpose({
  getContent: () => editorInstance.value?.getMarkdown() || "",
  setContent: (content: string) => editorInstance.value?.setMarkdown(content),
  focus: () => editorInstance.value?.focus(),
  triggerSave,
});
</script>

<template>
  <div class="blog-editor">
    <!-- Save status bar -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <small :class="saveStatusClass">
        <span v-if="saveStatus === 'saving'" class="spinner-border spinner-border-sm me-1"></span>
        {{ saveStatusText }}
      </small>
      <small class="text-muted">
        Press <kbd>Ctrl</kbd>+<kbd>S</kbd> to save
      </small>
    </div>

    <!-- Editor container -->
    <div
      ref="editorRef"
      class="editor-container"
      :class="{ disabled: disabled }"
    ></div>
  </div>
</template>

<style>
/* Toast UI Editor overrides */
.toastui-editor-defaultUI {
  border: 1px solid #dee2e6 !important;
  border-radius: 0.375rem !important;
}

.toastui-editor-defaultUI .toastui-editor-toolbar {
  border-bottom: 1px solid #dee2e6 !important;
}

.toastui-editor-md-container,
.toastui-editor-ww-container {
  background-color: #fff !important;
}

/* Dark mode support (if using Bootstrap dark mode) */
[data-bs-theme="dark"] .toastui-editor-defaultUI {
  border-color: #495057 !important;
}

[data-bs-theme="dark"] .toastui-editor-defaultUI .toastui-editor-toolbar {
  background-color: #2b2b2b !important;
  border-bottom-color: #495057 !important;
}

[data-bs-theme="dark"] .toastui-editor-md-container,
[data-bs-theme="dark"] .toastui-editor-ww-container {
  background-color: #1e1e1e !important;
}

[data-bs-theme="dark"] .toastui-editor-contents {
  color: #e0e0e0 !important;
}

/* Disabled state */
.editor-container.disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* Keyboard shortcut styling */
kbd {
  background-color: #eee;
  border-radius: 3px;
  border: 1px solid #b4b4b4;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
  color: #333;
  display: inline-block;
  font-size: 0.75em;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
}
</style>
