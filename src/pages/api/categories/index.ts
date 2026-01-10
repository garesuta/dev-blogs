import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { categories } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { nanoid } from "nanoid";
import { eq, asc } from "drizzle-orm";
import { generateSlug } from "../../../lib/validations";

export const prerender = false;

// GET /api/categories - List all categories
export const GET: APIRoute = async ({ request }) => {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));

    return new Response(JSON.stringify({ categories: allCategories }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch categories" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// POST /api/categories - Create a new category
export const POST: APIRoute = async ({ request }) => {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check role
    const userRole = (session.user.role as string)?.toLowerCase();
    if (userRole !== "admin" && userRole !== "editor") {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const slug = generateSlug(name.trim());

    // Check if category already exists
    const existing = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return new Response(
        JSON.stringify({ error: "Category with this name already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    const newCategory = {
      id: nanoid(),
      name: name.trim(),
      slug,
      description: description?.trim() || null,
      color: color || null,
      icon: icon?.trim() || null,
    };

    await db.insert(categories).values(newCategory);

    return new Response(JSON.stringify({ category: newCategory }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create category" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
