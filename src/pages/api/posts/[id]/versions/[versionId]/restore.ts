import type { APIRoute } from "astro";
import { db } from "../../../../../../lib/db";
import { posts, postVersions } from "../../../../../../lib/schema";
import { auth } from "../../../../../../lib/auth";
import { canManageContent } from "../../../../../../lib/permissions";
import { restoreVersionSchema } from "../../../../../../lib/validations";
import { eq, and, max } from "drizzle-orm";
import { nanoid } from "nanoid";

export const prerender = false;

// POST /api/posts/[id]/versions/[versionId]/restore - Restore post to a specific version
export const POST: APIRoute = async ({ params, request }) => {
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

    // Get the version to restore
    const [versionToRestore] = await db
      .select()
      .from(postVersions)
      .where(
        and(eq(postVersions.postId, id), eq(postVersions.id, versionId))
      )
      .limit(1);

    if (!versionToRestore) {
      return new Response(JSON.stringify({ error: "Version not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse optional change summary
    let changeSummary = `Restored from version ${versionToRestore.versionNumber}`;
    try {
      const body = await request.json();
      const validated = restoreVersionSchema.safeParse(body);
      if (validated.success && validated.data.changeSummary) {
        changeSummary = validated.data.changeSummary;
      }
    } catch {
      // No body or invalid JSON - use default change summary
    }

    const now = new Date();

    // Update the post with version content
    const [updatedPost] = await db
      .update(posts)
      .set({
        title: versionToRestore.title,
        description: versionToRestore.description,
        content: versionToRestore.content,
        heroImage: versionToRestore.heroImage,
        metaTitle: versionToRestore.metaTitle,
        metaDescription: versionToRestore.metaDescription,
        ogTitle: versionToRestore.ogTitle,
        ogDescription: versionToRestore.ogDescription,
        ogImage: versionToRestore.ogImage,
        updatedAt: now,
      })
      .where(eq(posts.id, id))
      .returning();

    // Get max version number
    const [maxVersion] = await db
      .select({ max: max(postVersions.versionNumber) })
      .from(postVersions)
      .where(eq(postVersions.postId, id));

    const newVersionNumber = (maxVersion?.max || 0) + 1;

    // Create new version record for the restore action
    await db.insert(postVersions).values({
      id: nanoid(),
      postId: id,
      versionNumber: newVersionNumber,
      title: versionToRestore.title,
      description: versionToRestore.description,
      content: versionToRestore.content,
      heroImage: versionToRestore.heroImage,
      metaTitle: versionToRestore.metaTitle,
      metaDescription: versionToRestore.metaDescription,
      ogTitle: versionToRestore.ogTitle,
      ogDescription: versionToRestore.ogDescription,
      ogImage: versionToRestore.ogImage,
      createdAt: now,
      createdBy: session.user.id,
      changeSummary,
    });

    return new Response(
      JSON.stringify({
        post: updatedPost,
        message: `Restored to version ${versionToRestore.versionNumber}`,
        newVersionNumber,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error restoring version:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
