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
