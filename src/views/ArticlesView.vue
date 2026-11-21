<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase, subscribeTable } from '../lib/supabase'
import { NO_IMAGE_SVG, onImgError } from '../lib/images'

const articles = ref([])
const message = ref('Loading articles...')

async function loadArticles() {
  const { data, error } = await supabase.from('articles').select('*')
  if (error) {
    console.error('Error fetching articles:', error)
    articles.value = []
    message.value = 'Failed to load articles. Please try again later.'
    return
  }
  articles.value = data || []
  if (!data || data.length === 0) message.value = 'No articles found.'
}

let off = null
onMounted(async () => {
  await loadArticles()
  off = subscribeTable('realtime:articles', 'articles', () => loadArticles())
})
onBeforeUnmount(() => off && off())
</script>

<template>
  <section class="page-hero">
    <div class="blob blob-a"></div>
    <h1 class="heading" v-reveal>MY <span class="grad-text">ARTICLES</span></h1>
    <p v-reveal="100">Explore my thoughts, tutorials, and insights on various topics.</p>
  </section>

  <section class="section" id="articles-section">
    <div class="card-grid">
      <article v-for="(item, i) in articles" :key="item.id" class="card" v-reveal="(i % 3) * 70">
        <div class="card-img">
          <img :src="item.image_url || NO_IMAGE_SVG" :alt="item.title || 'Article Thumbnail'" @error="onImgError($event, NO_IMAGE_SVG)" />
        </div>
        <div class="card-body">
          <h4>{{ item.title || 'Untitled Article' }}</h4>
          <p>{{ item.description || 'No description provided.' }}</p>
          <a :href="item.link || '#'" class="card-btn">Visit Link <i class="bx bx-right-arrow-alt"></i></a>
        </div>
      </article>
      <div v-if="articles.length === 0" class="state-msg">
        <p>{{ message }}</p>
      </div>
    </div>
  </section>
</template>
