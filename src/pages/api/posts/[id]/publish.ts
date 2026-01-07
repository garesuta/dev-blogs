import type { APIRoute } from "astro";
import { db } from "../../../../lib/db";
import { posts, postVersions } from "../../../../lib/schema";
import { auth } from "../../../../lib/auth";
import { canManageContent } from "../../../../lib/permissions";
import { publishPostSchema } from "../../../../lib/validations";
import { eq, max } from "drizzle-orm";
import { nanoid } from "nanoid";
import * as fs from "fs/promises";
import * as path from "path";

export const prerender = false;

// Helper to generate MDX frontmatter
function generateMdxContent(post: {
  title: string;
  description: string;
  content: string;
  heroImage: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
}): string {
  const frontmatter = [
    "---",
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `description: "${post.description.replace(/"/g, '\\"')}"`,
    `pubDate: "${(post.publishedAt || post.updatedAt).toISOString()}"`,
  ];

  if (post.heroImage) {
    frontmatter.push(`heroImage: "${post.heroImage}"`);
  }

  frontmatter.push("---", "", post.content);

  return frontmatter.join("\n");
}

// POST /api/posts/[id]/publish - Publish or schedule post
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

    // Validate required fields for publishing
    if (!existingPost.title || !existingPost.description || !existingPost.content) {
      return new Response(
        JSON.stringify({
          error: "Cannot publish incomplete post",
          details: "Title, description, and content are required",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body for optional scheduled date
    let scheduledDate: Date | null = null;
    try {
      const body = await request.json();
      const validated = publishPostSchema.safeParse(body);
      if (validated.success && validated.data.scheduledDate) {
        scheduledDate = validated.data.scheduledDate;
      }
    } catch {
      // No body or invalid JSON - proceed without scheduled date
    }

    const now = new Date();
    const isScheduled = scheduledDate && scheduledDate > now;

    // Update post status
    const [updatedPost] = await db
      .update(posts)
      .set({
        status: isScheduled ? "scheduled" : "published",
        scheduledDate: isScheduled ? scheduledDate : null,
        publishedAt: isScheduled ? null : now,
        updatedAt: now,
      })
      .where(eq(posts.id, id))
      .returning();

    // If publishing immediately (not scheduled), generate MDX file
    if (!isScheduled) {
      try {
        const mdxContent = generateMdxContent({
          title: updatedPost.title,
          description: updatedPost.description,
          content: updatedPost.content,
          heroImage: updatedPost.heroImage,
          publishedAt: updatedPost.publishedAt,
          updatedAt: updatedPost.updatedAt,
        });

        const blogDir = path.join(process.cwd(), "src/content/blog");
        const filePath = path.join(blogDir, `${updatedPost.slug}.mdx`);

        await fs.writeFile(filePath, mdxContent, "utf-8");
      } catch (fileError) {
        console.error("Error writing MDX file:", fileError);
        // Don't fail the request - post is published in DB
        // The MDX file can be regenerated later
      }
    }

    // Create version record for publish action
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
      changeSummary: isScheduled
        ? `Scheduled for ${scheduledDate!.toISOString()}`
        : "Published",
    });

    return new Response(
      JSON.stringify({
        post: updatedPost,
        message: isScheduled
          ? `Post scheduled for ${scheduledDate!.toISOString()}`
          : "Post published successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error publishing post:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
