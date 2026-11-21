<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const show = ref(false)
const onScroll = () => {
  show.value = window.scrollY > 300
}
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <a href="#" class="floating-back-btn" :class="{ show }" title="Kembali ke atas" @click.prevent="toTop">
    <i class="bx bx-up-arrow-alt"></i>
  </a>
</template>
