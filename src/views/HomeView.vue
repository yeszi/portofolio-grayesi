<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase, subscribeTable } from '../lib/supabase'
import {
  FALLBACK_PROJECT_IMG,
  FALLBACK_EXPERIENCE_IMG,
  FALLBACK_ACTIVITY_IMG,
  onImgError,
} from '../lib/images'

const DEFAULT_PROFILE = '/images/profile.png'

const profileImage = ref(DEFAULT_PROFILE)
const about = ref({ description: '', image_url: '' })

const projects = ref([])
const projectsMsg = ref('Loading projects...')

const experiences = ref([])
const activities = ref([])

const fallbackExperiences = [
  {
    id: 'fb-exp',
    title: 'Frontend Developer Intern',
    description: 'Mengembangkan dan memelihara aplikasi web menggunakan React.js dan TypeScript.',
    period: 'Jun 2023 - Sep 2023',
    image_url: FALLBACK_EXPERIENCE_IMG,
  },
]
const fallbackActivities = [
  {
    id: 'fb-act',
    title: 'Web Development Workshop',
    description: 'Mengikuti workshop pengembangan web modern dengan fokus pada responsive design.',
    image_url: FALLBACK_ACTIVITY_IMG,
  },
]

async function loadAboutMe() {
  try {
    const { data, error } = await supabase.from('about_me').select('*').single()
    if (error) return
    if (data && data.description) {
      about.value = { description: data.description, image_url: data.image_url || '' }
      if (data.image_url) profileImage.value = data.image_url
    }
  } catch (e) {
    /* abaikan, sama seperti logika awal */
  }
}

async function loadProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      projects.value = []
      projectsMsg.value = 'Failed to load projects data.'
      return
    }
    projects.value = data || []
    if (!data || data.length === 0) projectsMsg.value = 'No projects found.'
  } catch (e) {
    projects.value = []
    projectsMsg.value = 'Error loading projects.'
  }
}

async function loadExperiences() {
  try {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .order('created_at', { ascending: false })
    experiences.value = !error && data && data.length > 0 ? data : fallbackExperiences
  } catch (e) {
    experiences.value = fallbackExperiences
  }
}

async function loadActivities() {
  try {
    const { data, error } = await supabase
      .from('activity')
      .select('*')
      .order('created_at', { ascending: false })
    activities.value = !error && data && data.length > 0 ? data : fallbackActivities
  } catch (e) {
    activities.value = fallbackActivities
  }
}

async function loadAllData() {
  try {
    await Promise.all([loadAboutMe(), loadProjects(), loadExperiences(), loadActivities()])
  } catch (e) {
    experiences.value = fallbackExperiences
    activities.value = fallbackActivities
  }
}

let unsubscribers = []

onMounted(() => {
  loadAllData()
  const handlers = {
    about_me: loadAboutMe,
    projects: loadProjects,
    experience: loadExperiences,
    activity: loadActivities,
  }
  unsubscribers = Object.entries(handlers).map(([table, fn]) =>
    subscribeTable(`${table}-changes`, table, () => fn())
  )
})

onBeforeUnmount(() => unsubscribers.forEach((off) => off()))
</script>

<template>
  <!-- HERO -->
  <section class="home" id="home">
    <div class="blob blob-a"></div>
    <div class="blob blob-b"></div>

    <div class="home-content" v-reveal>
      <span class="eyebrow">Hello, I am</span>
      <h1>Grayesi <span class="grad-text">Silitonga</span></h1>
      <p class="role">Design UI/UX Enthusiast || Front-End Developer</p>
      <p class="lead">
        Currently, I am a student at the Raja Ali Haji Maritime University, where I am pursuing a
        bachelor's degree in engineering.
      </p>

      <div class="social-media">
        <a href="https://github.com/Yeszi" target="_blank" rel="noopener" aria-label="GitHub"><i class="bx bxl-github"></i></a>
        <a href="https://www.linkedin.com/in/grayesi-silitonga" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="bx bxl-linkedin"></i></a>
        <a href="mailto:grayesi.silitonga@email.com" aria-label="Email"><i class="bx bx-envelope"></i></a>
      </div>

      <div class="hero-actions">
        <router-link to="/articles" class="btn">Activities <i class="bx bx-right-arrow-alt"></i></router-link>
        <router-link to="/contact" class="btn btn-ghost">Contact me</router-link>
      </div>
    </div>

    <div class="home-img" v-reveal="150">
      <div class="ring">
        <img :src="profileImage" alt="Profile Picture Grayesi" id="home-profile-image" @error="onImgError($event, DEFAULT_PROFILE)" />
      </div>
      <span class="chip chip-1"><i class="bx bx-palette"></i> UI/UX</span>
      <span class="chip chip-2"><i class="bx bx-code-alt"></i> Front-End</span>
    </div>
  </section>

  <!-- ABOUT -->
  <section v-if="about.description" class="section" id="about">
    <div class="section-head" v-reveal>
      <span class="eyebrow">Know me</span>
      <h2>About <span class="grad-text">Me</span></h2>
    </div>
    <div class="about-card" v-reveal>
      <img v-if="about.image_url" :src="about.image_url" alt="About Me" @error="onImgError" />
      <p id="about-description">{{ about.description }}</p>
    </div>
  </section>

  <!-- PROJECTS -->
  <section class="section alt" id="projects">
    <div class="section-head" v-reveal>
      <span class="eyebrow">Selected work</span>
      <h2>My <span class="grad-text">Projects</span></h2>
    </div>
    <div class="card-grid">
      <article v-for="(project, i) in projects" :key="project.id" class="card" v-reveal="i * 60">
        <div class="card-img">
          <img :src="project.image_url || FALLBACK_PROJECT_IMG" :alt="project.title" @error="onImgError" />
        </div>
        <div class="card-body">
          <h4>{{ project.title }}</h4>
          <p>{{ project.description }}</p>
          <a v-if="project.link" :href="project.link" class="card-btn" target="_blank" rel="noopener">
            View Project <i class="bx bx-right-arrow-alt"></i>
          </a>
          <a v-else href="#projects" class="card-btn">View Details <i class="bx bx-right-arrow-alt"></i></a>
        </div>
      </article>
      <div v-if="projects.length === 0" class="state-msg">
        <p>{{ projectsMsg }}</p>
      </div>
    </div>
  </section>

  <!-- EXPERIENCE -->
  <section class="section" id="experience">
    <div class="section-head" v-reveal>
      <span class="eyebrow">Journey</span>
      <h2>My <span class="grad-text">Experience</span></h2>
    </div>
    <div class="card-grid">
      <article v-for="(exp, i) in experiences" :key="exp.id" class="card" v-reveal="i * 60">
        <div class="card-img">
          <img :src="exp.image_url || FALLBACK_EXPERIENCE_IMG" :alt="exp.title" @error="onImgError($event, FALLBACK_EXPERIENCE_IMG)" />
        </div>
        <div class="card-body">
          <h4>{{ exp.title }}</h4>
          <p>{{ exp.description }}</p>
          <span v-if="exp.period" class="pill">{{ exp.period }}</span>
        </div>
      </article>
    </div>
  </section>

  <!-- ACTIVITY -->
  <section class="section alt" id="activity">
    <div class="section-head" v-reveal>
      <span class="eyebrow">Beyond the code</span>
      <h2>My <span class="grad-text">Activity</span></h2>
    </div>
    <div class="card-grid">
      <article v-for="(act, i) in activities" :key="act.id" class="card" v-reveal="i * 60">
        <div class="card-img">
          <img :src="act.image_url || FALLBACK_ACTIVITY_IMG" :alt="act.title" @error="onImgError($event, FALLBACK_ACTIVITY_IMG)" />
        </div>
        <div class="card-body">
          <h4>{{ act.title }}</h4>
          <p>{{ act.description }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
