import type { APIRoute } from "astro";
import { db } from "../../../lib/db";
import { siteSettings } from "../../../lib/schema";
import { auth } from "../../../lib/auth";
import { inArray } from "drizzle-orm";
import {
  SITE_SETTING_KEYS,
  invalidateSiteSettingsCache,
} from "../../../lib/site-settings";

export const prerender = false;

// GET /api/settings/site - Get site-wide settings
export const GET: APIRoute = async () => {
  try {
    const settings = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, [...SITE_SETTING_KEYS]));

    const siteSettingsMap: Record<string, string> = {};
    for (const setting of settings) {
      siteSettingsMap[setting.key] = setting.value;
    }

    return new Response(JSON.stringify({ settings: siteSettingsMap }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch site settings" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// PUT /api/settings/site - Update site-wide settings
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
    const {
      siteTitle,
      siteDescription,
      githubUrl,
      twitterUrl,
      linkedinUrl,
      footerDescription,
    } = body;

    if (!siteTitle || typeof siteTitle !== "string" || siteTitle.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Site title is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Optional fields must be strings when provided
    const optionalFields: Record<string, unknown> = {
      siteDescription,
      githubUrl,
      twitterUrl,
      linkedinUrl,
      footerDescription,
    };
    for (const [field, value] of Object.entries(optionalFields)) {
      if (value !== undefined && value !== null && typeof value !== "string") {
        return new Response(
          JSON.stringify({ error: `${field} must be a string` }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Social links must be http(s) URLs when provided
    const urlFields: Record<string, unknown> = {
      githubUrl,
      twitterUrl,
      linkedinUrl,
    };
    for (const [field, value] of Object.entries(urlFields)) {
      if (value && typeof value === "string" && value.trim().length > 0) {
        let parsed: URL;
        try {
          parsed = new URL(value.trim());
        } catch {
          return new Response(
            JSON.stringify({ error: `${field} must be a valid URL` }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
          return new Response(
            JSON.stringify({ error: `${field} must be an http(s) URL` }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
      }
    }

    const now = new Date();
    const userId = session.user.id;

    const settingsToUpsert = [
      { key: "site_title", value: siteTitle.trim() },
      { key: "site_description", value: ((siteDescription as string) || "").trim() },
      { key: "github_url", value: ((githubUrl as string) || "").trim() },
      { key: "twitter_url", value: ((twitterUrl as string) || "").trim() },
      { key: "linkedin_url", value: ((linkedinUrl as string) || "").trim() },
      { key: "footer_description", value: ((footerDescription as string) || "").trim() },
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

    invalidateSiteSettingsCache();

    const savedSettings: Record<string, string> = {};
    for (const setting of settingsToUpsert) {
      savedSettings[setting.key] = setting.value;
    }

    return new Response(
      JSON.stringify({
        message: "Site settings updated successfully",
        settings: savedSettings,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating site settings:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update site settings" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
