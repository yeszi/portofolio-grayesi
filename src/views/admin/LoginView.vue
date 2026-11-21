<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { supabase } from '../../lib/supabase'
import '../../assets/admin.css'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) {
      Swal.fire({ icon: 'error', title: 'Ur not YesZie Right ?🤪', text: error.message })
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Halo YesZie🤓',
        showConfirmButton: false,
        timer: 1500,
      }).then(() => router.push('/admin'))
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-blob b1"></div>
    <div class="login-blob b2"></div>
    <div class="login-card">
      <div class="login-avatar">👧🏽</div>
      <h1>YesZie</h1>
      <p class="login-sub">Masuk ke panel admin</p>
      <form @submit.prevent="submit">
        <label class="login-field">
          <i class="fas fa-envelope"></i>
          <input v-model="email" type="email" placeholder="Email Admin" required />
        </label>
        <label class="login-field">
          <i class="fas fa-lock"></i>
          <input v-model="password" type="password" placeholder="Password" required />
        </label>
        <button type="submit" :disabled="loading">{{ loading ? 'Memproses...' : 'Sign In' }}</button>
      </form>
      <router-link to="/" class="login-back"><i class="fas fa-arrow-left"></i> Kembali ke beranda</router-link>
    </div>
  </div>
</template>
