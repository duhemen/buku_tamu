# Setup Cloudflare Tunnel untuk Buku Tamu Digital

Panduan ini untuk Anda yang ingin aplikasi bisa diakses dari internet (bukan cuma lokal).

## Yang Anda Butuhkan
- Domain sendiri (misal: `kantorsaya.com`)
- Akun Cloudflare gratis
- Waktu setup: ~15 menit

## Langkah 1: Daftar Cloudflare (5 menit)

1. Buka https://dash.cloudflare.com/sign-up
2. Daftar dengan email + password
3. Verifikasi email

## Langkah 2: Tambah Domain ke Cloudflare (5 menit)

1. Login ke Cloudflare
2. Klik "Add a site"
3. Masukkan domain Anda: `kantorsaya.com`
4. Pilih plan **Free** → Confirm
5. Ikuti instruksi untuk update nameserver di registrar domain Anda
6. Tunggu propagasi (1-24 jam, biasanya 15 menit)

## Langkah 3: Buat Tunnel (3 menit)

1. Buka https://one.dash.cloudflare.com
2. Networks → Tunnels → **Create a tunnel**
3. Pilih **Cloudflared** → Next
4. Nama tunnel: `bukutamu`
5. Klik **Save tunnel**
6. **Copy token** yang muncul (format panjang `eyJhIjoi...`)
   - ⚠️ **PENTING**: Token ini cuma muncul sekali! Copy & simpan dulu.

## Langkah 4: Setup Public Hostname (2 menit)

Masih di halaman tunnel:

### Route 1: Web
- Subdomain: (kosongkan)
- Domain: `kantorsaya.com`
- Path: (kosongkan)
- Service Type: `HTTP`
- URL: `bt-web:80`
- Klik **Save**

### Route 2: API (tambahkan)
- Subdomain: (kosongkan)
- Domain: `kantorsaya.com`
- Path: `/api/*`
- Service Type: `HTTP`
- URL: `bt-api:3000`
- Klik **Save**

## Langkah 5: Input Token ke Aplikasi

1. Buka `BukuTamu-Menu.bat` (di folder bundle)
2. Pilih **[8] Setup Token Cloudflare**
3. Paste token yang Anda copy tadi
4. Masukkan domain Anda (opsional)
5. Klik **Simpan**

## Langkah 6: Jalankan

1. Dari menu, pilih **[1] Start Semua**
2. Aplikasi akan:
   - Start Docker containers
   - Start Cloudflare Tunnel dengan token Anda
   - Start API + Web
   - Auto-open browser

## Selesai! 🎉

Aplikasi Anda sekarang bisa diakses di:
- **Lokal**: `http://localhost:5173`
- **Publik**: `https://kantorsaya.com`

## Troubleshooting

### "Tunnel tidak bisa start"
- Cek token benar (paste ulang via menu [8])
- Cek domain sudah benar setup di Cloudflare
- Cek koneksi internet

### "Domain tidak bisa diakses"
- Cek nameserver sudah propagasi (`nslookup kantorsaya.com`)
- Cek Public Hostname di Cloudflare sudah benar
- Cek tunnel status di Cloudflare dashboard