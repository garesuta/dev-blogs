import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  loginSchema,
  registerSchema,
  slugSchema,
  postTitleSchema,
  postDescriptionSchema,
  postContentSchema,
  metaDescriptionSchema,
  metaTitleSchema,
  postStatusSchema,
  createPostSchema,
  updatePostSchema,
  autoSavePostSchema,
  postListQuerySchema,
  imageUploadSchema,
  generateSlug,
  getFieldError,
  type LoginFormData,
  type RegisterFormData,
} from '@/lib/validations'

describe('Validation Schemas - Authentication', () => {
  describe('emailSchema', () => {
    it('should accept valid email addresses', () => {
      const result1 = emailSchema.safeParse('user@example.com')
      const result2 = emailSchema.safeParse('test.email+tag@domain.co.uk')

      expect(result1.success).toBe(true)
      expect(result2.success).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      const results = [
        emailSchema.safeParse(''),
        emailSchema.safeParse('invalid'),
        emailSchema.safeParse('@example.com'),
        emailSchema.safeParse('user@'),
      ]

      results.forEach((result) => {
        expect(result.success).toBe(false)
      })
    })

    it('should require email', () => {
      const result = emailSchema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Email is required')
      }
    })
  })

  describe('passwordSchema', () => {
    it('should accept valid passwords', () => {
      const result = passwordSchema.safeParse('password123')
      expect(result.success).toBe(true)
    })

    it('should reject passwords shorter than 8 characters', () => {
      const result = passwordSchema.safeParse('pass12')
      expect(result.success).toBe(false)
    })

    it('should require password', () => {
      const result = passwordSchema.safeParse('')
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required')
      }
    })
  })

  describe('nameSchema', () => {
    it('should accept valid names', () => {
      const result = nameSchema.safeParse('John Doe')
      expect(result.success).toBe(true)
    })

    it('should reject names shorter than 2 characters', () => {
      const result = nameSchema.safeParse('J')
      expect(result.success).toBe(false)
    })

    it('should require name', () => {
      const result = nameSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('loginSchema', () => {
    it('should accept valid login data', () => {
      const data: LoginFormData = {
        email: 'user@example.com',
        password: 'password123',
      }
      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject invalid login data', () => {
      const result = loginSchema.safeParse({
        email: 'invalid',
        password: 'short',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('registerSchema', () => {
    it('should accept valid registration data', () => {
      const data: RegisterFormData = {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      }
      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('should reject mismatched passwords', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'user@example.com',
        password: 'password123',
        confirmPassword: 'password456',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match')
      }
    })
  })
})

describe('Validation Schemas - Blog CMS', () => {
  describe('slugSchema', () => {
    it('should accept valid slugs', () => {
      const validSlugs = [
        'my-post',
        'my-post-title',
        'test123',
        'hello-world-123',
      ]

      validSlugs.forEach((slug) => {
        const result = slugSchema.safeParse(slug)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid slugs', () => {
      const invalidSlugs = [
        '',
        'Invalid_Caps',
        'with spaces',
        'special@characters',
        'double--hyphens',
        '-leading-hyphen',
        'trailing-hyphen-',
        'a'.repeat(201), // Over 200 chars
      ]

      invalidSlugs.forEach((slug) => {
        const result = slugSchema.safeParse(slug)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('postTitleSchema', () => {
    it('should accept valid titles', () => {
      const result = postTitleSchema.safeParse('My Blog Post Title')
      expect(result.success).toBe(true)
    })

    it('should reject titles over 200 characters', () => {
      const result = postTitleSchema.safeParse('a'.repeat(201))
      expect(result.success).toBe(false)
    })
  })

  describe('postDescriptionSchema', () => {
    it('should accept valid descriptions', () => {
      const result = postDescriptionSchema.safeParse('A valid description')
      expect(result.success).toBe(true)
    })

    it('should reject descriptions over 500 characters', () => {
      const result = postDescriptionSchema.safeParse('a'.repeat(501))
      expect(result.success).toBe(false)
    })
  })

  describe('postContentSchema', () => {
    it('should accept non-empty content', () => {
      const result = postContentSchema.safeParse('Some content')
      expect(result.success).toBe(true)
    })

    it('should reject empty content', () => {
      const result = postContentSchema.safeParse('')
      expect(result.success).toBe(false)
    })
  })

  describe('SEO Schemas', () => {
    it('should accept valid meta descriptions', () => {
      const result = metaDescriptionSchema.safeParse('A valid meta description')
      expect(result.success).toBe(true)
    })

    it('should reject meta descriptions over 160 characters', () => {
      const result = metaDescriptionSchema.safeParse('a'.repeat(161))
      expect(result.success).toBe(false)
    })

    it('should accept valid meta titles', () => {
      const result = metaTitleSchema.safeParse('A valid meta title')
      expect(result.success).toBe(true)
    })

    it('should reject meta titles over 70 characters', () => {
      const result = metaTitleSchema.safeParse('a'.repeat(71))
      expect(result.success).toBe(false)
    })
  })

  describe('postStatusSchema', () => {
    it('should accept valid status values', () => {
      const statuses = ['draft', 'published', 'scheduled'] as const

      statuses.forEach((status) => {
        const result = postStatusSchema.safeParse(status)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid status values', () => {
      const result = postStatusSchema.safeParse('invalid')
      expect(result.success).toBe(false)
    })
  })

  describe('createPostSchema', () => {
    const validPostData = {
      title: 'Test Post',
      slug: 'test-post',
      description: 'A test post description',
      content: 'Test content',
      status: 'draft' as const,
    }

    it('should accept valid post data', () => {
      const result = createPostSchema.safeParse(validPostData)
      expect(result.success).toBe(true)
    })

    it('should accept post with all optional fields', () => {
      const fullPostData = {
        ...validPostData,
        heroImage: 'https://example.com/image.jpg',
        categoryId: 'cat-123',
        tagIds: ['tag-1', 'tag-2'],
        metaTitle: 'SEO Title',
        metaDescription: 'SEO Description',
        ogTitle: 'OG Title',
        ogDescription: 'OG Description',
        ogImage: 'https://example.com/og.jpg',
        canonicalUrl: 'https://example.com/canonical',
      }
      const result = createPostSchema.safeParse(fullPostData)
      expect(result.success).toBe(true)
    })

    it('should reject invalid post data', () => {
      const result = createPostSchema.safeParse({
        title: '',
        slug: 'invalid slug',
        description: '',
        content: '',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updatePostSchema', () => {
    it('should accept partial updates', () => {
      const result = updatePostSchema.safeParse({
        title: 'Updated Title',
      })
      expect(result.success).toBe(true)
    })

    it('should accept optimistic locking field', () => {
      const result = updatePostSchema.safeParse({
        title: 'Updated Title',
        expectedUpdatedAt: new Date(),
      })
      expect(result.success).toBe(true)
    })
  })

  describe('autoSavePostSchema', () => {
    it('should accept minimal draft data', () => {
      const result = autoSavePostSchema.safeParse({
        title: 'Draft',
      })
      expect(result.success).toBe(true)
    })

    it('should accept empty fields for auto-save', () => {
      const result = autoSavePostSchema.safeParse({
        title: '',
        content: '',
        description: '',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('postListQuerySchema', () => {
    it('should apply defaults for pagination', () => {
      const result = postListQuerySchema.safeParse({})
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.limit).toBe(20)
        expect(result.data.sortBy).toBe('updatedAt')
        expect(result.data.sortOrder).toBe('desc')
      }
    })

    it('should accept valid query parameters', () => {
      const result = postListQuerySchema.safeParse({
        page: 2,
        limit: 10,
        status: 'published',
        search: 'keyword',
        sortBy: 'createdAt',
        sortOrder: 'asc',
      })
      expect(result.success).toBe(true)
    })

    it('should enforce max limit of 100', () => {
      const result = postListQuerySchema.safeParse({
        limit: 200,
      })
      if (result.success) {
        expect(result.data.limit).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('imageUploadSchema', () => {
    const validImageData = {
      filename: 'image.jpg',
      mimeType: 'image/jpeg' as const,
      sizeBytes: 1024 * 1024, // 1MB
    }

    it('should accept valid image data', () => {
      const result = imageUploadSchema.safeParse(validImageData)
      expect(result.success).toBe(true)
    })

    it('should accept all allowed MIME types', () => {
      const mimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ] as const

      mimeTypes.forEach((mimeType) => {
        const result = imageUploadSchema.safeParse({
          ...validImageData,
          mimeType,
        })
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid MIME types', () => {
      const result = imageUploadSchema.safeParse({
        ...validImageData,
        mimeType: 'application/pdf',
      })
      expect(result.success).toBe(false)
    })

    it('should reject files over 10MB', () => {
      const result = imageUploadSchema.safeParse({
        ...validImageData,
        sizeBytes: 11 * 1024 * 1024, // 11MB
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('Utility Functions', () => {
  describe('getFieldError', () => {
    it('should return error message for existing field error', () => {
      const errors = [
        { path: ['email'], message: 'Invalid email' },
        { path: ['password'], message: 'Password too short' },
      ] as z.ZodIssue[]

      const emailError = getFieldError(errors, 'email')
      expect(emailError).toBe('Invalid email')

      const passwordError = getFieldError(errors, 'password')
      expect(passwordError).toBe('Password too short')
    })

    it('should return undefined for non-existent field', () => {
      const errors = [{ path: ['email'], message: 'Invalid email' }] as z.ZodIssue[]
      const passwordError = getFieldError(errors, 'password')
      expect(passwordError).toBeUndefined()
    })
  })

  describe('generateSlug', () => {
    it('should convert title to slug', () => {
      expect(generateSlug('My Blog Post')).toBe('my-blog-post')
    })

    it('should handle special characters', () => {
      expect(generateSlug('Hello @ World!')).toBe('hello-world')
    })

    it('should handle multiple spaces', () => {
      expect(generateSlug('My    Blog   Post')).toBe('my-blog-post')
    })

    it('should handle leading/trailing spaces', () => {
      expect(generateSlug('  My Blog Post  ')).toBe('my-blog-post')
    })

    it('should handle multiple hyphens', () => {
      expect(generateSlug('My -- Blog --- Post')).toBe('my-blog-post')
    })

    it('should handle leading/trailing hyphens', () => {
      expect(generateSlug('-My Blog Post-')).toBe('my-blog-post')
    })

    it('should handle numbers', () => {
      expect(generateSlug('Top 10 Tips for 2024')).toBe('top-10-tips-for-2024')
    })

    it('should return empty string for empty input', () => {
      expect(generateSlug('')).toBe('')
    })
  })
})
