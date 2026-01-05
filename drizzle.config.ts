import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in your .env file");
}

export default defineConfig({
  // Path to your schema file (where you defined your tables)
  schema: "./src/lib/schema.ts",

  // Where the generated SQL migrations will be stored
  out: "./drizzle",

  // The database dialect
  dialect: "postgresql",

  // Connection details using your Neon URL
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },

  // Recommended for Neon to ignore system tables/roles
  verbose: true,
  strict: true,
});
