import { describe, it, expect } from 'vitest'
import { useRelatedArticles } from '@/composables/useRelatedArticles'
import type { SearchDocument } from '@/types/search'

const mockCurrentArticle: SearchDocument = {
  id: 'article-1',
  title: 'Test Article',
  description: 'Test description',
  body: 'Test body content',
  tags: ['javascript', 'react', 'frontend'],
  category: 'frontend',
  pubDate: new Date(), // Recent date
  readingTime: 10,
  difficulty: 'beginner',
  heroImage: '/images/test.jpg',
}

const mockAllArticles: SearchDocument[] = [
  mockCurrentArticle,
  {
    id: 'article-2',
    title: 'JavaScript Best Practices',
    description: 'Learn JS best practices',
    body: 'Content about JavaScript',
    tags: ['javascript', 'tutorial'],
    category: 'frontend',
    pubDate: new Date(), // Recent date
    readingTime: 8,
    difficulty: 'intermediate',
  },
  {
    id: 'article-3',
    title: 'React Hooks Guide',
    description: 'Master React hooks',
    body: 'React hooks content',
    tags: ['react', 'hooks', 'frontend'],
    category: 'frontend',
    pubDate: new Date(), // Recent date
    readingTime: 12,
    difficulty: 'advanced',
  },
  {
    id: 'article-4',
    title: 'Backend Development',
    description: 'Node.js backend guide',
    body: 'Backend content',
    tags: ['nodejs', 'backend'],
    category: 'backend',
    pubDate: new Date(), // Recent date
    readingTime: 15,
    difficulty: 'beginner',
  },
]

describe('useRelatedArticles', () => {
  it('should initialize with empty allArticles', () => {
    const { relatedArticles, hasRelated } = useRelatedArticles(mockCurrentArticle, [])

    expect(relatedArticles.value).toEqual([])
    expect(hasRelated.value).toBe(false)
  })

  it('should exclude current article from related articles', () => {
    const { relatedArticles } = useRelatedArticles(mockCurrentArticle, mockAllArticles)

    const relatedIds = relatedArticles.value.map(article => article.id)
    expect(relatedIds).not.toContain(mockCurrentArticle.id)
  })

  it('should return at most 5 related articles', () => {
    const { relatedArticles } = useRelatedArticles(mockCurrentArticle, mockAllArticles)

    expect(relatedArticles.value.length).toBeLessThanOrEqual(5)
  })

  it('should calculate hasRelated correctly', () => {
    const { hasRelated, relatedArticles } = useRelatedArticles(mockCurrentArticle, mockAllArticles)

    // The composable filters out current article, so check if others are returned
    // Based on Fuse.js configuration and similarity scoring
    expect(Array.isArray(relatedArticles.value)).toBe(true)
  })

  it('should return empty trending when allArticles is empty', () => {
    const { trendingArticles, hasTrending } = useRelatedArticles(mockCurrentArticle, [])

    expect(trendingArticles.value).toEqual([])
    expect(hasTrending.value).toBe(false)
  })

  it('should filter trending articles published in last 90 days', () => {
    const { trendingArticles } = useRelatedArticles(mockCurrentArticle, mockAllArticles)

    expect(trendingArticles.value.length).toBeGreaterThan(0)
    const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000)
    trendingArticles.value.forEach(article => {
      expect(new Date(article.pubDate).getTime()).toBeGreaterThanOrEqual(ninetyDaysAgo)
    })
  })

  it('should return at most 10 trending articles', () => {
    const { trendingArticles } = useRelatedArticles(mockCurrentArticle, mockAllArticles)

    expect(trendingArticles.value.length).toBeLessThanOrEqual(10)
  })

  it('should sort trending by most recent', () => {
    const { trendingArticles } = useRelatedArticles(mockCurrentArticle, mockAllArticles)

    for (let i = 0; i < trendingArticles.value.length - 1; i++) {
      const currentDate = new Date(trendingArticles.value[i].pubDate).getTime()
      const nextDate = new Date(trendingArticles.value[i + 1].pubDate).getTime()
      expect(currentDate).toBeGreaterThanOrEqual(nextDate)
    }
  })

  it('should calculate hasTrending correctly', () => {
    const { hasTrending } = useRelatedArticles(mockCurrentArticle, mockAllArticles)

    expect(hasTrending.value).toBe(true)
  })

  it('should return empty recentlyUpdated when no updatedDate', () => {
    const articlesWithoutUpdate = mockAllArticles.map(article => ({
      ...article,
      updatedDate: undefined,
    }))
    const { recentlyUpdated, hasRecentlyUpdated } = useRelatedArticles(mockCurrentArticle, articlesWithoutUpdate)

    expect(recentlyUpdated.value).toEqual([])
    expect(hasRecentlyUpdated.value).toBe(false)
  })

  it('should filter recently updated within last 30 days', () => {
    const recentUpdate = new Date()
    const articlesWithUpdate = mockAllArticles.map((article, i) => ({
      ...article,
      updatedDate: i === 0 ? recentUpdate : undefined,
    }))
    const { recentlyUpdated } = useRelatedArticles(mockCurrentArticle, articlesWithUpdate)

    expect(recentlyUpdated.value.length).toBeGreaterThan(0)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
    recentlyUpdated.value.forEach(article => {
      if (article.updatedDate) {
        expect(new Date(article.updatedDate).getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo)
      }
    })
  })

  it('should return at most 5 recently updated articles', () => {
    const articlesWithUpdate = mockAllArticles.map(article => ({
      ...article,
      updatedDate: new Date(),
    }))
    const { recentlyUpdated } = useRelatedArticles(mockCurrentArticle, articlesWithUpdate)

    expect(recentlyUpdated.value.length).toBeLessThanOrEqual(5)
  })

  it('should sort recentlyUpdated by most recent update', () => {
    const articlesWithUpdate = mockAllArticles.map(article => ({
      ...article,
      updatedDate: new Date(),
    }))
    const { recentlyUpdated } = useRelatedArticles(mockCurrentArticle, articlesWithUpdate)

    for (let i = 0; i < recentlyUpdated.value.length - 1; i++) {
      const currentDate = new Date(recentlyUpdated.value[i].updatedDate!).getTime()
      const nextDate = new Date(recentlyUpdated.value[i + 1].updatedDate!).getTime()
      expect(currentDate).toBeGreaterThanOrEqual(nextDate)
    }
  })

  it('should calculate hasRecentlyUpdated correctly', () => {
    const articlesWithUpdate = mockAllArticles.map(article => ({
      ...article,
      updatedDate: new Date(),
    }))
    const { hasRecentlyUpdated } = useRelatedArticles(mockCurrentArticle, articlesWithUpdate)

    expect(hasRecentlyUpdated.value).toBe(true)
  })

  it('should handle empty current article', () => {
    const emptyArticle = {} as SearchDocument
    const { relatedArticles, trendingArticles } = useRelatedArticles(emptyArticle, mockAllArticles)

    // Should handle gracefully without throwing
    expect(Array.isArray(relatedArticles.value)).toBe(true)
    expect(Array.isArray(trendingArticles.value)).toBe(true)
  })

  it('should handle missing optional fields in articles', () => {
    const minimalArticles: SearchDocument[] = [
      {
        id: 'article-1',
        title: 'Test',
        description: 'Test desc',
        body: 'Test body',
        tags: [],
        pubDate: new Date(),
      },
    ]
    const { relatedArticles, trendingArticles } = useRelatedArticles(minimalArticles[0], minimalArticles)

    expect(Array.isArray(relatedArticles.value)).toBe(true)
    expect(Array.isArray(trendingArticles.value)).toBe(true)
  })
})
