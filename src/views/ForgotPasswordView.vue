<template>
  <div class="reset-shell">
    <div class="blob blob-a"></div>
    <div class="blob blob-b"></div>

    <router-link to="/" class="top-logo">
      <div class="logo-mark">ก</div>
      <span>กินเลย</span>
    </router-link>

    <div class="reset-card">
      <Transition name="fade" mode="out-in">

        <!-- STEP 1: request -->
        <div class="step" key="request" v-if="!sent">
          <div class="icon-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="M3 7l9 6 9-6" />
            </svg>
          </div>

          <span class="pill">
            <span class="pill-dot"></span>
            รีเซ็ตรหัสผ่าน
          </span>
          <h1>ลืมรหัสผ่าน?</h1>
          <p class="sub">ใส่อีเมลที่ใช้สมัคร เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้</p>

          <form @submit.prevent="handleSend">
            <div class="field">
              <label>อีเมล</label>
              <input type="email" v-model="email" placeholder="you@example.com" required />
            </div>

            <button class="cta-btn" type="submit" :disabled="loading">
              <span v-if="!loading">ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
              <span v-else class="loading-dots">กำลังส่ง<i></i><i></i><i></i></span>
            </button>
          </form>

          <router-link to="/login" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            กลับไปเข้าสู่ระบบ
          </router-link>
        </div>

        <!-- STEP 2: sent confirmation -->
        <div class="step" key="sent" v-else>
          <div class="icon-badge success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <span class="pill">
            <span class="pill-dot"></span>
            ส่งอีเมลแล้ว
          </span>
          <h1>ตรวจสอบกล่องจดหมาย</h1>
          <p class="sub">
            เราส่งลิงก์รีเซ็ตรหัสผ่านไปที่<br />
            <b>{{ email }}</b> แล้ว
          </p>

          <button class="cta-btn ghost" @click="resend" :disabled="cooldown > 0">
            <span v-if="cooldown > 0">ส่งอีกครั้งได้ใน {{ cooldown }}s</span>
            <span v-else>ส่งอีกครั้ง</span>
          </button>

          <router-link to="/login" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            กลับไปเข้าสู่ระบบ
          </router-link>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const email = ref('')
const loading = ref(false)
const sent = ref(false)
const cooldown = ref(0)
let cooldownTimer = null

function startCooldown() {
  cooldown.value = 30
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

function handleSend() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    sent.value = true
    startCooldown()
  }, 900)
}

function resend() {
  if (cooldown.value > 0) return
  startCooldown()
}

onBeforeUnmount(() => clearInterval(cooldownTimer))
</script>

<style scoped>
.reset-shell {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  overflow: hidden;
}

.top-logo {
  position: relative; display: flex; align-items: center; gap: 10px;
  text-decoration: none; color: var(--ink); margin-bottom: 48px;
}
.top-logo .logo-mark {
  width: 36px; height: 36px; border-radius: 11px;
  background: linear-gradient(155deg, var(--green) 0%, var(--green-deep) 130%);
  color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px;
}
.top-logo span { font-weight: 700; font-size: 17px; }

.reset-card {
  position: relative;
  width: 100%; max-width: 420px;
  background: var(--paper); border: 1px solid var(--line); border-radius: 26px;
  padding: 40px 34px;
  box-shadow: 0 16px 40px rgba(22, 33, 28, 0.08);
  margin: auto;
}

.step { display: flex; flex-direction: column; align-items: center; text-align: center; }

.icon-badge {
  width: 64px; height: 64px; border-radius: 20px; margin-bottom: 20px;
  background: linear-gradient(155deg, rgba(79, 146, 113, 0.16) 0%, rgba(79, 146, 113, 0.32) 100%);
  color: var(--green-deep); display: flex; align-items: center; justify-content: center;
}
.icon-badge svg { width: 28px; height: 28px; }
.icon-badge.success { background: linear-gradient(155deg, rgba(79, 146, 113, 0.85) 0%, var(--green-deep) 130%); color: #fff; }

.pill {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid rgba(52, 105, 78, 0.22); background: rgba(79, 146, 113, 0.08);
  color: var(--green-deep); font-family: 'IBM Plex Mono', monospace;
  font-weight: 600; font-size: 11px; letter-spacing: 0.06em;
  padding: 6px 13px; border-radius: 999px; margin-bottom: 16px;
}
.pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }

h1 { font-size: 24px; font-weight: 700; color: var(--ink); margin: 0 0 10px; }
.sub { font-size: 14px; color: var(--muted); line-height: 1.7; margin: 0 0 26px; }
.sub b { color: var(--ink); }

form { width: 100%; display: flex; flex-direction: column; gap: 18px; }
.field { display: flex; flex-direction: column; gap: 6px; text-align: left; }
.field label { font-size: 12.5px; font-weight: 600; color: var(--muted); }
.field input {
  width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px;
  font-size: 14px; font-family: inherit; color: var(--ink); background: var(--bg);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px rgba(79, 146, 113, 0.15); }

.cta-btn {
  width: 100%; padding: 14px; border-radius: 999px; border: none; font-weight: 700; font-size: 15px;
  background: var(--green); color: #fff; cursor: pointer;
  box-shadow: 0 3px 0 var(--green-deep); transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
}
.cta-btn:hover:not(:disabled) { background: var(--green-deep); transform: translateY(-1px); }
.cta-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.cta-btn.ghost {
  background: none; color: var(--green-deep); border: 1.5px solid var(--line); box-shadow: none; margin-top: 4px;
}
.cta-btn.ghost:hover:not(:disabled) { border-color: var(--green); background: rgba(79, 146, 113, 0.06); transform: none; }

.loading-dots i { width: 4px; height: 4px; background: #fff; border-radius: 50%; display: inline-block; margin-left: 3px; animation: blink-dot 1.2s infinite; }
.loading-dots i:nth-child(2) { animation-delay: 0.2s; }
.loading-dots i:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink-dot { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

.back-link {
  display: flex; align-items: center; gap: 6px; margin-top: 22px;
  color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 600;
}
.back-link svg { width: 14px; height: 14px; }
.back-link:hover { color: var(--ink); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-enter-from { opacity: 0; transform: translateY(6px); }
.fade-leave-to { opacity: 0; transform: translateY(-6px); }
</style>