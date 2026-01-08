import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { tags, postTags } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { eq, count } from "drizzle-orm";
import { generateSlug } from "../../../lib/validations";

export const prerender = false;

// GET /api/tags/:id - Get single tag with usage count
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Tag ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    if (!tag) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get usage count
    const [{ usageCount }] = await db
      .select({ usageCount: count() })
      .from(postTags)
      .where(eq(postTags.tagId, id));

    return new Response(JSON.stringify({ tag: { ...tag, usageCount } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching tag:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch tag" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT /api/tags/:id - Update tag
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Tag ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check role - only admin can manage tags
    const userRole = (session.user.role as string)?.toLowerCase();
    if (userRole !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if tag exists
    const [existing] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    if (!existing) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newSlug = generateSlug(name.trim());

    // Check if another tag has this slug
    if (newSlug !== existing.slug) {
      const [duplicate] = await db
        .select()
        .from(tags)
        .where(eq(tags.slug, newSlug))
        .limit(1);

      if (duplicate) {
        return new Response(
          JSON.stringify({ error: "Tag with this name already exists" }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const [updated] = await db
      .update(tags)
      .set({
        name: name.trim(),
        slug: newSlug,
      })
      .where(eq(tags.id, id))
      .returning();

    return new Response(JSON.stringify({ tag: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating tag:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update tag" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// DELETE /api/tags/:id - Delete tag
export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Tag ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check role - only admin can delete tags
    const userRole = (session.user.role as string)?.toLowerCase();
    if (userRole !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if tag exists
    const [existing] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id))
      .limit(1);

    if (!existing) {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete tag (cascade will remove post_tags entries)
    await db.delete(tags).where(eq(tags.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete tag" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
