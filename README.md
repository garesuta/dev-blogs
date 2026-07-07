# Astro Blog with CMS

Astro blog with server-side rendering, Vue 3 islands, a database-backed CMS, and role-based authentication.

## Stack

- **Astro 7** (SSR, Node.js adapter) + **Vue 3** components
- **Better Auth** — email/password + Google OAuth, RBAC (`user` / `editor` / `admin`)
- **Drizzle ORM** + **Neon PostgreSQL**
- **Bootstrap 5.3** styling, MDX support, Tiptap rich-text editor
- **Vitest** for unit/component/integration tests

## Getting Started

```sh
pnpm install
cp .env.example .env   # or create .env — see Environment below
pnpm dev               # http://localhost:4321
```

### Environment

```env
DATABASE_URL=<neon-postgres-connection-string>
BETTER_AUTH_SECRET=<random-32-char-string>
BETTER_AUTH_URL=http://localhost:4321
PUBLIC_BETTER_AUTH_URL=http://localhost:4321
GOOGLE_CLIENT_ID=<from-google-console>      # optional, for Google login
GOOGLE_CLIENT_SECRET=<from-google-console>  # optional
```

### First admin

Accounts sign up with the `user` role. Promote the first admin directly in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

After that, manage roles from `/admin/users`.

## Content Management

| Route | Access | Purpose |
| :---- | :----- | :------ |
| `/editor` | editor, admin | Content dashboard |
| `/editor/posts` | editor, admin | Post list, create/edit/preview/version history |
| `/admin/users` | admin | User roles and bans |
| `/admin/taxonomy` | admin | Categories and tags |
| `/admin/about` | admin | About page content |
| `/admin/settings` | admin | Site title, description, social links, footer text |

Site-wide details (header GitHub icon, footer blurb, social links) are stored in the `site_settings` table and editable at `/admin/settings` — no code changes needed.

## Commands

| Command | Action |
| :------ | :----- |
| `pnpm dev` | Dev server at `localhost:4321` |
| `pnpm build` | Production build to `./dist/` |
| `pnpm preview` | Preview production build |
| `pnpm eslint .` | Lint (`--fix` to auto-fix) |
| `pnpm astro check` | Type-check `.astro`/`.ts`/`.vue` files |
| `pnpm test` | Tests in watch mode |
| `pnpm test:run` | Tests once |
| `pnpm test:coverage` | Coverage report |
| `pnpm drizzle-kit generate` | Generate migrations from schema changes |
| `pnpm drizzle-kit migrate` | Apply migrations |
| `pnpm drizzle-kit studio` | Database GUI |

## Project Structure

```text
├── src/
│   ├── components/       # Vue + Astro components (editor/ has Tiptap modules)
│   ├── composables/      # Vue composables (search, history, related articles)
│   ├── content/blog/     # Legacy markdown posts (live posts come from the DB)
│   ├── layouts/          # BlogPost, AdminLayout
│   ├── lib/              # auth, db, schema, permissions, site-settings
│   ├── pages/            # Routes: blog, editor, admin, api
│   ├── middleware.ts     # Route protection + CSP header
│   └── styles/           # Global CSS + cyber theme
├── test/                 # Vitest: unit, components, integration
└── drizzle/              # Generated migrations
```

## Credit

Started from the Astro blog template, based on [Bear Blog](https://github.com/HermanMartinus/bearblog/).

---

change the claude subscription key and url in `hobbyproject/local_scripts/switch_claude.sh`

```sh
# API mode
source switch_claude.sh api

# Subscription mode
source switch_claude.sh sub
```
