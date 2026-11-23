# Phase 5 — Acceptance Criteria Verification

Sumber bukti yang digabungkan:

- Vitest/Testing Library: `apps/web/src/tests/services-pricing-time.test.ts`,
  `services-behavior.test.ts`, `hooks.test.tsx`, `components.test.tsx`,
  `integration.test.tsx` (**38 test cases**, 5 files, 0 failed).
- Phase 3: `docs/validation/phase3/overflow.json` dan 44 screenshot.
- Phase 4: `docs/validation/phase4/phase4-runtime.json` (32/32),
  `docs/validation/phase4/responsive.json` (16 checks), 10 screenshot.
- Phase 5: `docs/validation/phase5/visual-audit.json` (22 screenshot,
  0 deviasi visual, 0 overflow, 0 halaman > 3 detik) dan screenshot di
  `docs/screenshots/phase5/`.

Rekap: **Pass 42 · Fail 0 · Blocked 0 · Not Tested 0**.
Status AC-037 tetap diberi catatan sesuai keputusan Phase 1 Q8.

| AC | Priority | Status | Bukti | Catatan |
|---|---|---|---|---|
| AC-001 | Must Have | Pass | `services-pricing-time.test.ts`; `phase4-runtime.json` S8 | `getEffectivePrice` adalah satu sumber harga; beranda/produk/keranjang/checkout memakai nilai yang sama. |
| AC-002 | Must Have | Pass | `components.test.tsx` (PriceBreakdown); screenshot `phase5/product-390.png` | Rincian menampilkan harga, biaya ukuran, ongkir, biaya layanan, diskon, dan total akhir. |
| AC-003 | Must Have | Pass | `services-pricing-time.test.ts` (computePriceBreakdown) | Total dihitung dari penjumlahan komponen dikurangi diskon; override harga tetap menghasilkan total konsisten. |
| AC-004 | Must Have | Pass | `services-behavior.test.ts` (canCompleteOrder); `integration.test.tsx` Selesaikan | Tombol aktif untuk `Diterima` maupun `receivedBadge === true`. |
| AC-005 | Must Have | Pass | `integration.test.tsx` completion; `phase4-runtime.json` S1 | Status menjadi Selesai, tab Selesai aktif, toast konfirmasi tampil. |
| AC-006 | Must Have | Pass | `components.test.tsx` (ConfirmModal); `phase4-runtime.json` S2 | Batal menutup modal dan status tidak berubah. |
| AC-007 | Must Have | Pass | `services-pricing-time.test.ts` (isReminderDue); `components.test.tsx` (ReminderBanner); `integration.test.tsx` auto-complete | Pengingat 24 jam sebelum batas 48 jam dengan opsi Selesaikan Sekarang / Tunggu Otomatis. |
| AC-008 | Must Have | Pass | `integration.test.tsx` completion | Alur selesai: klik tombol lalu klik Ya = dua ketukan. |
| AC-009 | Must Have | Pass | `services-behavior.test.ts` (completeOrderIn, addNotification); `integration.test.tsx` double action | Klik berulang tidak mengubah status dua kali dan tidak membuat notifikasi ganda. |
| AC-010 | Must Have | Pass | `integration.test.tsx` completion | Setelah Selesai, tombol Lunasi Sekarang tersedia di detail pesanan. |
| AC-011 | Must Have | Pass | `components.test.tsx` (FilterTabs); `integration.test.tsx` filter; `services-behavior.test.ts` (matchesFilter) | Enam tab persis. Diterima bukan tab; pesanan ber-badge Diterima dihitung di tab Dikirim. |
| AC-012 | Should Have | Pass | `integration.test.tsx` filter + pencarian | Pencarian tetap membatasi hasil pada tab aktif. |
| AC-013 | Must Have | Pass | `integration.test.tsx` completion; `phase4-runtime.json` S1/S3 | Status yang sama tampil di kartu daftar, tab, dan detail setelah navigasi. |
| AC-014 | Must Have | Pass | `components.test.tsx` (AdBanner); `phase4-runtime.json` S4 | Satu klik pada tombol Tutup iklan menyembunyikan banner. |
| AC-015 | Must Have | Pass | `components.test.tsx` (AdBanner); `phase4-runtime.json` S4 | Banner hanya berisi tombol tutup, bukan tautan/deep-link. |
| AC-016 | Must Have | Pass | `phase3/overflow.json`; `phase5/visual-audit.json` | `primaryActionCovered = 0` pada 44 + 22 kombinasi halaman/lebar. |
| AC-017 | Should Have | Pass | `services-behavior.test.ts` (adFrequency); `hooks.test.tsx` (useAdFrequency); `phase4-runtime.json` S4 | Maksimal 3 tayangan/hari dan cooldown 24 jam setelah tutup, termasuk setelah reload. |
| AC-018 | Must Have | Pass | `services-pricing-time.test.ts` (estimateRangeLabel); `components.test.tsx` (DeliveryEstimate) | Estimasi tampil sebagai rentang, misalnya 2–5 hari, dengan label teks. |
| AC-019 | Must Have | Pass | `services-pricing-time.test.ts` (isDelayed); `phase4-runtime.json` S7 | Pesanan aktif yang melewati batas estimasi memicu notifikasi keterlambatan dan banner. |
| AC-020 | Must Have | Pass | `services-behavior.test.ts` (notificationService); `integration.test.tsx` double action | ID `${orderId}:${kind}` dipakai sebagai kunci deduplikasi. |
| AC-021 | Should Have | Pass | `phase4-runtime.json` S7 | Demo failure flag menghasilkan `status: 'failed'`, error toast, dan data order tetap Dikirim. |
| AC-022 | Must Have | Pass | `integration.test.tsx` report; `phase4-runtime.json` S5 | Laporan valid menghasilkan tiket `TKT-YYYY-NNNNNN`, draft dihapus, konfirmasi tampil. |
| AC-023 | Must Have | Pass | `components.test.tsx` (ReportForm); `phase4-runtime.json` S5 | ID dan status pesanan terisi otomatis dan bersifat read-only. |
| AC-024 | Must Have | Pass | `services-behavior.test.ts` (reportValidator); `components.test.tsx`; `integration.test.tsx`; `phase4-runtime.json` S5 | Error per field untuk kategori/deskripsi, batas 1000 karakter, dan batas bukti 5MB. |
| AC-025 | Must Have | Pass | `integration.test.tsx` navigation; `phase3/overflow.json`; `phase5/visual-audit.json` | Menu aktif mengikuti rute; navigasi bawah/tablet/sidebar sesuai breakpoint. |
| AC-026 | Must Have | Pass | `integration.test.tsx` completion; `phase4-runtime.json` S1/S6/S7 | Toast sukses/error tampil untuk kompletion, rollback storage, dan kegagalan notifikasi. |
| AC-027 | Should Have | Pass | `integration.test.tsx` filter empty state | Filter tanpa hasil menampilkan pesan empty state dan tombol Reset Filter. |
| AC-028 | Must Have | Pass | `phase3/overflow.json`; `phase4/responsive.json`; `phase5/visual-audit.json` | 0 overflow pada 390/768/1024/1440 px; 22 screenshot Phase 5 di `docs/screenshots/phase5/`. |
| AC-029 | Must Have | Pass | `components.test.tsx` (ReportForm); `phase4-runtime.json` S5/S6 | Input laporan tersimpan saat error; rollback storage mengembalikan state lama tanpa kehilangan data lain. |
| AC-030 | Must Have | Pass | `phase5/visual-audit.json`; `phase3/overflow.json`; `npm run check:tokens` | Warna computed style sesuai token: primary, background, surface, border, text; 0 deviasi, 0 token undefined. |
| AC-031 | Should Have | Pass | `phase5/visual-audit.json`; `phase3/overflow.json` | Body 14px, H1 28px/700, H2 22px/600, rasio line-height 1.2–1.4; 0 deviasi. |
| AC-032 | Must Have | Pass | `components.test.tsx`; `phase5/visual-audit.json` | Tombol, input, kartu, badge, dan modal memakai kelas/token yang sama; radius tombol 8px, kartu 12px, input 8px. |
| AC-033 | Must Have | Pass | `components.test.tsx` (StatusBadge via integration); `phase5/visual-audit.json` | Badge radius 999px, padding 4px 10px, font 12px, dan selalu disertai label teks. |
| AC-034 | Must Have | Pass | `components.test.tsx` (AdBanner); `phase3/overflow.json`; `phase5/visual-audit.json` | Area tutup iklan 44×44 px teruji di jsdom dan computed style Chrome. |
| AC-035 | Should Have | Pass | `phase5/visual-audit.json` | Navigation timing Chrome untuk 22 kombinasi halaman/lebar; `performanceOver3s = 0`. |
| AC-036 | Must Have | Pass | `integration.test.tsx` completion; `phase4-runtime.json` S3 | State tersimpan di localStorage namespaced dan tetap setelah reload/masuk kembali. |
| AC-037 | Must Have | Pass | `integration.test.tsx` isolation; `CHANGELOG.md` Phase 2 Q8 | **Catatan:** simulasi single-user, tanpa autentikasi nyata; isolasi memakai localStorage keys terpisah (`shopee-tracking-state-v1` dan `shopee-tracking-demo-v1`). |
| AC-038 | Should Have | Pass | `components.test.tsx` (ConfirmModal Escape, ReportForm labels, StatusBadge teks) | Modal responsif terhadap Escape, input berlabel, status tidak hanya warna; fokus terlihat via `:focus-visible`. |
| AC-039 | Must Have | Pass | `hooks.test.tsx` (usePersistentState rollback); `phase4-runtime.json` S6 | Gagal tulis localStorage → state lama dipertahankan, toast error, status tidak berubah. |
| AC-040 | Must Have | Pass | `services-pricing-time.test.ts` (getEffectivePrice); `phase4-runtime.json` S8 | Perubahan harga menampilkan “Harga diperbarui.” dengan nilai lama dan baru di beranda/produk/keranjang/checkout. |
| AC-041 | Must Have | Pass | `services-behavior.test.ts` (canCompleteOrder); `integration.test.tsx` detail; `phase4-runtime.json` S1 | Paket diterima namun status belum berubah tetap menampilkan tombol Selesaikan Pesanan. |
| AC-042 | Should Have | Pass | `integration.test.tsx` filter empty state | Filter tanpa hasil menampilkan empty state + Reset Filter yang mengembalikan daftar. |
