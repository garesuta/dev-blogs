/**
 * useImageUpload Composable
 *
 * Handles image upload with presigned URL flow.
 *
 * Security: Client-side validation before any API call
 * - File type whitelist
 * - File size limits
 * - Required postId for access control
 */

import { ref, type Ref } from 'vue';
import type { Editor } from '@tiptap/core';

/**
 * Allowed image MIME types
 * SECURITY: Rejects non-image files
 */
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);

/**
 * Maximum file size (5MB in bytes)
 * SECURITY: Prevents resource exhaustion
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Presigned URL response
 */
interface PresignedUploadResponse {
  presignedUrl: string;
  objectKey: string;
  publicUrl: string;
}

interface UploadConfirmBody {
  objectKey: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  postId: string | null;
}

interface UseImageUploadOptions {
  editor: Ref<Editor | null>;
  postId: string | null | undefined;
}

interface ImageUploadReturn {
  fileInputRef: Ref<HTMLInputElement | null>;
  handleImageUpload: (file: File) => Promise<void>;
  openImageUpload: () => void;
  handleFileInputChange: (event: Event) => void;
}

/**
 * Validate file is an allowed image type
 */
function isValidFileType(file: File): boolean {
  return ALLOWED_IMAGE_TYPES.has(file.type);
}

/**
 * Validate file is within size limits
 */
function isValidFileSize(file: File): boolean {
  return file.size > 0 && file.size <= MAX_FILE_SIZE;
}

/**
 * Get validation error message
 */
function getValidationError(file: File): string | null {
  if (!isValidFileType(file)) {
    return `File type ${file.type} is not allowed. Please upload: JPEG, PNG, GIF, WebP, or SVG.`;
  }
  if (!isValidFileSize(file)) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return `File size (${sizeMB}MB) exceeds maximum of 5MB.`;
  }
  return null;
}

export function useImageUpload(options: UseImageUploadOptions): ImageUploadReturn {
  const { editor, postId } = options;

  const fileInputRef = ref<HTMLInputElement | null>(null);

  /**
   * Handle image upload with presigned URL flow
   * SECURITY: Validates file BEFORE any API call
   */
  async function handleImageUpload(file: File): Promise<void> {
    // SECURITY: Validate file type first
    if (!isValidFileType(file)) {
      alert(getValidationError(file)!);
      return;
    }

    // SECURITY: Validate file size second
    if (!isValidFileSize(file)) {
      alert(getValidationError(file)!);
      return;
    }

    // SECURITY: Ensure postId is provided for access control
    if (!postId) {
      alert("Post ID is required for image upload");
      return;
    }

    try {
      // Request presigned URL from server
      const presignResponse = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          postId: postId || null,
        }),
      });

      if (!presignResponse.ok) {
        const error = await presignResponse.json();
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { presignedUrl, objectKey, publicUrl } = await presignResponse.json() as PresignedUploadResponse;

      // Upload file to presigned URL
      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Confirm upload with server
      const confirmBody: UploadConfirmBody = {
        objectKey,
        filename: objectKey.split("/").pop() || file.name,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        url: publicUrl,
        postId: postId || null,
      };

      await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmBody),
      });

      // Insert figure with caption (empty caption shows placeholder)
      if (editor.value) {
        editor.value
          .chain()
          .focus()
          .insertContent({
            type: 'figure',
            attrs: { src: publicUrl, alt: file.name },
            content: [{ type: 'figcaption' }],
          })
          .run();
      }
    } catch (error) {
      console.error("Image upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to upload image: ${errorMessage}`);
    }
  }

  /**
   * Trigger file input click
   */
  function openImageUpload(): void {
    fileInputRef.value?.click();
  }

  /**
   * Handle file input change event
   */
  function handleFileInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    target.value = ""; // Reset input
  }

  return {
    fileInputRef,
    handleImageUpload,
    openImageUpload,
    handleFileInputChange,
  };
}
