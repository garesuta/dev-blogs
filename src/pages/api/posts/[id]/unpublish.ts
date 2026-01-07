import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { posts, postVersions } from "../../../../lib/schema";
import { auth } from "../../../../lib/auth";
import { canManageContent } from "../../../../lib/permissions";
import { eq, max } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as fs from "fs/promises";
import * as path from "path";

export const prerender = false;

// POST /api/posts/[id]/unpublish - Unpublish post (revert to draft)
export const POST: APIRoute = async ({ params, request }) => {
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

    // Get existing post
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!existingPost) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (existingPost.status === "draft") {
      return new Response(
        JSON.stringify({ error: "Post is already a draft" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const now = new Date();

    // Update post status to draft
    const [updatedPost] = await db
      .update(posts)
      .set({
        status: "draft",
        scheduledDate: null,
        updatedAt: now,
      })
      .where(eq(posts.id, id))
      .returning();

    // Try to remove MDX file if it exists
    try {
      const blogDir = path.join(process.cwd(), "src/content/blog");
      const filePath = path.join(blogDir, `${existingPost.slug}.mdx`);

      await fs.unlink(filePath);
    } catch (fileError) {
      // File might not exist or other error - that's okay
      console.log("MDX file removal skipped:", fileError);
    }

    // Create version record for unpublish action
    const [maxVersion] = await db
      .select({ max: max(postVersions.versionNumber) })
      .from(postVersions)
      .where(eq(postVersions.postId, id));

    const newVersionNumber = (maxVersion?.max || 0) + 1;

    await db.insert(postVersions).values({
      id: nanoid(),
      postId: id,
      versionNumber: newVersionNumber,
      title: updatedPost.title,
      description: updatedPost.description,
      content: updatedPost.content,
      heroImage: updatedPost.heroImage,
      metaTitle: updatedPost.metaTitle,
      metaDescription: updatedPost.metaDescription,
      ogTitle: updatedPost.ogTitle,
      ogDescription: updatedPost.ogDescription,
      ogImage: updatedPost.ogImage,
      createdAt: now,
      createdBy: session.user.id,
      changeSummary: "Unpublished - reverted to draft",
    });

    return new Response(
      JSON.stringify({
        post: updatedPost,
        message: "Post unpublished successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error unpublishing post:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
