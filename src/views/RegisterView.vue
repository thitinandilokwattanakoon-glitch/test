<template>
  <div class="register-page">
    <router-link to="/" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      กลับหน้าแรก
    </router-link>

    <div class="card-wrap">
      <div class="label-card">

        <!-- ตราประทับมุมการ์ด -->
        <div class="stamp" aria-hidden="true">
          <span class="stamp-check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </span>
          <span class="stamp-label">สมัครใหม่</span>
        </div>

        <div class="label-band">
          <span>ข้อมูลสมาชิกใหม่</span>
          <span class="band-dot"><i></i>GEMINI 3 FLASH</span>
        </div>

        <div class="scan-beam" aria-hidden="true"></div>

        <div class="label-body">
          <h1>สร้างบัญชีใหม่</h1>
          <p class="sub">ใช้เวลาไม่ถึงนาที เริ่มสแกนและบันทึกประวัติได้ทันที</p>

          <form @submit.prevent="handleRegister">

            <!-- แถวสองคอลัมน์ — เหมือนตารางฉลากที่โชว์ "ต่อหน่วยบริโภค / ต่อ 100 กรัม" -->
            <div class="row two-col">
              <div class="col">
                <label>ชื่อ</label>
                <input type="text" v-model="firstName" placeholder="ชื่อจริง" required />
              </div>
              <div class="col-divider"></div>
              <div class="col">
                <label>นามสกุล</label>
                <input type="text" v-model="lastName" placeholder="นามสกุล" required />
              </div>
            </div>

            <div class="row">
              <label>อีเมล</label>
              <input type="email" v-model="email" placeholder="you@example.com" required />
            </div>

            <div class="row">
              <label>รหัสผ่าน</label>
              <div class="pw-wrap">
                <input :type="showPw ? 'text' : 'password'" v-model="password" placeholder="อย่างน้อย 8 ตัวอักษร" required />
                <button type="button" class="eye-btn" @click="showPw = !showPw" aria-label="แสดง/ซ่อนรหัสผ่าน">
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
                  :style="n <= strength.score ? { background: strength.color } : {}"
                ></span>
              </div>
              <span class="strength-label" v-if="password" :style="{ color: strength.color }">{{ strength.label }}</span>
            </div>

            <div class="row">
              <label>ยืนยันรหัสผ่าน</label>
              <div class="pw-wrap">
                <input :type="showPw2 ? 'text' : 'password'" v-model="confirmPassword" placeholder="พิมพ์รหัสผ่านอีกครั้ง" required />
                <button type="button" class="eye-btn" @click="showPw2 = !showPw2" aria-label="แสดง/ซ่อนรหัสผ่าน">
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

            <div class="thick-rule"></div>

            <button class="cta-btn" type="submit" :disabled="loading || !canSubmit">
              <span v-if="!loading">สร้างบัญชี</span>
              <span v-else class="loading-dots">กำลังสร้างบัญชี<i></i><i></i><i></i></span>
            </button>

            <p class="footnote">* ข้อมูลของคุณใช้เพื่อปรับผลวิเคราะห์ให้ตรงกับสุขภาพของคุณเท่านั้น</p>
          </form>

          <div class="register-line">
            มีบัญชีอยู่แล้ว? <router-link to="/login">เข้าสู่ระบบ</router-link>
          </div>
        </div>

        <Transition name="fade">
          <div class="toast" :class="{ 'toast-error': toastIsError }" v-if="toast">{{ toast }}</div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser, getDeviceId } from '../lib/api.js'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPw = ref(false)
const showPw2 = ref(false)
const agree = ref(false)
const loading = ref(false)
const toast = ref('')
const toastIsError = ref(false)

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
    { label: 'แข็งแรง', color: '#3f8f5f' },
  ]
  return { score, ...levels[Math.max(0, score - 1)] }
})

const canSubmit = computed(
  () => agree.value && password.value.length >= 8 && password.value === confirmPassword.value
)

async function handleRegister() {
  if (!canSubmit.value) return
  loading.value = true
  toast.value = ''
  toastIsError.value = false

  try {
    // ส่ง device_id เดิม (ถ้ามีประวัติสแกนแบบไม่ login มาก่อน) ไปด้วย
    // เพื่อให้ backend ผูกประวัติเก่าเข้ากับบัญชีใหม่แทนที่จะทิ้งไป
    await registerUser({
      email: email.value,
      password: password.value,
      displayName: `${firstName.value} ${lastName.value}`.trim(),
      deviceId: getDeviceId(),
    })
    toast.value = 'สมัครสมาชิกสำเร็จ'
    setTimeout(() => router.push('/'), 600)
  } catch (err) {
    toastIsError.value = true
    toast.value = err.message || 'สมัครสมาชิกไม่สำเร็จ ลองใหม่อีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  --paper: #fbf1e4;
  --paper-line: #e4d3b8;
  --ink-warm: #2b2118;

  min-height: 100vh;
  background:
    radial-gradient(rgba(43, 33, 24, 0.05) 1px, transparent 1px) 0 0 / 22px 22px,
    var(--paper);
  display: flex; flex-direction: column; align-items: center;
  padding: 28px 20px 60px;
}

.back-link {
  align-self: flex-start;
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13.5px; font-weight: 600; color: var(--ink-warm); opacity: 0.65;
  text-decoration: none; margin-bottom: 22px;
}
.back-link svg { width: 15px; height: 15px; }
.back-link:hover { opacity: 1; }

.card-wrap { width: 100%; max-width: 460px; margin: auto 0; }

.label-card {
  position: relative;
  background: var(--white);
  border: 1.5px solid var(--paper-line);
  border-radius: 18px;
  box-shadow: 0 18px 40px -18px rgba(43, 33, 24, 0.28);
  overflow: visible;
  animation: card-in 0.5s cubic-bezier(.2,.9,.25,1) both;
}
@keyframes card-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* ---------- ตราประทับ ---------- */
.stamp {
  position: absolute; top: -20px; right: -12px; width: 68px; height: 68px;
  z-index: 5; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  border-radius: 50%; background: rgba(251, 241, 228, 0.96);
  border: 2px dashed var(--orange-deep);
  box-shadow: 0 6px 14px -4px rgba(43, 33, 24, 0.25);
  transform: rotate(-10deg);
  animation: stamp-in 0.6s 0.35s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes stamp-in { from { opacity: 0; transform: rotate(10deg) scale(0.6); } to { opacity: 1; transform: rotate(-10deg) scale(1); } }
.stamp-check {
  width: 22px; height: 22px; border-radius: 50%; background: var(--orange);
  color: #fff; display: flex; align-items: center; justify-content: center;
}
.stamp-check svg { width: 12px; height: 12px; }
.stamp-label {
  font-family: var(--font-mono); font-size: 8.5px; font-weight: 700;
  letter-spacing: 0.03em; color: var(--orange-deep);
}

/* ---------- แถบหัวฉลาก ---------- */
.label-band {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 4px solid var(--ink-warm);
  font-family: var(--font-mono); font-weight: 700; font-size: 12.5px;
  letter-spacing: 0.08em; color: var(--ink-warm);
  border-radius: 18px 18px 0 0;
}
.band-dot { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; color: var(--muted); font-weight: 600; }
.band-dot i {
  width: 6px; height: 6px; border-radius: 50%; background: var(--green);
  box-shadow: 0 0 0 3px rgba(63, 143, 95, 0.22);
  animation: pulse-dot 1.6s ease-in-out infinite;
}
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }

/* ---------- ลำแสงสแกน ---------- */
.scan-beam {
  position: absolute; left: 6%; right: 6%; height: 2px; top: 54px;
  background: linear-gradient(90deg, transparent, var(--orange) 30%, #ffe0be 50%, var(--orange) 70%, transparent);
  box-shadow: 0 0 10px 1px rgba(233, 122, 47, 0.5);
  animation: sweep 1.3s 0.15s cubic-bezier(.3,.8,.4,1) both;
  pointer-events: none;
}
@keyframes sweep {
  0% { top: 54px; opacity: 0; }
  12% { opacity: 1; }
  92% { opacity: 0.9; }
  100% { top: 92%; opacity: 0; }
}

.label-body { padding: 26px 24px 22px; }
.label-body h1 { font-size: 24px; font-weight: 700; color: var(--ink-warm); margin: 0 0 6px; }
.sub { font-size: 13.5px; color: var(--muted); line-height: 1.6; margin: 0 0 20px; }

form { display: flex; flex-direction: column; }

.row {
  display: flex; flex-direction: column; gap: 5px;
  padding: 11px 0;
  border-bottom: 1px dashed var(--paper-line);
}

.row.two-col { flex-direction: row; align-items: stretch; gap: 0; }
.row.two-col .col { flex: 1; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.col-divider { width: 1px; background: var(--paper-line); margin: 0 16px; }

.row label, .col label {
  font-family: var(--font-mono); font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.08em; color: var(--muted); text-transform: uppercase;
}
.row input, .col input {
  width: 100%; border: none; background: transparent; padding: 3px 0;
  font-size: 15px; font-family: inherit; color: var(--ink-warm);
  outline: none;
}
.row input::placeholder, .col input::placeholder { color: #c9bda4; }

.pw-wrap { display: flex; align-items: center; gap: 8px; }
.pw-wrap input { flex: 1; }
.eye-btn {
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 8px; border: none;
  background: transparent; color: var(--muted); display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.eye-btn svg { width: 16px; height: 16px; }
.eye-btn:hover { color: var(--orange-deep); }

.strength-bar { display: flex; gap: 4px; margin-top: 5px; }
.strength-seg { flex: 1; height: 4px; border-radius: 3px; background: var(--paper-line); transition: background 0.2s; }
.strength-label { font-size: 11px; font-weight: 600; margin-top: 3px; display: inline-block; }
.mismatch { font-size: 11px; color: var(--red); margin-top: 3px; }

.checkbox.terms {
  display: flex; align-items: flex-start; gap: 8px; font-size: 12.5px; color: var(--muted);
  cursor: pointer; line-height: 1.5; padding-top: 14px;
}
.checkbox.terms input { accent-color: var(--orange); width: 15px; height: 15px; margin-top: 2px; flex-shrink: 0; }
.checkbox.terms a { color: var(--orange-deep); font-weight: 600; }

.thick-rule { height: 3px; background: var(--ink-warm); margin: 16px 0 18px; border-radius: 2px; }

.cta-btn {
  width: 100%; padding: 15px; border-radius: 999px; border: none; font-weight: 700; font-size: 15.5px;
  background: var(--orange); color: #fff; cursor: pointer;
  box-shadow: 0 3px 0 var(--orange-deep); transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}
.cta-btn:hover:not(:disabled) { background: var(--orange-deep); transform: translateY(-1px); }
.cta-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.loading-dots i { width: 4px; height: 4px; background: #fff; border-radius: 50%; display: inline-block; margin-left: 3px; animation: blink-dot 1.2s infinite; }
.loading-dots i:nth-child(2) { animation-delay: 0.2s; }
.loading-dots i:nth-child(3) { animation-delay: 0.4s; }
@keyframes blink-dot { 0%, 80%, 100% { opacity: 0.2; } 40% { opacity: 1; } }

.footnote {
  font-family: var(--font-mono); font-size: 10.5px; color: var(--muted);
  text-align: center; margin: 12px 0 0; letter-spacing: 0.01em;
}

.register-line { text-align: center; font-size: 13.5px; color: var(--muted); margin-top: 18px; }
.register-line a { color: var(--orange-deep); font-weight: 700; text-decoration: none; }
.register-line a:hover { text-decoration: underline; }

.toast {
  position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%);
  background: var(--ink-warm); color: #fff; font-size: 13px; font-weight: 600;
  padding: 10px 20px; border-radius: 999px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25); z-index: 40;
}
.toast.toast-error { background: var(--red); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 420px) {
  .stamp { width: 56px; height: 56px; top: -14px; right: -6px; }
  .stamp-label { font-size: 7.5px; }
  .row.two-col { flex-direction: column; gap: 12px; }
  .col-divider { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .label-card, .stamp, .scan-beam, .band-dot i { animation: none !important; }
}
</style>