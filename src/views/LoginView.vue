<template>
  <div class="auth-shell">

    <!-- Brand side -->
    <div class="brand-side">
      <div class="brand-dots"></div>
      <div class="scan-line"></div>

      <router-link to="/" class="brand-logo">
        <div class="logo-mark">ก</div>
        <span>กินเลย</span>
      </router-link>

      <div class="brand-copy">
        <span class="brand-eyebrow">WELCOME BACK</span>
        <h1>ถ่ายรูป<br />ก่อน<em>กินเลย</em></h1>
        <p>เข้าสู่ระบบเพื่อดูประวัติการสแกน และให้ Gemini จำโปรไฟล์สุขภาพของคุณไว้</p>
      </div>

      <div class="brand-badge">
        <div class="badge-dot"></div>
        <span>GEMINI 3 FLASH · ONLINE</span>
      </div>
    </div>

    <!-- Form side -->
    <div class="form-side">
      <div class="form-topbar">
        <router-link to="/" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          กลับหน้าแรก
        </router-link>
        <router-link to="/register" class="form-topbar-link">ยังไม่มีบัญชี? สมัครสมาชิก</router-link>
      </div>

      <div class="form-center">
      <div class="form-card">
        <span class="pill">
          <span class="pill-dot"></span>
          เข้าสู่ระบบ
        </span>
        <h2>ยินดีต้อนรับกลับมา</h2>
        <p class="form-sub">กรอกข้อมูลเพื่อเข้าใช้งานบัญชีของคุณ</p>

        <form @submit.prevent="handleLogin">
          <div class="field">
            <label>อีเมล</label>
            <input type="email" v-model="email" placeholder="you@example.com" required />
          </div>

          <div class="field">
            <label>รหัสผ่าน</label>
            <div class="password-row">
              <input :type="showPw ? 'text' : 'password'" v-model="password" placeholder="••••••••" required />
              <button type="button" class="eye-btn" @click="showPw = !showPw">
                <svg v-if="!showPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.9 4.24A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a13.2 13.2 0 0 1-3.15 3.94M6.1 6.1C3.5 7.9 2 11 2 11s3.5 7 10 7c1.3 0 2.47-.28 3.5-.74" />
                </svg>
              </button>
            </div>
          </div>

          <div class="field-row">
            <label class="checkbox">
              <input type="checkbox" v-model="remember" />
              <span>จำฉันไว้</span>
            </label>
            <router-link to="/forgot-password" class="link-btn">ลืมรหัสผ่าน?</router-link>
          </div>

          <button class="cta-btn" type="submit" :disabled="loading">
            <span v-if="!loading">เข้าสู่ระบบ</span>
            <span v-else class="loading-dots">กำลังเข้าสู่ระบบ<i></i><i></i><i></i></span>
          </button>
        </form>

        <div class="divider"><span>หรือ</span></div>

        <div class="social-row">
          <button class="social-btn">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.2 14.7 2.2 12 2.2 6.9 2.2 2.7 6.4 2.7 11.7S6.9 21.2 12 21.2c6.9 0 9.2-4.8 9.2-7.3 0-.5-.05-.9-.1-1.3H12z" /></svg>
            Google
          </button>
          <button class="social-btn">
            <svg viewBox="0 0 24 24" width="18" height="18"><path fill="#1877F2" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" /></svg>
            Facebook
          </button>
        </div>

        <Transition name="fade">
          <div class="toast" v-if="toast">{{ toast }}</div>
        </Transition>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPw = ref(false)
const remember = ref(true)
const loading = ref(false)
const toast = ref('')

function handleLogin() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.value = 'เข้าสู่ระบบสำเร็จ (เดโม)'
    setTimeout(() => router.push('/'), 700)
  }, 900)
}
</script>

<style scoped>
.auth-shell {
  display: grid;
  grid-template-columns: minmax(320px, 36%) 1fr;
  min-height: 100vh;
}
@media (max-width: 900px) {
  .auth-shell { grid-template-columns: 1fr; }
  .brand-side { display: none; }
}

/* Brand side */
.brand-side {
  position: relative;
  background: var(--dark);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 44px 52px;
  overflow: hidden;
}
.brand-dots {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
}
.scan-line {
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--green) 20%, #dcefe0 50%, var(--green) 80%, transparent);
  box-shadow: 0 0 16px 2px rgba(79, 146, 113, 0.6);
  animation: scan 3.2s ease-in-out infinite;
}
@keyframes scan {
  0% { top: 8%; opacity: 0.15; }
  50% { top: 92%; opacity: 0.9; }
  100% { top: 8%; opacity: 0.15; }
}

.brand-logo { position: relative; display: flex; align-items: center; gap: 10px; text-decoration: none; color: #fff; width: fit-content; }
.brand-logo .logo-mark {
  width: 38px; height: 38px; border-radius: 12px;
  background: linear-gradient(155deg, var(--green) 0%, var(--green-deep) 130%);
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 17px;
}
.brand-logo span { font-weight: 700; font-size: 17px; }

.brand-copy { position: relative; }
.brand-eyebrow {
  font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; font-weight: 700;
  letter-spacing: 0.14em; color: var(--green); display: block; margin-bottom: 16px;
}
.brand-copy h1 { font-size: clamp(34px, 4.4vw, 52px); line-height: 1.15; font-weight: 700; margin: 0 0 18px; }
.brand-copy h1 em {
  font-style: normal;
  background: linear-gradient(100deg, var(--green) 10%, #dcefe0 90%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.brand-copy p { font-size: 15px; color: #9aa79c; max-width: 380px; line-height: 1.7; }

.brand-badge {
  position: relative; display: inline-flex; align-items: center; gap: 8px; width: fit-content;
  font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 0.08em; color: #9aa79c;
  border: 1px solid rgba(255, 255, 255, 0.14); padding: 8px 14px; border-radius: 999px;
}
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px rgba(79, 146, 113, 0.3); animation: pulse-dot 1.4s ease-in-out infinite; }
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* Form side */
.form-side { display: flex; flex-direction: column; min-height: 100vh; padding: 32px 40px; background: var(--bg); overflow-y: auto; }
.form-topbar { display: flex; align-items: center; justify-content: space-between; }
.form-center { flex: 1; display: flex; align-items: center; justify-content: center; }
.back-link {
  display: flex; align-items: center; gap: 6px; color: var(--muted); text-decoration: none;
  font-size: 13.5px; font-weight: 600;
}
.back-link svg { width: 15px; height: 15px; }
.back-link:hover { color: var(--ink); }
.form-topbar-link { font-size: 13px; color: var(--green-deep); font-weight: 600; text-decoration: none; }
.form-topbar-link:hover { text-decoration: underline; }

.form-card { max-width: 400px; width: 100%; margin: 32px 0; position: relative; }
.form-card .pill {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid rgba(52, 105, 78, 0.22); background: rgba(79, 146, 113, 0.08);
  color: var(--green-deep); font-family: 'IBM Plex Mono', monospace;
  font-weight: 600; font-size: 11px; letter-spacing: 0.06em;
  padding: 6px 13px; border-radius: 999px; margin-bottom: 18px;
}
.form-card .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
.form-card h2 { font-size: 26px; font-weight: 700; color: var(--ink); margin: 0 0 6px; }
.form-sub { color: var(--muted); font-size: 14px; margin: 0 0 28px; }

form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12.5px; font-weight: 600; color: var(--muted); }
.field input {
  width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px;
  font-size: 14px; font-family: inherit; color: var(--ink); background: var(--paper);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px rgba(79, 146, 113, 0.15); }

.password-row { display: flex; align-items: center; gap: 8px; }
.password-row input { flex: 1; }
.eye-btn {
  flex-shrink: 0; width: 42px; height: 42px; border-radius: 10px; border: 1px solid var(--line);
  background: var(--paper); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.eye-btn svg { width: 17px; height: 17px; }
.eye-btn:hover { color: var(--green-deep); border-color: var(--green); }

.field-row { display: flex; align-items: center; justify-content: space-between; }
.checkbox { display: flex; align-items: center; gap: 7px; font-size: 13px; color: var(--muted); cursor: pointer; }
.checkbox input { accent-color: var(--green); width: 15px; height: 15px; }
.link-btn { font-size: 13px; color: var(--green-deep); font-weight: 600; text-decoration: none; }
.link-btn:hover { text-decoration: underline; }

.cta-btn {
  width: 100%; padding: 14px; border-radius: 999px; border: none; font-weight: 700; font-size: 15px;
  background: var(--green); color: #fff; cursor: pointer; margin-top: 4px;
  box-shadow: 0 3px 0 var(--green-deep); transition: transform 0.15s, box-shadow 0.15s;
}
.cta-btn:hover:not(:disabled) { background: var(--green-deep); transform: translateY(-1px); }
.cta-btn:disabled { opacity: 0.75; cursor: not-allowed; }

.loading-dots i { width: 4px; height: 4px; background: #fff; border-radius: 50%; display: inline-block; margin-left: 3px; animation: blink-dot 1.2s infinite; }
.loading-dots i:nth-child(2) { animation-delay: 0.2s; }
.loading-dots i:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink-dot { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

.divider { display: flex; align-items: center; gap: 12px; margin: 24px 0 18px; color: var(--muted); font-size: 12px; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--line); }

.social-row { display: flex; gap: 10px; }
.social-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 11px; border-radius: 12px; border: 1px solid var(--line); background: var(--paper);
  font-size: 13.5px; font-weight: 600; color: var(--ink); cursor: pointer; transition: 0.15s;
}
.social-btn:hover { border-color: var(--green); background: rgba(79, 146, 113, 0.05); }

.toast {
  position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%);
  background: var(--dark); color: #fff; font-size: 13px; font-weight: 600;
  padding: 10px 20px; border-radius: 999px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25); z-index: 40;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>