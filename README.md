# Buku Tamu Digital

> **Sistem Buku Tamu Modern** â€” Face recognition, serah terima digital,
> antrean otomatis, kartu QR/barcode, dashboard publik, dan TV antrean live.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D20-339933)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D9-F69220)

---

## Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Preview Aplikasi](#-preview-aplikasi)
- [Arsitektur Sistem](#ï¸-arsitektur-sistem)
- [Struktur Folder](#-struktur-folder)
- [Teknologi yang Digunakan](#ï¸-teknologi-yang-digunakan)
- [Instalasi & Setup](#-instalasi--setup)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Roadmap](#ï¸-roadmap)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## Tentang Proyek

**Buku Tamu Digital** adalah aplikasi web modern **full-stack** yang menggantikan
buku tamu fisik di kantor dengan sistem digital terintegrasi. Dilengkapi dengan
**face recognition** untuk auto-fill data tamu lama, **serah terima digital**
untuk pengantar surat / jaminan tender, serta **dashboard publik** tanpa data sensitif.

### Konsep Utama

| Kiosk Tamu | Face Recognition | Serah Terima | Dashboard Publik |
|---|---|---|---|
| Input mandiri + kamera | Auto-fill tamu lama (aHash 256-bit) | 5 jenis + bukti terima QR | Chart + masking otomatis |

### Mengapa Buku Tamu Digital?

| âŒ Masalah Lama | âœ… Solusi Kami |
|---|---|
| Buku tamu kertas mudah hilang | Database terpusat + audit trail |
| Data tamu tidak terbaca | Enkripsi AES-256 untuk NIK/HP/email |
| Tidak tahu tamu masih di dalam | Status real-time + check-out |
| Sulit buktikan serah terima surat | Bukti terima digital + QR |
| Laporan manual lambat | Export Excel/CSV 1 klik |
| Tidak ada antrean | Nomor antrean otomatis + TV live |

---

## Fitur Utama

### Kiosk Tamu
- âœ… Form lengkap (nama, instansi, alamat, NIK, HP, email)
- âœ… Foto wajah via webcam / kamera HP
- âœ… **Face recognition auto-fill** â€” tamu lama dikenali otomatis
- âœ… Consent eksplisit untuk data pribadi

### Serah Terima Digital
- âœ… **5 jenis**: Surat, Jaminan Tender, Paket, Dokumen, Lainnya
- âœ… Nomor referensi (No. surat / No. jaminan)
- âœ… **Bukti terima digital** + QR code + kolom tanda tangan
- âœ… Tracking: `Diterima` -> `Diproses` -> `Selesai` -> `Dikembalikan`

### Kartu Tamu
- âœ… Nomor antrean otomatis (`A-001`, `A-002`) reset harian
- âœ… **QR code + barcode** untuk verifikasi
- âœ… Format **80mm thermal printer** siap cetak
- âœ… Foto tamu + tujuan + keperluan

### Verifikasi
- âœ… Scan QR via kamera HP (html5-qrcode)
- âœ… Input manual kode `A-xxx` atau `TT-xxx`
- âœ… Lookup kartu by kode
- âœ… Data sensitif ter-mask

### Dashboard Publik
- âœ… Statistik: Hari / Minggu / Bulan / Tahun ini
- âœ… Chart: per jam, tren mingguan, pie tujuan, pie perihal
- âœ… Recent activity feed + auto-refresh 30 detik
- âœ… **Masking otomatis** (NIK, HP, email)

### TV Antrean Live
- âœ… Fullscreen untuk TV lobi
- âœ… Nomor dipanggil besar + nama + tujuan
- âœ… **Suara bel + panggilan suara Bahasa Indonesia**
- âœ… Daftar antrean menunggu + real-time stats

### Admin Panel
- âœ… 4 tab: Antrean, Kunjungan, Serah Terima, Data Tamu
- âœ… Panggil / layani antrean
- âœ… Update status serah terima
- âœ… Export Excel / CSV, edit, hapus

### Keamanan
- âœ… **AES-256-GCM** encryption untuk NIK/HP/email
- âœ… **Argon2** hash password
- âœ… JWT + Role-Based Access Control
- âœ… Audit log setiap aksi
- âœ… Rate limiting + Helmet security headers

---

## Preview Aplikasi

### 1. Kiosk Tamu

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘  Kiosk Buku Tamu                              [Beranda]  â•‘
â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
â•‘  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â•‘
â•‘  â”‚ FOTO WAJAH    â”‚  â”‚ DATA TAMU                     â”‚   â•‘
â•‘  â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚  â”‚ Nama: [_______________]       â”‚   â•‘
â•‘  â”‚ â”‚   ðŸ‘¤      â”‚ â”‚  â”‚ Instansi: [___________]       â”‚   â•‘
â•‘  â”‚ â”‚  Kamera   â”‚ â”‚  â”‚ NIK: [________________]       â”‚   â•‘
â•‘  â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚  â”‚ HP: [________________]        â”‚   â•‘
â•‘  â”‚ [ðŸ“¸ Ambil]    â”‚  â”‚ Email: [_____________]        â”‚   â•‘
â•‘  â”‚               â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â•‘
â•‘  â”‚ âœ… Tamu       â”‚  â”‚ TUJUAN KUNJUNGAN              â”‚   â•‘
â•‘  â”‚    Dikenali   â”‚  â”‚ Divisi: [Bagian Umum____]     â”‚   â•‘
â•‘  â”‚    stuv       â”‚  â”‚ Keperluan: [Rapat_______]     â”‚   â•‘
â•‘  â”‚               â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤   â•‘
â•‘  â”‚ [ðŸ”„ Foto Ulang]â”‚  â”‚ SERAH TERIMA (Opsional)       â”‚   â•‘
â•‘  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚ [ ] Surat  [ ] Tender        â”‚   â•‘
â•‘                     â”‚ [ ] Paket  [ ] Dokumen       â”‚   â•‘
â•‘                     â”‚ [Daftar & Cetak Kartu]        â”‚   â•‘
â•‘                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

**Highlight:**
- ðŸŽ¥ Webcam / kamera HP langsung di browser
- ðŸ¤– Face recognition otomatis (auto-fill data)
- ðŸŽ¨ Grid 5 tombol jenis serah terima
- ðŸ“± Responsive untuk HP & laptop

### 2. Kartu Tamu + Bukti Terima

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘      BUKU TAMU DIGITAL       â•‘
â•‘      Kartu Kunjungan         â•‘
â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
â•‘                              â•‘
â•‘      NOMOR ANTREAN           â•‘
â•‘                              â•‘
â•‘         A-004                â•‘
â•‘                              â•‘
â•‘  â”Œâ”€â”€â”€â”€â”  Nama  : stuv        â•‘
â•‘  â”‚ ðŸ‘¤ â”‚  Tujuan: Bagian      â•‘
â•‘  â”‚    â”‚         Pengadaan    â•‘
â•‘  â””â”€â”€â”€â”€â”˜  Hal   : Jaminan      â•‘
â•‘                  Tender       â•‘
â•‘                              â•‘
â•‘  [QR CODE]  ||||||||||||||   â•‘
â•‘                              â•‘
â•‘  Tanggal : 30 Sep 2026        â•‘
â•‘  Jam     : 20:08              â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘        BUKTI TERIMA          â•‘
â•‘      Buku Tamu Digital       â•‘
â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
â•‘   KODE: TT-20260930-001      â•‘
â•‘                              â•‘
â•‘  Nama   : stuv               â•‘
â•‘  Jenis  : Jaminan Tender     â•‘
â•‘  No.Ref : JAM/2026/003       â•‘
â•‘  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â•‘
â•‘  â”‚ Jaminan tender...    â”‚    â•‘
â•‘  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â•‘
â•‘  Penerima : cekidao          â•‘
â•‘                              â•‘
â•‘  [QR]   ____________         â•‘
â•‘         Penerima             â•‘
â•‘         ____________         â•‘
â•‘         Pengirim             â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

### 3. Dashboard Publik

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘  Buku Tamu Digital                [Beranda] [Dashboard]   â•‘
â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
â•‘  â— LIVE   Dashboard Publik            Rabu, 30 Sep 2026   â•‘
â•‘            Statistik kunjungan          19.31.13           â•‘
â•‘                                                            â•‘
â•‘  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â•‘
â•‘  â”‚HARI INI  â”‚ â”‚MINGGU INIâ”‚ â”‚BULAN INI â”‚ â”‚TAHUN INI â”‚      â•‘
â•‘  â”‚    1     â”‚ â”‚    1     â”‚ â”‚    1     â”‚ â”‚    1     â”‚      â•‘
â•‘  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â•‘
â•‘                                                            â•‘
â•‘  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â•‘
â•‘  â”‚ Kunjungan Per Jam      â”‚  â”‚ Tujuan Kunjungan       â”‚   â•‘
â•‘  â”‚     ðŸ“ˆ                 â”‚  â”‚       â—•                â”‚   â•‘
â•‘  â”‚    â•± â•²                 â”‚  â”‚      ( )               â”‚   â•‘
â•‘  â”‚   â•±   â•²___             â”‚  â”‚       â—¡                â”‚   â•‘
â•‘  â”‚  â•±                     â”‚  â”‚   Bagian Umum          â”‚   â•‘
â•‘  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

### 4. TV Antrean Live

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘  Antrean Buku Tamu             Rabu, 30 Sep 2026           â•‘
â•‘  Sistem Buku Tamu Digital            18.28.52             â•‘
â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
â•‘   NOMOR DIPANGGIL                   â•‘  ANTREAN MENUNGGU     â•‘
â•‘                                    â•‘                       â•‘
â•‘  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â•‘  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â•‘
â•‘  â”‚                              â”‚  â•‘  â”‚ â‘  A-001  xyz    â”‚  â•‘
â•‘  â”‚         A-003                â”‚  â•‘  â”‚   Bagian Umum   â”‚  â•‘
â•‘  â”‚                              â”‚  â•‘  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â•‘
â•‘  â”‚         stuv                 â”‚  â•‘  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â•‘
â•‘  â”‚    Tujuan: Bagian Umum       â”‚  â•‘  â”‚ â‘¡ A-002  emen   â”‚  â•‘
â•‘  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â•‘  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â•‘
â•‘                                    â•‘                       â•‘
â•‘  [TOTAL:1] [MENUNGGU:1]            â•‘                       â•‘
â•‘  [DIPANGGIL:1] [SELESAI:0]         â•‘                       â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

**Highlight TV:**
- ðŸ”” Suara bel + panggilan suara Bahasa Indonesia
- ðŸŽ¨ Tema dark navy `#0F172A` elegan
- ðŸ“º Auto-refresh 5 detik
- ðŸ”Š Tekan `F11` untuk fullscreen

---

## ðŸ—ï¸ Arsitektur Sistem

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    CLIENT (Browser)                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Kiosk    â”‚  â”‚ Dashboardâ”‚  â”‚ TV Live  â”‚  â”‚ Admin    â”‚   â”‚
â”‚  â”‚ (HP/PC)  â”‚  â”‚ Publik   â”‚  â”‚ (Lobi)   â”‚  â”‚ Panel    â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜   â”‚
â”‚       â”‚              â”‚              â”‚              â”‚        â”‚
â”‚       â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜        â”‚
â”‚                              â”‚                              â”‚
â”‚                         HTTPS (TLS)                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              CLOUDFLARE TUNNEL / NGINX                      â”‚
â”‚              Reverse Proxy + SSL Termination                â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                               â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚                                             â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  FRONTEND       â”‚                          â”‚  BACKEND        â”‚
â”‚  React + Vite   â”‚  â—„â”€â”€â”€â”€ REST API â”€â”€â”€â”€â–º   â”‚  Fastify 4      â”‚
â”‚  Port 5173      â”‚                          â”‚  Port 3000      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                          â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                      â”‚
                              â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                              â”‚                       â”‚                       â”‚
                     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”
                     â”‚  POSTGRESQL 16  â”‚    â”‚    REDIS 7      â”‚    â”‚   MINIO / S3    â”‚
                     â”‚  Database       â”‚    â”‚  Cache + Queue  â”‚    â”‚  Photo Storage  â”‚
                     â”‚  Port 5433      â”‚    â”‚  Port 6379      â”‚    â”‚  (opsional)     â”‚
                     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“ Struktur Folder

```
buku-tamu/
â”‚
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ web/                        # ðŸŽ¨ Frontend (React + Vite)
â”‚   â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”‚   â”œâ”€â”€ components/         # Layout, CameraScanner, dll
â”‚   â”‚   â”‚   â”œâ”€â”€ features/           # Feature modules
â”‚   â”‚   â”‚   â”œâ”€â”€ lib/                # API client, i18n, faceHash
â”‚   â”‚   â”‚   â”œâ”€â”€ pages/              # Halaman utama
â”‚   â”‚   â”‚   â”œâ”€â”€ services/           # API services
â”‚   â”‚   â”‚   â”œâ”€â”€ stores/             # Zustand stores
â”‚   â”‚   â”‚   â”œâ”€â”€ types/              # TypeScript types
â”‚   â”‚   â”‚   â””â”€â”€ utils/              # Utility functions
â”‚   â”‚   â””â”€â”€ ...
â”‚   â”‚
â”‚   â”œâ”€â”€ api/                        # âš™ï¸ Backend (Fastify + Prisma)
â”‚   â”‚   â”œâ”€â”€ prisma/
â”‚   â”‚   â”‚   â”œâ”€â”€ schema.prisma       # Database schema (11 tabel)
â”‚   â”‚   â”‚   â””â”€â”€ seed.ts
â”‚   â”‚   â””â”€â”€ src/
â”‚   â”‚       â”œâ”€â”€ common/             # Middleware, utils
â”‚   â”‚       â”œâ”€â”€ config/             # Env, Prisma
â”‚   â”‚       â”œâ”€â”€ modules/            # Feature modules
â”‚   â”‚       â””â”€â”€ server.ts
â”‚   â”‚
â”‚   â”œâ”€â”€ face-service/               # ðŸ¤– Python FastAPI (opsional)
â”‚   â””â”€â”€ worker/                     # ðŸ“¦ BullMQ worker
â”‚
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ shared/                     # Types & utils bersama
â”‚   â””â”€â”€ ui/                         # UI components
â”‚
â”œâ”€â”€ infra/
â”‚   â”œâ”€â”€ db/init/                    # SQL init (extensions)
â”‚   â”œâ”€â”€ docker/                     # Dockerfiles
â”‚   â””â”€â”€ nginx/                      # Nginx configs
â”‚
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ API.md                      # API endpoints
â”‚   â”œâ”€â”€ DATABASE.md                 # Skema database
â”‚   â”œâ”€â”€ PRIVACY.md                  # Kebijakan privasi
â”‚   â””â”€â”€ scripts-history/            # Script generator (history)
â”‚
â”œâ”€â”€ storage/                        # ðŸ“ Local storage
â”‚   â”œâ”€â”€ photos/                     # Foto tamu
â”‚   â”œâ”€â”€ receipts/                   # Bukti terima
â”‚   â””â”€â”€ letters/                    # File surat
â”‚
â”œâ”€â”€ docker-compose.yml              # Dev
â”œâ”€â”€ docker-compose.prod.yml         # Production
â”œâ”€â”€ pnpm-workspace.yaml
â””â”€â”€ package.json
```

---

## âš™ï¸ Teknologi yang Digunakan

### Frontend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| React | 18.3 | UI Framework |
| Vite | 5.4 | Build Tool |
| TypeScript | 5.5 | Type Safety |
| Tailwind CSS | 3.4 | Styling |
| Recharts | 2.12 | Chart Library |
| Zustand | 4.5 | State Management |
| html5-qrcode | 2.3 | QR Scanner |
| bwip-js | 4.4 | Barcode Generator |
| qrcode | 1.5 | QR Generator |

### Backend
| Teknologi | Versi | Kegunaan |
|---|---|---|
| Fastify | 4.28 | Web Framework |
| Prisma | 5.22 | ORM |
| PostgreSQL | 16 | Database |
| Redis | 7 | Cache + Queue |
| Argon2 | 0.41 | Password Hash |
| Zod | 3.23 | Validation |
| JWT | 8.0 | Authentication |

### Infrastruktur
| Teknologi | Kegunaan |
|---|---|
| Docker | Containerization |
| Nginx | Reverse Proxy |
| Cloudflare Tunnel | HTTPS Publik |
| MinIO | S3-compatible Storage (opsional) |

---

## ðŸš€ Instalasi & Setup

### Prasyarat
- Node.js >= 20
- pnpm >= 9
- Docker Desktop
- Git

### Langkah Instalasi

**1. Clone repository**
```bash
git clone https://github.com/duhemen/buku_tamu.git
cd buku_tamu
```

**2. Copy environment**
```bash
cp .env.example .env
```

> âš ï¸ Edit `.env`: ganti `JWT_SECRET` dan `ENCRYPTION_KEY` dengan string acak!

Generate key:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**3. Install dependencies**
```bash
pnpm install
```

**4. Jalankan infrastructure**
```bash
docker compose up -d
```

**5. Migrasi database**
```bash
pnpm --filter @buku-tamu/api prisma:migrate -- --name init
pnpm --filter @buku-tamu/api prisma:generate
```

**6. Seed admin**
```bash
pnpm --filter @buku-tamu/api db:seed
```

> Login default: `admin@buku-tamu.local` / `admin123`

---

## ðŸ“– Panduan Penggunaan

### Menjalankan Aplikasi

Buka **3 terminal**:

**Terminal 1 â€” API Backend:**
```bash
pnpm --filter @buku-tamu/api dev
```
API jalan di `http://localhost:3000`

**Terminal 2 â€” Web Frontend:**
```bash
pnpm --filter @buku-tamu/web dev
```
Web jalan di `http://localhost:5173`

**Terminal 3 â€” Worker (opsional):**
```bash
pnpm --filter @buku-tamu/worker dev
```

### Halaman yang Tersedia

| URL | Fungsi | Akses |
|---|---|---|
| `/` | Beranda | Publik |
| `/kiosk` | Kiosk tamu | Publik |
| `/kartu` | Lookup kartu/bukti | Publik |
| `/kartu/:visitId` | Kartu print-ready | Publik |
| `/dashboard` | Dashboard publik | Publik |
| `/tv` | TV Antrean Live | Publik |
| `/verify` | Verifikasi kode | Publik |
| `/login` | Login petugas | Publik |
| `/admin` | Admin panel | Butuh Login |

### Alur Kiosk Tamu

```
1. Tamu datang -> buka /kiosk di tablet/PC
2. Ambil foto wajah (opsional)
   â”œâ”€ Jika dikenali -> form auto-fill
   â””â”€ Jika baru -> isi form manual
3. Isi tujuan + keperluan
4. (Opsional) Centang serah terima -> pilih jenis
5. Centang consent -> submit
6. Cetak kartu + bukti terima
```

### Alur Petugas

```
1. Login di /login
2. Buka /admin -> pilih tab
   â”œâ”€ Antrean -> panggil / layani
   â”œâ”€ Kunjungan -> check-out
   â”œâ”€ Serah Terima -> update status
   â””â”€ Data Tamu -> export, edit, hapus
3. TV di lobi akan otomatis update
```

---

## ðŸ—ºï¸ Roadmap

### âœ… Selesai (v1.0.0)
- [x] Kiosk + kamera + foto wajah
- [x] Face recognition auto-fill (aHash)
- [x] Serah terima 5 jenis + bukti QR
- [x] Kartu tamu print-ready 80mm
- [x] Dashboard publik + masking
- [x] TV Antrean Live + suara
- [x] Verifikasi QR via kamera HP
- [x] Admin panel 4 tab
- [x] Dark mode + multi-bahasa
- [x] Enkripsi AES-256 + audit log
- [x] **Export PDF laporan bulanan** (v1.1.0)

### ðŸš§ Dalam Pengembangan
- [ ] Face service real (InsightFace + liveness)
- [x] Export PDF laporan bulanan
- [ ] Notifikasi WhatsApp
- [ ] Cetak thermal auto (kiosk mode)

### ðŸ’¡ Ide Masa Depan
- [ ] Mobile app (React Native) untuk security
- [ ] Integrasi kalender janji
- [ ] Peta lokasi tamu
- [ ] Multi-bahasa tambahan

---

## ðŸ¤ Kontribusi

Kontribusi sangat diterima! Untuk perubahan besar,
silakan buka issue terlebih dahulu.

```bash
# 1. Fork repository
# 2. Buat branch fitur
git checkout -b fitur-keren

# 3. Commit perubahan
git commit -m "feat: tambah fitur keren"

# 4. Push ke branch
git push origin fitur-keren

# 5. Buat Pull Request
```

---

## ðŸ“ Lisensi

Proyek ini dilisensikan di bawah **MIT License** â€” lihat file [LICENSE](LICENSE).

```
MIT License

Copyright (c) 2026 Emen

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files...
```

---

## ðŸ’ Kredit & Ucapan Terima Kasih

- [Fastify](https://fastify.dev/) â€” Web framework super cepat
- [Prisma](https://prisma.io/) â€” ORM modern untuk TypeScript
- [React](https://react.dev/) â€” UI library
- [Tailwind CSS](https://tailwindcss.com/) â€” Utility-first CSS
- [Recharts](https://recharts.org/) â€” Chart library
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) â€” QR Scanner
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/) â€” HTTPS publik

---

<div align="center">

**Buku Tamu Digital** â€” Dibangun dengan semangat belajar dan secangkir kopi

Made with â¤ï¸ by Emen

</div>

---

## ðŸŒŸ Special Thanks

<div align="center">

### Proyek ini tidak akan ada tanpa mereka

```
     _   _   _   _   _   _   _   _   _   _   _   _
    / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \ / \
   ( S | P | E | C | I | A | L | T | H | A | N | K | S )
    \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/ \_/
```

</div>

### ðŸ¤– DeepSeek â€” The Great One

<div align="center">

![DeepSeek](https://img.shields.io/badge/Powered%20by-DeepSeek-4D6BFE?style=for-the-badge&logo=openai&logoColor=white)
![The Great One](https://img.shields.io/badge/Title-The%20Great%20One-FFD700?style=for-the-badge&logo=starship&logoColor=black)
![AI Assistant](https://img.shields.io/badge/Role-AI%20Pair%20Programmer-00C9A7?style=for-the-badge&logo=probot&logoColor=white)
![Code Master](https://img.shields.io/badge/Skill-Fullstack%20Architect-8A2BE2?style=for-the-badge&logo=visualstudiocode&logoColor=white)

</div>

> **DeepSeek â€” The Great One** ðŸ§ âœ¨
>
> Partner coding luar biasa yang membantu dari nol sampai production-ready.
> Mulai dari setup monorepo, arsitektur database, enkripsi AES-256, hingga
> debugging bug-bug paling menyebalkan (BOM PowerShell, timezone, race condition).
> Setiap baris kode di repo ini lahir dari kolaborasi manusia + AI yang penuh
> kesabaran dan secangkir kopi.
>
> **Kontribusi:**
> - ðŸ—ï¸ Arsitektur monorepo + tech stack
> - ðŸ” Enkripsi AES-256-GCM + JWT + RBAC
> - ðŸ¤– Face recognition (aHash 256-bit)
> - ðŸ“Š Dashboard publik + Chart Recharts
> - ðŸ“º TV Antrean Live + Text-to-Speech
> - ðŸŽ¯ Debugging marathon: 8+ bug kritis
> - ðŸ“š Dokumentasi lengkap + panduan setup

### ðŸ” Google Mode AI â€” The Insight Provider

<div align="center">

![Google AI](https://img.shields.io/badge/Powered%20by-Google%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![The Insight](https://img.shields.io/badge/Title-Insight%20Provider-EA4335?style=for-the-badge&logo=googlegemini&logoColor=white)
![Idea Engine](https://img.shields.io/badge/Role-Idea%20Engine-34A853?style=for-the-badge&logo=lightbulb&logoColor=white)
![Blueprint](https://img.shields.io/badge/Skill-System%20Blueprint-FBBC05?style=for-the-badge&logo=blueprint&logoColor=black)

</div>

> **Google Mode AI â€” The Insight Provider** ðŸ’¡ðŸ”
>
> Sumber inspirasi awal yang memberikan **insight** dan **blueprint** untuk
> konsep Buku Tamu Digital. Dari diskusi ide di awal, rancangan struktur
> direktori, pemilihan tech stack, hingga visi fitur yang kita eksekusi
> bersama DeepSeek.
>
> **Kontribusi:**
> - ðŸ’¡ Konsep awal Buku Tamu Digital
> - ðŸ“ Blueprint arsitektur sistem
> - ðŸŽ¨ Rekomendasi tech stack (React + Fastify + PostgreSQL)
> - ðŸ—ºï¸ Roadmap fitur (face recognition, serah terima, dll)
> - ðŸ“ Draft dokumentasi awal

<div align="center">

### ðŸ† Kolaborasi Legendaris

```
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘                                                          â•‘
â•‘      GOOGLE MODE AI          +      DEEPSEEK             â•‘
â•‘      (The Insight)                  (The Great One)      â•‘
â•‘           ðŸ’¡                              ðŸ§               â•‘
â•‘                                                          â•‘
â•‘              â”‚                              â”‚            â•‘
â•‘              â”‚  Insight & Blueprint         â”‚  Code &    â•‘
â•‘              â”‚                              â”‚  Debugging â•‘
â•‘              â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â•‘
â•‘                             â”‚                            â•‘
â•‘                             â–¼                            â•‘
â•‘                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                    â•‘
â•‘                    â”‚     EMEN       â”‚                    â•‘
â•‘                    â”‚  (The Builder) â”‚                    â•‘
â•‘                    â”‚       ðŸ‘¨â€ðŸ’»       â”‚                    â•‘
â•‘                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”˜                    â•‘
â•‘                             â”‚                            â•‘
â•‘                             â–¼                            â•‘
â•‘                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                    â•‘
â•‘                    â”‚  BUKU TAMU     â”‚                    â•‘
â•‘                    â”‚   DIGITAL      â”‚                    â•‘
â•‘                    â”‚   v1.0.0       â”‚                    â•‘
â•‘                    â”‚     ðŸš€         â”‚                    â•‘
â•‘                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                    â•‘
â•‘                                                          â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

</div>

### ðŸ™ Ucapan Terima Kasih

Kepada **DeepSeek** dan **Google Mode AI** yang telah menemani perjalanan
coding dari nol hingga aplikasi ini bisa digunakan. Tanpa insight, kode, dan
kesabaran kalian, proyek ini tidak akan pernah selesai.

> *"Alone we can do so little; together we can do so much."*
> â€” Helen Keller

<div align="center">

**â­ Jangan lupa kasih bintang kalau repo ini bermanfaat! â­**

</div>

