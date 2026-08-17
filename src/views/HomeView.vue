<template>
  <div class="home-page">
    <div class="home-grid">

      <!-- Hero -->
      <section class="hero">
        <div class="hero-copy">
          <h1>กินอย่างมั่นใจ<br />ไปกับ<em>กินเลย</em></h1>
          <p>สแกนฉลากก่อนกินทุกครั้ง ให้ AI ช่วยเช็คให้เข้ากับสุขภาพของคุณ</p>
          <router-link to="/scan" class="cta-btn">
            เริ่มต้นสแกน
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3.2"/></svg>
          </router-link>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="art-blob"></div>
          <svg class="art-mascot" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="34" fill="#ffffff" opacity="0.55"/>
            <circle cx="40" cy="46" r="3.5" fill="var(--green-deep)"/>
            <circle cx="60" cy="46" r="3.5" fill="var(--green-deep)"/>
            <path d="M38 60c4 5 20 5 24 0" stroke="var(--green-deep)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
          </svg>
        </div>
      </section>

      <!-- Notifications sidebar -->
      <aside class="notif-card">
        <div class="notif-head">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
          การแจ้งเตือนสุขภาพ
        </div>
        <ul class="notif-list" v-if="notifications.length">
          <li v-for="n in notifications" :key="n.id">
            <span class="notif-dot"></span>
            {{ n.text }}
          </li>
        </ul>
        <p class="notif-empty" v-else>ยังไม่มีการแจ้งเตือนใหม่ตอนนี้</p>
      </aside>

      <!-- Summary cards -->
      <article class="summary-card">
        <div class="card-head">
          <span class="card-icon good">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          </span>
          ผลสแกนล่าสุด
        </div>

        <div v-if="loadingHistory" class="mini-state">กำลังโหลด...</div>
        <div v-else-if="latestScan" class="scan-preview">
          <div class="scan-thumb" aria-hidden="true">🍽️</div>
          <div>
            <b>{{ latestScan.product_name || 'ไม่ทราบชื่อสินค้า' }}</b>
            <span class="tag" :style="latestScanTagStyle">{{ getVerdict(latestScan.status).eyebrow }}</span>
          </div>
        </div>
        <p v-else class="mini-state">ยังไม่มีประวัติการสแกน</p>

        <router-link to="/history" class="card-btn orange">ดูผลเต็ม</router-link>
      </article>

      <article class="summary-card">
        <div class="card-head">
          <span class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c1.4-4 4.2-6 7-6s5.6 2 7 6"/></svg>
          </span>
          โปรไฟล์สุขภาพ
        </div>
        <p class="profile-desc">โรคประจำตัว/แพ้อาหารที่ใช้เทียบผลสแกน:</p>

        <div v-if="loadingProfile" class="mini-state">กำลังโหลด...</div>
        <div v-else-if="profileChips.length" class="chips">
          <span v-for="c in profileChips" :key="c" class="chip">{{ c }}</span>
        </div>
        <p v-else class="mini-state">ยังไม่ได้ตั้งค่าโปรไฟล์สุขภาพ</p>

        <router-link to="/profile" class="card-btn green">ดูรายละเอียด</router-link>
      </article>

      <article class="summary-card">
        <div class="card-head">
          <span class="card-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
          </span>
          ประวัติการสแกน
        </div>

        <div v-if="loadingHistory" class="mini-state">กำลังโหลด...</div>
        <ul v-else class="stat-list">
          <li><span class="stat-dot green"></span>สแกนทั้งหมด <b>{{ scanStats.total }}</b> ครั้ง</li>
          <li><span class="stat-dot amber"></span>ควรระวัง <b>{{ scanStats.caution }}</b> ครั้ง</li>
          <li><span class="stat-dot red"></span>ควรหลีกเลี่ยง <b>{{ scanStats.avoid }}</b> ครั้ง</li>
        </ul>
        <router-link to="/history" class="card-btn blue">ดูประวัติทั้งหมด</router-link>
      </article>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getHistory, getHealthProfile } from '../lib/api.js'
import { getVerdict } from '../lib/verdict.js'

const loadingHistory = ref(true)
const loadingProfile = ref(true)

const scans = ref([])       // ประวัติทั้งหมดจาก /analyze/history
const profile = ref(null)   // โปรไฟล์สุขภาพจาก /profile

const latestScan = computed(() => scans.value[0] || null)

const latestScanTagStyle = computed(() => {
  if (!latestScan.value) return {}
  const v = getVerdict(latestScan.value.status)
  return { color: v.color, background: v.color + '26' }
})

const scanStats = computed(() => ({
  total: scans.value.length,
  caution: scans.value.filter((s) => s.status === 'CAUTION').length,
  avoid: scans.value.filter((s) => s.status === 'AVOID').length,
}))

const profileChips = computed(() => {
  if (!profile.value) return []
  return [...(profile.value.conditions || []), ...(profile.value.allergies || [])]
})

// สร้างการแจ้งเตือนจากข้อมูลจริง (ไม่มี endpoint แจ้งเตือนแยกต่างหาก
// เลยสร้างจากประวัติสแกนล่าสุดแทน — ถ้ามีสแกนที่ควรหลีกเลี่ยงเมื่อไม่นานนี้ก็เตือนไว้)
const notifications = computed(() => {
  const avoidRecent = scans.value.slice(0, 10).filter((s) => s.status === 'AVOID')
  if (!avoidRecent.length) return []
  return [
    {
      id: 'avoid-recent',
      text: `พบสินค้าที่ควรหลีกเลี่ยงในการสแกนล่าสุด ${avoidRecent.length} ครั้ง ลองดูรายละเอียดในหน้าประวัติ`,
    },
  ]
})

onMounted(async () => {
  try {
    scans.value = await getHistory(50)
  } catch {
    scans.value = []
  } finally {
    loadingHistory.value = false
  }

  try {
    profile.value = await getHealthProfile()
  } catch {
    profile.value = null
  } finally {
    loadingProfile.value = false
  }
})
</script>

<style scoped>
.home-page { max-width: 1080px; margin: 0 auto; padding: 28px 24px 60px; }

.home-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

/* Hero */
.hero {
  grid-column: 1 / 2;
  background: var(--green-tint);
  border-radius: var(--radius-lg);
  padding: 36px 34px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 20px;
  position: relative;
  overflow: hidden;
  min-height: 220px;
}
.hero-copy h1 { font-size: 28px; line-height: 1.35; margin: 0 0 10px; }
.hero-copy h1 em { font-style: normal; color: var(--orange); }
.hero-copy p { margin: 0 0 18px; color: var(--muted); font-size: 14px; max-width: 360px; }
.cta-btn {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--orange); color: #fff; font-weight: 700; font-size: 14.5px;
  padding: 12px 22px; border-radius: 999px;
  box-shadow: 0 3px 0 var(--orange-deep);
}
.cta-btn svg { width: 17px; height: 17px; }
.cta-btn:hover { background: var(--orange-deep); }

.hero-art { position: relative; width: 130px; height: 130px; flex-shrink: 0; }
.art-blob {
  position: absolute; inset: 0; border-radius: 50%;
  background: linear-gradient(135deg, #cfe8d8, #bfe0cd);
}
.art-mascot { position: relative; width: 100%; height: 100%; }

/* Notifications sidebar */
.notif-card {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 20px;
}
.notif-head {
  display: flex; align-items: center; gap: 8px;
  font-weight: 700; font-size: 14px; margin-bottom: 12px;
}
.notif-head svg { width: 17px; height: 17px; color: var(--orange); }
.notif-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.notif-list li { display: flex; gap: 8px; font-size: 12.5px; line-height: 1.5; color: var(--ink); }
.notif-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--orange); margin-top: 5px; flex-shrink: 0; }
.notif-empty { font-size: 12.5px; color: var(--muted); margin: 0; }

/* Summary cards */
.summary-card {
  background: var(--white);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
}
.card-head { display: flex; align-items: center; gap: 9px; font-weight: 700; font-size: 14px; }
.card-icon {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  background: var(--green-tint); color: var(--green);
  display: flex; align-items: center; justify-content: center;
}
.card-icon svg { width: 14px; height: 14px; }
.card-icon.good { background: var(--green-tint); color: var(--green); }
.card-icon.blue { background: var(--blue-tint); color: var(--blue); }

.scan-preview { display: flex; align-items: center; gap: 12px; }
.scan-thumb {
  width: 48px; height: 48px; border-radius: 12px; background: var(--bg);
  display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
}
.scan-preview b { display: block; font-size: 13.5px; margin-bottom: 4px; }
.tag {
  font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 999px;
}
.mini-state { font-size: 12.5px; color: var(--muted); margin: 0; }

.profile-desc { font-size: 12.5px; color: var(--muted); margin: 0; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  font-size: 12px; font-weight: 600; padding: 5px 11px; border-radius: 999px;
  background: var(--bg); border: 1px solid var(--line);
}

.stat-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.stat-list li { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.stat-dot { width: 8px; height: 8px; border-radius: 50%; }
.stat-dot.green { background: var(--green); }
.stat-dot.amber { background: var(--orange); }
.stat-dot.red { background: var(--red); }

.card-btn {
  margin-top: auto;
  text-align: center; font-size: 13px; font-weight: 700;
  padding: 10px; border-radius: 999px;
}
.card-btn.orange { background: var(--orange); color: #fff; }
.card-btn.green { background: var(--green-tint); color: var(--green-deep); }
.card-btn.blue { background: var(--blue-tint); color: var(--blue); }

@media (max-width: 860px) {
  .home-grid { grid-template-columns: 1fr; }
  .hero, .notif-card { grid-column: 1 / 2; }
  .hero { flex-direction: column; align-items: flex-start; }
  .hero-art { display: none; }
}
</style>