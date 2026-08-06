<template>
  <div class="scan-page">
    <router-link to="/" class="back-link">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      กลับหน้าแรก
    </router-link>

    <div class="intro">
      <span class="eyebrow">STEP 01 · CAPTURE</span>
      <h1>ถ่ายรูปฉลาก ก่อน<em>กินเลย</em></h1>
      <p>เล็งกล้องไปที่ฉลากโภชนาการ หรือเลือกภาพจากคลังก็ได้</p>
    </div>

    <div class="stage">
      <Transition name="fade" mode="out-in">

        <!-- ยังไม่ได้เปิดกล้อง/ยังไม่มีรูป -->
        <div
          v-if="mode === 'idle'"
          key="idle"
          class="stage-card dropzone"
          :class="{ drag: isDragging }"
          @dragover.prevent="isDragging = true"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <div class="corner tl"></div>
          <div class="corner tr"></div>
          <div class="corner bl"></div>
          <div class="corner br"></div>

          <div class="idle-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
              <circle cx="12" cy="13" r="3.2" />
            </svg>
          </div>

          <button class="btn-primary" @click="openCamera">เปิดกล้อง</button>
          <button class="btn-ghost" @click="triggerGallery">เลือกภาพจากคลัง</button>
          <p class="hint">หรือลากไฟล์รูปมาวางตรงนี้</p>

          <p v-if="cameraError" class="error-msg">{{ cameraError }}</p>

          <input
            ref="galleryInput"
            type="file"
            accept="image/*"
            class="hidden-input"
            @change="onGalleryChange"
          />
        </div>

        <!-- กล้องกำลังเปิดอยู่ -->
        <div v-else-if="mode === 'camera'" key="camera" class="stage-card camera-live">
          <video ref="videoEl" autoplay playsinline muted></video>

          <div class="corner tl light"></div>
          <div class="corner tr light"></div>
          <div class="corner bl light"></div>
          <div class="corner br light"></div>

          <button class="close-btn" @click="closeCamera" aria-label="ปิดกล้อง">✕</button>

          <div class="camera-controls">
            <button class="switch-btn" @click="switchCamera" aria-label="สลับกล้อง" :disabled="switching">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 2l4 4-4 4M3 12v-2a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 12v2a4 4 0 0 1-4 4H3" />
              </svg>
            </button>
            <button class="shutter-btn" @click="capturePhoto" aria-label="ถ่ายภาพ">
              <span class="shutter-ring"></span>
            </button>
            <span class="spacer"></span>
          </div>
        </div>

        <!-- ถ่าย/เลือกรูปแล้ว -->
        <div v-else key="preview" class="stage-card preview">
          <img :src="imageUrl" alt="ภาพที่เลือก" />
          <div class="preview-tag">READY</div>
          <button class="retake-btn" @click="retake">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" />
            </svg>
            ถ่ายใหม่
          </button>
        </div>

      </Transition>

      <canvas ref="canvasEl" class="hidden-input"></canvas>
    </div>

    <button
      class="analyze-btn"
      :disabled="mode !== 'preview' || analyzing"
      @click="analyzeImage"
    >
      <span v-if="analyzing">กำลังส่งวิเคราะห์...</span>
      <span v-else>วิเคราะห์ภาพ</span>
    </button>
    <p v-if="analyzeNote" class="analyze-note">{{ analyzeNote }}</p>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

// mode: 'idle' -> 'camera' (กำลังเปิดกล้องอยู่) -> 'preview' (มีรูปพร้อมวิเคราะห์)
const mode = ref('idle')

const videoEl = ref(null)
const canvasEl = ref(null)
const galleryInput = ref(null)

const imageUrl = ref(null)   // URL สำหรับ <img> preview
const imageBlob = ref(null)  // ไฟล์รูปจริง เก็บไว้ส่งให้ backend ตอนกด "วิเคราะห์ภาพ"

const isDragging = ref(false)
const cameraError = ref('')
const switching = ref(false)

const analyzing = ref(false)
const analyzeNote = ref('')

let mediaStream = null
let facingMode = 'environment' // เริ่มจากกล้องหลัง (สำหรับส่องฉลาก)

// ---------- เปิด/ปิดกล้อง ----------
async function openCamera() {
  cameraError.value = ''

  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = 'เบราว์เซอร์นี้ไม่รองรับกล้อง ลองเลือกภาพจากคลังแทน'
    return
  }

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode },
      audio: false,
    })
    mode.value = 'camera'
    // ต้องรอให้ <video> ถูก render ก่อน (v-if) ค่อยผูก stream
    await nextFrame()
    if (videoEl.value) videoEl.value.srcObject = mediaStream
  } catch (err) {
    if (err.name === 'NotAllowedError') {
      cameraError.value = 'ไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาอนุญาตสิทธิ์กล้องในเบราว์เซอร์'
    } else if (err.name === 'NotFoundError') {
      cameraError.value = 'ไม่พบกล้องบนอุปกรณ์นี้ ลองเลือกภาพจากคลังแทน'
    } else {
      cameraError.value = 'เปิดกล้องไม่ได้ ลองเลือกภาพจากคลังแทน'
    }
  }
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

function stopStream() {
  mediaStream?.getTracks().forEach((track) => track.stop())
  mediaStream = null
}

function closeCamera() {
  stopStream()
  mode.value = 'idle'
}

async function switchCamera() {
  if (switching.value) return
  switching.value = true
  facingMode = facingMode === 'environment' ? 'user' : 'environment'
  stopStream()
  await openCamera()
  switching.value = false
}

// ---------- ถ่ายภาพจากวิดีโอ ----------
function capturePhoto() {
  const video = videoEl.value
  const canvas = canvasEl.value
  if (!video || !canvas || !video.videoWidth) return

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

  canvas.toBlob(
    (blob) => {
      if (!blob) return
      setImage(blob)
      stopStream()
      mode.value = 'preview'
    },
    'image/jpeg',
    0.92
  )
}

// ---------- เลือกจากคลัง / ลากวาง ----------
function triggerGallery() {
  galleryInput.value?.click()
}

function onGalleryChange(e) {
  const file = e.target.files?.[0]
  if (file) setImage(file)
}

function onDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) setImage(file)
}

function setImage(blobOrFile) {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageBlob.value = blobOrFile
  imageUrl.value = URL.createObjectURL(blobOrFile)
  analyzeNote.value = ''
  mode.value = 'preview'
}

function retake() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = null
  imageBlob.value = null
  analyzeNote.value = ''
  if (galleryInput.value) galleryInput.value.value = ''
  mode.value = 'idle'
}

// ---------- วิเคราะห์ภาพ ----------
// TODO(backend): เปลี่ยนส่วนนี้เป็นการยิง POST /analyze จริง
// ส่ง imageBlob.value (multipart/form-data) พร้อมข้อมูลโรคประจำตัว/แพ้อาหารของผู้ใช้
// ตอนนี้ทำแค่จำลองไว้ก่อน เพื่อให้ต่อ backend ทีหลังได้ทันที
async function analyzeImage() {
  if (!imageBlob.value) return
  analyzing.value = true
  analyzeNote.value = ''

  await new Promise((resolve) => setTimeout(resolve, 1200))

  analyzing.value = false
  analyzeNote.value = 'ถ่ายรูปสำเร็จ พร้อมส่งวิเคราะห์ — รอต่อ backend จริงในขั้นถัดไป'
}

onBeforeUnmount(() => {
  stopStream()
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
})
</script>

<style scoped>
.scan-page { max-width: 520px; margin: 0 auto; padding: 28px 20px 20px; }

.back-link {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600; color: var(--muted); margin-bottom: 16px;
}
.back-link svg { width: 15px; height: 15px; }
.back-link:hover { color: var(--ink); }

.intro { margin-bottom: 20px; }
.eyebrow {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  color: var(--green); letter-spacing: 0.08em;
}
.intro h1 { font-size: 26px; margin: 8px 0 6px; line-height: 1.3; }
.intro h1 em { font-style: normal; color: var(--green); }
.intro p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.5; }

.stage { position: relative; }
.stage-card {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  min-height: 360px;
}

/* --- idle / dropzone --- */
.dropzone {
  background: var(--bg);
  border: 1.5px dashed var(--line);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; padding: 40px 24px;
  transition: border-color 0.15s, background 0.15s;
}
.dropzone.drag { border-color: var(--green); background: #eef2e8; }
.idle-icon {
  width: 60px; height: 60px; border-radius: 50%;
  background: var(--white); border: 1px solid var(--line);
  display: flex; align-items: center; justify-content: center;
  color: var(--green); margin-bottom: 6px;
}
.idle-icon svg { width: 26px; height: 26px; }
.hint { font-size: 12.5px; color: var(--muted); margin: 4px 0 0; }
.error-msg {
  font-size: 12.5px; color: var(--red); background: rgba(193, 80, 63, 0.08);
  padding: 8px 12px; border-radius: 10px; margin-top: 8px; text-align: center;
}
.hidden-input { display: none; }

/* --- camera live --- */
.camera-live { background: var(--dark); }
.camera-live video {
  width: 100%; height: 400px; object-fit: cover; display: block;
}
.corner.light { border-color: rgba(255, 255, 255, 0.85); }
.close-btn {
  position: absolute; top: 12px; right: 12px; width: 34px; height: 34px;
  border-radius: 50%; border: none; background: rgba(0, 0, 0, 0.45); color: #fff;
  font-size: 14px; cursor: pointer;
}
.camera-controls {
  position: absolute; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px 22px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55), transparent);
}
.spacer { width: 42px; }
.switch-btn {
  width: 42px; height: 42px; border-radius: 50%; cursor: pointer;
  border: 1.5px solid rgba(255, 255, 255, 0.5); background: rgba(255, 255, 255, 0.1);
  color: #fff; display: flex; align-items: center; justify-content: center;
}
.switch-btn svg { width: 18px; height: 18px; }
.switch-btn:disabled { opacity: 0.5; }
.shutter-btn {
  width: 66px; height: 66px; border-radius: 50%; border: 3px solid #fff;
  background: rgba(255, 255, 255, 0.15); cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
}
.shutter-ring { width: 52px; height: 52px; border-radius: 50%; background: #fff; }

/* --- preview --- */
.preview { background: var(--dark); }
.preview img { width: 100%; height: 400px; object-fit: contain; display: block; }
.preview-tag {
  position: absolute; top: 12px; left: 12px;
  font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.06em;
  color: var(--orange); background: rgba(0, 0, 0, 0.4); padding: 4px 10px; border-radius: 999px;
}
.retake-btn {
  position: absolute; top: 12px; right: 12px;
  display: flex; align-items: center; gap: 6px;
  background: rgba(0, 0, 0, 0.5); color: #fff; border: none;
  padding: 8px 13px; border-radius: 999px; font-size: 12.5px; font-weight: 600; cursor: pointer;
}
.retake-btn svg { width: 13px; height: 13px; }

/* --- buttons --- */
.btn-primary {
  background: var(--green); color: #fff; border: none; padding: 13px 28px;
  border-radius: 999px; font-weight: 700; font-size: 14.5px; cursor: pointer;
  box-shadow: 0 3px 0 var(--green-deep);
}
.btn-primary:hover { background: var(--green-deep); }
.btn-ghost {
  background: none; border: none; color: var(--green); font-weight: 600;
  font-size: 13.5px; cursor: pointer; padding: 4px;
}

.analyze-btn {
  width: 100%; margin-top: 16px; padding: 15px; border-radius: 999px; border: none;
  background: var(--orange); color: #fff; font-weight: 700; font-size: 15px; cursor: pointer;
  box-shadow: 0 3px 0 var(--orange-deep); transition: opacity 0.15s;
}
.analyze-btn:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
.analyze-note {
  text-align: center; font-size: 12.5px; color: var(--muted); margin-top: 10px;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
