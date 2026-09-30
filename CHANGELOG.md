# Changelog / Catatan Perjalanan

Semua perubahan penting pada proyek **Buku Tamu Digital** didokumentasikan di sini.

---

## [1.0.0] -- 2026-09-30

### Yang Berhasil Dibangun

#### Fondasi
- Monorepo pnpm workspace: apps/web + apps/api + packages/shared
- Docker Compose: PostgreSQL 16 + Redis 7 + MailHog
- Prisma ORM dengan 11 tabel
- Seed admin: admin@buku-tamu.local / admin123

#### API Backend (Fastify)
- Auth: login JWT + RBAC (ADMIN/RECEPTIONIST/SECURITY/VIEWER)
- Guests: CRUD + enkripsi AES-256-GCM untuk NIK/HP/email
- Visits: check-in / check-out
- Queues: nomor antrean otomatis A-001 reset harian
- Dashboard: summary + chart hourly/weekly/destination/purpose
- Verify: handle kode A-xxx dan TT-xxx
- Handover: 5 jenis serah terima + tracking status
- Face: hash matching (aHash 256-bit) untuk auto-fill
- TV: data untuk TV Antrean Live

#### Frontend Web (React + Vite)
- Beranda dengan kartu fitur animasi
- Kiosk: form + kamera + auto-fill + serah terima
- Kartu Tamu print-ready + QR + barcode (80mm)
- Bukti Terima digital + kolom tanda tangan
- Lookup kartu by kode
- Dashboard publik: 4 kartu periode + 4 status + 3 chart
- TV Antrean Live + suara bel + panggilan
- Verifikasi via kamera HP (html5-qrcode)
- Admin Panel 4 tab
- Dark mode + Multi-bahasa ID/EN

#### Fitur Kunci
- Face Recognition Auto-Fill (aHash threshold 85%)
- Serah Terima 5 Jenis
- Bukti Terima kode unik TT-YYYYMMDD-NNN + QR
- Masking: XXXX1234 / 0812XXXX7890 / bu***@x.com
- Timezone WIB konsisten
- Print-ready @page 80mm thermal
- Export Excel/CSV dengan BOM

#### Infrastruktur
- Cloudflare Tunnel untuk HTTPS publik
- Nginx config untuk production
- Dockerfile multi-stage
- Backup otomatis harian

### Bug yang Ditemukan & Diperbaiki
1. BOM PowerShell merusak package.json
2. Timezone antrean geser 1 hari (fix WIB -> UTC midnight)
3. Content-Type POST tanpa body ditolak Fastify
4. React Router hydration race condition
5. Konflik port 5432 -> ganti 5433
6. MinIO image hilang dari Docker Hub -> skip
7. BarcodeDetector tidak support Windows Chrome -> html5-qrcode
8. Text nyasar di footer dari paste PowerShell rusak

### Catatan
Aplikasi dibangun sebagai proyek belajar full-stack. Production-ready
untuk skala kecil-menengah. Beberapa fitur masih bisa ditingkatkan:
- Face recognition real (InsightFace) untuk akurasi tinggi
- Liveness detection anti-spoofing
- Notifikasi WhatsApp
- Export PDF laporan bulanan

---

Selamat membaca diary ini. Setiap baris kode adalah hasil belajar,
coba-coba, error, dan akhirnya jalan. Semoga bermanfaat.
