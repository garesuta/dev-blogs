import { z } from "zod";

// Shared field schemas
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters");

// Form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Helper to get first error for a field from Zod issues
export function getFieldError(
  errors: z.ZodIssue[],
  field: string
): string | undefined {
  const error = errors.find((e) => e.path[0] === field);
  return error?.message;
}

// ============================================
// Blog CMS Validation Schemas
// ============================================

// Slug validation - URL-safe string
export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(200, "Slug must be 200 characters or less")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens only"
  );

// Post title
export const postTitleSchema = z
  .string()
  .min(1, "Title is required")
  .max(200, "Title must be 200 characters or less");

// Post description
export const postDescriptionSchema = z
  .string()
  .min(1, "Description is required")
  .max(500, "Description must be 500 characters or less");

// Post content
export const postContentSchema = z
  .string()
  .min(1, "Content is required");

// SEO meta description (optimal 150-160 chars)
export const metaDescriptionSchema = z
  .string()
  .max(160, "Meta description should be 160 characters or less")
  .optional()
  .nullable();

// SEO meta title (optimal 50-60 chars)
export const metaTitleSchema = z
  .string()
  .max(70, "Meta title should be 70 characters or less")
  .optional()
  .nullable();

// Post status
export const postStatusSchema = z.enum(["draft", "published", "scheduled"]);

// Create post schema
export const createPostSchema = z.object({
  title: postTitleSchema,
  slug: slugSchema,
  description: postDescriptionSchema,
  content: postContentSchema,
  heroImage: z.string().url().optional().nullable(),
  status: postStatusSchema.default("draft"),
  scheduledDate: z.coerce.date().optional().nullable(),
  // Category and tags
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  // SEO fields
  metaTitle: metaTitleSchema,
  metaDescription: metaDescriptionSchema,
  ogTitle: z.string().max(70).optional().nullable(),
  ogDescription: z.string().max(200).optional().nullable(),
  ogImage: z.string().url().optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
});

// Update post schema (all fields optional except what's being updated)
export const updatePostSchema = createPostSchema.partial().extend({
  // updatedAt check for optimistic locking
  expectedUpdatedAt: z.coerce.date().optional(),
});

// Publish post schema
export const publishPostSchema = z.object({
  scheduledDate: z.coerce.date().optional().nullable(),
});

// Auto-save draft schema (minimal validation for drafts)
export const autoSavePostSchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  heroImage: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
});

// Sort options for posts
export const postSortBySchema = z.enum(["updatedAt", "createdAt", "title", "publishedAt"]);
export const sortOrderSchema = z.enum(["asc", "desc"]);

// Post list query params
export const postListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: postStatusSchema.optional(),
  search: z.string().optional(),
  authorId: z.string().optional(),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  sortBy: postSortBySchema.optional().default("updatedAt"),
  sortOrder: sortOrderSchema.optional().default("desc"),
});

// Image upload validation
export const imageUploadSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.enum([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ]),
  sizeBytes: z.number().int().positive().max(10 * 1024 * 1024), // 10MB max
  postId: z.string().optional().nullable(),
});

// Version restore schema
export const restoreVersionSchema = z.object({
  changeSummary: z.string().max(500).optional(),
});

// Blog CMS Types
export type CreatePostData = z.infer<typeof createPostSchema>;
export type UpdatePostData = z.infer<typeof updatePostSchema>;
export type AutoSavePostData = z.infer<typeof autoSavePostSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;

// Helper to generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}
