import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import RoleSelector from '@/components/RoleSelector.vue'
import { authClient } from '@/lib/auth-client'
import type { UserRole } from '@/lib/schema'

// Mock the auth client
vi.mock('@/lib/auth-client', () => ({
  authClient: {
    admin: {
      setRole: vi.fn(),
    },
  },
}))

describe('RoleSelector Component', () => {
  const mockUserId = 'user-123'
  const mockCurrentRole: UserRole = 'user'

  const createWrapper = (props = {}) => {
    return mount(RoleSelector, {
      props: {
        userId: mockUserId,
        currentRole: mockCurrentRole,
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

      expect(wrapper.find('.role-selector').exists()).toBe(true)
      expect(wrapper.find('select').exists()).toBe(true)
    })

    it('should display current role as selected', () => {
      const wrapper = createWrapper({ currentRole: 'editor' })
      const select = wrapper.find('select') as any

      expect(select.element.value).toBe('editor')
    })

    it('should show all available roles as options', () => {
      const wrapper = createWrapper()
      const options = wrapper.findAll('option')

      expect(options).toHaveLength(3)
      expect(options[0].text()).toBe('User')
      expect(options[1].text()).toBe('Editor')
      expect(options[2].text()).toBe('Administrator')
    })

    it('should disable select when loading', async () => {
      const wrapper = createWrapper()

      // Mock successful API call
      vi.mocked(authClient.admin.setRole).mockResolvedValueOnce({
        data: {},
        error: null,
      } as any)

      const select = wrapper.find('select')
      await select.setValue('editor')

      // Select should be disabled during loading
      expect(select.attributes('disabled')).toBeDefined()
    })
  })

  describe('Role Change', () => {
    it('should call authClient.admin.setRole when role changes', async () => {
      const wrapper = createWrapper()

      vi.mocked(authClient.admin.setRole).mockResolvedValueOnce({
        data: {},
        error: null,
      } as any)

      const select = wrapper.find('select')
      await select.setValue('editor')

      expect(authClient.admin.setRole).toHaveBeenCalledWith({
        userId: mockUserId,
        role: 'editor',
      })
    })

    it('should not call API if role has not changed', async () => {
      const wrapper = createWrapper({ currentRole: 'editor' })

      const select = wrapper.find('select')
      await select.setValue('editor')

      expect(authClient.admin.setRole).not.toHaveBeenCalled()
    })

    it('should emit roleChanged event on successful update', async () => {
      const wrapper = createWrapper()

      vi.mocked(authClient.admin.setRole).mockResolvedValueOnce({
        data: {},
        error: null,
      } as any)

      const select = wrapper.find('select')
      await select.setValue('editor')
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('roleChanged')).toBeTruthy()
      expect(wrapper.emitted('roleChanged')?.[0]).toEqual(['editor'])
    })

    it('should show loading state during API call', async () => {
      const wrapper = createWrapper()

      // Create a promise that we control
      let resolvePromise: (value: any) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      vi.mocked(authClient.admin.setRole).mockReturnValueOnce(
        pendingPromise as any
      )

      const select = wrapper.find('select')
      await select.setValue('editor')

      expect(wrapper.find('.spinner-border').exists()).toBe(true)

      // Resolve the promise
      resolvePromise!({ data: {}, error: null })
      await wrapper.vm.$nextTick()
    })

    it('should show success message after successful update', async () => {
      const wrapper = createWrapper()

      vi.mocked(authClient.admin.setRole).mockResolvedValueOnce({
        data: {},
        error: null,
      } as any)

      const select = wrapper.find('select')
      await select.setValue('editor')

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.text-success').exists()).toBe(true)
    })

    it('should revert selection on API error', async () => {
      const wrapper = createWrapper({ currentRole: 'user' })

      vi.mocked(authClient.admin.setRole).mockRejectedValueOnce(
        new Error('API Error')
      )

      const select = wrapper.find('select')
      await select.setValue('editor')

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      // Should revert to original role
      expect((select.element as HTMLSelectElement).value).toBe('user')
    })

    it('should display error message on API error', async () => {
      const wrapper = createWrapper()

      vi.mocked(authClient.admin.setRole).mockRejectedValueOnce(
        new Error('API Error')
      )

      const select = wrapper.find('select')
      await select.setValue('editor')

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 0))
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.text-danger').exists()).toBe(true)
      expect(wrapper.find('.text-danger').text()).toBe('Failed to update role')
    })
  })

  describe('Props', () => {
    it('should accept userId prop', () => {
      const wrapper = createWrapper({ userId: 'test-user-id' })

      expect((wrapper.props() as any).userId).toBe('test-user-id')
    })

    it('should accept currentRole prop', () => {
      const wrapper = createWrapper({ currentRole: 'admin' })

      expect((wrapper.props() as any).currentRole).toBe('admin')
    })
  })
})
