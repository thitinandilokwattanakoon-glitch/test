import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ScanView from '../views/ScanView.vue'
import HistoryView from '../views/HistoryView.vue'
import ProfileView from '../views/ProfileView.vue'
import TipsView from '../views/TipsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/scan', name: 'scan', component: ScanView },
    { path: '/history', name: 'history', component: HistoryView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/tips', name: 'tips', component: TipsView },
  ],
})

export default router
