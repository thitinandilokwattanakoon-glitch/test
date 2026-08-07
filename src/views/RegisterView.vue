<template>
  <div class="auth-shell">

    <!-- Form side -->
    <div class="form-side">
      <div class="form-topbar">
        <router-link to="/" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          กลับหน้าแรก
        </router-link>
        <router-link to="/login" class="form-topbar-link">มีบัญชีอยู่แล้ว? เข้าสู่ระบบ</router-link>
      </div>

      <div class="form-center">
      <div class="form-card">
        <span class="pill">
          <span class="pill-dot"></span>
          สมัครสมาชิก
        </span>
        <h2>สร้างบัญชีใหม่</h2>
        <p class="form-sub">ใช้เวลาไม่ถึงนาที เริ่มสแกนได้ทันที</p>

        <form @submit.prevent="handleRegister">
          <div class="field-row-2">
            <div class="field">
              <label>ชื่อ</label>
              <input type="text" v-model="firstName" placeholder="ชื่อจริง" required />
            </div>
            <div class="field">
              <label>นามสกุล</label>
              <input type="text" v-model="lastName" placeholder="นามสกุล" required />
            </div>
          </div>

          <div class="field">
            <label>อีเมล</label>
            <input type="email" v-model="email" placeholder="you@example.com" required />
          </div>

          <div class="field">
            <label>เบอร์โทร</label>
            <input type="tel" v-model="phone" placeholder="08x-xxx-xxxx" />
          </div>

          <div class="field">
            <label>รหัสผ่าน</label>
            <div class="password-row">
              <input :type="showPw ? 'text' : 'password'" v-model="password" placeholder="อย่างน้อย 8 ตัวอักษร" required />
              <button type="button" class="eye-btn" @click="showPw = !showPw">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            <div class="strength-bar" v-if="password">
              <span
                v-for="n in 4"
                :key="n"
                class="strength-seg"
                :class="{ filled: n <= strength.score }"
                :style="n <= strength.score ? { background: strength.color } : {}"
              ></span>
            </div>
            <span class="strength-label" v-if="password" :style="{ color: strength.color }">{{ strength.label }}</span>
          </div>

          <div class="field">
            <label>ยืนยันรหัสผ่าน</label>
            <div class="password-row">
              <input :type="showPw2 ? 'text' : 'password'" v-model="confirmPassword" placeholder="พิมพ์รหัสผ่านอีกครั้ง" required />
              <button type="button" class="eye-btn" @click="showPw2 = !showPw2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <span class="mismatch" v-if="confirmPassword && confirmPassword !== password">รหัสผ่านไม่ตรงกัน</span>
          </div>

          <label class="checkbox terms">
            <input type="checkbox" v-model="agree" required />
            <span>ยอมรับ <a href="#" @click.prevent>ข้อกำหนดการใช้งาน</a> และ <a href="#" @click.prevent>นโยบายความเป็นส่วนตัว</a></span>
          </label>

          <button class="cta-btn" type="submit" :disabled="loading || !canSubmit">
            <span v-if="!loading">สร้างบัญชี</span>
            <span v-else class="loading-dots">กำลังสร้างบัญชี<i></i><i></i><i></i></span>
          </button>
        </form>

        <Transition name="fade">
          <div class="toast" v-if="toast">{{ toast }}</div>
        </Transition>
      </div>
      </div>
    </div>

    <!-- Brand side -->
    <div class="brand-side">
      <div class="brand-dots"></div>

      <router-link to="/" class="brand-logo">
        <div class="logo-mark">ก</div>
        <span>กินเลย</span>
      </router-link>

      <div class="brand-copy">
        <span class="brand-eyebrow">JOIN KINLOEI</span>
        <h1>รู้ทันทุก<br /><em>ส่วนประกอบ</em></h1>

        <ul class="feature-list">
          <li><span class="check">✓</span>วิเคราะห์ฉลากด้วย Gemini 3 Flash</li>
          <li><span class="check">✓</span>บันทึกประวัติการสแกนไม่จำกัด</li>
          <li><span class="check">✓</span>ปรับผลตามโปรไฟล์สุขภาพของคุณ</li>
          <li><span class="check">✓</span>ให้คำแนะนำแบบไม่ตัดสิน</li>
        </ul>
      </div>

      <div class="mini-gauge-row">
        <div class="mini-gauge" style="--pct: 94; --gcolor: #4f9271">
          <div class="mini-gauge-inner"><b>94%</b></div>
        </div>
        <span class="mini-gauge-caption">ความแม่นยำเฉลี่ยของการวิเคราะห์</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPw = ref(false)
const showPw2 = ref(false)
const agree = ref(false)
const loading = ref(false)
const toast = ref('')

const strength = computed(() => {
  const v = password.value
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++
  if (/\d/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  const levels = [
    { label: 'อ่อนมาก', color: '#c1503f' },
    { label: 'อ่อน', color: '#c98a3e' },
    { label: 'ปานกลาง', color: '#c9a63e' },
    { label: 'แข็งแรง', color: '#4f9271' },
  ]
  return { score, ...levels[Math.max(0, score - 1)] }
})

const canSubmit = computed(
  () => agree.value && password.value.length >= 8 && password.value === confirmPassword.value
)

function handleRegister() {
  if (!canSubmit.value) return
  loading.value = true
  setTimeout(() => {
    loading.value = false
    toast.value = 'สมัครสมาชิกสำเร็จ (เดโม)'
    setTimeout(() => router.push('/'), 700)
  }, 900)
}
</script>

<style scoped>
.auth-shell {
  display: grid;
  grid-template-columns: 1fr minmax(320px, 36%);
  min-height: 100vh;
}
@media (max-width: 900px) {
  .auth-shell { grid-template-columns: 1fr; }
  .brand-side { display: none; }
}

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

.form-card { max-width: 420px; width: 100%; margin: 24px 0; position: relative; }
.form-card .pill {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid rgba(52, 105, 78, 0.22); background: rgba(79, 146, 113, 0.08);
  color: var(--green-deep); font-family: 'IBM Plex Mono', monospace;
  font-weight: 600; font-size: 11px; letter-spacing: 0.06em;
  padding: 6px 13px; border-radius: 999px; margin-bottom: 18px;
}
.form-card .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); }
.form-card h2 { font-size: 26px; font-weight: 700; color: var(--ink); margin: 0 0 6px; }
.form-sub { color: var(--muted); font-size: 14px; margin: 0 0 26px; }

form { display: flex; flex-direction: column; gap: 15px; }
.field-row-2 { display: flex; gap: 12px; }
.field-row-2 .field { flex: 1; min-width: 0; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 12.5px; font-weight: 600; color: var(--muted); }
.field input {
  width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 11px 14px;
  font-size: 14px; font-family: inherit; color: var(--ink); background: var(--paper);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field input:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px rgba(79, 146, 113, 0.15); }

.password-row { display: flex; align-items: center; gap: 8px; }
.password-row input { flex: 1; }
.eye-btn {
  flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; border: 1px solid var(--line);
  background: var(--paper); color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.eye-btn svg { width: 16px; height: 16px; }
.eye-btn:hover { color: var(--green-deep); border-color: var(--green); }

.strength-bar { display: flex; gap: 4px; margin-top: 4px; }
.strength-seg { flex: 1; height: 4px; border-radius: 3px; background: var(--line); transition: background 0.2s; }
.strength-label { font-size: 11px; font-weight: 600; margin-top: 2px; display: inline-block; }
.mismatch { font-size: 11px; color: var(--red); margin-top: 2px; }

.checkbox { display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: var(--muted); cursor: pointer; line-height: 1.5; }
.checkbox input { accent-color: var(--green); width: 15px; height: 15px; margin-top: 2px; flex-shrink: 0; }
.checkbox a { color: var(--green-deep); font-weight: 600; }

.cta-btn {
  width: 100%; padding: 14px; border-radius: 999px; border: none; font-weight: 700; font-size: 15px;
  background: var(--green); color: #fff; cursor: pointer; margin-top: 4px;
  box-shadow: 0 3px 0 var(--green-deep); transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
}
.cta-btn:hover:not(:disabled) { background: var(--green-deep); transform: translateY(-1px); }
.cta-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.loading-dots i { width: 4px; height: 4px; background: #fff; border-radius: 50%; display: inline-block; margin-left: 3px; animation: blink-dot 1.2s infinite; }
.loading-dots i:nth-child(2) { animation-delay: 0.2s; }
.loading-dots i:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink-dot { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

.toast {
  position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%);
  background: var(--dark); color: #fff; font-size: 13px; font-weight: 600;
  padding: 10px 20px; border-radius: 999px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25); z-index: 40;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Brand side */
.brand-side {
  position: relative; background: var(--dark); color: #fff;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 44px 52px; overflow: hidden;
}
.brand-dots {
  position: absolute; inset: 0; pointer-events: none; opacity: 0.5;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
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
.brand-copy h1 { font-size: clamp(32px, 4vw, 46px); line-height: 1.15; font-weight: 700; margin: 0 0 28px; }
.brand-copy h1 em {
  font-style: normal;
  background: linear-gradient(100deg, var(--green) 10%, #dcefe0 90%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.feature-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 13px; }
.feature-list li { display: flex; align-items: center; gap: 10px; font-size: 14.5px; color: #d6ddd2; }
.check {
  width: 20px; height: 20px; border-radius: 50%; background: rgba(79, 146, 113, 0.25); color: var(--green);
  display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; flex-shrink: 0;
}

.mini-gauge-row { position: relative; display: flex; align-items: center; gap: 14px; }
.mini-gauge {
  width: 58px; height: 58px; border-radius: 50%; flex-shrink: 0;
  background: conic-gradient(var(--gcolor) calc(var(--pct) * 1%), rgba(255, 255, 255, 0.12) 0);
  display: flex; align-items: center; justify-content: center;
}
.mini-gauge-inner { width: 46px; height: 46px; border-radius: 50%; background: var(--dark-2); display: flex; align-items: center; justify-content: center; }
.mini-gauge-inner b { font-size: 13px; color: #fff; }
.mini-gauge-caption { font-size: 12px; color: #9aa79c; max-width: 160px; line-height: 1.5; }
</style>