<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './SiteHeader.vue'
import SiteFooter from './SiteFooter.vue'
import BackToTop from './BackToTop.vue'
import { useTheme } from '../composables/useTheme'
import '../assets/public.css'

const route = useRoute()
const theme = useTheme()

onMounted(() => theme.enable())
onBeforeUnmount(() => theme.disable())
</script>

<template>
  <div class="site">
    <SiteHeader />
    <main>
      <router-view />
    </main>
    <SiteFooter :action="route.meta.footer" />
    <BackToTop />
  </div>
</template>
