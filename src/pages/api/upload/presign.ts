import type { APIRoute } from "astro";
import { auth } from "../../../lib/auth";
import { canManageContent } from "../../../lib/permissions";
import {
  generatePresignedPutUrl,
  isMinioConfigured,
  isAllowedImageType,
  isValidFileSize,
} from "../../../lib/minio";
import { imageUploadSchema } from "../../../lib/validations";

export const prerender = false;

// POST /api/upload/presign - Generate presigned URL for file upload
export const POST: APIRoute = async ({ request }) => {
  try {
    // Verify session
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check permissions
    const userRole = session.user.role as string;
    if (!canManageContent(userRole as "admin" | "editor" | "user")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if MinIO is configured
    if (!isMinioConfigured()) {
      return new Response(
        JSON.stringify({ error: "File storage is not configured" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await request.json();
    const validated = imageUploadSchema.safeParse(body);

    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validated.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { filename, mimeType, sizeBytes } = validated.data;

    // Validate MIME type
    if (!isAllowedImageType(mimeType)) {
      return new Response(
        JSON.stringify({
          error: "Invalid file type",
          allowed: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate file size
    if (!isValidFileSize(sizeBytes)) {
      return new Response(
        JSON.stringify({
          error: "File too large",
          maxSizeBytes: 10 * 1024 * 1024,
          maxSizeMB: 10,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate presigned URL
    const { presignedUrl, objectKey, publicUrl } = await generatePresignedPutUrl(
      filename,
      mimeType,
      300 // 5 minutes expiry
    );

    return new Response(
      JSON.stringify({
        presignedUrl,
        objectKey,
        publicUrl,
        expiresIn: 300,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
