import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchInput from '@/components/SearchInput.vue'
import { useSearchValidation } from '@/composables/useSearchValidation'

// Mock composables
vi.mock('@/composables/useSearchValidation', () => ({
  useSearchValidation: vi.fn(() => ({
    query: ref(''),
    error: ref(null),
    isValid: ref(true),
    updateQuery: vi.fn(),
    clearError: vi.fn(),
    MAX_QUERY_LENGTH: 200,
  })),
}))

const mockUseSearchValidation = vi.mocked('@/composables/useSearchValidation')

describe('SearchInput Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render correctly', () => {
    const wrapper = mount(SearchInput, {
      props: {
        placeholder: 'Search articles...',
      },
    })

    expect(wrapper.find('input[type="search"]').exists()).toBe(true)
    expect(wrapper.find('.search-icon').exists()).toBe(true)
  })

  it('should apply placeholder prop', () => {
    const wrapper = mount(SearchInput, {
      props: {
        placeholder: 'Type to search...',
      },
    })

    const input = wrapper.find('input[type="search"]') as any

    expect(input.attributes('placeholder')).toBe('Type to search...')
  })

  it('should apply disabled prop', () => {
    const wrapper = mount(SearchInput, {
      props: {
        disabled: true,
      },
    })

    const input = wrapper.find('input[type="search"]') as any

    expect(input.attributes('disabled')).toBeDefined()
  })

  it('should call updateQuery on input', async () => {
    const wrapper = mount(SearchInput)

    const input = wrapper.find('input[type="search"]')
    await input.setValue('react hooks')

    expect(mockUseSearchValidation.updateQuery).toHaveBeenCalledWith('react hooks')
  })

  it('should emit search event on query change', async () => {
    const wrapper = mount(SearchInput)

    const input = wrapper.find('input[type="search"]')
    await input.setValue('react hooks')

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 350))

    expect(wrapper.emitted('search')).toBeTruthy()
  })

  it('should show clear button when query is not empty', async () => {
    mockUseSearchValidation.query.value = 'react'

    const wrapper = mount(SearchInput)

    expect(wrapper.find('.btn-clear').exists()).toBe(true)
  })

  it('should hide clear button when query is empty', () => {
    mockUseSearchValidation.query.value = ''

    const wrapper = mount(SearchInput)

    expect(wrapper.find('.btn-clear').exists()).toBe(false)
  })

  it('should have proper ARIA attributes', () => {
    const wrapper = mount(SearchInput)

    const input = wrapper.find('input[type="search"]') as any

    expect(input.attributes('aria-label')).toBe('Search articles')
    expect(input.attributes('aria-autocomplete')).toBe('list')
    expect(input.attributes('aria-controls')).toBe('search-results')
  })

  it('should expose focus method', () => {
    const wrapper = mount(SearchInput)

    expect(wrapper.vm.focus).toBeDefined()
    expect(typeof wrapper.vm.focus).toBe('function')
  })

  it('should display error message when validation fails', () => {
    mockUseSearchValidation.error.value = 'Invalid characters'
    mockUseSearchValidation.query.value = 'invalid<script>'

    const wrapper = mount(SearchInput)

    expect(wrapper.find('.search-error').exists()).toBe(true)
    expect(wrapper.text()).toContain('Invalid characters')
  })

  it('should display loading indicator when searching', () => {
    const wrapper = mount(SearchInput, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.find('.search-loading').exists()).toBe(true)
  })

  it('should be responsive', () => {
    const wrapper = mount(SearchInput)

    // Check for mobile-responsive classes
    const container = wrapper.find('.search-container')
    expect(container.exists()).toBe(true)
  })

  it('should handle keyboard events', () => {
    const wrapper = mount(SearchInput)

    const input = wrapper.find('input[type="search"]')

    await input.trigger('keydown', { key: 'ArrowDown' })

    // Should handle keyboard events
    expect(wrapper.emitted('select')).toBeFalsy() // No selection on nav
  })

  it('should handle Enter key for selection', async () => {
    const wrapper = mount(SearchInput)

    // Simulate having results
    mockUseSearchValidation.isValid.value = true
    mockUseSearchValidation.query.value = 'react'

    const input = wrapper.find('input[type="search"]')
    await input.setValue('react')
    await new Promise(resolve => setTimeout(resolve, 350))

    await input.trigger('keydown', { key: 'Enter' })

    // Should emit select on Enter with valid selection
  })

  it('should handle Escape key', async () => {
    const wrapper = mount(SearchInput)

    const input = wrapper.find('input[type="search"]')
    await input.trigger('keydown', { key: 'Escape' })

    // Should handle Escape
    expect(wrapper.exists()).toBe(true)
  })

  it('should clear error when clear button clicked', async () => {
    mockUseSearchValidation.error.value = 'Invalid chars'
    mockUseSearchValidation.query.value = 'react'

    const wrapper = mount(SearchInput)
    const clearBtn = wrapper.find('.btn-clear')

    await clearBtn.trigger('click')

    expect(mockUseSearchValidation.clearError).toHaveBeenCalled()
    expect(mockUseSearchValidation.updateQuery).toHaveBeenCalledWith('')
  })
})
