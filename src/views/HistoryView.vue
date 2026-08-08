<template>
  <div class="history-page">
    <div class="intro">
      <span class="eyebrow">SCAN LOG</span>
      <h1>ประวัติการสแกน</h1>
      <p>ผลการวิเคราะห์ย้อนหลังทั้งหมดของคุณ เรียงจากล่าสุด</p>
    </div>

    <div v-if="loading" class="state-box">กำลังโหลดประวัติ...</div>

    <div v-else-if="error" class="state-box error">
      {{ error }}
      <button class="retry-btn" @click="load">ลองใหม่</button>
    </div>

    <div v-else-if="!scans.length" class="state-box">
      ยังไม่มีประวัติการสแกน
      <router-link to="/scan" class="inline-link">เริ่มสแกนเลย</router-link>
    </div>

    <ul v-else class="scan-list">
      <li v-for="s in scans" :key="s.id" class="scan-item">
        <div class="scan-item-top">
          <span class="status-pill" :style="pillStyle(s.status)">{{ getVerdict(s.status).eyebrow }}</span>
          <span class="scan-date">{{ formatDate(s.created_at) }}</span>
        </div>
        <b class="scan-name">{{ s.product_name || 'ไม่ทราบชื่อสินค้า' }}</b>
        <p v-if="s.summary" class="scan-summary">{{ s.summary }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHistory } from '../lib/api.js'
import { getVerdict } from '../lib/verdict.js'

const scans = ref([])
const loading = ref(true)
const error = ref('')

function pillStyle(status) {
  const v = getVerdict(status)
  return { color: v.color, background: v.color + '26' }
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString('th-TH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    scans.value = await getHistory()
  } catch (err) {
    error.value = err.message || 'โหลดประวัติไม่สำเร็จ ลองใหม่อีกครั้ง'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.history-page { max-width: 560px; margin: 0 auto; padding: 28px 20px 60px; }

.intro { margin-bottom: 20px; }
.eyebrow {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  color: var(--green); letter-spacing: 0.08em;
}
.intro h1 { font-size: 24px; margin: 8px 0 6px; }
.intro p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }

.state-box {
  text-align: center; padding: 40px 20px; color: var(--muted); font-size: 14px;
  background: var(--white); border: 1px solid var(--line); border-radius: var(--radius-lg);
}
.state-box.error { color: var(--red); }
.retry-btn {
  display: block; margin: 12px auto 0; padding: 8px 18px; border-radius: 999px;
  border: 1px solid var(--line); background: var(--paper); color: var(--ink);
  font-size: 13px; font-weight: 600; cursor: pointer;
}
.inline-link { display: block; margin-top: 8px; color: var(--green-deep); font-weight: 600; }

.scan-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.scan-item {
  background: var(--white); border: 1px solid var(--line); border-radius: var(--radius-md);
  padding: 14px 16px;
}
.scan-item-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.status-pill { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.scan-date { font-size: 12px; color: var(--muted); }
.scan-name { display: block; font-size: 14.5px; margin-bottom: 4px; }
.scan-summary { margin: 0; font-size: 13px; color: var(--muted); line-height: 1.6; }
</style>