<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase, subscribeTable } from '../../lib/supabase'
import { useToast } from '../../composables/useToast'

const toast = useToast()
const messages = ref([])
const state = ref('loading') // loading | ok | empty | error

async function fetchContactMessages() {
  if (messages.value.length === 0) state.value = 'loading'

  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fetch error:', error)
    state.value = 'error'
    return
  }
  messages.value = data || []
  state.value = messages.value.length ? 'ok' : 'empty'
}

async function deleteMessage(id) {
  if (!confirm('Anda yakin ingin menghapus pesan ini?')) return
  const { error } = await supabase.from('contact_messages').delete().eq('id', id)
  if (error) {
    toast.error('Gagal menghapus pesan: ' + error.message)
    console.error('Delete error:', error)
  } else {
    toast.success('🗑️ Pesan berhasil dihapus!')
    messages.value = messages.value.filter((m) => m.id !== id)
    if (messages.value.length === 0) state.value = 'empty'
  }
}

const fmt = (d) =>
  new Date(d).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const initial = (name) => (name ? name.trim().charAt(0).toUpperCase() : '?')

let off = null
onMounted(() => {
  fetchContactMessages()
  off = subscribeTable('realtime_contact_messages', 'contact_messages', (payload) => {
    console.log('📩 Perubahan Realtime Pesan:', payload)
    toast.success('Ada pesan baru atau perubahan!')
    fetchContactMessages()
  })
})
onBeforeUnmount(() => off && off())
</script>

<template>
  <div class="adm-page-head">
    <h1><i class="fas fa-inbox"></i> Pesan Masuk</h1>
    <p>Semua pesan yang dikirim lewat form kontak.</p>
  </div>

  <section class="adm-card">
    <div class="adm-card-head"><h2><i class="fas fa-envelope-open-text"></i> Daftar Pesan</h2></div>

    <div v-if="state === 'loading'" class="adm-empty"><i class="fas fa-spinner fa-spin"></i><p>Memuat pesan...</p></div>
    <div v-else-if="state === 'error'" class="adm-empty err"><i class="fas fa-exclamation-triangle"></i><p>Gagal memuat pesan. Coba refresh halaman.</p></div>
    <div v-else-if="state === 'empty'" class="adm-empty"><i class="far fa-folder-open"></i><p>Belum ada pesan masuk.</p></div>

    <div v-else class="adm-messages">
      <article v-for="msg in messages" :key="msg.id" class="adm-message">
        <div class="adm-avatar">{{ initial(msg.name) }}</div>
        <div class="adm-message-body">
          <div class="adm-message-top">
            <div>
              <h4>{{ msg.name }}</h4>
              <a :href="'mailto:' + msg.email">{{ msg.email }}</a>
            </div>
            <span class="adm-time"><i class="far fa-clock"></i> {{ fmt(msg.created_at) }}</span>
          </div>
          <p class="adm-message-text">{{ msg.message }}</p>
          <button type="button" class="adm-btn danger sm" @click="deleteMessage(msg.id)">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </article>
    </div>
  </section>
</template>
