import { db } from "./db";
import { siteSettings } from "./schema";
import { inArray } from "drizzle-orm";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

// Keys managed on the /admin/settings page
export const SITE_SETTING_KEYS = [
  "site_title",
  "site_description",
  "github_url",
  "twitter_url",
  "linkedin_url",
  "footer_description",
] as const;

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number];

export interface SiteSettingsData {
  siteTitle: string;
  siteDescription: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  footerDescription: string;
}

// Fallbacks when a key has never been saved in the DB
const DEFAULTS: SiteSettingsData = {
  siteTitle: SITE_TITLE,
  siteDescription: SITE_DESCRIPTION,
  githubUrl: "",
  twitterUrl: "",
  linkedinUrl: "",
  footerDescription:
    "A modern blog platform sharing insights on AI, coding, frameworks, and the future of technology.",
};

// Header/Footer render on every request; cache to avoid a DB query per page view
const CACHE_TTL_MS = 60_000;
let cache: SiteSettingsData | null = null;
let cacheExpiresAt = 0;

export function invalidateSiteSettingsCache() {
  cache = null;
  cacheExpiresAt = 0;
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  if (cache && Date.now() < cacheExpiresAt) {
    return cache;
  }

  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(inArray(siteSettings.key, [...SITE_SETTING_KEYS]));

    const byKey: Partial<Record<SiteSettingKey, string>> = {};
    for (const row of rows) {
      byKey[row.key as SiteSettingKey] = row.value;
    }

    cache = {
      siteTitle: byKey.site_title || DEFAULTS.siteTitle,
      siteDescription: byKey.site_description || DEFAULTS.siteDescription,
      githubUrl: byKey.github_url || DEFAULTS.githubUrl,
      twitterUrl: byKey.twitter_url || DEFAULTS.twitterUrl,
      linkedinUrl: byKey.linkedin_url || DEFAULTS.linkedinUrl,
      footerDescription: byKey.footer_description || DEFAULTS.footerDescription,
    };
    cacheExpiresAt = Date.now() + CACHE_TTL_MS;
    return cache;
  } catch (error) {
    console.error("Failed to load site settings, using defaults:", error);
    return DEFAULTS;
  }
}
