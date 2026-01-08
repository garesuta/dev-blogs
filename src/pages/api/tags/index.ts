import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { tags } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { nanoid } from "nanoid";
import { eq, asc } from "drizzle-orm";
import { generateSlug } from "../../../lib/validations";

export const prerender = false;

// GET /api/tags - List all tags
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search");

    let query = db.select().from(tags).orderBy(asc(tags.name));

    const allTags = await query;

    // Filter by search if provided
    const filteredTags = search
      ? allTags.filter((tag) =>
          tag.name.toLowerCase().includes(search.toLowerCase())
        )
      : allTags;

    return new Response(JSON.stringify({ tags: filteredTags }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch tags" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// POST /api/tags - Create a new tag
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
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const slug = generateSlug(name.trim());

    // Check if tag already exists
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      // Return existing tag instead of error
      return new Response(JSON.stringify({ tag: existing[0], exists: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newTag = {
      id: nanoid(),
      name: name.trim(),
      slug,
    };

    await db.insert(tags).values(newTag);

    return new Response(JSON.stringify({ tag: newTag, exists: false }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    return new Response(JSON.stringify({ error: "Failed to create tag" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
