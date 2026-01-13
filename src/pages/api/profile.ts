import type { APIRoute } from "astro";
import { db } from "../../lib/db";
import { users, posts } from "../../lib/schema";
import { eq, desc, count, and } from "drizzle-orm";

// URL validation helper
function isValidUrl(url: string): boolean {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Username validation helper (alphanumeric and underscores only)
function isValidUsername(username: string): boolean {
  if (!username) return true;
  return /^[a-zA-Z0-9_]+$/.test(username);
}

export const PUT: APIRoute = async ({ request, locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { nickname, bio, website, twitter, github, linkedin, isPublic } =
      body;

    // Validate nickname (optional, max 50 chars)
    if (nickname !== undefined && nickname !== null) {
      if (typeof nickname !== "string") {
        return new Response(
          JSON.stringify({ error: "Nickname must be a string" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (nickname.length > 50) {
        return new Response(
          JSON.stringify({
            error: "Nickname must be 50 characters or less",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Validate bio (optional, max 500 chars)
    if (bio !== undefined && bio !== null) {
      if (typeof bio !== "string") {
        return new Response(
          JSON.stringify({ error: "Bio must be a string" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      if (bio.length > 500) {
        return new Response(
          JSON.stringify({ error: "Bio must be 500 characters or less" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Validate website URL
    if (website && !isValidUrl(website)) {
      return new Response(
        JSON.stringify({ error: "Website must be a valid URL" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate social usernames
    if (twitter && !isValidUsername(twitter)) {
      return new Response(
        JSON.stringify({
          error: "Twitter username can only contain letters, numbers, and underscores",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (github && !isValidUsername(github)) {
      return new Response(
        JSON.stringify({
          error: "GitHub username can only contain letters, numbers, and underscores",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (linkedin && !isValidUsername(linkedin)) {
      return new Response(
        JSON.stringify({
          error: "LinkedIn username can only contain letters, numbers, and underscores",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate isPublic
    if (isPublic !== undefined && typeof isPublic !== "boolean") {
      return new Response(
        JSON.stringify({ error: "isPublic must be a boolean" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Update user profile
    const [updatedUser] = await db
      .update(users)
      .set({
        nickname: nickname?.trim() || null,
        bio: bio?.trim() || null,
        website: website?.trim() || null,
        twitter: twitter?.trim() || null,
        github: github?.trim() || null,
        linkedin: linkedin?.trim() || null,
        isPublic: isPublic ?? false,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        name: users.name,
        nickname: users.nickname,
        email: users.email,
        bio: users.bio,
        website: users.website,
        twitter: users.twitter,
        github: users.github,
        linkedin: users.linkedin,
        isPublic: users.isPublic,
      });

    return new Response(
      JSON.stringify({
        success: true,
        user: updatedUser,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update profile" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Fetch user profile
    const [profile] = await db
      .select({
        id: users.id,
        name: users.name,
        nickname: users.nickname,
        email: users.email,
        image: users.image,
        bio: users.bio,
        website: users.website,
        twitter: users.twitter,
        github: users.github,
        linkedin: users.linkedin,
        coverImage: users.coverImage,
        isPublic: users.isPublic,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    // Fetch post count for user
    const [postCountResult] = await db
      .select({ count: count() })
      .from(posts)
      .where(
        and(eq(posts.authorId, user.id), eq(posts.status, "published"))
      );

    // Fetch recent posts (last 5 published)
    const recentPosts = await db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        publishedAt: posts.publishedAt,
        createdAt: posts.createdAt,
      })
      .from(posts)
      .where(
        and(eq(posts.authorId, user.id), eq(posts.status, "published"))
      )
      .orderBy(desc(posts.publishedAt))
      .limit(5);

    return new Response(
      JSON.stringify({
        ...profile,
        stats: {
          postCount: postCountResult?.count || 0,
        },
        recentPosts,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Profile fetch error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch profile" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
