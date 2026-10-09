# Setup Cloudflare Tunnel untuk Buku Tamu Digital

Panduan ini untuk Anda yang ingin aplikasi bisa diakses dari internet (bukan cuma lokal).

**Waktu setup: ~15 menit**

---

## Yang Anda Butuhkan

- Domain sendiri (misal: `kantorsaya.com`) - daftar di Cloudflare gratis
- Akun Cloudflare gratis
- Koneksi internet stabil
- Browser (Chrome, Edge, Firefox)

Catatan: Kalau belum punya domain, beli dulu di registrar (Namecheap, Niagahoster, Rumahweb, dll) sekitar Rp 100-200rb/tahun.

---

## Langkah 1: Daftar Cloudflare (5 menit)

1. Buka https://dash.cloudflare.com/sign-up
2. Daftar dengan email + password
3. Verifikasi email (cek inbox/spam)
4. Login ke dashboard Cloudflare

---

## Langkah 2: Tambah Domain ke Cloudflare (5 menit)

1. Setelah login, klik **Add a site**
2. Masukkan domain Anda: `kantorsaya.com`
3. Pilih plan **Free** - Continue
4. Cloudflare akan scan DNS records - tunggu sebentar
5. Klik **Continue**
6. PENTING: Update nameserver domain Anda:
   - Cloudflare kasih 2 nameserver (misal: `anna.ns.cloudflare.com`)
   - Login ke registrar domain (tempat beli domain)
   - Ganti nameserver ke yang Cloudflare kasih
   - Save
7. Tunggu propagasi **1-24 jam** (biasanya 15 menit)
8. Cek status di Cloudflare - harus "Active"

---

## Langkah 3: Buat Tunnel (3 menit)

1. Buka https://one.dash.cloudflare.com
2. Menu kiri: **Networks** - **Tunnels**
3. Klik **Create a tunnel**
4. Pilih **Cloudflared** - Next
5. Nama tunnel: `bukutamu` (atau nama lain, bebas)
6. Klik **Save tunnel**
7. COPY TOKEN yang muncul di halaman berikutnya
   - Format: string panjang `eyJhIjoiNzNmNTA0OTk3...`
   - PENTING: Token ini cuma muncul sekali! Copy & simpan dulu di Notepad
8. JANGAN tutup halaman ini - kita butuh di langkah berikutnya

---

## Langkah 4: Setup Public Hostname (2 menit)

Masih di halaman tunnel yang sama:

### Route 1 - Web (Frontend)

Klik tab **Public Hostname** - **Add a public hostname**:

| Field | Value |
|---|---|
| Subdomain | (kosongkan) |
| Domain | `kantorsaya.com` |
| Path | (kosongkan) |
| Service Type | `HTTP` |
| URL | `bt-web:80` |

Klik **Save hostname**.

### Route 2 - API (Backend)

Klik **Add a public hostname** lagi:

| Field | Value |
|---|---|
| Subdomain | (kosongkan) |
| Domain | `kantorsaya.com` |
| Path | `/api/*` |
| Service Type | `HTTP` |
| URL | `bt-api:3000` |

Klik **Save hostname**.

Hasil akhir: 2 route aktif.

---

## Langkah 5: Input Token ke Aplikasi

1. Buka folder bundle Buku Tamu Digital
2. Klik 2x `BukuTamu-Menu.bat`
3. Pilih **[8] Setup Token Cloudflare**
4. Paste token yang Anda copy di Langkah 3
5. Masukkan domain Anda (opsional, untuk referensi): `kantorsaya.com`
6. Tunggu validasi (10-30 detik)
7. Kalau sukses: **Token berhasil disimpan!**

---

## Langkah 6: Jalankan Aplikasi

1. Dari menu, pilih **[1] Start Semua**
2. Aplikasi akan:
   - Start Docker containers (Postgres, Redis, API, Web, Face, Tunnel)
   - Start Cloudflare Tunnel dengan token Anda
   - Start API + Web
   - Auto-open browser
3. Tunggu ~1 menit
4. Buka https://kantorsaya.com di browser

---

## Selesai!

Aplikasi Anda sekarang bisa diakses di:
- **Lokal**: `http://localhost:5173`
- **Publik**: `https://kantorsaya.com`

---

## Troubleshooting

### Token tidak valid

**Penyebab:** Token salah / expired / sudah dipakai tunnel lain.

**Solusi:**
1. Balik ke Cloudflare - Tunnels - pilih tunnel
2. Cek status tunnel (harus "Healthy")
3. Kalau perlu, buat tunnel baru dan copy token baru
4. Input ulang via menu [8]

### Domain tidak bisa diakses

**Cek 1:** Nameserver sudah propagasi?
```
nslookup kantorsaya.com
```
Harus balas dengan IP Cloudflare (104.x.x.x atau 172.67.x.x).

**Cek 2:** Public Hostname sudah di-set?
- Cloudflare - Tunnels - pilih tunnel - Public Hostname
- Harus ada 2 route: `/` dan `/api/*`

**Cek 3:** Tunnel status di Cloudflare?
- Harus "Healthy" (hijau)

### Tunnel error 1033

**Penyebab:** Tunnel belum jalan atau token belum di-input.

**Solusi:**
1. Cek menu [7] Cek Status Tunnel
2. Pastikan tunnel aktif
3. Kalau tidak aktif, start via menu [5]

### 502 Bad Gateway

**Penyebab:** Container web/api belum jalan.

**Solusi:**
1. Cek menu [4] Cek Status Semua
2. Pastikan Docker containers aktif
3. Start via menu [14] Start Docker Containers

---

## Tips Keamanan

1. Jangan share token ke orang lain
2. Backup token di tempat aman (kalau hilang, buat baru)
3. Rate limiting sudah aktif otomatis
4. HTTPS otomatis dari Cloudflare
5. DDoS protection gratis dari Cloudflare

---

## Dukungan

Kalau ada masalah:
- Baca `README-ENDUER.md`
- Cek `docs/INSTALL.md`
- Buka issue di GitHub: https://github.com/duhemen/buku_tamu

---

**Selamat menggunakan Buku Tamu Digital!**