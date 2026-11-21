<script setup>
import { toasts } from '../composables/useToast'
</script>

<template>
  <div class="toast-host" aria-live="polite">
    <transition-group name="toast">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">
        <i class="fas" :class="t.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        <span>{{ t.message }}</span>
      </div>
    </transition-group>
  </div>
</template>
