import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { siteSettings } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { eq, inArray } from "drizzle-orm";

export const prerender = false;

// About settings keys
const ABOUT_KEYS = [
  "about_title",
  "about_description",
  "about_content",
  "about_hero_image",
] as const;

// GET /api/settings/about - Get about page settings
export const GET: APIRoute = async () => {
  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, [...ABOUT_KEYS]));

    // Transform to object for easier consumption
    const aboutSettings: Record<string, string> = {};
    for (const setting of settings) {
      aboutSettings[setting.key] = setting.value;
    }

    return new Response(JSON.stringify({ settings: aboutSettings }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching about settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch about settings" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT /api/settings/about - Update about page settings
export const PUT: APIRoute = async ({ request }) => {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check role - admin only
    const userRole = (session.user.role as string)?.toLowerCase();
    if (userRole !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    const { title, description, content, heroImage } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Title is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const userId = session.user.id;

    // Upsert each setting
    const settingsToUpsert = [
      { key: "about_title", value: title.trim() },
      { key: "about_description", value: (description || "").trim() },
      { key: "about_content", value: content.trim() },
      { key: "about_hero_image", value: (heroImage || "").trim() },
    ];

    for (const setting of settingsToUpsert) {
      await db
        .insert(siteSettings)
        .values({
          key: setting.key,
          value: setting.value,
          updatedAt: now,
          updatedBy: userId,
        })
        .onConflictDoUpdate({
          target: siteSettings.key,
          set: {
            value: setting.value,
            updatedAt: now,
            updatedBy: userId,
          },
        });
    }

    return new Response(
      JSON.stringify({
        message: "About settings updated successfully",
        settings: {
          about_title: title.trim(),
          about_description: (description || "").trim(),
          about_content: content.trim(),
          about_hero_image: (heroImage || "").trim(),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating about settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update about settings" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
