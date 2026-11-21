<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

const totalContent = ref('Loading...')
const totalMessages = ref('Loading...')
const recent = ref([])
const recentState = ref('loading') // loading | ok | empty | error

async function loadTotalContent() {
  const tables = ['projects', 'experience', 'activity', 'articles']
  let total = 0
  try {
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      if (error) {
        console.warn(`Warning: Could not count table ${table}:`, error.message)
      } else {
        total += count || 0
      }
    }
    totalContent.value = total
  } catch (err) {
    console.error('Error calculating total content:', err)
    totalContent.value = 'Error'
  }
}

async function loadMessagesCount() {
  try {
    const { count, error } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
    if (error) throw error
    totalMessages.value = count || 0
  } catch (error) {
    console.error('Error loading total messages count:', error)
    totalMessages.value = 'Error'
  }
}

async function loadRecentMessages() {
  recentState.value = 'loading'
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('id, name, created_at, message')
      .order('created_at', { ascending: false })
      .limit(3)
    if (error) throw error
    recent.value = data || []
    recentState.value = recent.value.length ? 'ok' : 'empty'
  } catch (error) {
    console.error('Error loading recent messages:', error)
    recentState.value = 'error'
  }
}

const fmt = (d) =>
  new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })

onMounted(() => {
  loadTotalContent()
  loadMessagesCount()
  loadRecentMessages()
})
</script>

<template>
  <div class="adm-page-head">
    <h1><i class="fas fa-tachometer-alt"></i> Dashboard</h1>
    <p>Ringkasan konten dan pesan masuk portofolio kamu.</p>
  </div>

  <div class="adm-stats">
    <div class="adm-stat">
      <div class="adm-stat-icon"><i class="fas fa-file-alt"></i></div>
      <div>
        <h3>Total Konten</h3>
        <p>{{ totalContent }}</p>
      </div>
    </div>
    <div class="adm-stat">
      <div class="adm-stat-icon alt"><i class="fas fa-envelope-open-text"></i></div>
      <div>
        <h3>Total Pesan</h3>
        <p>{{ totalMessages }}</p>
      </div>
    </div>
  </div>

  <section class="adm-card">
    <div class="adm-card-head">
      <h2>Pesan Terbaru</h2>
      <router-link to="/admin/pesan">Lihat Semua</router-link>
    </div>
    <div v-if="recentState === 'loading'" class="adm-empty">Memuat pesan terbaru...</div>
    <div v-else-if="recentState === 'empty'" class="adm-empty">Tidak ada pesan terbaru.</div>
    <div v-else-if="recentState === 'error'" class="adm-empty err">Gagal memuat pesan.</div>
    <div v-else class="adm-recent">
      <div v-for="msg in recent" :key="msg.id" class="adm-recent-item">
        <div class="adm-recent-meta">
          <h4>{{ msg.name }}</h4>
          <span>{{ fmt(msg.created_at) }}</span>
        </div>
        <p>{{ msg.message }}</p>
      </div>
    </div>
  </section>

  <section class="adm-card">
    <div class="adm-card-head"><h2>Quick Actions</h2></div>
    <div class="adm-actions">
      <router-link to="/admin/tambah" class="adm-action">
        <div class="adm-action-icon"><i class="fas fa-plus"></i></div>
        <div>
          <h3>Tambah Konten Baru</h3>
          <p>Buat postingan atau item baru</p>
        </div>
      </router-link>
      <router-link to="/admin/edit" class="adm-action green">
        <div class="adm-action-icon"><i class="fas fa-edit"></i></div>
        <div>
          <h3>Edit Konten</h3>
          <p>Update atau hapus konten</p>
        </div>
      </router-link>
    </div>
  </section>
</template>
