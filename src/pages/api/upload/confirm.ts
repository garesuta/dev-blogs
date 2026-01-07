import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { postImages } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { canManageContent } from "../../../lib/permissions";
import {
  MINIO_BUCKET,
  isMinioConfigured,
  getObjectInfo,
} from "../../../lib/minio";
import { z } from "zod";
import { nanoid } from "nanoid";

export const prerender = false;

// Schema for confirm upload request
const confirmUploadSchema = z.object({
  objectKey: z.string().min(1),
  filename: z.string().min(1),
  originalName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  url: z.string().url(),
  postId: z.string().optional().nullable(),
});

// POST /api/upload/confirm - Confirm upload and save to database
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
    const validated = confirmUploadSchema.safeParse(body);

    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validated.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { objectKey, filename, originalName, mimeType, sizeBytes, url, postId } = validated.data;

    // Verify the object exists in MinIO
    try {
      await getObjectInfo(objectKey);
    } catch {
      return new Response(
        JSON.stringify({ error: "File not found in storage. Upload may have failed." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Save to database
    const imageId = nanoid();
    const [savedImage] = await db
      .insert(postImages)
      .values({
        id: imageId,
        postId: postId || null,
        filename,
        originalName,
        minioKey: objectKey,
        minioBucket: MINIO_BUCKET,
        mimeType,
        sizeBytes,
        url,
        uploadedBy: session.user.id,
      })
      .returning();

    return new Response(
      JSON.stringify({
        image: savedImage,
        message: "Upload confirmed successfully",
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error confirming upload:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
