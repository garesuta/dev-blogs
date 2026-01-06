import { createAuthClient } from "better-auth/vue";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "./permissions";

// Create the auth client for Vue components
export const authClient = createAuthClient({
  baseURL: import.meta.env.PUBLIC_BETTER_AUTH_URL || "http://localhost:4321",
  plugins: [
    adminClient({
      ac,
      roles,
    }),
  ],
});

// Export commonly used functions for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

// Type exports
export type AuthClient = typeof authClient;
