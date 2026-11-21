<script setup>
import { reactive, ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'

const toast = useToast()
const form = reactive({ name: '', email: '', message: '' })
const sending = ref(false)

const services = [
  { icon: '🖍️', name: 'Desain UI/UX', price: 'Rp 250.000 - Rp 850.000' },
  { icon: '💻', name: 'Website Portfolio', price: 'Rp 400.000 - Rp 1.000.000' },
  { icon: '📽️', name: 'Edit Video / Musik', price: 'Rp 150.000 - Rp 300.000' },
  { icon: '🎨', name: 'Desain Grafis', price: 'Rp 100.000 - Rp 500.000' },
]

async function submit() {
  sending.value = true
  try {
    // Kirim data ke tabel 'contact_messages' di Supabase
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ name: form.name, email: form.email, message: form.message }])

    if (error) {
      console.error('Error mengirim pesan:', error.message)
      toast.error('Maaf, ada masalah saat mengirim pesan Anda. Silakan coba lagi.', 4000)
    } else {
      console.log('Pesan berhasil dikirim:', data)
      toast.success('Pesan Anda berhasil dikirim! Saya akan membalasnya segera.', 4000)
      form.name = form.email = form.message = ''
    }
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="page-hero">
    <div class="blob blob-a"></div>
    <h1 class="heading" v-reveal>CONTACT <span class="grad-text">ME</span></h1>
    <p v-reveal="100">Have a question? Collaboration? Or just want to chat? Just send your message below!</p>
  </section>

  <section class="section" id="contact">
    <div class="section-head" v-reveal>
      <h2>Get In <span class="grad-text">Touch</span></h2>
    </div>

    <div class="contact-grid">
      <!-- Contact Information -->
      <div class="panel" v-reveal>
        <h4 class="panel-title">INFORMATION <span class="grad-text">CONTACT</span></h4>

        <div class="info-row">
          <i class="bx bx-envelope"></i>
          <p><strong>Email</strong><a href="mailto:grayesi.silitonga@email.com">grayesi.silitonga@email.com</a></p>
        </div>
        <div class="info-row">
          <i class="bx bx-phone"></i>
          <p><strong>WhatsApp</strong><a href="https://wa.me/6283147320226">+62 813-6093-0979</a></p>
        </div>
        <div class="info-row">
          <i class="bx bxl-instagram"></i>
          <p><strong>Instagram</strong><a href="https://instagram.com/szieup">Grayesii</a></p>
        </div>
        <div class="info-row">
          <i class="bx bx-map"></i>
          <p><strong>Lokasi</strong><span>Tanjungpinang, Kepulauan Riau</span></p>
        </div>

        <div class="social-links">
          <a href="mailto:grayesi.silitonga@email.com" title="Email"><i class="bx bx-envelope"></i></a>
          <a href="https://wa.me/6281360930979" title="WhatsApp"><i class="bx bxl-whatsapp"></i></a>
          <a href="https://facebook.com/Grayesi%20Silitonga" title="Facebook"><i class="bx bxl-facebook"></i></a>
          <a href="https://twitter.com/pentasgw" title="Twitter"><i class="bx bxl-twitter"></i></a>
          <a href="https://instagram.com/grayesii" title="Instagram"><i class="bx bxl-instagram"></i></a>
        </div>
      </div>

      <!-- Service Offering -->
      <div class="panel" v-reveal="100">
        <h4 class="panel-title">SERVICE <span class="grad-text">OFFERING</span></h4>
        <div v-for="s in services" :key="s.name" class="service-row">
          <span class="service-icon">{{ s.icon }}</span>
          <div>
            <h5>{{ s.name }}</h5>
            <p>{{ s.price }}</p>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="panel" v-reveal="200">
        <h4 class="panel-title">SEND <span class="grad-text">MESSAGE</span></h4>
        <form class="contact-form" @submit.prevent="submit">
          <input v-model="form.name" type="text" name="name" placeholder="Nama Lengkap" required />
          <input v-model="form.email" type="email" name="email" placeholder="Email Kamu" required />
          <textarea v-model="form.message" name="message" placeholder="Pesan Kamu..." required></textarea>
          <button type="submit" class="btn submit-btn" :disabled="sending">
            {{ sending ? 'Mengirim...' : 'Kirim Pesan' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>
