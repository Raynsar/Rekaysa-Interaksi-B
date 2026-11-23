# Peningkatan Pengalaman Pelacakan Pesanan Shopee — PRD

> Varian A — PRD Only. Varian B (PRD + UX Skill) ada di repo terpisah.
> Referensi worksheet: Pertemuan 05–08 (Interview Record U1–U5,
> Empathy Map, Persona, User Journey Map + MOT, Insight→Need→Requirement,
> User Stories). Worksheet 09 tidak dipakai.

## 1. Product Overview

### 1.1 Latar Belakang
Raka Pratama, mahasiswa 22 tahun, rutin berbelanja kebutuhan kuliah dan
sehari-hari di Shopee. Setelah checkout, ia memantau posisi paket dan
menyelesaikan pesanan. Dari 10 ulasan Play Store rating 1–3 bintang
(30 Agustus–19 September 2026, dianalisis sebagai U1–U5), keluhan justru
bukan soal teknis (lemot/error) — tidak satu pun menyebut itu. Keluhan
berpusat pada kepercayaan dan kejelasan: harga tidak konsisten (U1),
alur menyelesaikan pesanan berubah setelah pembaruan (U2, U5), iklan
memaksa masuk aplikasi (U3), dan pengiriman yang lambat/tidak jelas (U4).

Benang merahnya: pengguna merasa kehilangan kontrol dan kepastian saat
aplikasi berubah ("Shopee tidak seperti dulu lagi").

### 1.2 Product Vision
Memberikan kembali rasa kendali dan kepastian kepada pembeli Shopee atas
setiap pesanannya — harga transparan sejak beranda, status pesanan yang
akurat, penyelesaian pesanan yang bisa dikontrol sendiri, dan bantuan
langsung di dalam aplikasi.

### 1.3 Target Pengguna
Pembeli aktif Shopee di Indonesia berusia 18–40 tahun (mahasiswa dan
pekerja) yang berbelanja lewat aplikasi mobile, sering memakai
ShopeePay/SPayLater, dan mengecek status pesanan secara berkala.

## 2. User Problem
- Harga di beranda berbeda dengan harga saat checkout (U1); contoh
  36.000 menjadi 47.000, sehingga promo terasa menipu.
- Setelah pembaruan, tombol "Selesaikan Pesanan" hilang dan pesanan
  selesai otomatis setelah 2 hari; daftar pesanan panjang (U2).
- Status pesanan tidak akurat walau paket sudah diterima; cicilan
  SPayLater tertahan (U2, U5).
- Iklan memaksa membuka aplikasi saat pengguna sedang browsing/mengedit,
  sehingga pekerjaan hilang (U3).
- Pengiriman melambat sejak pembaruan 2026; estimasi dan status tidak
  andal (U4).
- Balasan Shopee mengarahkan pengguna ke DM media sosial dan meminta
  username/screenshot, bukan penyelesaian di dalam aplikasi (4 ulasan
  dari JOHAN 79, TruthfulMonkey, Hamba Allah, ulasan 16 Sep).

**Problem Statement**
Pembeli Shopee membutuhkan transparansi harga dan kendali penuh atas
penyelesaian pesanan — harga yang konsisten sejak beranda, status yang
akurat, iklan yang bisa ditutup, estimasi pengiriman yang diandalkan, dan
bantuan yang tidak memaksa keluar aplikasi — agar mereka kembali percaya
dan tenang bertransaksi.

## 3. User Need (Insight → Need → Requirement)

| Research Insight | User Need | Functional Requirement | UX Requirement |
|---|---|---|---|
| Harga di beranda tidak sama dengan saat checkout sehingga promo terasa menipu (U1, ulasan tutik). | Harga dan biaya yang transparan dan konsisten. | Menampilkan harga final (termasuk biaya ukuran khusus dan ongkir) di beranda & halaman produk, sinkron dengan checkout, menampilkan rincian biaya sebelum bayar. | Harga di beranda sama dengan checkout; rincian biaya terbaca tanpa scroll berlebihan; label promo jelas. |
| Alur menyelesaikan pesanan rumit setelah pembaruan: selesai otomatis 2 hari, tombol hilang, status tidak akurat (U2, U5). | Kontrol atas penyelesaian pesanan dan status yang akurat. | Tombol "Selesaikan Pesanan" selalu tersedia setelah status pengiriman; pengingat sebelum selesai otomatis; daftar pesanan dapat difilter per status. | Pesanan dapat diselesaikan dalam ≤ 2 ketukan; status selalu sesuai kondisi; pesanan yang sudah beres ditandai berbeda. |
| Iklan memaksa masuk aplikasi, tombol tutup kecil/tidak ada, pekerjaan hilang (U3, ulasan Ersa & Karimah). | Iklan yang bisa ditutup dan tidak mengganggu aktivitas. | Tombol tutup (X) dengan area sentuh memadai; iklan tidak membuka aplikasi tanpa aksi pengguna; batas frekuensi iklan. | Iklan bisa ditutup dalam 1 ketukan; menutup iklan tidak membuka aplikasi. |
| Pengiriman melambat sejak pembaruan 2026 dan paket tidak diantar padahal sudah ditugaskan (U4). | Estimasi dan status pengiriman yang bisa diandalkan. | Estimasi tiba berbentuk rentang berbasis data historis kurir; notifikasi saat terlambat; opsi ajukan bantuan dari halaman pesanan. | Pesan keterlambatan jelas dengan langkah berikutnya; estimasi ditampilkan sebagai rentang. |
| Balasan Shopee pada 4 ulasan mengarahkan pengguna DM media sosial; salah satunya meminta username & screenshot. | Bantuan langsung di dalam aplikasi tanpa mengulang detail. | Tombol "Laporkan Masalah" pada halaman pesanan yang otomatis melampirkan ID pesanan & status, memberi nomor tiket. | Pengguna tidak perlu mengetik ulang info; konfirmasi laporan diterima langsung ditampilkan. |

## 4. User Persona

**Nama:** Raka Pratama (fiktif)
**Umur:** 22 Tahun
**Pekerjaan:** Mahasiswa
**Lokasi:** Surabaya

**Goal**
- Membeli kebutuhan kuliah dengan harga sesuai yang ia lihat.
- Memantau dan menyelesaikan pesanan dengan mudah.

**Behavior**
- Membandingkan harga di beranda dengan saat checkout sebelum membayar (U1).
- Menulis ulasan rating rendah di Play Store ketika kecewa (U1–U5).

**Pain Point**
- Harga di beranda berbeda dengan saat checkout (U1).
- Alur menyelesaikan pesanan rumit dan status tidak akurat (U2, U5).
- Iklan memaksa masuk aplikasi dan sulit ditutup (U3).

**Need**
- Harga dan biaya yang transparan sejak beranda.
- Kontrol atas penyelesaian pesanan, status akurat, dan iklan yang bisa ditutup.

**Evidence:** Analisis ulasan Play Store U1–U5 (rating 1–3 bintang;
interview langsung tidak dilakukan, diganti analisis ulasan atas izin dosen).

## 5. Product Goals
- Harga & biaya konsisten sejak beranda sampai checkout.
- Kontrol pengguna atas penyelesaian pesanan.
- Status pesanan akurat dan dapat difilter.
- Iklan mudah ditutup, tidak memaksa keluar.
- Estimasi & notifikasi pengiriman andal.
- Kanal pelaporan masalah in-app.

**Success Metrics**

| Indikator | Target Awal |
|---|---|
| Kesamaan harga beranda vs checkout | 100% konsisten |
| Pesanan diselesaikan manual oleh pengguna | ≥ 80% pesanan |
| Keluhan status pesanan tidak akurat | Turun dibanding baseline |
| Iklan dapat ditutup dalam 1 ketukan | 100% iklan |
| Penggunaan fitur lapor masalah in-app | Terukur setelah rilis |

## 6. Functional Requirements

**FR-01: Transparansi & Konsistensi Harga**
- Harga final (termasuk biaya ukuran khusus & ongkir) tampil di beranda
  dan halaman produk.
- Harga tersinkron di beranda, produk, keranjang, checkout.
- Rincian biaya (expandable) sebelum bayar.

**FR-02: Kontrol Penyelesaian Pesanan**
- Tombol "Selesaikan Pesanan" selalu tersedia setelah status pengiriman.
- Pengingat 24 jam sebelum pesanan selesai otomatis.
- Tidak ada auto-selesai tanpa pengingat/pilihan pengguna;
  auto-selesai hanya jika pengguna memilih "Tunggu Otomatis".
- Setelah selesai, pesanan pindah ke tab Selesai.

**FR-03: Akurasi Status Pesanan**
- Status mencerminkan kondisi sebenarnya: Belum Bayar, Dikemas,
  Dikirim, Diterima, Selesai, Dibatalkan.
- "Dalam Perjalanan" bukan status terpisah (bagian dari Dikirim).
- "Diterima" hanya badge sementara, bukan tab filter.
- Daftar pesanan dapat difilter per status.

**FR-04: Kontrol Iklan**
- Tombol tutup (X) area sentuh ≥ 44×44px.
- Iklan tidak membuka aplikasi tanpa aksi pengguna.
- Batas frekuensi iklan (maks tampil/hari + cooldown 24 jam setelah ditutup).

**FR-05: Estimasi & Notifikasi Pengiriman**
- Estimasi tiba berbentuk rentang (mis. "3–6 hari").
- Notifikasi saat pengiriman terlambat, menyertakan langkah berikutnya.
- Opsi mengajukan bantuan dari halaman pesanan.

**FR-06: Pelaporan Masalah In-App**
- Tombol "Laporkan Masalah" pada halaman pesanan.
- Otomatis melampirkan ID pesanan & status.
- Memberi nomor tiket `TKT-YYYY-NNNNNN` + konfirmasi.

**FR-07: Pembayaran ShopeePay / SPayLater**
- Menu pelunasan cicilan setelah pesanan Selesai.
- Cukup UI "Lunasi Sekarang"; tanpa backend pembayaran.

## 7. Non-Functional Requirements
- **NFR-01 Performance:** Halaman daftar & detail pesanan dimuat cepat
  (≤ 3 detik pada kondisi wajar); perubahan status tanpa reload penuh.
- **NFR-02 Usability:** Menyelesaikan pesanan ≤ 2 ketukan dari detail.
- **NFR-03 Responsive:** Nyaman di smartphone (<640px), tablet
  (640–1023px), desktop (≥1024px), wide (≥1440px).
- **NFR-04 Reliability:** Status pesanan konsisten di seluruh halaman;
  kegagalan aksi dicatat dan tidak mengubah data.
- **NFR-05 Security:** Pengguna hanya dapat mengakses & mengelola
  pesanannya sendiri.

## 8. Business Rules
- Pesanan hanya dapat diselesaikan oleh pemilik pesanan.
- Tombol "Selesaikan Pesanan" aktif hanya setelah paket berstatus
  Diterima/Dalam Perjalanan (bagian dari Dikirim).
- Pesanan yang sudah Selesai tidak dapat dikembalikan ke status sebelumnya.
- Harga di beranda wajib sama dengan checkout.
- Iklan tidak boleh membuka aplikasi tanpa aksi pengguna dan tidak
  menghalangi aksi utama.
- Laporan masalah hanya dapat dibuat untuk pesanan valid milik pengguna.

## 9. User Stories

| ID | User Story |
|---|---|
| US-01 | As a pembeli Shopee, I want to melihat harga final yang sama sejak beranda sampai checkout, so that saya tidak merasa tertipu oleh promo. |
| US-02 | As a pembeli Shopee, I want to melihat rincian biaya tambahan sebelum membayar, so that saya paham apa yang saya bayar. |
| US-03 | As a pembeli Shopee, I want to menekan tombol "Selesaikan Pesanan" sendiri setelah barang diterima, so that saya tetap mengontrol pesanan dan pembayaran cicilan. |
| US-04 | As a pembeli Shopee, I want to memfilter daftar pesanan berdasarkan status, so that saya tidak bingung mana pesanan yang sudah beres. |
| US-05 | As a pembeli Shopee, I want to menutup iklan dengan satu ketukan tanpa terlempar ke aplikasi, so that aktivitas saya tidak terganggu dan pekerjaan saya tidak hilang. |
| US-06 | As a pembeli Shopee, I want to mendapat estimasi dan notifikasi bila pengiriman terlambat, so that saya tahu kapan paket akan sampai. |
| US-07 | As a pembeli Shopee, I want to melaporkan masalah pesanan langsung dari aplikasi, so that saya tidak perlu DM media sosial dan mengulang detail. |

## 10. Scope

**In Scope**
- Harga final & rincian biaya konsisten (beranda→checkout).
- Tombol Selesaikan Pesanan + pengingat selesai otomatis.
- Filter daftar pesanan per status.
- Kontrol iklan.
- Estimasi + notifikasi keterlambatan.
- Pelaporan masalah in-app.
- Menu ShopeePay/SPayLater (UI-only).

**Out of Scope**
- Backend pembayaran.
- Integrasi kurir/logistik baru.
- Fitur sosial/komunitas.
- Rekomendasi produk berbasis AI.
- Perubahan kebijakan refund di luar alur pelaporan.
- Web Push, service worker, backend server.

## 11. Assumptions & Dependencies
**Assumptions**
- Pengguna telah login.
- Data status berasal dari data seed karena tidak ada backend logistik.
- Notifikasi berupa in-app dan localStorage.
- Sampel ulasan (10 ulasan) belum mewakili seluruh pengguna.

**Dependencies**
- Autentikasi pengguna (simulasi).
- Data seed pesanan & produk.
- ShopeePay / SPayLater (UI simulasi).

## 12. Expected Deliverables
- Halaman produk & checkout dengan harga final konsisten.
- Halaman detail pesanan dengan tombol "Selesaikan Pesanan".
- Daftar pesanan dengan filter per status.
- Komponen notifikasi keterlambatan.
- Form pelaporan masalah in-app.
- Deployment web di `apps/web` (Vercel).

## 13. Product Acceptance Criteria
Lihat `ACCEPTANCE-CRITERIA.md` (AC-001 s/d AC-042).

## 14. Deployment
Proyek di-deploy manual ke Vercel oleh pemilik repo:
1. Login/daftar Vercel dengan akun GitHub.
2. Import repo GitHub
   `https://github.com/Raynsar/Rekaysa-Interaksi-B.git`.
3. Konfigurasi build: Framework `Vite`, Root Directory `apps/web`,
   Build Command `npm run build`, Output Directory `dist`.
4. Klik Deploy dan tunggu hingga proses selesai.
5. Salin URL publik dari dashboard Vercel.

Live URL: https://rekaysa-interaksi-b.vercel.app

## 15. Validasi Visual
Screenshot halaman utama disimpan sebagai bukti validasi visual:
- `docs/screenshots/phase3/` — 11 halaman × 390/768/1024/1440px.
- `docs/screenshots/phase4/` — perubahan UI setelah persistensi, iklan,
  notifikasi, dan pelaporan.
- `docs/screenshots/phase5/` — 11 halaman × 390/1440px untuk audit akhir.