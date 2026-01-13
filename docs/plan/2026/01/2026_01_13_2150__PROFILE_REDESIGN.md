# Feature: Profile Page Redesign

## 1. Overview

- **Goal**: Transform the profile page into a modern, actionable author profile with social features and content management
- **Value**: Increase user engagement, enable author discovery, and provide content creators with visibility into their blog activity
- **In Scope**:
  - Bio & social links
  - Author stats (post count, total views)
  - Recent posts list
  - Profile visibility settings (public/private)
  - Public author page
- **Out of Scope**:
  - Follower/following system
  - Direct messaging
  - Profile themes/customization
  - Achievement badges

## 2. Requirements Summary

| Requirement | Detail | Priority |
|-------------|--------|----------|
| Bio field | Rich text bio (max 500 chars) | P0 |
| Social links | Twitter, GitHub, LinkedIn, Website | P0 |
| Author stats | Post count, total views | P0 |
| Recent posts | List of user's published posts | P0 |
| Visibility toggle | Public/private profile setting | P1 |
| Public author page | `/author/[username]` route | P1 |
| Cover image | Optional profile banner | P2 |

## 3. Architecture & Design

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Profile Page Layout                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Profile Header (Cover + Avatar)         │    │
│  │  - Cover image (optional)                           │    │
│  │  - Avatar + Name + Nickname                         │    │
│  │  - Bio                                              │    │
│  │  - Social links                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │   Stats Card     │  │      Main Content Area          │  │
│  │  - Posts count   │  │  ┌────────────────────────────┐│  │
│  │  - Total views   │  │  │    Edit Profile Form       ││  │
│  │  - Member since  │  │  │  - Nickname                ││  │
│  ├──────────────────┤  │  │  - Bio                     ││  │
│  │  Quick Actions   │  │  │  - Social links            ││  │
│  │  - Home          │  │  │  - Visibility toggle       ││  │
│  │  - My Posts      │  │  └────────────────────────────┘│  │
│  │  - New Post      │  │                                │  │
│  │  - Editor        │  │  ┌────────────────────────────┐│  │
│  │  - Admin         │  │  │    Recent Posts List       ││  │
│  └──────────────────┘  │  │  - Post cards with stats   ││  │
│                        │  └────────────────────────────┘│  │
│                        └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User navigates to `/profile`
2. Server fetches user data + posts + stats
3. Page renders with editable profile form
4. User updates profile → API call → DB update
5. Public profile accessible at `/author/[id]`

### Data Model & Migration

**Schema Changes** (Add to users table):

```sql
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN website TEXT;
ALTER TABLE users ADD COLUMN twitter TEXT;
ALTER TABLE users ADD COLUMN github TEXT;
ALTER TABLE users ADD COLUMN linkedin TEXT;
ALTER TABLE users ADD COLUMN cover_image TEXT;
ALTER TABLE users ADD COLUMN is_public BOOLEAN DEFAULT false;
```

**Migration Strategy**: Expand-only (backward compatible)
- All new columns are nullable
- No data migration needed
- Rollback: Remove columns if needed

## 4. Implementation Steps

### Phase 1: Database & API (P0)

- [ ] **1.1** Add new fields to users schema in `src/lib/schema.ts`
  - bio (text, nullable)
  - website, twitter, github, linkedin (text, nullable)
  - coverImage (text, nullable)
  - isPublic (boolean, default false)
- [ ] **1.2** Generate and apply migration
- [ ] **1.3** Update `/api/profile` endpoint to handle new fields
  - GET: Return all profile fields
  - PUT: Validate and update profile fields

### Phase 2: Profile Editor Enhancement (P0)

- [ ] **2.1** Update `ProfileEditor.vue` component
  - Add bio textarea with character counter
  - Add social links inputs (website, twitter, github, linkedin)
  - Add visibility toggle switch
- [ ] **2.2** Add form validation
  - Bio max 500 chars
  - URL validation for social links
  - Twitter/GitHub username format validation

### Phase 3: Profile Page Redesign (P0)

- [ ] **3.1** Update profile header section
  - Display bio below name
  - Show social links as icon buttons
  - Add cover image support (with upload)
- [ ] **3.2** Create Author Stats component
  - Fetch post count for user
  - Calculate total views (sum of post views)
  - Display in card format
- [ ] **3.3** Create Recent Posts component
  - Fetch user's last 5 published posts
  - Show title, date, view count
  - Link to edit and view

### Phase 4: Public Author Page (P1)

- [ ] **4.1** Create `/author/[id].astro` route
  - Fetch user by ID (only if isPublic=true)
  - Display read-only profile info
  - List all published posts
- [ ] **4.2** Add "View Public Profile" button to profile page
- [ ] **4.3** Add author link to blog post pages

### Phase 5: Polish (P2)

- [ ] **5.1** Cover image upload functionality
- [ ] **5.2** Image cropping/preview
- [ ] **5.3** SEO meta tags for public author pages

## 5. UI Components

### Stats Card

```
┌─────────────────────────┐
│  📊 Your Stats          │
├─────────────────────────┤
│  ┌─────┐ ┌─────┐       │
│  │  12 │ │ 1.2K│       │
│  │Posts│ │Views│       │
│  └─────┘ └─────┘       │
│                        │
│  Member since Jan 2026 │
└────────────────────────┘
```

### Social Links Row

```
┌──────────────────────────────────────┐
│  🌐  🐦  📱  💼                      │
│  (website) (twitter) (github) (linkedin)
└──────────────────────────────────────┘
```

### Recent Posts Card

```
┌─────────────────────────────────────────┐
│  📝 Your Recent Posts                   │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐   │
│  │ Post Title Here                  │   │
│  │ Jan 10, 2026 · 245 views        │   │
│  │ [Edit] [View]                    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Another Post Title               │   │
│  │ Jan 8, 2026 · 189 views         │   │
│  │ [Edit] [View]                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [View All Posts →]                     │
└─────────────────────────────────────────┘
```

## 6. API Endpoints

### GET /api/profile

Returns full profile data including stats.

```json
{
  "id": "user_123",
  "name": "John Doe",
  "nickname": "johnd",
  "email": "john@example.com",
  "bio": "Full-stack developer...",
  "website": "https://johnd.dev",
  "twitter": "johndoe",
  "github": "johndoe",
  "linkedin": "johndoe",
  "coverImage": "https://...",
  "isPublic": true,
  "stats": {
    "postCount": 12,
    "totalViews": 1234
  },
  "recentPosts": [...]
}
```

### PUT /api/profile

Updates profile fields.

```json
{
  "nickname": "johnd",
  "bio": "Updated bio...",
  "website": "https://johnd.dev",
  "twitter": "johndoe",
  "github": "johndoe",
  "linkedin": "johndoe",
  "isPublic": true
}
```

## 7. File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/schema.ts` | Modify | Add new profile fields to users |
| `src/pages/api/profile.ts` | Modify | Handle new fields, add stats |
| `src/components/ProfileEditor.vue` | Modify | Add bio, social links, visibility |
| `src/pages/profile.astro` | Modify | New layout with stats & posts |
| `src/components/AuthorStats.vue` | Create | Stats display component |
| `src/components/RecentPosts.vue` | Create | User's posts list |
| `src/pages/author/[id].astro` | Create | Public author page |
| `drizzle/XXXX_profile_fields.sql` | Create | Migration file |

## 8. Testing Strategy

| Type | Coverage | Focus |
|------|----------|-------|
| Unit | ProfileEditor | Form validation, API calls |
| Integration | API endpoints | CRUD operations |
| E2E | Profile flow | Edit → Save → View |
| Manual | UI/UX | Responsive, accessibility |

## 9. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Profile completion | 50% users add bio | DB query |
| Public profiles | 30% opt-in | DB query |
| Author page visits | Track views | Analytics |

## 10. Rollback Plan

1. Feature is additive (new columns)
2. Old profile still works without new fields
3. Can hide new UI via CSS/conditional render
4. Migration is non-destructive

## 11. Timeline Estimate

| Phase | Tasks | Priority |
|-------|-------|----------|
| Phase 1 | Database & API | P0 |
| Phase 2 | Profile Editor | P0 |
| Phase 3 | Page Redesign | P0 |
| Phase 4 | Public Author Page | P1 |
| Phase 5 | Polish | P2 |

---

## Next Steps

1. Review and approve this plan
2. Begin Phase 1: Database schema changes
3. Iterate on UI design during implementation
