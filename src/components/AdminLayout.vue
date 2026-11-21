<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase, isAdminSession } from '../lib/supabase'
import { useToast } from '../composables/useToast'
import '../assets/admin.css'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const sidebarOpen = ref(false)
const authed = ref(false)

const nav = [
  { to: '/admin', icon: 'fa-tachometer-alt', label: 'Dashboard', name: 'dashboard' },
  { to: '/admin/edit', icon: 'fa-edit', label: 'Edit Content', name: 'edit' },
  { to: '/admin/tambah', icon: 'fa-plus-circle', label: 'Add Content', name: 'tambah' },
  { to: '/admin/pesan', icon: 'fa-envelope', label: 'Form Messages', name: 'pesan' },
]

function denyAndRedirect(message) {
  toast.error(message)
  setTimeout(() => router.push('/admin/login'), 2000)
}

onMounted(async () => {
  try {
    if (await isAdminSession()) {
      authed.value = true
    } else {
      denyAndRedirect('❌ Akses ditolak. Login sebagai admin.')
    }
  } catch (err) {
    console.error('Error checking session:', err)
    denyAndRedirect('Terjadi kesalahan saat cek sesi.')
  }
})

watch(
  () => route.path,
  () => (sidebarOpen.value = false)
)
watch(sidebarOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    toast.error('Gagal logout: ' + error.message)
  } else {
    toast.success('Berhasil logout...')
    setTimeout(() => router.push('/admin/login'), 1500)
  }
}
</script>

<template>
  <div class="adm">
    <header class="adm-mobile-header">
      <button type="button" aria-label="Buka menu" @click="sidebarOpen = true">
        <i class="fas fa-bars"></i>
      </button>
      <h1>{{ route.meta.heading }}</h1>
    </header>

    <div class="adm-overlay" :class="{ active: sidebarOpen }" @click="sidebarOpen = false"></div>

    <aside class="adm-sidebar" :class="{ open: sidebarOpen }">
      <div class="adm-sidebar-header">
        <router-link to="/admin" class="adm-logo"><i class="fas fa-user-shield"></i> YesZie</router-link>
        <button type="button" class="adm-close" aria-label="Tutup menu" @click="sidebarOpen = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <nav class="adm-nav">
        <router-link v-for="n in nav" :key="n.to" :to="n.to" :class="{ active: route.name === n.name }">
          <i class="fas" :class="n.icon"></i> {{ n.label }}
        </router-link>
        <a href="#" @click.prevent="logout"><i class="fas fa-sign-out-alt"></i> Log Out</a>
      </nav>
      <router-link to="/" class="adm-back"><i class="fas fa-arrow-left"></i> Lihat website</router-link>
    </aside>

    <div class="adm-main">
      <main class="adm-container">
        <router-view v-if="authed" />
        <div v-else class="adm-empty"><i class="fas fa-spinner fa-spin"></i><p>Memeriksa sesi...</p></div>
      </main>
      <footer class="adm-footer">Made by 🩷 Grayesi Silitonga</footer>
    </div>
  </div>
</template>
