import { computed, ref } from 'vue'
import type { SearchDocument } from '@/types/search'
import Fuse from 'fuse.js'

export function useRelatedArticles(currentArticle: SearchDocument, allArticles: SearchDocument[] = []) {
  // FUSE configuration for recommendations
  const fuseConfig = {
    keys: [
      { name: 'tags', weight: 2 },
      { name: 'category', weight: 1.5 },
      { name: 'series', weight: 2 },
    ],
    threshold: 0.4, // More lenient for related content
    includeScore: true,
  }

  const fuse = computed(() => {
    // Exclude current article from results
    const otherArticles = allArticles.filter(doc => doc.id !== currentArticle.id)

    return new Fuse(otherArticles, fuseConfig)
  })

  // Get related articles based on multiple factors
  const relatedArticles = computed(() => {
    if (!currentArticle || !fuse.value) return []

    const rawResults = fuse.value.search('', {
      limit: 10,
    })

    // Sort by Fuse.js score ascending (lower = better match) before extracting items
    return rawResults
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .map(result => result.item)
      .slice(0, 5) // Top 5 related
  })

  const hasRelated = computed(() => relatedArticles.value.length > 0)

  // Trending content - articles published in last 90 days
  const trendingArticles = computed(() => {
    return allArticles
      .filter(doc => {
        // Filter out very old content (older than 3 months)
        const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000)
        const docDate = new Date(doc.pubDate).getTime()
        return docDate >= ninetyDaysAgo
      })
      .sort((a, b) => {
        // Most recent first
        const aDate = new Date(a.pubDate).getTime()
        const bDate = new Date(b.pubDate).getTime()
        return bDate - aDate
      })
      .slice(0, 10)
  })

  const hasTrending = computed(() => trendingArticles.value.length > 0)

  // Recently updated articles - updated in last 30 days
  const recentlyUpdated = computed(() => {
    return allArticles
      .filter(doc => {
        // Has updated date and is within last 30 days
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)

        if (!doc.updatedDate) return false
        const docDate = new Date(doc.updatedDate).getTime()
        return docDate >= thirtyDaysAgo
      })
      .sort((a, b) => {
        // Most recently updated first
        const aDate = new Date(a.updatedDate!).getTime()
        const bDate = new Date(b.updatedDate!).getTime()
        return bDate - aDate
      })
      .slice(0, 5)
  })

  const hasRecentlyUpdated = computed(() => recentlyUpdated.value.length > 0)

  return {
    relatedArticles,
    hasRelated,
    trendingArticles,
    hasTrending,
    recentlyUpdated,
    hasRecentlyUpdated,
  }
}
