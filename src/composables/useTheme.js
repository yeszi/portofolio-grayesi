import { ref } from 'vue'

const isDark = ref(false)
let initialised = false

function apply() {
  document.documentElement.classList.toggle('dark', isDark.value)
}

export function useTheme() {
  if (!initialised) {
    initialised = true
    const saved = localStorage.getItem('darkMode')
    isDark.value =
      saved === 'true' ||
      (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)
  }

  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('darkMode', String(isDark.value))
    apply()
  }

  return {
    isDark,
    toggle,
    /** Dipanggil layout publik saat tampil */
    enable: apply,
    /** Dipanggil saat meninggalkan halaman publik (admin selalu terang) */
    disable: () => document.documentElement.classList.remove('dark'),
  }
}
