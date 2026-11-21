<script setup>
import { reactive, ref } from 'vue'
import { supabase } from '../../lib/supabase'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const BUCKETS = {
  ABOUT: 'aboutimages',
  PROJECT: 'projectimages',
  EXPERIENCE: 'experienceimages',
  ACTIVITY: 'activitybucket',
  ARTICLE: 'articlesimage',
}

const about = reactive({ title: '', description: '', file: null })
const project = reactive({ title: '', description: '', link: '', file: null })
const experience = reactive({ title: '', description: '', file: null })
const activity = reactive({ title: '', description: '', file: null })
const article = reactive({ title: '', description: '', link: '', file: null })

// Elemen <input type="file"> disimpan agar bisa dikosongkan setelah submit
const fileEls = {}
const busy = ref('')

const setFile = (form, e) => {
  form.file = e.target.files[0] || null
}

function reset(form, key) {
  Object.keys(form).forEach((k) => (form[k] = k === 'file' ? null : ''))
  if (fileEls[key]) fileEls[key].value = null
}

async function uploadImage(bucket, file) {
  if (!file) {
    console.warn('⚠️ Tidak ada file yang dipilih.')
    return null
  }
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
  console.log(`📤 Mengupload ${fileName} ke bucket ${bucket}...`)

  const { error } = await supabase.storage.from(bucket).upload(fileName, file)
  if (error) {
    console.error('❌ Kesalahan Upload:', error)
    toast.error('Upload gambar gagal: ' + error.message, 4000)
    return null
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
  console.log('✅ Upload berhasil. URL:', data.publicUrl)
  return data.publicUrl
}

async function updateAboutMe() {
  const title = about.title.trim()
  const description = about.description.trim()
  const file = about.file

  if (!file) return toast.error('Pilih gambar untuk About Me!')
  if (!title || !description) return toast.error('Isi Judul dan Deskripsi About Me!')

  busy.value = 'about'
  try {
    const image_url = await uploadImage(BUCKETS.ABOUT, file)
    if (!image_url) return

    const { error } = await supabase
      .from('about_me')
      .upsert({ id: 1, title, description, image_url }, { onConflict: 'id' })

    if (error) {
      console.error('Supabase error (About Me):', error)
      return toast.error('Gagal update About Me: ' + error.message)
    }
    toast.success('✅ About Me berhasil diperbarui!')
    reset(about, 'about')
  } finally {
    busy.value = ''
  }
}

async function tambahProject() {
  const title = project.title.trim()
  const description = project.description.trim()
  const link = project.link.trim()
  const file = project.file

  if (!title || !description || !file) return toast.error('Isi Judul, Deskripsi, dan Gambar Project!')

  busy.value = 'project'
  try {
    const image_url = await uploadImage(BUCKETS.PROJECT, file)
    if (!image_url && file) return

    const { error } = await supabase
      .from('projects')
      .insert({ title, description, image_url, link: link || null })

    if (error) {
      console.error('Supabase error (Project):', error)
      return toast.error('Gagal tambah project: ' + error.message)
    }
    toast.success('✅ Project berhasil ditambahkan!')
    reset(project, 'project')
  } finally {
    busy.value = ''
  }
}

async function tambahExperience() {
  const title = experience.title.trim()
  const description = experience.description.trim()
  const file = experience.file

  if (!title || !description) return toast.error('Isi Judul dan Deskripsi Pengalaman!')

  busy.value = 'experience'
  try {
    let image_url = null
    if (file) {
      image_url = await uploadImage(BUCKETS.EXPERIENCE, file)
      if (!image_url) return
    }

    const { error } = await supabase.from('experience').insert({ title, description, image_url })

    if (error) {
      console.error('Supabase error (Experience):', error)
      return toast.error('Gagal tambah pengalaman: ' + error.message)
    }
    toast.success('✅ Pengalaman berhasil ditambahkan!')
    reset(experience, 'experience')
  } finally {
    busy.value = ''
  }
}

async function tambahActivity() {
  const title = activity.title.trim()
  const description = activity.description.trim()
  const file = activity.file

  if (!title || !description || !file) return toast.error('Isi Judul, Deskripsi, dan Gambar Aktivitas!')

  busy.value = 'activity'
  try {
    const image_url = await uploadImage(BUCKETS.ACTIVITY, file)
    if (!image_url) return

    const { error } = await supabase.from('activity').insert({ title, description, image_url })

    if (error) {
      console.error('Supabase error (Activity):', error)
      return toast.error('Gagal tambah aktivitas: ' + error.message)
    }
    toast.success('✅ Aktivitas berhasil ditambahkan!')
    reset(activity, 'activity')
  } finally {
    busy.value = ''
  }
}

async function tambahArticle() {
  const title = article.title.trim()
  const description = article.description.trim()
  const link = article.link.trim()
  const file = article.file

  if (!title || !description || !file || !link) {
    return toast.error('Isi Judul, Deskripsi, Gambar, dan Link Artikel!')
  }
  try {
    new URL(link)
  } catch (_) {
    return toast.error('Format Link Artikel tidak valid. Pastikan menggunakan http:// atau https://', 4000)
  }

  busy.value = 'article'
  try {
    const image_url = await uploadImage(BUCKETS.ARTICLE, file)
    if (!image_url) return

    const { error } = await supabase.from('articles').insert({ title, description, image_url, link })

    if (error) {
      console.error('Supabase error (Article):', error)
      return toast.error('Gagal tambah artikel: ' + error.message)
    }
    toast.success('✅ Artikel berhasil ditambahkan!')
    reset(article, 'article')
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <div class="adm-page-head">
    <h1><i class="fas fa-plus-circle"></i> Tambah Konten</h1>
    <p>Perbarui About Me atau tambahkan project, pengalaman, aktivitas, dan artikel baru.</p>
  </div>

  <div class="adm-forms">
    <section class="adm-card">
      <h2 class="adm-form-title"><i class="fas fa-user"></i> Update About Me</h2>
      <div class="adm-field">
        <label for="judul-about">Judul</label>
        <input id="judul-about" v-model="about.title" type="text" placeholder="e.g., About YesZie" />
      </div>
      <div class="adm-field">
        <label for="deskripsi-about">Deskripsi</label>
        <textarea id="deskripsi-about" v-model="about.description" placeholder="Ceritakan tentang diri Anda..."></textarea>
      </div>
      <div class="adm-field">
        <label for="gambar-about-file">Upload Gambar Profil</label>
        <input id="gambar-about-file" :ref="(el) => (fileEls.about = el)" type="file" accept="image/*" @change="setFile(about, $event)" />
      </div>
      <button class="adm-btn" :disabled="busy === 'about'" @click="updateAboutMe">
        {{ busy === 'about' ? 'Menyimpan...' : 'Update About Me' }}
      </button>
    </section>

    <section class="adm-card">
      <h2 class="adm-form-title"><i class="fas fa-laptop-code"></i> Add New Project</h2>
      <div class="adm-field">
        <label for="judul-project">Judul Project</label>
        <input id="judul-project" v-model="project.title" type="text" placeholder="Nama project Anda" />
      </div>
      <div class="adm-field">
        <label for="deskripsi-project">Deskripsi Project</label>
        <textarea id="deskripsi-project" v-model="project.description" placeholder="Jelaskan project ini..."></textarea>
      </div>
      <div class="adm-field">
        <label for="link-project">Link Project (Optional)</label>
        <input id="link-project" v-model="project.link" type="url" placeholder="https://github.com/user/repo atau URL demo" />
      </div>
      <div class="adm-field">
        <label for="gambar-project-file">Upload Gambar Project</label>
        <input id="gambar-project-file" :ref="(el) => (fileEls.project = el)" type="file" accept="image/*" @change="setFile(project, $event)" />
      </div>
      <button class="adm-btn" :disabled="busy === 'project'" @click="tambahProject">
        {{ busy === 'project' ? 'Menyimpan...' : 'Add Project' }}
      </button>
    </section>

    <section class="adm-card">
      <h2 class="adm-form-title"><i class="fas fa-briefcase"></i> Add New Experience</h2>
      <div class="adm-field">
        <label for="judul-exp">Posisi/Jabatan</label>
        <input id="judul-exp" v-model="experience.title" type="text" placeholder="e.g., Web Developer Intern" />
      </div>
      <div class="adm-field">
        <label for="deskripsi-exp">Deskripsi Pengalaman</label>
        <textarea id="deskripsi-exp" v-model="experience.description" placeholder="Jelaskan tugas dan pencapaian Anda..."></textarea>
      </div>
      <div class="adm-field">
        <label for="gambar-exp-file">Upload Gambar/Logo Perusahaan (Optional)</label>
        <input id="gambar-exp-file" :ref="(el) => (fileEls.experience = el)" type="file" accept="image/*" @change="setFile(experience, $event)" />
      </div>
      <button class="adm-btn" :disabled="busy === 'experience'" @click="tambahExperience">
        {{ busy === 'experience' ? 'Menyimpan...' : 'Add Experience' }}
      </button>
    </section>

    <section class="adm-card">
      <h2 class="adm-form-title"><i class="fas fa-calendar-check"></i> Add New Activity</h2>
      <div class="adm-field">
        <label for="judul-activity">Nama Aktivitas/Acara</label>
        <input id="judul-activity" v-model="activity.title" type="text" placeholder="e.g., Lomba Coding Nasional" />
      </div>
      <div class="adm-field">
        <label for="deskripsi-activity">Deskripsi Aktivitas</label>
        <textarea id="deskripsi-activity" v-model="activity.description" placeholder="Ceritakan tentang aktivitas ini..."></textarea>
      </div>
      <div class="adm-field">
        <label for="gambar-activity-file">Upload Gambar Aktivitas</label>
        <input id="gambar-activity-file" :ref="(el) => (fileEls.activity = el)" type="file" accept="image/*" @change="setFile(activity, $event)" />
      </div>
      <button class="adm-btn" :disabled="busy === 'activity'" @click="tambahActivity">
        {{ busy === 'activity' ? 'Menyimpan...' : 'Add Activity' }}
      </button>
    </section>

    <section class="adm-card">
      <h2 class="adm-form-title"><i class="fas fa-newspaper"></i> Add New Article</h2>
      <div class="adm-field">
        <label for="judul-article">Judul Artikel</label>
        <input id="judul-article" v-model="article.title" type="text" placeholder="Judul artikel Anda" />
      </div>
      <div class="adm-field">
        <label for="deskripsi-article">Deskripsi Singkat</label>
        <textarea id="deskripsi-article" v-model="article.description" placeholder="Ringkasan singkat tentang artikel..."></textarea>
      </div>
      <div class="adm-field">
        <label for="link-article">Link Artikel</label>
        <input id="link-article" v-model="article.link" type="url" placeholder="https://medium.com/@user/artikel" />
      </div>
      <div class="adm-field">
        <label for="gambar-article-file">Upload Gambar Thumbnail Artikel</label>
        <input id="gambar-article-file" :ref="(el) => (fileEls.article = el)" type="file" accept="image/*" @change="setFile(article, $event)" />
      </div>
      <button class="adm-btn" :disabled="busy === 'article'" @click="tambahArticle">
        {{ busy === 'article' ? 'Menyimpan...' : 'Add Article' }}
      </button>
    </section>
  </div>
</template>
