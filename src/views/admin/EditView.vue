<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { supabase, subscribeTable } from '../../lib/supabase'
import { useToast } from '../../composables/useToast'
import EditModal from '../../components/EditModal.vue'
import ImageModal from '../../components/ImageModal.vue'

const toast = useToast()

const menus = [
  { table: 'about_me', title: 'About Me', bucket: 'aboutimages', isSingular: true },
  { table: 'projects', title: 'Projects', bucket: 'projectimages', isSingular: false },
  { table: 'experience', title: 'Experience', bucket: 'experienceimages', isSingular: false },
  { table: 'activity', title: 'My Activity', bucket: 'activityimages', isSingular: false },
  { table: 'articles', title: 'My Articles', bucket: 'articleimages', isSingular: false },
]

// state per tabel: { items: [], status: 'loading' | 'ok' | 'error' }
const data = reactive(
  Object.fromEntries(menus.map((m) => [m.table, { items: [], status: 'loading' }]))
)

const query = ref('')
const editing = ref(null) // { table, id, bucket, hasLink }
const previewSrc = ref('')

async function fetchData(menu) {
  const { table, isSingular } = menu
  try {
    const { data: rows, error } = await supabase.from(table).select('*')
    if (error) throw error
    data[table].items = isSingular && rows.length > 0 ? [rows[0]] : rows
    data[table].status = 'ok'
  } catch (error) {
    console.error(`Error fetching ${table}:`, error)
    data[table].status = 'error'
  }
}

// Filter pencarian: judul atau deskripsi
const sections = computed(() => {
  const q = query.value.toLowerCase()
  return menus.map((menu) => {
    const all = data[menu.table].items
    const items = q
      ? all.filter(
          (i) =>
            (i.title || '').toLowerCase().includes(q) ||
            (i.description || '').toLowerCase().includes(q)
        )
      : all
    return {
      ...menu,
      status: data[menu.table].status,
      total: all.length,
      items,
      hidden: q && all.length > 0 && items.length === 0,
    }
  })
})

const allHidden = computed(
  () => query.value && sections.value.every((s) => s.hidden || s.total === 0)
)

function openEdit(menu, item) {
  editing.value = {
    table: menu.table,
    id: item.id,
    bucket: menu.bucket,
    hasLink: menu.table === 'projects',
    isSingular: menu.isSingular,
  }
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

async function deleteItem(menu, item) {
  if (!confirm(`Yakin ingin menghapus dari ${menu.table}?`)) return
  try {
    if (item.image_url) await deleteImage(menu.bucket, item.image_url)
    const { error } = await supabase.from(menu.table).delete().eq('id', item.id)
    if (error) throw error
    toast.success('✅ Item berhasil dihapus!')
    fetchData(menu)
  } catch (error) {
    console.error('Error deleting item:', error)
    toast.error('Gagal hapus item: ' + error.message, 4000)
  }
}

let unsubscribers = []
onMounted(() => {
  menus.forEach((menu) => {
    fetchData(menu)
    unsubscribers.push(subscribeTable(`realtime_${menu.table}`, menu.table, () => fetchData(menu)))
  })
})
onBeforeUnmount(() => unsubscribers.forEach((off) => off()))
</script>

<template>
  <div class="adm-page-head">
    <h1><i class="fas fa-edit"></i> Edit Konten</h1>
    <p>Cari, ubah, atau hapus konten yang tampil di website.</p>
  </div>

  <div class="adm-search">
    <i class="fas fa-search"></i>
    <input v-model="query" type="text" placeholder="Cari berdasarkan judul atau deskripsi..." />
  </div>

  <template v-for="menu in sections" :key="menu.table">
    <section v-show="!menu.hidden" class="adm-card">
      <h2 class="adm-form-title">{{ menu.title }} <span class="adm-count">{{ menu.total }}</span></h2>

      <div v-if="menu.status === 'loading'" class="adm-empty">Loading...</div>
      <div v-else-if="menu.status === 'error'" class="adm-empty err">Error loading data.</div>
      <div v-else-if="menu.total === 0" class="adm-empty">Tidak ada item ditemukan.</div>

      <div v-else class="adm-list">
        <div v-for="item in menu.items" :key="item.id" class="adm-item">
          <div class="adm-item-head">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              class="adm-thumb"
              :alt="item.title || 'Thumbnail'"
              @click.stop="previewSrc = $event.target.src"
            />
            <div v-else class="adm-thumb none">No Image</div>
            <div class="adm-item-info">
              <h3>{{ item.title || 'No Title' }}</h3>
              <a v-if="menu.table === 'projects' && item.link" :href="item.link" target="_blank" rel="noopener" class="adm-link">{{ item.link }}</a>
            </div>
          </div>
          <p class="adm-item-desc">{{ item.description || 'No description available' }}</p>
          <div class="adm-item-actions">
            <button type="button" class="adm-btn sm" @click="openEdit(menu, item)">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button v-if="!menu.isSingular" type="button" class="adm-btn danger sm" @click="deleteItem(menu, item)">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </section>
  </template>

  <p v-if="allHidden" class="adm-empty">Tidak ada hasil yang cocok untuk pencarian ini.</p>

  <EditModal
    v-if="editing"
    :table="editing.table"
    :id="editing.id"
    :bucket="editing.bucket"
    :has-link="editing.hasLink"
    @close="editing = null"
    @saved="fetchData(menus.find((m) => m.table === editing.table))"
    @preview="previewSrc = $event"
  />
  <ImageModal :src="previewSrc" @close="previewSrc = ''" />
</template>
