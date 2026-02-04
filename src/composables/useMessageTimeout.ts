import { ref } from 'vue'

export function useMessageTimeout(duration = 3000) {
  const message = ref('')
  const type = ref<'success' | 'error'>('success')
  let timeout: ReturnType<typeof setTimeout> | null = null

  function show(text: string, msgType: 'success' | 'error' = 'success') {
    if (timeout) clearTimeout(timeout)
    message.value = text
    type.value = msgType
    timeout = setTimeout(() => {
      message.value = ''
    }, duration)
  }

  return { message, type, show }
}
