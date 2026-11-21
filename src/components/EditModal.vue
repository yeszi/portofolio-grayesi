<script setup>
import { reactive, ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'
import { useToast } from '../composables/useToast'

const props = defineProps({
  table: { type: String, required: true },
  id: { type: [String, Number], required: true },
  bucket: { type: String, required: true },
  hasLink: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'saved', 'preview'])
const toast = useToast()

const loaded = ref(false)
const saving = ref(false)
const currentImage = ref('')
const form = reactive({ title: '', description: '', link: '' })
const file = ref(null)

onMounted(async () => {
  try {
    const { data, error } = await supabase.from(props.table).select('*').eq('id', props.id).single()
    if (error) throw error
    form.title = data.title || ''
    form.description = data.description || ''
    form.link = data.link || ''
    currentImage.value = data.image_url || ''
    loaded.value = true
  } catch (error) {
    console.error('Error showing edit form:', error)
    toast.error('Gagal mengambil data: ' + error.message, 4000)
    emit('close')
  }
})

async function uploadImage(bucket, f) {
  if (!f) return null
  const fileName = `${Date.now()}-${f.name}`
  const { error } = await supabase.storage.from(bucket).upload(fileName, f)
  if (error) throw error
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  return data.publicUrl
}

async function deleteImage(bucket, imageUrl) {
  if (!imageUrl) return
  const fileName = imageUrl.split('/').pop()
  if (!fileName) return
  try {
    const { error } = await supabase.storage.from(bucket).remove([fileName])
    if (error) console.error('Gagal hapus gambar lama:', error.message)
  } catch (e) {
    console.error('Error parsing image URL:', e)
  }
}

async function save() {
  saving.value = true
  try {
    const title = form.title.trim()
    const description = form.description.trim()
    const link = props.hasLink ? form.link.trim() : null

    if (!title || !description) {
      toast.error('Judul dan Deskripsi tidak boleh kosong!')
      return
    }

    const { data: current, error: currentError } = await supabase
      .from(props.table)
      .select('image_url')
      .eq('id', props.id)
      .single()
    if (currentError) throw currentError

    let imageUrl = current.image_url || null
    if (file.value) {
      const newUrl = await uploadImage(props.bucket, file.value)
      if (imageUrl) await deleteImage(props.bucket, imageUrl)
      imageUrl = newUrl
    }

    const update = { title, description }
    if (imageUrl) update.image_url = imageUrl
    if (props.hasLink) update.link = link

    const { error } = await supabase.from(props.table).update(update).eq('id', props.id)
    if (error) throw error

    toast.success('✅ Berhasil update!')
    emit('saved')
    emit('close')
  } catch (error) {
    console.error('Error handling edit:', error)
    toast.error('Gagal update: ' + error.message, 4000)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="adm-modal" @click.self="emit('close')">
    <div v-if="loaded" class="adm-modal-box">
      <button class="adm-modal-close" type="button" aria-label="Tutup" @click="emit('close')">&times;</button>
      <h2>Edit {{ table }}</h2>

      <form @submit.prevent="save">
        <div class="adm-field">
          <label for="edit-title">Judul</label>
          <input id="edit-title" v-model="form.title" type="text" required />
        </div>
        <div class="adm-field">
          <label for="edit-desc">Deskripsi</label>
          <textarea id="edit-desc" v-model="form.description" required></textarea>
        </div>
        <div v-if="hasLink" class="adm-field">
          <label for="edit-link">Link</label>
          <input id="edit-link" v-model="form.link" type="url" />
        </div>
        <div class="adm-field">
          <label for="edit-image">Gambar (biarkan kosong jika tidak ingin mengubah)</label>
          <input id="edit-image" type="file" accept="image/*" @change="file = $event.target.files[0] || null" />
          <div v-if="currentImage" class="adm-current-image">
            <span>Gambar saat ini:</span>
            <img :src="currentImage" alt="Gambar saat ini" @click="emit('preview', currentImage)" />
          </div>
        </div>

        <div class="adm-modal-actions">
          <button type="button" class="adm-btn ghost" @click="emit('close')"><i class="fas fa-times"></i> Batal</button>
          <button type="submit" class="adm-btn" :disabled="saving">
            <template v-if="saving">Menyimpan...</template>
            <template v-else><i class="fas fa-save"></i> Simpan Perubahan</template>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
