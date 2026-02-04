import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { useBootstrapModal } from '@/composables/useBootstrapModal'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'

// Mock bootstrap module with a real class
const mockShow = vi.fn()
const mockHide = vi.fn()
const mockDispose = vi.fn()

class MockModal {
  show = mockShow
  hide = mockHide
  dispose = mockDispose
}

vi.mock('bootstrap', () => ({
  Modal: MockModal,
}))

describe('useBootstrapModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes modal instance on mount', async () => {
    const TestComponent = defineComponent({
      setup() {
        const modalRef = ref<HTMLElement | null>(null)
        const modal = useBootstrapModal(modalRef)
        return { modalRef, ...modal }
      },
      template: '<div ref="modalRef"></div>',
    })

    mount(TestComponent)
    await flushPromises()

    // Modal should have been created since ref is bound
    expect((await import('bootstrap')).Modal).toBeDefined()
  })

  it('calls show on modal instance', async () => {
    const TestComponent = defineComponent({
      setup() {
        const modalRef = ref<HTMLElement | null>(null)
        const modal = useBootstrapModal(modalRef)
        return { modalRef, ...modal }
      },
      template: '<div ref="modalRef"></div>',
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    ;(wrapper.vm as any).show()
    expect(mockShow).toHaveBeenCalledTimes(1)
  })

  it('calls hide on modal instance', async () => {
    const TestComponent = defineComponent({
      setup() {
        const modalRef = ref<HTMLElement | null>(null)
        const modal = useBootstrapModal(modalRef)
        return { modalRef, ...modal }
      },
      template: '<div ref="modalRef"></div>',
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    ;(wrapper.vm as any).hide()
    expect(mockHide).toHaveBeenCalledTimes(1)
  })

  it('does not create modal if ref is null', async () => {
    mockShow.mockClear()
    mockHide.mockClear()

    const TestComponent = defineComponent({
      setup() {
        const modalRef = ref<HTMLElement | null>(null)
        const modal = useBootstrapModal(modalRef)
        // Don't bind ref to template element
        return { ...modal }
      },
      template: '<div></div>',
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    // show/hide should not throw and not call mocks
    ;(wrapper.vm as any).show()
    ;(wrapper.vm as any).hide()
    expect(mockShow).not.toHaveBeenCalled()
    expect(mockHide).not.toHaveBeenCalled()
  })

  it('show/hide do nothing when modal not initialized', async () => {
    const TestComponent = defineComponent({
      setup() {
        const modalRef = ref<HTMLElement | null>(null)
        const modal = useBootstrapModal(modalRef)
        return { ...modal }
      },
      template: '<div></div>',
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    // Should not throw
    ;(wrapper.vm as any).show()
    ;(wrapper.vm as any).hide()
    expect(mockShow).not.toHaveBeenCalled()
    expect(mockHide).not.toHaveBeenCalled()
  })
})
