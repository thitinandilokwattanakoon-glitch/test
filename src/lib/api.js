// ---------------------------------------------------------------------------
// กินเลย — API client
// เชื่อมกับ backend ตัวเอง (FastAPI + Postgres + JWT ของตัวเอง — ไม่ใช่ Supabase)
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const TOKEN_KEY = 'kinloei_token'
const DEVICE_ID_KEY = 'kinloei_device_id'

// ---------- device_id ----------
// backend ต้องการ device_id เสมอ (ทั้งตอน login และตอนสแกนแบบไม่ login)
// สร้างครั้งเดียวแล้วเก็บถาวรไว้ใน localStorage ของเครื่องนั้นๆ
export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

// ---------- token (JWT ของ backend เอง) ----------
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn() {
  return !!getToken()
}

// ---------- helper: เรียก backend + จัดการ error ให้เป็นข้อความไทยอ่านง่าย ----------
async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : await res.text()

  if (!res.ok) {
    const message = (isJson && data?.detail) || `เกิดข้อผิดพลาด (HTTP ${res.status})`
    throw new Error(message)
  }
  return data
}

// ---------------------------------------------------------------------------
// Auth — POST /auth/register, /auth/login, GET /auth/me
// ---------------------------------------------------------------------------

export async function registerUser({ email, password, displayName }) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      display_name: displayName || null,
      device_id: getDeviceId(), // ผูกประวัติที่เคยสแกนแบบไม่ login เข้ากับบัญชีใหม่
    }),
  })
  setToken(data.token)
  return data.user
}

export async function loginUser({ email, password }) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  setToken(data.token)
  return data.user
}

export async function getMe() {
  return apiFetch('/auth/me')
}

// ---------------------------------------------------------------------------
// Scan — POST /analyze/scan, GET /analyze/history/{device_id}
// ---------------------------------------------------------------------------

/**
 * วิเคราะห์ภาพ/ข้อความอาหาร
 * @param {Object} params
 * @param {Blob|null} params.imageBlob - รูปที่ถ่าย/เลือก (ไม่บังคับถ้ามี textInput)
 * @param {string} [params.textInput] - ข้อความเพิ่มเติม (ไม่บังคับถ้ามีรูป)
 * @param {Object} [params.healthProfile] - { conditions, allergies, avoid_ingredients, notes, nutrient_limits }
 */
export async function scanFood({ imageBlob, textInput, healthProfile }) {
  const form = new FormData()
  form.append('device_id', getDeviceId())
  form.append('health_profile', JSON.stringify(healthProfile || {}))
  if (textInput) form.append('text_input', textInput)
  if (imageBlob) form.append('image', imageBlob, 'scan.jpg')

  return apiFetch('/analyze/scan', { method: 'POST', body: form })
}

export async function getHistory(limit = 20) {
  const data = await apiFetch(`/analyze/history/${getDeviceId()}?limit=${limit}`)
  return data.scans
}

// ---------------------------------------------------------------------------
// Profile — GET/PUT /profile/{device_id}
// ---------------------------------------------------------------------------

export async function getHealthProfile() {
  const data = await apiFetch(`/profile/${getDeviceId()}`)
  return data.health_profile
}

export async function updateHealthProfile(profile) {
  const data = await apiFetch(`/profile/${getDeviceId()}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  return data.health_profile
}