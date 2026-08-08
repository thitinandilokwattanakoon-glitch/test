<template>
  <div class="profile-page">
    <div class="intro">
      <span class="eyebrow">HEALTH PROFILE</span>
      <h1>โปรไฟล์สุขภาพของคุณ</h1>
      <p>ข้อมูลนี้จะถูกใช้ทุกครั้งที่วิเคราะห์ฉลาก เพื่อเช็คว่าเหมาะกับคุณไหม</p>
    </div>

    <div v-if="loading" class="state-box">กำลังโหลดโปรไฟล์...</div>

    <form v-else class="profile-form" @submit.prevent="save">
      <!-- โรคประจำตัว -->
      <section class="field-group">
        <label>โรคประจำตัว</label>
        <div class="tag-input">
          <span v-for="(item, i) in conditions" :key="item" class="chip">
            {{ item }}
            <button type="button" class="chip-x" @click="conditions.splice(i, 1)">✕</button>
          </span>
          <input
            v-model="conditionInput"
            type="text"
            placeholder="พิมพ์แล้วกด Enter เช่น เบาหวาน"
            @keydown.enter.prevent="addTag(conditions, 'conditionInput')"
          />
        </div>
      </section>

      <!-- อาหารที่แพ้ -->
      <section class="field-group">
        <label>อาหารที่แพ้</label>
        <div class="tag-input">
          <span v-for="(item, i) in allergies" :key="item" class="chip">
            {{ item }}
            <button type="button" class="chip-x" @click="allergies.splice(i, 1)">✕</button>
          </span>
          <input
            v-model="allergyInput"
            type="text"
            placeholder="พิมพ์แล้วกด Enter เช่น กุ้ง, ถั่วลิสง"
            @keydown.enter.prevent="addTag(allergies, 'allergyInput')"
          />
        </div>
      </section>

      <!-- ส่วนผสมที่ต้องเลี่ยง -->
      <section class="field-group">
        <label>ส่วนผสมที่ต้องเลี่ยงเป็นพิเศษ</label>
        <div class="tag-input">
          <span v-for="(item, i) in avoidIngredients" :key="item" class="chip">
            {{ item }}
            <button type="button" class="chip-x" @click="avoidIngredients.splice(i, 1)">✕</button>
          </span>
          <input
            v-model="avoidInput"
            type="text"
            placeholder="พิมพ์แล้วกด Enter เช่น ผงชูรส, สีผสมอาหาร"
            @keydown.enter.prevent="addTag(avoidIngredients, 'avoidInput')"
          />
        </div>
      </section>

      <!-- หมายเหตุ -->
      <section class="field-group">
        <label>หมายเหตุเพิ่มเติม</label>
        <textarea v-model="notes" rows="3" placeholder="เช่น แพ้กุ้งรุนแรงมาก ระวังเป็นพิเศษ"></textarea>
      </section>

      <!-- จำกัดสารอาหารต่อวัน -->
      <section class="field-group">
        <label>จำกัดสารอาหารต่อวัน</label>
        <div v-if="nutrientLimits.length" class="nutrient-list">
          <div v-for="(item, i) in nutrientLimits" :key="i" class="nutrient-row">
            <input type="checkbox" v-model="item.enabled" />
            <span class="nutrient-label">{{ item.label }}</span>
            <span class="nutrient-max">≤ {{ item.max }} {{ item.unit }}/วัน</span>
            <button type="button" class="chip-x" @click="nutrientLimits.splice(i, 1)">✕</button>
          </div>
        </div>

        <div class="nutrient-add">
          <input v-model="newNutrient.label" type="text" placeholder="ชื่อสาร เช่น โซเดียม" />
          <input v-model.number="newNutrient.max" type="number" min="0" placeholder="ค่าสูงสุด" />
          <input v-model="newNutrient.unit" type="text" placeholder="หน่วย เช่น mg" />
          <button type="button" class="btn-ghost-add" @click="addNutrientLimit">+ เพิ่ม</button>
        </div>
      </section>

      <button class="save-btn" type="submit" :disabled="saving">
        <span v-if="!saving">บันทึกโปรไฟล์</span>
        <span v-else>กำลังบันทึก...</span>
      </button>
    </form>

    <Transition name="fade">
      <div class="toast" :class="{ 'toast-error': toastIsError }" v-if="toast">{{ toast }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getHealthProfile, updateHealthProfile } from '../lib/api.js'

const loading = ref(true)
const saving = ref(false)
const toast = ref('')
const toastIsError = ref(false)

const conditions = ref([])
const allergies = ref([])
const avoidIngredients = ref([])
const notes = ref('')
const nutrientLimits = ref([]) // { key, label, max, unit, enabled }

const conditionInput = ref('')
const allergyInput = ref('')
const avoidInput = ref('')
const newNutrient = ref({ label: '', max: null, unit: 'mg' })

// map ของ ref แต่ละอัน เพื่อให้ addTag เคลียร์ input ที่ถูกต้องได้
const inputRefs = { conditionInput, allergyInput, avoidInput }

function addTag(list, inputKey) {
  const inputRef = inputRefs[inputKey]
  const value = inputRef.value.trim()
  if (value && !list.includes(value)) list.push(value)
  inputRef.value = ''
}

function addNutrientLimit() {
  const { label, max, unit } = newNutrient.value
  if (!label?.trim() || !max || max <= 0) return
  nutrientLimits.value.push({
    key: label.trim().toLowerCase().replace(/\s+/g, '_'),
    label: label.trim(),
    max,
    unit: unit?.trim() || 'mg',
    enabled: true,
  })
  newNutrient.value = { label: '', max: null, unit: 'mg' }
}

async function loadProfile() {
  loading.value = true
  try {
    const profile = (await getHealthProfile()) || {}
    conditions.value = profile.conditions || []
    allergies.value = profile.allergies || []
    avoidIngredients.value = profile.avoid_ingredients || []
    notes.value = profile.notes || ''
    nutrientLimits.value = profile.nutrient_limits || []
  } catch (err) {
    toastIsError.value = true
    toast.value = err.message || 'โหลดโปรไฟล์ไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  toast.value = ''
  toastIsError.value = false
  try {
    await updateHealthProfile({
      conditions: conditions.value,
      allergies: allergies.value,
      avoid_ingredients: avoidIngredients.value,
      notes: notes.value,
      nutrient_limits: nutrientLimits.value,
    })
    toast.value = 'บันทึกโปรไฟล์เรียบร้อยแล้ว'
  } catch (err) {
    toastIsError.value = true
    toast.value = err.message || 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง'
  } finally {
    saving.value = false
    setTimeout(() => (toast.value = ''), 3000)
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-page { max-width: 560px; margin: 0 auto; padding: 28px 20px 80px; }

.intro { margin-bottom: 22px; }
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

.profile-form { display: flex; flex-direction: column; gap: 20px; }
.field-group {
  background: var(--white); border: 1px solid var(--line); border-radius: var(--radius-lg);
  padding: 16px 18px;
}
.field-group > label { display: block; font-size: 13px; font-weight: 700; color: var(--ink); margin-bottom: 10px; }

.tag-input {
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
  border: 1px solid var(--line); border-radius: 12px; padding: 8px 10px; background: var(--paper);
}
.tag-input input {
  flex: 1; min-width: 140px; border: none; outline: none; background: none;
  font-size: 13.5px; font-family: inherit; color: var(--ink); padding: 4px 2px;
}
.chip {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600;
  padding: 5px 8px 5px 12px; border-radius: 999px; background: var(--green-tint); color: var(--green-deep);
}
.chip-x {
  border: none; background: none; cursor: pointer; color: inherit; opacity: 0.6;
  font-size: 11px; padding: 2px; line-height: 1;
}
.chip-x:hover { opacity: 1; }

textarea {
  width: 100%; border: 1px solid var(--line); border-radius: 12px; padding: 10px 12px;
  font-size: 13.5px; font-family: inherit; color: var(--ink); background: var(--paper); resize: vertical;
}
textarea:focus { outline: none; border-color: var(--green); box-shadow: 0 0 0 3px rgba(79, 146, 113, 0.15); }

.nutrient-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.nutrient-row {
  display: flex; align-items: center; gap: 10px; font-size: 13px;
  padding: 8px 10px; border-radius: 10px; background: var(--bg);
}
.nutrient-row input[type="checkbox"] { accent-color: var(--green); width: 15px; height: 15px; flex-shrink: 0; }
.nutrient-label { font-weight: 600; flex: 1; }
.nutrient-max { color: var(--muted); font-size: 12.5px; }

.nutrient-add { display: flex; gap: 8px; flex-wrap: wrap; }
.nutrient-add input {
  border: 1px solid var(--line); border-radius: 10px; padding: 8px 10px; font-size: 13px;
  font-family: inherit; background: var(--paper); color: var(--ink);
}
.nutrient-add input:nth-child(1) { flex: 2; min-width: 120px; }
.nutrient-add input:nth-child(2) { flex: 1; min-width: 80px; }
.nutrient-add input:nth-child(3) { flex: 1; min-width: 70px; }
.btn-ghost-add {
  border: 1px dashed var(--green); background: none; color: var(--green-deep);
  border-radius: 10px; padding: 8px 14px; font-size: 12.5px; font-weight: 700; cursor: pointer;
}
.btn-ghost-add:hover { background: var(--green-tint); }

.save-btn {
  width: 100%; padding: 15px; border-radius: 999px; border: none;
  background: var(--green); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer;
  box-shadow: 0 3px 0 var(--green-deep);
}
.save-btn:hover:not(:disabled) { background: var(--green-deep); }
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.toast {
  position: fixed; left: 50%; bottom: 30px; transform: translateX(-50%);
  background: var(--dark); color: #fff; font-size: 13px; font-weight: 600;
  padding: 10px 20px; border-radius: 999px; box-shadow: 0 10px 26px rgba(0, 0, 0, 0.25); z-index: 40;
}
.toast.toast-error { background: var(--red); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>