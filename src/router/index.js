import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '../components/PublicLayout.vue'
import HomeView from '../views/HomeView.vue'
import ArticlesView from '../views/ArticlesView.vue'
import ContactView from '../views/ContactView.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: HomeView, meta: { title: 'Grayesi Silitonga', footer: 'contact' } },
      { path: 'articles', name: 'articles', component: ArticlesView, meta: { title: 'My Articles - YesZie', footer: 'login' } },
      { path: 'contact', name: 'contact', component: ContactView, meta: { title: 'Contact - YesZie', footer: 'login' } },
    ],
  },
  {
    path: '/admin/login',
    name: 'login',
    component: () => import('../views/admin/LoginView.vue'),
    meta: { title: 'Admin Login - Grayesi' },
  },
  {
    path: '/admin',
    component: () => import('../components/AdminLayout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('../views/admin/DashboardView.vue'), meta: { title: 'Admin Dashboard - YesZie', heading: 'Dashboard' } },
      { path: 'edit', name: 'edit', component: () => import('../views/admin/EditView.vue'), meta: { title: 'Edit Konten - Admin YesZie', heading: 'Edit Konten' } },
      { path: 'tambah', name: 'tambah', component: () => import('../views/admin/TambahView.vue'), meta: { title: 'Tambah Konten - Admin YesZie', heading: 'Tambah Konten' } },
      { path: 'pesan', name: 'pesan', component: () => import('../views/admin/MessagesView.vue'), meta: { title: 'Pesan Masuk - Admin YesZie', heading: 'Pesan Masuk' } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 80, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  if (to.meta.title) document.title = to.meta.title
})

export default router
