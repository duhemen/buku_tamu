# Buku Tamu Digital

> **Sistem Buku Tamu Digital Terintegrasi** - Siap pakai untuk kantor, instansi, atau komunitas Anda.

![Version](https://img.shields.io/badge/version-1.6.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Quick Start (5 Menit)

### Prasyarat
- Windows 10/11
- Docker Desktop (install otomatis via menu)
- 8 GB RAM
- 5 GB storage

### Cara Pakai

```
1. Extract bundle ke C:\buku_tamu\
2. Klik 2x "BukuTamu-Menu.bat"
3. Pilih [22] Setup Awal - install Docker otomatis
4. Restart Windows (kalau baru install Docker)
5. Klik 2x "BukuTamu-Menu.bat" lagi
6. Pilih [1] Start Semua
7. Tunggu ~1 menit
8. Browser auto-open - login: admin@buku-tamu.local / admin123
```

**Selesai!** Aplikasi siap dipakai.

---

## Fitur Lengkap

### Kiosk Tamu
- Form isian tamu dengan foto wajah
- Face recognition auto-fill (tamu lama dikenali)
- Serah terima 5 jenis (surat, jaminan tender, paket, dokumen, lainnya)
- Cetak kartu tamu dengan QR + barcode

### Dashboard Publik
- Statistik kunjungan: hari/minggu/bulan/tahun
- Chart: per jam, mingguan, pie tujuan
- Tabel tamu (data sensitif ter-mask)

### TV Antrean Live
- Fullscreen untuk TV lobi
- Nomor dipanggil besar + suara Bahasa Indonesia
- Info agenda + status petugas

### Verifikasi QR
- Scan QR via kamera HP
- Lookup kartu by kode

### Admin Panel (8 Tab)
- **Antrean** - panggil/layani
- **Kunjungan** - check-out
- **Serah Terima** - tracking
- **Data Tamu** - edit, export Excel/CSV
- **Laporan** - generate PDF bulanan
- **Jam Operasional** - atur jam kerja
- **Petugas** - CRUD + konfirmasi harian
- **Agenda** - pengumuman & jadwal

### Keamanan
- Enkripsi AES-256 untuk NIK/HP/email
- Face recognition privacy-first (embedding only)
- JWT + RBAC
- Audit log

### Multi-Bahasa
- Bahasa Indonesia
- English

### Tema
- Light mode
- Dark mode

---

## Menu Command Center

| Menu | Fungsi |
|---|---|
| **[1] Start Semua** | Jalanin Docker + Tunnel + API + Web |
| **[2] Stop Semua** | Stop semua service |
| **[4] Cek Status** | Cek status semua service |
| **[8] Setup Token Cloudflare** | Input token untuk akses publik |
| **[22] Setup Awal** | Cek + install prasyarat |

Full menu: Klik 2x `BukuTamu-Menu.bat`

---

## Akses Aplikasi

| URL | Fungsi |
|---|---|
| `http://localhost:5173` | Beranda |
| `http://localhost:5173/kiosk` | Kiosk tamu |
| `http://localhost:5173/dashboard` | Dashboard publik |
| `http://localhost:5173/tv` | TV Antrean (fullscreen) |
| `http://localhost:5173/verify` | Verifikasi QR |
| `http://localhost:5173/login` | Login petugas |
| `http://localhost:5173/admin` | Admin panel |

**Login default:** `admin@buku-tamu.local` / `admin123`

SEGERA GANTI PASSWORD setelah login pertama!

---

## Akses dari Internet (Opsional)

Kalau mau aplikasi bisa diakses dari luar kantor:

1. Punya domain sendiri (misal `kantorsaya.com`)
2. Daftar Cloudflare gratis
3. Baca **`docs/SETUP-CLOUDFLARE.md`**
4. Setup tunnel via menu [8]

Setelah selesai:
- Akses publik: `https://kantorsaya.com`
- Semua data tetap di laptop Anda

---

## Penggunaan Harian

### Pagi - Buka Kantor

```
1. Klik 2x BukuTamu-Menu.bat
2. Pilih [1] Start Semua
3. Login admin - konfirmasi status petugas
4. Kiosk & TV siap untuk tamu
```

### Sore - Tutup Kantor

```
1. Klik 2x BukuTamu-Menu.bat
2. Pilih [2] Stop Semua
```

### Setiap Pagi (Rutin)

```
1. Login Admin - Petugas - Konfirmasi Hari Ini
2. Set status tiap petugas (Tersedia / Sibuk / Tidak Ada)
3. Save - kiosk & TV update otomatis
```

### Kalau Ada Agenda Baru

```
1. Login Admin - Agenda - + Tambah Agenda
2. Isi: judul, kategori, tanggal, jam, lokasi
3. Save - tampil di kiosk & TV
```

---

## Troubleshooting Cepat

| Masalah | Solusi |
|---|---|
| Docker belum jalan | Buka Docker Desktop, tunggu ikon hijau |
| Port 5173 in use | Tutup aplikasi lain yang pakai port itu |
| Tunnel error | Cek menu [7] Status Tunnel, restart via menu [5] |
| Lupa password admin | Hubungi developer |
| Database error | Menu [3] Restart Semua |

Detail: Baca `docs/INSTALL.md` bagian Troubleshooting.

---

## Backup Otomatis

Database backup otomatis tiap hari jam 2 pagi. Tersimpan di:

```
C:\buku_tamu\backups\
```

Retensi: 30 hari. Backup manual: menu [20].

---

## Update Aplikasi

1. Stop aplikasi (menu [2])
2. Backup database (menu [20])
3. Download bundle versi baru
4. Extract ke folder baru
5. Copy folder `data/` + `config/` dari lama ke baru
6. Start aplikasi baru

---

## Lisensi

**MIT License** - bebas dipakai, dimodifikasi, didistribusikan.

Copyright (c) 2026 Emen

---

## Kredit

Dibuat dengan semangat belajar menggunakan:
- React + Fastify + PostgreSQL + Redis
- InsightFace (face recognition)
- Cloudflare Tunnel
- Docker

Special thanks to DeepSeek + Google Mode AI.

---

## Dukungan

- Baca dokumentasi di folder `docs/`
- Buka issue: https://github.com/duhemen/buku_tamu
- Kontak developer

---

**Selamat menggunakan Buku Tamu Digital!**