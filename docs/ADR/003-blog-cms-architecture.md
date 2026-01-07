# ADR-003: Blog CMS Architecture

**Status:** Accepted
**Date:** 2026-01-07
**Decision Makers:** Project Team / Claude Agent

---

## Context

The project needed a content management system (CMS) for blog posts that allows Admin and Editor roles to create, edit, and publish content without touching the codebase directly.

Options considered:
1. **File-based MDX only** - Continue editing MDX files directly in the codebase
2. **Full database-driven blog** - Store all content in PostgreSQL, read from DB
3. **Hybrid approach** - Store drafts in DB, generate MDX files on publish

---

## Decision

**Hybrid approach: Database for drafts and metadata, MDX files for published content.**

### Implementation

The CMS uses a hybrid storage model:

```
┌─────────────────┐     Publish     ┌─────────────────┐
│   PostgreSQL    │ ──────────────▶ │   MDX Files     │
│                 │                 │                 │
│ - Drafts        │                 │ - Published     │
│ - Versions      │  ◀──────────── │   content       │
│ - Metadata      │    Unpublish    │                 │
└─────────────────┘                 └─────────────────┘
```

**Key Components:**
- Toast UI Editor for rich markdown editing
- MinIO (S3-compatible) for image storage via presigned URLs
- Version history with full content snapshots
- Auto-save with optimistic locking

**Database Tables:**
```typescript
// Posts table - drafts and metadata
posts: {
  id, slug, title, description, content,
  status, // draft | published | scheduled
  scheduledDate, authorId,
  metaTitle, metaDescription, ogTitle, ogDescription, ogImage, canonicalUrl,
  createdAt, updatedAt, publishedAt
}

// Version history
post_versions: {
  id, postId, versionNumber,
  title, description, content, // Full snapshot
  createdAt, createdBy, changeSummary
}

// Image tracking
post_images: {
  id, postId, filename, minioKey, url,
  uploadedBy, createdAt
}
```

**Packages/Dependencies:**
- `@toast-ui/editor` - Rich markdown editor
- `minio` - S3-compatible storage client
- `nanoid` - Unique ID generation

---

## Rationale

### Pros
1. **Astro content collections preserved** - Published posts use native Astro content collections with full SSG benefits
2. **Rich editing experience** - WYSIWYG editing without learning markdown syntax
3. **Version history** - Full rollback capability for all changes
4. **SEO control** - Custom slugs, meta descriptions, Open Graph tags
5. **Offline-safe** - Published MDX files work without database

### Cons
1. **Two sources of truth** - Draft in DB, published in file system
2. **File system dependency** - Requires write access to generate MDX files
3. **Build required** - Changes require Astro rebuild to appear (in production)

---

## Consequences

### Must Do
- Configure MinIO environment variables before using image upload
- Run database migration before using CMS
- Set `BETTER_AUTH_SECRET` for production
- Ensure file system write access for MDX generation

### Must Not Do
- Edit published MDX files directly (use CMS to maintain version history)
- Skip version creation on saves
- Upload images without authentication

### Guidelines

```typescript
// Good: Create post through API
const response = await fetch('/api/posts', {
  method: 'POST',
  body: JSON.stringify({ title, slug, description, content })
});

// Good: Use presigned URLs for image upload
const { presignedUrl } = await fetch('/api/upload/presign').then(r => r.json());
await fetch(presignedUrl, { method: 'PUT', body: imageBlob });

// Bad: Edit MDX files directly
fs.writeFileSync('src/content/blog/my-post.mdx', content);

// Bad: Bypass version history
await db.update(posts).set({ content });  // Missing version creation
```

---

## Future Considerations

1. **Real-time preview** - WebSocket-based live preview without page refresh
2. **Scheduled publisher** - Background job to publish scheduled posts
3. **Media library** - Centralized image management with gallery view
4. **CDN integration** - Put CDN in front of MinIO for better performance
5. **Collaborative editing** - Real-time collaboration with conflict resolution

---

## References

- [Toast UI Editor](https://ui.toast.com/tui-editor/)
- [MinIO JavaScript SDK](https://docs.min.io/community/minio-object-store/developers/javascript/quickstart.html)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Implementation Plan](../plan/2026/01/2026_01_07_1430__admin_blog_cms.md)
