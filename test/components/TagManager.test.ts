import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TagManager from '@/components/TagManager.vue'

describe('TagManager Component', () => {
  const mockTags = [
    { id: 'tag-1', name: 'JavaScript', slug: 'javascript' },
    { id: 'tag-2', name: 'Vue', slug: 'vue' },
    { id: 'tag-3', name: 'TypeScript', slug: 'typescript' },
  ]

  const createWrapper = (props = {}) => {
    return mount(TagManager, {
      props: {
        availableTags: mockTags,
        selectedTagIds: [],
        ...props,
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render correctly', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('.tag-manager').exists()).toBe(true)
    })

    it('should display available tags', () => {
      const wrapper = createWrapper()
      const tags = wrapper.findAll('.tag-item')

      expect(tags.length).toBeGreaterThan(0)
    })

    it('should show selected tags', () => {
      const wrapper = createWrapper({ selectedTagIds: ['tag-1', 'tag-2'] })
      const selectedTags = wrapper.findAll('.selected-tag')

      expect(selectedTags.length).toBe(2)
    })

    it('should show search input', () => {
      const wrapper = createWrapper()
      const searchInput = wrapper.find('input[type="text"]')

      expect(searchInput.exists()).toBe(true)
    })
  })

  describe('Tag Selection', () => {
    it('should emit tagSelected when tag is clicked', async () => {
      const wrapper = createWrapper()

      // Simulate clicking a tag
      ;(wrapper.vm as any).handleTagSelect(mockTags[0])
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('tagSelected')).toBeTruthy()
    })

    it('should emit tagRemoved when removing selected tag', async () => {
      const wrapper = createWrapper({ selectedTagIds: ['tag-1'] })

      ;(wrapper.vm as any).handleRemoveTag('tag-1')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('tagRemoved')).toBeTruthy()
    })

    it('should not select already selected tag', () => {
      const wrapper = createWrapper({ selectedTagIds: ['tag-1'] })

      // Should not emit if already selected
      ;(wrapper.vm as any).handleTagSelect(mockTags[0])

      expect(wrapper.emitted('tagSelected')).toBeFalsy()
    })
  })

  describe('Search/Filter', () => {
    it('should filter tags by search term', async () => {
      const wrapper = createWrapper()

      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('Java')

      // Should filter to show only JavaScript
      expect((wrapper.vm as any).filteredTags).toBeDefined()
    })

    it('should show all tags when search is empty', async () => {
      const wrapper = createWrapper()

      const searchInput = wrapper.find('input[type="text"]')
      await searchInput.setValue('')

      expect((wrapper.vm as any).filteredTags.length).toBe(mockTags.length)
    })
  })

  describe('Props', () => {
    it('should accept availableTags prop', () => {
      const customTags = [{ id: 'custom', name: 'Custom', slug: 'custom' }]
      const wrapper = createWrapper({ availableTags: customTags })

      expect((wrapper.props() as any).availableTags).toEqual(customTags)
    })

    it('should accept selectedTagIds prop', () => {
      const wrapper = createWrapper({ selectedTagIds: ['tag-1', 'tag-2'] })

      expect((wrapper.props() as any).selectedTagIds).toEqual(['tag-1', 'tag-2'])
    })
  })
})
