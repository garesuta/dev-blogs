import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { db } from "./db";
import * as schema from "./schema";
import { ac, roles } from "./permissions";

// Session expiry configuration (in seconds)
const SESSION_EXPIRY_DAYS = parseInt(
  import.meta.env.SESSION_EXPIRY_DAYS || "7",
  10
);
const SESSION_UPDATE_AGE_DAYS = parseInt(
  import.meta.env.SESSION_UPDATE_AGE_DAYS || "1",
  10
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  // Base URL for OAuth callbacks
  baseURL: import.meta.env.BETTER_AUTH_URL || "http://localhost:4321",

  // Secret for signing tokens
  secret: import.meta.env.BETTER_AUTH_SECRET,

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: import.meta.env.GOOGLE_CLIENT_ID || "",
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET || "",
      prompt: "select_account",
    },
  },

  // Session configuration
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // Cache valid for 5 minutes
    },
    expiresIn: 60 * 60 * 24 * SESSION_EXPIRY_DAYS, // Session expiry
    updateAge: 60 * 60 * 24 * SESSION_UPDATE_AGE_DAYS, // Refresh if older than this
  },

  // Advanced configuration
  advanced: {
    cookiePrefix: "blog_auth",
    useSecureCookies: import.meta.env.PROD,
  },

  // Account linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // Plugins
  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
  ],

  // User fields configuration
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        required: false,
      },
    },
  },
});

// Export auth types for use in other files
export type Auth = typeof auth;
