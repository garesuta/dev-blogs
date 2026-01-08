import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { categories } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { eq } from "drizzle-orm";
import { generateSlug } from "../../../lib/validations";

export const prerender = false;

// GET /api/categories/:id - Get single category
export const GET: APIRoute = async ({ params }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Category ID required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!category) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ category }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch category" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT /api/categories/:id - Update category
export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Category ID required" }), {
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

    // Check role - only admin can manage categories
    const userRole = (session.user.role as string)?.toLowerCase();
    if (userRole !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if category exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { name, description, color } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newSlug = generateSlug(name.trim());

    // Check if another category has this slug
    if (newSlug !== existing.slug) {
      const [duplicate] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, newSlug))
        .limit(1);

      if (duplicate) {
        return new Response(
          JSON.stringify({ error: "Category with this name already exists" }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const [updated] = await db
      .update(categories)
      .set({
        name: name.trim(),
        slug: newSlug,
        description: description?.trim() || null,
        color: color || null,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return new Response(JSON.stringify({ category: updated }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating category:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update category" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// DELETE /api/categories/:id - Delete category
export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Category ID required" }), {
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

    // Check role - only admin can delete categories
    const userRole = (session.user.role as string)?.toLowerCase();
    if (userRole !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if category exists
    const [existing] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existing) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await db.delete(categories).where(eq(categories.id, id));

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    return new Response(
      JSON.stringify({ error: "Failed to delete category" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
