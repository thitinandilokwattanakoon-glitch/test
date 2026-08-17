import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn } from '../lib/api.js'

import HomeView from '../views/HomeView.vue'
import ScanView from '../views/ScanView.vue'
import HistoryView from '../views/HistoryView.vue'
import ProfileView from '../views/ProfileView.vue'
import TipsView from '../views/TipsView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ForgotPasswordView from '../views/ForgotPasswordView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
    { path: '/scan', name: 'scan', component: ScanView, meta: { requiresAuth: true } },
    { path: '/history', name: 'history', component: HistoryView, meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: ProfileView, meta: { requiresAuth: true } },
    { path: '/tips', name: 'tips', component: TipsView, meta: { requiresAuth: true } },

    // หน้า auth — เข้าได้เฉพาะตอนยังไม่ login (guestOnly)
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordView, meta: { guestOnly: true } },
  ],
})

router.beforeEach((to) => {
  const loggedIn = isLoggedIn()

  // ต้อง login ก่อนถึงจะเข้าหน้านี้ได้ — ยังไม่ login เตะไป /login
  // พร้อมจำหน้าที่ตั้งใจจะไป (redirect) ไว้ ให้กลับมาที่เดิมได้หลัง login สำเร็จ
  if (to.meta.requiresAuth && !loggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // login อยู่แล้ว แต่พยายามเข้าหน้า login/register/forgot-password ซ้ำ → เด้งกลับหน้าแรก
  if (to.meta.guestOnly && loggedIn) {
    return { path: '/' }
  }

  return true
})

export default router