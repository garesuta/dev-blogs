/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Database
  readonly DATABASE_URL: string;

  // Better Auth
  readonly BETTER_AUTH_SECRET: string;
  readonly BETTER_AUTH_URL: string;
  readonly PUBLIC_BETTER_AUTH_URL: string;

  // Session Configuration
  readonly SESSION_EXPIRY_DAYS?: string;
  readonly SESSION_UPDATE_AGE_DAYS?: string;

  // Google OAuth
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;

  // Feature Flags
  readonly FEATURE_RBAC_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Astro Locals for auth
declare namespace App {
  interface Locals {
    user: import("./lib/schema").User | null;
    session: import("./lib/schema").Session | null;
  }
}
