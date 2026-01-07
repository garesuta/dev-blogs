import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { postImages } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { canManageContent, isAdmin } from "../../../lib/permissions";
import { deleteObject, isMinioConfigured } from "../../../lib/minio";
import { eq } from "drizzle-orm";

export const prerender = false;

// GET /api/upload/[id] - Get image details
export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Image ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Get image from database
    const [image] = await db
      .select()
      .from(postImages)
      .where(eq(postImages.id, id))
      .limit(1);

    if (!image) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ image }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting image:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// DELETE /api/upload/[id] - Delete uploaded image
export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Image ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

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

    // Get image from database
    const [image] = await db
      .select()
      .from(postImages)
      .where(eq(postImages.id, id))
      .limit(1);

    if (!image) {
      return new Response(JSON.stringify({ error: "Image not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Only uploader or admin can delete
    if (image.uploadedBy !== session.user.id && !isAdmin(userRole as "admin" | "editor" | "user")) {
      return new Response(
        JSON.stringify({ error: "You can only delete your own uploads" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete from MinIO if configured
    if (isMinioConfigured()) {
      try {
        await deleteObject(image.minioKey);
      } catch (minioError) {
        console.error("Error deleting from MinIO:", minioError);
        // Continue with database deletion even if MinIO fails
      }
    }

    // Delete from database
    await db.delete(postImages).where(eq(postImages.id, id));

    return new Response(
      JSON.stringify({ success: true, message: "Image deleted successfully" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting image:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
