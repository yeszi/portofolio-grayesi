import { reactive } from 'vue'

export const toasts = reactive([])
let seq = 0

export function useToast() {
  function show(type, message, duration = 3000) {
    const id = ++seq
    toasts.push({ id, type, message })
    setTimeout(() => {
      const i = toasts.findIndex((t) => t.id === id)
      if (i > -1) toasts.splice(i, 1)
    }, duration)
  }
  return {
    show,
    success: (m, d) => show('success', m, d),
    error: (m, d) => show('error', m, d),
  }
}
