import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

// ============================================
// Better Auth Schema
// ============================================

// Users table - core user data
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"), // user | editor | admin
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Sessions table - active user sessions
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  impersonatedBy: text("impersonated_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Accounts table - OAuth providers and credentials
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Verifications table - email verification, password reset tokens
export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// Blog CMS Schema
// ============================================

// Post status type
export type PostStatus = "draft" | "published" | "scheduled";

// Posts table - blog post content and metadata
export const posts = pgTable(
  "posts",
  {
    id: text("id").primaryKey(),
    slug: text("slug").unique().notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    heroImage: text("hero_image"),
    status: text("status").notNull().default("draft"), // draft | published | scheduled
    scheduledDate: timestamp("scheduled_date"),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // SEO fields
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    ogImage: text("og_image"),
    canonicalUrl: text("canonical_url"),

    // Timestamps
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    publishedAt: timestamp("published_at"),
  },
  (table) => [
    index("idx_posts_slug").on(table.slug),
    index("idx_posts_status").on(table.status),
    index("idx_posts_author").on(table.authorId),
  ]
);

// Post versions for history/rollback
export const postVersions = pgTable(
  "post_versions",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    content: text("content").notNull(),
    heroImage: text("hero_image"),

    // SEO fields snapshot
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    ogTitle: text("og_title"),
    ogDescription: text("og_description"),
    ogImage: text("og_image"),

    // Version metadata
    createdAt: timestamp("created_at").notNull().defaultNow(),
    createdBy: text("created_by")
      .notNull()
      .references(() => users.id),
    changeSummary: text("change_summary"),
  },
  (table) => [index("idx_post_versions_post_id").on(table.postId)]
);

// Image uploads tracking
export const postImages = pgTable(
  "post_images",
  {
    id: text("id").primaryKey(),
    postId: text("post_id").references(() => posts.id, { onDelete: "set null" }),
    filename: text("filename").notNull(),
    originalName: text("original_name").notNull(),
    minioKey: text("minio_key").notNull(),
    minioBucket: text("minio_bucket").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    url: text("url").notNull(),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("idx_post_images_post_id").on(table.postId)]
);

// ============================================
// Type Exports
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;

// Blog CMS types
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostVersion = typeof postVersions.$inferSelect;
export type NewPostVersion = typeof postVersions.$inferInsert;
export type PostImage = typeof postImages.$inferSelect;
export type NewPostImage = typeof postImages.$inferInsert;

// Role type for type safety
export type UserRole = "user" | "editor" | "admin";
