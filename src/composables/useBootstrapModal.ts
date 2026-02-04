import { shallowRef, onMounted, type Ref } from 'vue'

interface ModalInstance {
  show: () => void
  hide: () => void
  dispose: () => void
}

export function useBootstrapModal(modalRef: Ref<HTMLElement | null>) {
  const modalInstance = shallowRef<ModalInstance | null>(null)

  onMounted(async () => {
    const { Modal } = await import('bootstrap')
    if (modalRef.value) {
      modalInstance.value = new Modal(modalRef.value) as unknown as ModalInstance
    }
  })

  function show() {
    modalInstance.value?.show()
  }

  function hide() {
    modalInstance.value?.hide()
  }

  return { show, hide, modalInstance }
}
