<template>
  <div class="placeholder">
    <span class="eyebrow">STEP ถัดไป</span>
    <h2>หน้าโปรไฟล์</h2>
    <p>ยังไม่ได้เริ่มทำหน้านี้ — จะต่อคิวหลังหน้าสแกนกล้องเสร็จ</p>
  </div>
</template>

<script setup></script>

<style scoped>
.placeholder {
  max-width: 480px; margin: 60px auto; padding: 0 20px; text-align: center;
}
.eyebrow {
  font-family: var(--font-mono); font-size: 11px; font-weight: 600;
  color: var(--orange); letter-spacing: 0.08em;
}
h2 { margin: 10px 0 6px; font-size: 20px; }
p { color: var(--muted); font-size: 14px; margin: 0; }
</style>
