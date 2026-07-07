import { getCollection } from 'astro:content'
import { writeFileSync, renameSync, unlinkSync } from 'fs'
import { join } from 'path'
import type { SearchDocument } from '../src/types/search'
import { validateIndexSize } from '../src/lib/search'

// Maximum index size: 5MB
const MAX_INDEX_SIZE = 5 * 1024 * 1024

/**
 * Estimate reading time from content
 */
function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

/**
 * Extract text content from MDX
 */
function extractBodyContent(content: string): string {
  // Remove frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---/, '')

  // Remove markdown syntax (basic)
  const body = withoutFrontmatter
    .replace(/#{1,6}\s.*/g, '') // Headers
    .replace(/\*\*.*?\*\*/g, '') // Bold
    .replace(/\*.*?\*/g, '') // Italic
    .replace(/`[^`]*`/g, '') // Code
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/\[.*?\]\(.*?\)/g, '') // Links
    .replace(/!\[.*?\]\(.*?\)/g, '') // Images
    .replace(/\*\*.*?\*\*/g, '') // Bullet points
    .replace(/\d+\.\s/g, '') // Numbered lists

  return body.trim()
}

/**
 * Build search index from content collections
 */
async function buildSearchIndex() {
  console.log('Building search index...')

  // Get all blog posts
  const allPosts = await getCollection('blog')

  // Transform to search documents
  const searchDocuments: SearchDocument[] = allPosts.map(post => {
    const body = extractBodyContent(post.body || '')
    const contentWithoutHtml = body.replace(/<[^>]*>/g, '')
    const readingTime = post.data.readingTime || estimateReadingTime(contentWithoutHtml)

    return {
      id: post.id,
      title: post.data.title,
      description: post.data.description,
      body: contentWithoutHtml,
      tags: post.data.tags || [],
      category: post.data.category,
      pubDate: post.data.pubDate,
      readingTime,
      difficulty: post.data.difficulty,
    }
  })

  // Create index JSON
  const indexData = {
    version: new Date().toISOString(),
    documentCount: searchDocuments.length,
    documents: searchDocuments,
  }

  // Serialize to JSON
  const jsonString = JSON.stringify(indexData, null, 2)
  const indexSize = Buffer.byteLength(jsonString, 'utf8')

  console.log(`Index size: ${(indexSize / 1024).toFixed(2)}KB`)

  // Validate index size
  const validation = validateIndexSize(indexSize)
  if (!validation.valid) {
    console.error(validation.message)
    process.exit(1)
  }

  if (validation.message) {
    console.warn(validation.message)
  }

  // Output path
  const timestamp = Date.now()
  const tempPath = join(process.cwd(), `public/search-index-temp-${timestamp}.json`)
  const finalPath = join(process.cwd(), 'public/search-index.json')

  // Write to temp file first
  writeFileSync(tempPath, jsonString, 'utf8')
  console.log(`Wrote temporary index to: ${tempPath}`)

  // Rename to final path (atomic operation)
  try {
    // Delete old index if exists
    try {
      unlinkSync(finalPath)
    } catch (e) {
      // File doesn't exist, ignore
    }

    // Rename temp to final
    renameSync(tempPath, finalPath)
    console.log(`Search index built successfully: ${finalPath}`)
    console.log(`Indexed ${searchDocuments.length} documents`)
  } catch (error) {
    console.error('Failed to rename index file:', error)
    process.exit(1)
  }
}

// Run the build
buildSearchIndex().catch(error => {
  console.error('Failed to build search index:', error)
  process.exit(1)
})
