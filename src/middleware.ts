import { defineMiddleware } from "astro:middleware";
import { auth } from "./lib/auth";
import type { UserRole } from "./lib/schema";

// Routes that require authentication
const protectedRoutes = ["/admin", "/editor", "/profile"];

// Routes that require specific roles
const roleRoutes: Record<string, UserRole[]> = {
  "/admin": ["admin"],
  "/editor": ["admin", "editor"],
};

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // Get session from Better Auth
  const session = await auth.api.getSession({
    headers: context.request.headers,
  });

  // Debug: Log session info for protected routes
  if (pathname.startsWith("/editor") || pathname.startsWith("/admin")) {
    const rawRole = session?.user?.role;
    const normalizedRole = ((rawRole as string) || "user").toLowerCase();
    console.log("[Auth Debug]", {
      pathname,
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      rawRole,
      normalizedRole,
    });
  }

  // Set user and session in locals
  context.locals.user = session?.user ?? null as any;
  context.locals.session = session?.session ?? null as any;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Redirect to login if not authenticated
    if (!session?.user) {
      const loginUrl = new URL("/login", context.url.origin);
      loginUrl.searchParams.set("redirect", pathname);
      return context.redirect(loginUrl.toString());
    }

    // Check if user is banned
    if (session.user.banned) {
      return context.redirect("/banned");
    }

    // Check role-based access (normalize to lowercase for case-insensitive comparison)
    const userRole = ((session.user.role as string) || "user").toLowerCase() as UserRole;

    for (const [routePrefix, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(routePrefix)) {
        if (!allowedRoles.includes(userRole)) {
          return context.redirect("/403");
        }
        break;
      }
    }
  }

  return next();
});
