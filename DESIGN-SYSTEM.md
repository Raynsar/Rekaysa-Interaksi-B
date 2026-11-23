# DESIGN SYSTEM

Project: Peningkatan Pengalaman Pelacakan Pesanan Shopee
Version: 2.0
Status: Draft
Reference: README.md (PRD)

## 1. Design Direction

### 1.1 Design Concept
Trustworthy Commerce, Clear Control — antarmuka e-commerce yang bersih,
tegas pada aksi utama, dan minim gangguan.

Karakteristik:
- Hierarki jelas antara harga, status, dan aksi.
- Aksen oranye Shopee sebagai warna utama aksi.
- Ruang lega agar kartu pesanan mudah dipindai.
- Iklan tidak pernah menutupi aksi utama.
- Responsif di mobile, tablet, desktop.

### 1.2 Design Principles
- **Clarity:** harga & status terbaca langsung.
- **Control:** aksi utama menonjol dan dapat dikonfirmasi.
- **Consistency:** harga & status sama di semua halaman.
- **Accessibility:** status tidak hanya warna.
- **Scalability:** komponen dapat dipakai ulang.

## 2. Color System

### 2.1 Primary Colors

| Token | Hex | Usage |
|---|---|---|
| Primary | #EE4D2D | Tombol aksi utama, aksen |
| Primary Hover | #D73211 | Hover tombol |
| Primary Light | #FFF1ED | Highlight & selected |
| Primary Dark | #B72709 | Emphasis aktif |

### 2.2 Neutral Colors

| Token | Hex | Usage |
|---|---|---|
| Background | #F5F5F5 | Latar utama |
| Surface | #FFFFFF | Kartu & panel |
| Surface Secondary | #FAFAFA | Latar sekunder |
| Border | #E5E5E5 | Divider & border |
| Text Primary | #212121 | Judul & teks utama |
| Text Secondary | #757575 | Teks pendukung |
| Text Muted | #BDBDBD | Placeholder & disabled |

### 2.3 Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| Success | #2E7D32 | Pesanan selesai |
| Success Light | #E8F5E9 | Latar sukses |
| Warning | #F57C00 | Keterlambatan |
| Warning Light | #FFF3E0 | Latar peringatan |
| Danger | #D32F2F | Gagal / dibatalkan |
| Danger Light | #FDECEA | Latar error |
| Info | #1976D2 | Informasi & pengingat |

### 2.4 Order Status Colors

| Status | Text Color | Background |
|---|---|---|
| Belum Bayar | #757575 | #FAFAFA |
| Dikemas | #1976D2 | #E3F2FD |
| Dikirim | #EE4D2D | #FFF1ED |
| Diterima | #2E7D32 | #E8F5E9 |
| Selesai | #2E7D32 | #E8F5E9 |
| Dibatalkan | #D32F2F | #FDECEA |

Status tidak boleh hanya ditandai warna; selalu sertakan label teks.

## 3. Typography System

### 3.1 Font Family
Primary: Inter — Fallback: system-ui, sans-serif.

### 3.2 Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| Display | 32px | 700 | Highlight dashboard |
| H1 | 28px | 700 | Judul halaman |
| H2 | 22px | 600 | Judul seksi |
| H3 | 18px | 600 | Judul kartu |
| Body Large | 16px | 400 | Konten utama |
| Body | 14px | 400 | Teks default |
| Body Small | 13px | 400 | Teks pendukung |
| Caption | 12px | 400 | Metadata |

Line height: Heading 1.2–1.4 · Body 1.5 · Caption 1.4.

## 4. Spacing System
Kelipatan 4px: space-1 4 · space-2 8 · space-3 12 · space-4 16 ·
space-5 20 · space-6 24 · space-8 32 · space-10 40 · space-12 48.

## 5. Layout System

### 5.1 Main Layout
- Desktop: Sidebar 240px, konten fleksibel, padding 32px, max width 1440px.
- Tablet: Sidebar collapsible, padding 24px.
- Mobile: Satu kolom, padding 16px, navigasi bawah, aksi full-width.

### 5.2 Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Mobile | < 640px | Satu kolom |
| Tablet | 640–1023px | Layout adaptif |
| Desktop | ≥ 1024px | Sidebar |
| Wide | ≥ 1440px | Max width |

## 6. Component Specifications

### 6.1 Buttons
Primary, Secondary, Outline, Ghost, Danger, Icon. Tinggi 40px,
padding 16px, radius 8px, font 14px/600, transisi 150ms.
Size: S 32 · M 40 · L 48.

### 6.2 Input Fields
Text, Textarea, Select, Search, Date Picker. Tinggi 40px,
border 1px #E5E5E5, radius 8px, padding 12px, font 14px.

### 6.3 Cards (Order Card & Product Card)
Background #FFF, border 1px #E5E5E5, radius 12px, padding 16–20px,
shadow halus, spacing 16px.

### 6.4 Status Badge
Radius 999px, padding 4px 10px, font 12px/500. Variant: Belum Bayar,
Dikemas, Dikirim, Diterima, Selesai, Dibatalkan.

### 6.5 Tabs / Filter Bar
Tab horizontal scrollable di mobile, indikator aktif primary,
menampilkan jumlah per status.

### 6.6 Modal / Bottom Sheet
Background putih, radius 12px, max width 480px, padding 24px, overlay
gelap. Dipakai untuk konfirmasi "Selesaikan Pesanan" dan lapor masalah.

### 6.7 Price Breakdown (Expandable Row)
Baris dapat dibuka/ditutup, chevron indikator, total tebal di baris
akhir. Dipakai di halaman produk, keranjang, checkout, & detail pesanan.

### 6.8 Toast Notification
Success, Error, Warning, Info. Desktop top-right, mobile top.
Durasi 3–5 detik; error penting tetap sampai ditutup.

### 6.9 Ad Close Button
Area sentuh minimal 44×44px, ikon X jelas, tidak memicu deep-link.

## 7. Iconography
Gunakan Lucide Icons. Ukuran 16/20/24px. Ikon aksi wajib punya label
aksesibel. Contoh: Package, Truck, CheckCircle, AlertTriangle, Filter,
Search, X (tutup iklan), Flag (lapor).

## 8. Design Tokens

```json
{
  "color": {
    "primary": "#EE4D2D",
    "background": "#F5F5F5",
    "surface": "#FFFFFF",
    "textPrimary": "#212121",
    "textSecondary": "#757575",
    "success": "#2E7D32",
    "warning": "#F57C00",
    "danger": "#D32F2F"
  },
  "radius": { "sm": "6px", "md": "8px", "lg": "12px", "full": "999px" },
  "spacing": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px" },
  "touchTarget": { "min": "44px" }
}
Design tokens wajib dipakai ulang, hindari nilai acak.

9. Accessibility Guidelines
Kontras teks/latar memadai.
Status tidak hanya lewat warna.
Label pada input.
Keyboard accessible.
Fokus terlihat.
Label aksesibel untuk ikon-only.
Area sentuh minimal 44×44px (termasuk tombol tutup iklan).
10. Design Consistency Rules
Pakai ulang komponen sebelum membuat baru.
Tidak menambah warna tanpa persetujuan.
Spacing & hierarki konsisten.
Varian tombol sama antar halaman.
Indikator status konsisten.
Semua layout mengikuti breakpoint.
Catatan: Warna oranye Shopee dan tipografi di sini adalah asumsi wajar,
terbuka untuk disesuaikan dengan brand guideline resmi.

makefile

---

## 3. `INTERACTION-SPEC.md`

```markdown
# INTERACTION SPECIFICATION

Project: Peningkatan Pengalaman Pelacakan Pesanan Shopee
Version: 2.0
Status: Draft
References: README.md (PRD), DESIGN-SYSTEM.md

## 0. Status Kanonik
Status pesanan: **Belum Bayar, Dikemas, Dikirim, Diterima, Selesai,
Dibatalkan**.
- "Dalam Perjalanan" BUKAN status terpisah — bagian dari "Dikirim".
- "Diterima" hanya badge sementara, BUKAN tab filter.
- Tab filter: Semua, Belum Bayar, Dikemas, Dikirim, Selesai, Dibatalkan.

## 1. Interaction Overview

### 1.1 Objective
Mendefinisikan perilaku interaksi pelacakan & penyelesaian pesanan agar
konsisten, terprediksi, dan memberi rasa kendali — terutama pada aksi
"Selesaikan Pesanan" (MOT pasca-penerimaan).

### 1.2 Interaction Principles
- Immediate Feedback, Predictability, Error Prevention, User Control,
  State Consistency, Persistence.

## 2. Global Interaction Behavior

### 2.1 Navigation

| Action | Behavior |
|---|---|
| Klik Pesanan | Buka daftar pesanan |
| Klik Detail | Buka detail pesanan |
| Tombol kembali | Kembali ke halaman sebelumnya |
| Klik iklan tutup | Menutup iklan tanpa membuka aplikasi |

Menu aktif punya indikator; tidak ada halaman kosong; data tersimpan
dipertahankan.

### 2.2 Global Loading
Tampilkan loading/skeleton; jangan tampilkan data belum terkonfirmasi
sebagai terbaru; jika gagal, tampilkan pesan + coba lagi.

### 2.3 Global Error Handling
- "Daftar pesanan tidak dapat dimuat. Silakan coba kembali."
- "Pesanan gagal diselesaikan. Periksa koneksi dan coba lagi."
- "Laporan gagal dikirim. Silakan coba kembali."

## 3. Harga Final & Rincian Biaya Interaction

### 3.1 Harga Konsisten
**Trigger:** Pengguna berpindah halaman (beranda → produk → keranjang → checkout).
**Behavior:**
1. Harga final ditampilkan sama di semua halaman.
2. Biaya ukuran khusus & ongkir tampil sejak halaman produk.
3. Jika harga berubah, tampilkan pesan "harga diperbarui" dengan angka baru.

### 3.2 Rincian Biaya (Expandable)
**Trigger:** Klik baris "Rincian Biaya".
**Behavior:**
1. Baris membuka (expand) menampilkan komponen biaya.
2. Menampilkan harga, ongkir, biaya layanan, diskon.
3. Total akhir tetap terlihat.
4. Menekan ulang menutup rincian.

**Rule:** Total konsisten dengan jumlah komponen.

## 4. Filter Pesanan Interaction

**Option:** Semua, Belum Bayar, Dikemas, Dikirim, Selesai, Dibatalkan.
**Behavior:**
1. Pengguna memilih tab status.
2. Daftar diperbarui sesuai status.
3. Jumlah per status ditampilkan.
4. Filter bisa digabung pencarian.
5. Jika kosong, tampil empty state + "Reset Filter".

## 5. Selesaikan Pesanan Interaction

### 5.1 Trigger
Pengguna menekan "Selesaikan Pesanan" pada detail pesanan.

### 5.2 Flow
1. Sistem menampilkan modal konfirmasi: "Selesaikan pesanan ini?
   Pastikan paket sudah kamu terima."
2. Tombol: Batal, Ya, Selesaikan.
3. Batal → modal ditutup, status tetap.
4. Ya → status berubah menjadi Selesai.
5. Pesanan pindah ke tab Selesai.
6. Notifikasi berhasil tampil.
7. Tombol dinonaktifkan selama proses; klik ganda hanya menghasilkan
   satu umpan balik.
8. Cicilan SPayLater dapat dibayar setelah status Selesai.

### 5.3 Pengingat Selesai Otomatis
**Trigger:** 24 jam sebelum pesanan selesai otomatis.
**Behavior:**
1. Sistem menampilkan pengingat: "Pesanan akan selesai otomatis dalam
   24 jam. Selesaikan sekarang atau tunggu otomatis."
2. Tombol: Selesaikan Sekarang, Tunggu Otomatis.
3. Jika pengguna memilih "Tunggu Otomatis", auto-selesai akan berjalan
   saat batas waktu terlewat (dengan interval pemeriksaan ±30 detik).
4. Tanpa opt-in, tidak ada auto-selesai.

### 5.4 Special Rules
- Tombol aktif hanya saat status Diterima/Dalam Perjalanan.
- Jika gagal, status tetap & pesan error tampil.
- Cegah klik berulang (duplicate submission).
- Total ≤ 2 ketukan dari detail pesanan.

## 6. Status Pesanan Interaction

### 6.1 Status & Transition

| Current | New | Behavior |
|---|---|---|
| Dikemas | Dikirim | Update otomatis |
| Dikirim | Diterima | Konfirmasi penerimaan |
| Diterima | Selesai | Aksi manual pengguna |
| Selesai | — | Final, tidak bisa mundur |

### 6.2 Behavior
Status tampil konsisten di daftar & detail. Perubahan disimpan persisten.
Jika gagal, kembalikan status sebelumnya + pesan.

## 7. Estimasi & Notifikasi Keterlambatan Interaction

### 7.1 Estimasi Rentang
Estimasi tiba ditampilkan sebagai rentang (mis. "3–5 hari").

### 7.2 Notifikasi Keterlambatan
**Schedule:** dikirim saat pesanan melewati batas akhir rentang estimasi.
**Content:** nama paket, status, keterlambatan, langkah berikutnya.
**Rules:** hanya untuk pesanan aktif; tidak duplikat (ID
`${orderId}:${kind}`); kegagalan dicatat tanpa mengubah data pesanan.

## 8. Pelaporan Masalah Interaction

### 8.1 Flow
1. Klik "Laporkan Masalah".
2. Kategori terisi otomatis (mis. "Paket belum diterima" untuk Dikirim).
3. ID pesanan & status dilampirkan otomatis.
4. Isi deskripsi (wajib).
5. Unggah bukti (opsional; hanya nama & ukuran disimpan).
6. Kirim.
7. Validasi → simpan → tampilkan nomor tiket + konfirmasi.
8. Draft laporan persisten per order, terhapus setelah sukses.

### 8.2 Validation
- Kategori wajib.
- Deskripsi wajib, maks 1000 karakter.
- Bukti maks 5MB.

### 8.3 States

| State | Behavior |
|---|---|
| Default | Form kosong dengan kategori otomatis |
| Invalid | Pesan error per field |
| Submitting | Tombol loading |
| Success | Nomor tiket + konfirmasi |
| Error | Pesan + input dipertahankan |

## 9. Iklan Interaction
- Ditutup dengan tombol X (area sentuh ≥44×44px).
- Tidak membuka aplikasi tanpa aksi pengguna.
- Menutup iklan tidak mengubah state pesanan.
- Batas frekuensi: maks tampil/hari + cooldown 24 jam setelah ditutup.

## 10. Empty State Interaction

| Page | Condition | Message | Action |
|---|---|---|---|
| Daftar Pesanan | Kosong | Belum ada pesanan | Mulai Belanja |
| Filter | Tidak ada hasil | Tidak ada pesanan pada status ini | Reset Filter |

## 11. Responsive Interaction
- Desktop: sidebar, modal terpusat, kartu lebar.
- Tablet: sidebar collapsible, filter tab.
- Mobile: navigasi bawah, filter scrollable, aksi full-width,
  bottom sheet.

## 12. Data Consistency
Perubahan status/harga tercermin di daftar pesanan, detail, notifikasi,
dan riwayat. Tidak ada status/harga berbeda antarkomponen.

## 13. Interaction Completion Rules
Interaksi selesai bila: aksi diproses, data diperbarui, tampilan
mencerminkan kondisi terbaru, pengguna dapat umpan balik, tidak ada
duplikasi, error dapat dipahami.