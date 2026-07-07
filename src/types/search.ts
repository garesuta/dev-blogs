export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | undefined

export interface SearchDocument {
  readonly id: string              // Slug
  readonly title: string
  readonly description: string
  readonly body: string           // Extracted content
  readonly tags: readonly string[]
  readonly category?: string
  readonly pubDate: Date
  readonly updatedDate?: Date
  readonly heroImage?: string
  readonly readingTime?: number
  readonly difficulty?: DifficultyLevel
}

export interface SearchFilters {
  category?: string
  tags?: string[]
  difficulty?: DifficultyLevel
  dateRange?: {
    from?: Date
    to?: Date
  }
}

export interface SearchState {
  query: string
  results: SearchDocument[]
  isSearching: boolean
  error: string | null
}
