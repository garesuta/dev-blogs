# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Build production site to ./dist/
pnpm preview      # Preview production build locally
pnpm eslint .     # Run ESLint on all files
```

### Database (Drizzle + Neon)

```bash
pnpm drizzle-kit generate   # Generate migrations from schema changes
pnpm drizzle-kit migrate    # Apply migrations to database
pnpm drizzle-kit push       # Push schema directly (dev only)
pnpm drizzle-kit studio     # Open Drizzle Studio GUI
```

Requires `DATABASE_URL` in `.env` file pointing to Neon PostgreSQL.

## Architecture

This is an Astro blog with SSR (Node.js adapter) using Vue components, MDX content, and Drizzle ORM for database access.

**Styling:** Bootstrap 5.3 (loaded globally via CDN). See `docs/ADR/001-bootstrap-first-styling.md` for guidelines.

**Key integrations:**
- `@astrojs/vue` - Vue 3 components in `.vue` files
- `@astrojs/mdx` - MDX support for blog posts
- `@astrojs/node` - Server-side rendering (standalone mode)
- `better-auth` - Authentication
- `drizzle-orm` + `@neondatabase/serverless` - PostgreSQL database

**Content collections:**
- Blog posts in `src/content/blog/` as `.md` or `.mdx` files
- Schema defined in `src/content.config.ts` with Zod validation
- Frontmatter requires: `title`, `description`, `pubDate`; optional: `updatedDate`, `heroImage`

**Site constants:**
- Global config in `src/consts.ts` (SITE_TITLE, SITE_DESCRIPTION)

**Database schema:**
- Located at `src/lib/schema.ts` (referenced by drizzle.config.ts)
- Migrations output to `./drizzle/`

## Authentication (Better Auth)

**Configuration files:**
- `src/lib/auth.ts` - Server-side Better Auth configuration
- `src/lib/auth-client.ts` - Client-side auth for Vue components
- `src/lib/permissions.ts` - RBAC role and permission definitions
- `src/middleware.ts` - Route protection middleware

**Auth routes:**
- `/login` - Sign in with email/password or Google
- `/register` - Create new account
- `/profile` - User profile (requires auth)
- `/admin/*` - Admin panel (requires admin role)
- `/editor/*` - Content editor (requires editor or admin role)
- `/403` - Access denied page
- `/banned` - Account suspended page

**API endpoints:**
- `/api/auth/*` - Better Auth API handler (handles all auth operations)

**Roles:**
- `user` - Default role, can view content
- `editor` - Can manage blog content
- `admin` - Full access including user management

**Environment variables required:**
```env
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=http://localhost:4321
PUBLIC_BETTER_AUTH_URL=http://localhost:4321
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
SESSION_EXPIRY_DAYS=7
```

**First admin setup:**
After creating your account, run SQL to promote yourself:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
