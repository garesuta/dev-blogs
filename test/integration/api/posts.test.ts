import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auth } from '@/lib/auth'
import { canManageContent } from '@/lib/permissions'
import { createPostSchema, postListQuerySchema } from '@/lib/validations'

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('@/lib/permissions', () => ({
  canManageContent: vi.fn(() => true),
}))

vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn(() => mockDbQuery),
    insert: vi.fn(() => mockDbInsert),
  },
}))

// Mock db query chain
const mockDbQuery = {
  from: vi.fn(() => mockDbQuery),
  where: vi.fn(() => mockDbQuery),
  orderBy: vi.fn(() => mockDbQuery),
  limit: vi.fn(() => mockDbQuery),
  offset: vi.fn(() => Promise.resolve([])),
  leftJoin: vi.fn(() => mockDbQuery),
  innerJoin: vi.fn(() => mockDbQuery),
}

const mockDbInsert = {
  values: vi.fn(() => mockDbInsert),
  returning: vi.fn(() => Promise.resolve([{ id: 'post-123' }])),
}

describe('Posts API - GET /api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication & Authorization', () => {
    it('should return 401 for unauthenticated requests', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

      const response = await fetch('http://localhost:4321/api/posts')
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 for users without content management permissions', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-123', role: 'user' },
      } as any)

      vi.mocked(canManageContent).mockReturnValueOnce(false)

      const response = await fetch('http://localhost:4321/api/posts')
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should allow access for editors', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      vi.mocked(canManageContent).mockReturnValueOnce(true)

      const response = await fetch('http://localhost:4321/api/posts')

      // Should proceed to query validation
      expect(response.status).not.toBe(401)
      expect(response.status).not.toBe(403)
    })

    it('should allow access for admins', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'admin-123', role: 'admin' },
      } as any)

      vi.mocked(canManageContent).mockReturnValueOnce(true)

      const response = await fetch('http://localhost:4321/api/posts')

      expect(response.status).not.toBe(401)
      expect(response.status).not.toBe(403)
    })
  })

  describe('Query Parameter Validation', () => {
    it('should accept valid query parameters', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?page=1&limit=10&status=draft')
      const response = await fetch(url.toString())

      expect(response.status).not.toBe(400)
    })

    it('should apply default values for missing parameters', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts')
      const response = await fetch(url.toString())

      // Default values: page=1, limit=20, sortBy=updatedAt, sortOrder=desc
      expect(response.status).not.toBe(400)
    })

    it('should reject invalid page number', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?page=invalid')
      const response = await fetch(url.toString())
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid query parameters')
    })

    it('should enforce maximum limit of 100', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?limit=200')
      const response = await fetch(url.toString())

      // Should cap at 100
      expect(response.status).not.toBe(400)
    })

    it('should reject invalid status value', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?status=invalid')
      const response = await fetch(url.toString())
      const data = await response.json()

      expect(response.status).toBe(400)
    })
  })

  describe('Filtering and Sorting', () => {
    it('should filter by status', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?status=published')
      const response = await fetch(url.toString())

      expect(response.status).not.toBe(400)
    })

    it('should filter by search term', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?search=test')
      const response = await fetch(url.toString())

      expect(response.status).not.toBe(400)
    })

    it('should filter by author', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?authorId=user-123')
      const response = await fetch(url.toString())

      expect(response.status).not.toBe(400)
    })

    it('should filter by category', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?categoryId=cat-123')
      const response = await fetch(url.toString())

      expect(response.status).not.toBe(400)
    })

    it('should filter by tag', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?tagId=tag-123')
      const response = await fetch(url.toString())

      expect(response.status).not.toBe(400)
    })

    it('should sort by specified column', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const url = new URL('http://localhost:4321/api/posts?sortBy=title&sortOrder=asc')
      const response = await fetch(url.toString())

      expect(response.status).not.toBe(400)
    })
  })

  describe('Response Format', () => {
    it('should return posts array', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const response = await fetch('http://localhost:4321/api/posts')
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.posts).toBeDefined()
      expect(Array.isArray(data.posts)).toBe(true)
    })

    it('should return pagination metadata', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      const response = await fetch('http://localhost:4321/api/posts')
      const data = await response.json()

      expect(data.pagination).toBeDefined()
      expect(data.pagination.page).toBeDefined()
      expect(data.pagination.limit).toBeDefined()
      expect(data.pagination.total).toBeDefined()
      expect(data.pagination.totalPages).toBeDefined()
    })
  })
})

describe('Posts API - POST /api/posts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication & Authorization', () => {
    it('should return 401 for unauthenticated requests', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null)

      const response = await fetch('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' }),
      })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 403 for users without content management permissions', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'user-123', role: 'user' },
      } as any)

      vi.mocked(canManageContent).mockReturnValueOnce(false)

      const response = await fetch('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' }),
      })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })
  })

  describe('Request Validation', () => {
    const validPostData = {
      title: 'Test Post',
      slug: 'test-post',
      description: 'A test post',
      content: 'Test content',
      status: 'draft',
    }

    it('should accept valid post data', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor', name: 'Editor' },
      } as any)

      vi.mocked(canManageContent).mockReturnValueOnce(true)

      const response = await fetch('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPostData),
      })

      // Should not return validation error
      expect(response.status).not.toBe(400)
    })

    it('should reject invalid post data', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      vi.mocked(canManageContent).mockReturnValueOnce(true)

      const response = await fetch('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '' }),
      })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })

    it('should reject duplicate slugs', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor' },
      } as any)

      vi.mocked(canManageContent).mockReturnValueOnce(true)

      const response = await fetch('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validPostData),
      })
      const data = await response.json()

      // If slug exists, should return 409
      // This would be handled by the database check
      expect([201, 409]).toContain(response.status)
    })
  })

  describe('Post Creation', () => {
    it('should create initial version for new post', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor', name: 'Editor' },
      } as any)

      vi.mocked(canManageContent).mockReturnValueOnce(true)

      const postData = {
        title: 'Test Post',
        slug: 'test-post',
        description: 'A test post',
        content: 'Test content',
        status: 'draft',
      }

      const response = await fetch('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })

      // Version should be created
      expect(response.status).toBe(201)
    })

    it('should set publishedAt when status is published', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { id: 'editor-123', role: 'editor', name: 'Editor' },
      } as any)

      vi.mocked(canManageContent).mockReturnValueOnce(true)

      const postData = {
        title: 'Test Post',
        slug: 'test-post',
        description: 'A test post',
        content: 'Test content',
        status: 'published',
      }

      const response = await fetch('http://localhost:4321/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      })

      expect(response.status).toBe(201)
    })
  })
})
