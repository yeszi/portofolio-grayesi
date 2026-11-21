// Direktif v-reveal: elemen muncul halus saat masuk viewport.
let observer = null

function getObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 }
  )
  return observer
}

export const vReveal = {
  mounted(el, binding) {
    el.classList.add('reveal')
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`
    const io = getObserver()
    if (io) io.observe(el)
    else el.classList.add('in')
  },
  unmounted(el) {
    if (observer) observer.unobserve(el)
  },
}
