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

  // Astro island hydration relies on inline scripts that we can't attach a
  // nonce to, so 'unsafe-inline' is required for script-src.
  const csp = `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'self'`;

  // Process the request
  const response = await processRequest(context, next, session, pathname);
  response.headers.set('Content-Security-Policy', csp);
  return response;
});

async function processRequest(
  context: any,
  next: () => Promise<Response>,
  session: any,
  pathname: string
): Promise<Response> {
  // Debug: Log session info for protected routes (only in development)
  if (pathname.startsWith("/editor") || pathname.startsWith("/admin")) {
    const rawRole = session?.user?.role;
    const normalizedRole = ((rawRole as string) || "user").toLowerCase();
    if (import.meta.env.DEV) {
      console.log("[Auth Debug]", {
        pathname,
        hasSession: !!session,
        userId: session?.user?.id,
        rawRole,
        normalizedRole,
      });
    }
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
}
