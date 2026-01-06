# Project Context: Astro Blog with Drizzle & Vue

## Project Overview
This is a server-side rendered (SSR) blog application built with **Astro**. It uses **Vue.js** for interactive components, **Drizzle ORM** with a **Neon (PostgreSQL)** database for data persistence, and **Better Auth** for authentication. Content is managed via Markdown/MDX files using Astro's Content Collections.

## Architecture & Stack

### Core Framework
*   **Astro:** Main web framework (v5). Configured for SSR using `@astrojs/node`.
*   **Language:** TypeScript is used throughout the project (`tsconfig.json`).
*   **Package Manager:** `pnpm`.

### Frontend
*   **Components:** Vue.js 3 (`.vue` files) integrated via `@astrojs/vue`.
*   **Styling:** Global CSS (`src/styles/global.css`) and component-scoped styles.
*   **Content:** Blog posts are stored as `.md` or `.mdx` files in `src/content/blog/`.

### Backend & Data
*   **Adapter:** `@astrojs/node` for running the Astro server in a Node.js environment.
*   **Database:** PostgreSQL (Neon) accessed via **Drizzle ORM**.
*   **Authentication:** `better-auth`.
*   **Validation:** `zod` is used for content collection schemas.

## Key Files and Directories

| Path | Description |
| :--- | :--- |
| `src/pages/` | File-based routing. Contains `.astro` pages and API endpoints. |
| `src/components/` | Reusable UI components (Astro and Vue). |
| `src/content/blog/` | Markdown/MDX source files for blog posts. |
| `src/content.config.ts` | Definition and schema validation for content collections. |
| `src/lib/db.ts` | Database connection initialization. |
| `src/lib/schema.ts` | Drizzle ORM schema definitions (tables, relations). |
| `astro.config.mjs` | Astro configuration (integrations, adapters). |
| `drizzle.config.ts` | Configuration for Drizzle Kit (migrations). |
| `package.json` | Project dependencies and scripts. |

## Development Workflow

### Prerequisites
*   Node.js (LTS recommended)
*   pnpm

### Common Commands

**General:**
*   `pnpm install`: Install dependencies.
*   `pnpm dev`: Start the local development server at `http://localhost:4321`.
*   `pnpm build`: Build the project for production (output to `./dist/`).
*   `pnpm preview`: Preview the production build locally.
*   `pnpm eslint .`: Run the linter.

**Database (Drizzle):**
*   `pnpm drizzle-kit generate`: Generate SQL migrations based on changes in `src/lib/schema.ts`.
*   `pnpm drizzle-kit migrate`: Apply migrations to the database.
*   `pnpm drizzle-kit push`: Push schema changes directly to the DB (prototyping only).
*   `pnpm drizzle-kit studio`: Open the Drizzle Studio GUI to manage data.

### Configuration
*   **Environment Variables:** Create a `.env` file for secrets (e.g., `DATABASE_URL` for Neon).
*   **Site Constants:** Global site metadata (title, description) is located in `src/consts.ts`.

## Data Models

### Database (`src/lib/schema.ts`)
*   **Users:** `id` (serial), `name` (text), `email` (text, unique), `createdAt` (timestamp).

### Content Collections (`src/content.config.ts`)
*   **Blog:**
    *   `title` (string)
    *   `description` (string)
    *   `pubDate` (date)
    *   `updatedDate` (date, optional)
    *   `heroImage` (image, optional)
