<script setup>
defineProps({
  action: { type: String, default: 'login' },
})
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <p class="footer-text">Made by 🩷 Grayesi Silitonga</p>
      <router-link v-if="action === 'contact'" to="/contact" class="login-button">Contact Me</router-link>
      <router-link v-else to="/admin/login" class="login-button">Sign In</router-link>
    </div>
  </footer>
</template>
