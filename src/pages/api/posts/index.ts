import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { posts, postVersions, users } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { canManageContent } from "../../../lib/permissions";
import {
  createPostSchema,
  postListQuerySchema,
} from "../../../lib/validations";
import { eq, desc, like, and, count } from "drizzle-orm";
import { nanoid } from "nanoid";

export const prerender = false;

// GET /api/posts - List all posts (with pagination)
export const GET: APIRoute = async ({ request }) => {
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

    // Parse query params
    const url = new URL(request.url);
    const queryParams = {
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "20",
      status: url.searchParams.get("status") || undefined,
      search: url.searchParams.get("search") || undefined,
      authorId: url.searchParams.get("authorId") || undefined,
    };

    const validated = postListQuerySchema.safeParse(queryParams);
    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: "Invalid query parameters", details: validated.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { page, limit, status, search, authorId } = validated.data;
    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(posts.status, status));
    }
    if (search) {
      conditions.push(like(posts.title, `%${search}%`));
    }
    if (authorId) {
      conditions.push(eq(posts.authorId, authorId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(posts)
      .where(whereClause);

    // Get posts with author info
    const postList = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        description: posts.description,
        heroImage: posts.heroImage,
        status: posts.status,
        scheduledDate: posts.scheduledDate,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        publishedAt: posts.publishedAt,
        authorId: posts.authorId,
        authorName: users.name,
        authorEmail: users.email,
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(whereClause)
      .orderBy(desc(posts.updatedAt))
      .limit(limit)
      .offset(offset);

    return new Response(
      JSON.stringify({
        posts: postList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error listing posts:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// POST /api/posts - Create new post
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

    // Parse and validate request body
    const body = await request.json();
    const validated = createPostSchema.safeParse(body);

    if (!validated.success) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: validated.error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = validated.data;

    // Check if slug already exists
    const existingPost = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.slug, data.slug))
      .limit(1);

    if (existingPost.length > 0) {
      return new Response(
        JSON.stringify({ error: "A post with this slug already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const postId = nanoid();
    const now = new Date();

    // Create the post
    const [newPost] = await db
      .insert(posts)
      .values({
        id: postId,
        slug: data.slug,
        title: data.title,
        description: data.description,
        content: data.content,
        heroImage: data.heroImage,
        status: data.status,
        scheduledDate: data.scheduledDate,
        authorId: session.user.id,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        ogTitle: data.ogTitle,
        ogDescription: data.ogDescription,
        ogImage: data.ogImage,
        canonicalUrl: data.canonicalUrl,
        createdAt: now,
        updatedAt: now,
        publishedAt: data.status === "published" ? now : null,
      })
      .returning();

    // Create initial version
    await db.insert(postVersions).values({
      id: nanoid(),
      postId: postId,
      versionNumber: 1,
      title: data.title,
      description: data.description,
      content: data.content,
      heroImage: data.heroImage,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      ogTitle: data.ogTitle,
      ogDescription: data.ogDescription,
      ogImage: data.ogImage,
      createdAt: now,
      createdBy: session.user.id,
      changeSummary: "Initial version",
    });

    return new Response(JSON.stringify({ post: newPost }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
