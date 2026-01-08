import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { posts, postVersions, users, categories, tags, postTags } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { canManageContent, isAdmin } from "../../../lib/permissions";
import { updatePostSchema } from "../../../lib/validations";
import { eq, max } from "drizzle-orm";
import { nanoid } from "nanoid";

export const prerender = false;

// GET /api/posts/[id] - Get single post
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

    // Get post with author info and category
    const [post] = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        description: posts.description,
        content: posts.content,
        heroImage: posts.heroImage,
        status: posts.status,
        scheduledDate: posts.scheduledDate,
        authorId: posts.authorId,
        categoryId: posts.categoryId,
        metaTitle: posts.metaTitle,
        metaDescription: posts.metaDescription,
        ogTitle: posts.ogTitle,
        ogDescription: posts.ogDescription,
        ogImage: posts.ogImage,
        canonicalUrl: posts.canonicalUrl,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
        authorName: users.name,
        authorEmail: users.email,
        categoryName: categories.name,
        categorySlug: categories.slug,
        categoryColor: categories.color,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id))
      .where(eq(posts.id, id))
      .limit(1);

    if (!post) {
      return new Response(JSON.stringify({ error: "Post not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get tags for this post
    const postTagsResult = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, id));

    return new Response(JSON.stringify({ post, tags: postTagsResult }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting post:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT /api/posts/[id] - Update post
export const PUT: APIRoute = async ({ params, request }) => {
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

    // Parse and validate request body
    const body = await request.json();
    const validated = updatePostSchema.safeParse(body);

    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validated.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = validated.data;

    // Optimistic locking check
    if (data.expectedUpdatedAt) {
      const expectedTime = new Date(data.expectedUpdatedAt).getTime();
      const actualTime = existingPost.updatedAt.getTime();
      if (actualTime > expectedTime) {
        return new Response(
          JSON.stringify({
            error: "Conflict",
            message: "Post was modified by another user. Please refresh and try again.",
            serverUpdatedAt: existingPost.updatedAt,
          }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existingPost.slug) {
      const slugExists = await db
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.slug, data.slug))
        .limit(1);

      if (slugExists.length > 0) {
        return new Response(
          JSON.stringify({ error: "A post with this slug already exists" }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const now = new Date();

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.heroImage !== undefined) updateData.heroImage = data.heroImage;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.scheduledDate !== undefined) updateData.scheduledDate = data.scheduledDate;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.ogTitle !== undefined) updateData.ogTitle = data.ogTitle;
    if (data.ogDescription !== undefined) updateData.ogDescription = data.ogDescription;
    if (data.ogImage !== undefined) updateData.ogImage = data.ogImage;
    if (data.canonicalUrl !== undefined) updateData.canonicalUrl = data.canonicalUrl;

    // Update published_at if status changes to published
    if (data.status === "published" && existingPost.status !== "published") {
      updateData.publishedAt = now;
    }

    // Update the post
    const [updatedPost] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();

    // Get max version number
    const [maxVersion] = await db
      .select({ max: max(postVersions.versionNumber) })
      .from(postVersions)
      .where(eq(postVersions.postId, id));

    const newVersionNumber = (maxVersion?.max || 0) + 1;

    // Create new version
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
      changeSummary: body.changeSummary || null,
    });

    // Handle tags if provided
    if (body.tagIds !== undefined) {
      // Remove existing tags
      await db.delete(postTags).where(eq(postTags.postId, id));

      // Add new tags
      if (Array.isArray(body.tagIds) && body.tagIds.length > 0) {
        const tagInserts = body.tagIds.map((tagId: string) => ({
          postId: id,
          tagId,
        }));
        await db.insert(postTags).values(tagInserts);
      }
    }

    // Get updated tags
    const updatedTags = await db
      .select({
        id: tags.id,
        name: tags.name,
        slug: tags.slug,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, id));

    return new Response(JSON.stringify({ post: updatedPost, tags: updatedTags }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// DELETE /api/posts/[id] - Delete post
export const DELETE: APIRoute = async ({ params, request }) => {
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

    // Only admins can delete published posts, or authors can delete their own drafts
    if (existingPost.status === "published" && !isAdmin(userRole as "admin" | "editor" | "user")) {
      return new Response(
        JSON.stringify({ error: "Only admins can delete published posts" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Delete the post (cascade will handle versions)
    await db.delete(posts).where(eq(posts.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
