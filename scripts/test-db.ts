import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

async function testConnection() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set in your .env file");
    process.exit(1);
  }

  console.log("Testing database connection...\n");

  try {
    const client = neon(process.env.DATABASE_URL);
    const db = drizzle(client);

    // Test the connection with a simple query
    const result = await db.execute(sql`SELECT NOW() as current_time`);

    console.log("Connection successful!");
    console.log("Result:", result.rows[0]);

    // Optional: Check PostgreSQL version
    const versionResult = await db.execute(sql`SELECT version()`);
    console.log("PostgreSQL version:", versionResult.rows[0]);
  } catch (error) {
    console.error("Connection failed!");
    console.error("Error:", error);
    process.exit(1);
  }
}

testConnection();
