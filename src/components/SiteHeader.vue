<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const route = useRoute()
const { isDark, toggle } = useTheme()

const menuOpen = ref(false)
const scrolled = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 20
}
const onDocClick = (e) => {
  if (menuOpen.value && !e.target.closest('.header')) menuOpen.value = false
}
const onResize = () => {
  if (window.innerWidth > 768) menuOpen.value = false
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  document.addEventListener('click', onDocClick)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', onDocClick)
})

watch(() => route.fullPath, () => (menuOpen.value = false))
</script>

<template>
  <header class="header" :class="{ sticky: scrolled }">
    <router-link to="/" class="logo">Yes<span>Zie</span></router-link>

    <nav class="navbar" :class="{ active: menuOpen }">
      <router-link to="/" :class="{ active: route.name === 'home' }">Home</router-link>
      <router-link to="/articles" :class="{ active: route.name === 'articles' }">Articles</router-link>
      <router-link to="/contact" :class="{ active: route.name === 'contact' }">Contact</router-link>
    </nav>

    <div class="header-icons">
      <button class="icon-btn" type="button" aria-label="Ganti tema" @click="toggle">
        <i class="bx" :class="isDark ? 'bx-sun' : 'bx-moon'"></i>
      </button>
      <button class="icon-btn menu-btn" type="button" aria-label="Menu" @click.stop="menuOpen = !menuOpen">
        <i class="bx" :class="menuOpen ? 'bx-x' : 'bx-menu'"></i>
      </button>
    </div>
  </header>
</template>
