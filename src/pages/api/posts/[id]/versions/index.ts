import type { APIRoute } from "astro";
import { db } from "../../../../../lib/db";
import { posts, postVersions, users } from "../../../../../lib/schema";
import { auth } from "../../../../../lib/auth";
import { canManageContent } from "../../../../../lib/permissions";
import { eq, desc } from "drizzle-orm";

export const prerender = false;

// GET /api/posts/[id]/versions - List all versions of a post
export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Post ID required" }), {
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

    // Verify post exists
    const [post] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get all versions with creator info
    const versions = await db
      .select({
        id: postVersions.id,
        postId: postVersions.postId,
        versionNumber: postVersions.versionNumber,
        title: postVersions.title,
        description: postVersions.description,
        changeSummary: postVersions.changeSummary,
        createdAt: postVersions.createdAt,
        createdBy: postVersions.createdBy,
        creatorName: users.name,
        creatorEmail: users.email,
      })
      .from(postVersions)
      .leftJoin(users, eq(postVersions.createdBy, users.id))
      .where(eq(postVersions.postId, id))
      .orderBy(desc(postVersions.versionNumber));

    return new Response(JSON.stringify({ versions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error listing versions:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
