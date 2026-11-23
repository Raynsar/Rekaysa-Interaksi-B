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
Immediate Feedback, Predictability, Error Prevention, User Control,
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
- Batas frekuensi: maks 3 tayangan/hari + cooldown 24 jam setelah ditutup.

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