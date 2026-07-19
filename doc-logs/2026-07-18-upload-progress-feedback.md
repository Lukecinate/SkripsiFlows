# Change Log

## 2026-07-18 - Upload Progress & Drag Feedback
- Category: ux, performance

### Loader saat unggah file
- `app/workspace/page.tsx` menambah 4 stage loader: `idle` → `reading` → `parsing` → `redirecting`.
- Dropzone menampilkan spinner berputar (CSS keyframes `dropzone-spin`).
- Progress bar dengan gradient `mint-strong → navy` di bawah dropzone, naik dari 0% ke 100% selama proses.
- Button "Mulai Edit" menampilkan inline spinner + label stage (`Membaca file` / `Mengenali struktur` / `Membuka editor`).
- Tombol + textarea disabled selama proses.

### Optimasi proses
- Validasi ukuran file (max 2 MB) sebelum baca; menolak lebih awal tanpa parse.
- Localstorage write dibungkus try/catch agar quota exceeded tidak crash silenciously.
- Stage transitions di-requestAnimationFrame sehingga tidak ada setTimeout yang tumpang tindih.
- Track `dragenter`/`dragleave` via counter agar tidak flicker saat anak elemen dilalui.

### UX
- Drag file ke dropzone ditandai dengan border `mint-strong` + bg `eef8df` + scale 1.01 (`is-dragging`).
- Live progress bar di dropzone dari `FileReader.onprogress`.

### Version
- Tetap `1.0.0-beta` (Minimal change - hanya UX loader).
