import type { APIRoute } from "astro";
import { db } from "../../../../../../lib/db";
import { posts, postVersions, users } from "../../../../../../lib/schema";
import { auth } from "../../../../../../lib/auth";
import { canManageContent } from "../../../../../../lib/permissions";
import { eq, and } from "drizzle-orm";

export const prerender = false;

// GET /api/posts/[id]/versions/[versionId] - Get specific version details
export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id, versionId } = params;
    if (!id || !versionId) {
      return new Response(
        JSON.stringify({ error: "Post ID and Version ID required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
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

    // Get version with full content and creator info
    const [version] = await db
      .select({
        id: postVersions.id,
        postId: postVersions.postId,
        versionNumber: postVersions.versionNumber,
        title: postVersions.title,
        description: postVersions.description,
        content: postVersions.content,
        heroImage: postVersions.heroImage,
        metaTitle: postVersions.metaTitle,
        metaDescription: postVersions.metaDescription,
        ogTitle: postVersions.ogTitle,
        ogDescription: postVersions.ogDescription,
        ogImage: postVersions.ogImage,
        changeSummary: postVersions.changeSummary,
        createdAt: postVersions.createdAt,
        createdBy: postVersions.createdBy,
        creatorName: users.name,
        creatorEmail: users.email,
      })
      .from(postVersions)
      .leftJoin(users, eq(postVersions.createdBy, users.id))
      .where(
        and(eq(postVersions.postId, id), eq(postVersions.id, versionId))
      )
      .limit(1);

    if (!version) {
      return new Response(JSON.stringify({ error: "Version not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ version }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting version:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
