import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchResultCard from '@/components/SearchResultCard.vue'
import type { SearchDocument } from '@/types/search'

const mockDocument: SearchDocument = {
  id: 'article-1',
  title: 'React Hooks Tutorial',
  description: 'Learn React hooks in depth with practical examples',
  body: 'React hooks content...',
  tags: ['react', 'hooks', 'frontend'],
  category: 'frontend',
  pubDate: new Date('2025-01-15'),
  readingTime: 10,
  difficulty: 'beginner',
  heroImage: '/images/react-hooks.jpg',
}

describe('SearchResultCard Component', () => {
  it('should render correctly', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: 'React <mark class="search-highlight">Hooks</mark> Tutorial',
        highlightedDescription: 'Learn <mark class="search-highlight">React</mark> hooks...',
        date: 'Jan 15, 2025',
      },
    })

    expect(wrapper.find('.result-card').exists()).toBe(true)
    expect(wrapper.find('.result-title').exists()).toBe(true)
    expect(wrapper.find('.result-description').exists()).toBe(true)
  })

  it('should render hero image when available', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: {
          ...mockDocument,
          heroImage: '/images/test.jpg',
        },
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    expect(wrapper.find('.result-image img').exists()).toBe(true)
  })

  it('should not render hero image when not available', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: {
          ...mockDocument,
          heroImage: undefined,
        },
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    expect(wrapper.find('.result-image').exists()).toBe(false)
  })

  it('should render difficulty badge', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const badge = wrapper.find('.badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('beginner')
  })

  it('should use correct badge class for beginner difficulty', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: {
          ...mockDocument,
          difficulty: 'beginner',
        },
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const badge = wrapper.find('.badge')
    expect(badge.classes()).toContain('bg-success')
  })

  it('should use correct badge class for intermediate difficulty', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: {
          ...mockDocument,
          difficulty: 'intermediate',
        },
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const badge = wrapper.find('.badge')
    expect(badge.classes()).toContain('bg-warning')
  })

  it('should use correct badge class for advanced difficulty', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: {
          ...mockDocument,
          difficulty: 'advanced',
        },
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const badge = wrapper.find('.badge')
    expect(badge.classes()).toContain('bg-danger')
  })

  it('should render category badge', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const badges = wrapper.findAll('.badge')
    const categoryBadge = badges.find(b => b.text() === 'frontend')

    expect(categoryBadge).toBeDefined()
    expect(categoryBadge.classes()).toContain('bg-info')
  })

  it('should render tags', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const tags = wrapper.findAll('.badge')
    expect(tags.length).toBeGreaterThan(0)
  })

  it('should render reading time when available', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const readingTimeEl = wrapper.text().includes('10 min read')
    expect(readingTimeEl).toBe(true)
  })

  it('should not render reading time when not available', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: {
          ...mockDocument,
          readingTime: undefined,
        },
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const readingTimeEl = wrapper.text().includes('min read')
    expect(readingTimeEl).toBe(false)
  })

  it('should render date prop when provided', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
        date: 'Jan 15, 2025',
      },
    })

    expect(wrapper.text()).toContain('Jan 15, 2025')
  })

  it('should use pubDate when date prop not provided', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    expect(wrapper.text()).toContain('2025-01-15')
  })

  it('should emit click event', async () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    await wrapper.find('.result-card').trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0]).toEqual([mockDocument])
  })

  it('should emit click event on Enter key', async () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    await wrapper.find('.result-card').trigger('keydown.enter')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')[0]).toEqual([mockDocument])
  })

  it('should have correct article URL', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('/blog/article-1/')
  })

  it('should be keyboard accessible', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const card = wrapper.find('.result-card')
    expect(card.attributes('tabindex')).toBe('0')
  })

  it('should render read more link', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        document: mockDocument,
        highlightedTitle: mockDocument.title,
        highlightedDescription: mockDocument.description,
      },
    })

    const readMore = wrapper.find('.read-more')
    expect(readMore.exists()).toBe(true)
    expect(readMore.text()).toContain('Read More')
  })
})
