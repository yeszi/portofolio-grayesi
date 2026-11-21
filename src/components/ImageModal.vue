<script setup>
defineProps({ src: { type: String, default: '' } })
const emit = defineEmits(['close'])
</script>

<template>
  <div v-if="src" class="adm-modal image" @click.self="emit('close')">
    <button class="adm-modal-close" type="button" aria-label="Tutup" @click="emit('close')">&times;</button>
    <img :src="src" class="adm-modal-image" alt="Preview" />
  </div>
</template>
