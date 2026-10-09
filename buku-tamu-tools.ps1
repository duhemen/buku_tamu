# buku-tamu-tools.ps1
# Command Center untuk Buku Tamu Digital
# Dipanggil dari BukuTamu-Menu.bat

param(
    [Parameter(Mandatory=$false)]
    [string]$Action
)

$ErrorActionPreference = 'Continue'
$Root = 'C:\buku_tamu'
Set-Location $Root

# ============================================================
# Config
# ============================================================
$CF_TOKEN = 'eyJhIjoiNzNmNTA0OTk3NjQ3OTdlOWU5NjlmMDg1OTYyMGY2OGQiLCJ0IjoiNTE0ZGU4ZWItZDFkOC00ZDc2LTk2MzMtMzk2MDUyN2Q4ZTllIiwicyI6IlltUmlZakZrTm1NdE1HUmxaQzAwWW1ZMExUaGlOV1F0TTJSaFpESXpNakl4TnpGaCJ9'
$CF_BIN = "$Root\cloudflared.exe"

# ============================================================
# Helper: Warna & Output
# ============================================================
function Write-Header {
    param([string]$Text)
    Write-Host ''
    Write-Host '============================================================' -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host '============================================================' -ForegroundColor Cyan
    Write-Host ''
}

function Write-OK { param([string]$Text) Write-Host "  [OK] $Text" -ForegroundColor Green }
function Write-Info { param([string]$Text) Write-Host "  [INFO] $Text" -ForegroundColor Gray }
function Write-Warn { param([string]$Text) Write-Host "  [WARN] $Text" -ForegroundColor Yellow }
function Write-Err { param([string]$Text) Write-Host "  [ERROR] $Text" -ForegroundColor Red }

function Write-Step {
    param([int]$Num, [int]$Total, [string]$Text)
    Write-Host "[$Num/$Total] $Text" -ForegroundColor Yellow
}

function Test-Admin {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Wait-User {
    Write-Host ''
    Write-Host 'Tekan Enter untuk lanjut...' -ForegroundColor DarkGray
    Read-Host | Out-Null
}

# ============================================================
# [1] START SEMUA
# ============================================================
function Action-StartAll {
    Write-Header 'START SEMUA SERVICE'
    
    # 1. Docker
    Write-Step 1 4 'Cek Docker Desktop...'
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Warn 'Docker belum jalan, mencoba start...'
        $dockerExe = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
        if (Test-Path $dockerExe) {
            Start-Process $dockerExe
            Write-Info 'Tunggu 30 detik...'
            Start-Sleep 30
        } else {
            Write-Err 'Docker Desktop.exe tidak ditemukan'
            Wait-User
            return
        }
    } else {
        Write-OK 'Docker sudah jalan'
    }
    
    # 2. Docker Containers
    Write-Step 2 4 'Start Docker containers...'
    docker compose up -d 2>&1 | Out-Null
    Write-Info 'Tunggu 10 detik untuk Postgres...'
    Start-Sleep 10
    Write-OK 'Containers aktif'
    
    # 3. Tunnel
    Write-Step 3 4 'Cek Cloudflare Tunnel...'
    $proc = Get-Process cloudflared -ErrorAction SilentlyContinue
    $svc = Get-Service Cloudflared -ErrorAction SilentlyContinue
    
    if ($proc) {
        Write-OK 'Tunnel sudah jalan (proses)'
    } elseif ($svc -and $svc.Status -eq 'Running') {
        Write-OK 'Tunnel sudah jalan (service)'
    } else {
        if (Test-Path $CF_BIN) {
            Write-Info 'Start tunnel manual...'
            Start-Process -FilePath $CF_BIN `
                -ArgumentList @('tunnel', 'run', '--token', $CF_TOKEN) `
                -WindowStyle Minimized
            Start-Sleep 5
            Write-OK 'Tunnel aktif'
        } else {
            Write-Warn 'cloudflared.exe tidak ditemukan, skip tunnel'
        }
    }
    
    # 4. API + Web (buka terminal baru)
    Write-Step 4 4 'Start API + Web...'
    
    # Cek port sudah listen?
    $port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($port3000) {
        Write-OK 'API sudah jalan (port 3000)'
    } else {
        Write-Info 'Buka terminal API...'
        Start-Process cmd -ArgumentList '/k', "cd /d $Root && title Buku Tamu API && pnpm --filter @buku-tamu/api dev"
        Start-Sleep 3
    }
    
    $port5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if ($port5173) {
        Write-OK 'Web sudah jalan (port 5173)'
    } else {
        Write-Info 'Buka terminal Web...'
        Start-Process cmd -ArgumentList '/k', "cd /d $Root && title Buku Tamu Web && pnpm --filter @buku-tamu/web dev"
        Start-Sleep 8
    }
    
    # Auto-open browser
    Write-Host ''
    Write-Info 'Membuka browser ke kiosk...'
    Start-Sleep 3
    Start-Process 'http://localhost:5173/kiosk'
    
    Write-Host ''
    Write-Host '============================================================' -ForegroundColor Green
    Write-Host '  SEMUA SERVICE SUDAH JALAN' -ForegroundColor Green
    Write-Host '============================================================' -ForegroundColor Green
    Write-Host '  Lokal:  http://localhost:5173' -ForegroundColor White
    Write-Host '  Publik: https://bukutamu.osvpn.id' -ForegroundColor White
    Write-Host '  Admin:  http://localhost:5173/admin' -ForegroundColor White
    Write-Host '  Login:  admin@buku-tamu.local / admin123' -ForegroundColor White
    Write-Host ''
}

# ============================================================
# [2] STOP SEMUA
# ============================================================
function Action-StopAll {
    Write-Header 'STOP SEMUA SERVICE'
    
    Write-Step 1 3 'Stop Cloudflare Tunnel...'
    $proc = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($proc) {
        $proc | Stop-Process -Force
        Write-OK 'Tunnel dihentikan'
    } else {
        Write-Info 'Tidak ada tunnel yang jalan'
    }
    
    Write-Step 2 3 'Stop Node (API + Web)...'
    $node = Get-Process node -ErrorAction SilentlyContinue
    if ($node) {
        $node | Stop-Process -Force
        Write-OK 'Node dihentikan'
    } else {
        Write-Info 'Tidak ada Node yang jalan'
    }
    
    Write-Step 3 3 'Stop Docker containers...'
    docker compose down 2>&1 | Out-Null
    Write-OK 'Docker containers dihentikan'
    
    Write-Host ''
    Write-Host '============================================================' -ForegroundColor Green
    Write-Host '  SEMUA SERVICE SUDAH STOP' -ForegroundColor Green
    Write-Host '============================================================' -ForegroundColor Green
    Write-Host ''
}

# ============================================================
# [3] RESTART SEMUA
# ============================================================
function Action-RestartAll {
    Write-Header 'RESTART SEMUA SERVICE'
    Action-StopAll
    Start-Sleep 3
    Action-StartAll
}

# ============================================================
# [4] CEK STATUS SEMUA
# ============================================================
function Action-StatusAll {
    Write-Header 'STATUS SEMUA SERVICE'
    
    # Tunnel
    Write-Host '[1] Cloudflare Tunnel:' -ForegroundColor Cyan
    $proc = Get-Process cloudflared -ErrorAction SilentlyContinue
    $svc = Get-Service Cloudflared -ErrorAction SilentlyContinue
    if ($proc) {
        Write-OK "Jalan sebagai proses (PID: $($proc.Id))"
    } elseif ($svc -and $svc.Status -eq 'Running') {
        Write-OK "Jalan sebagai service (Auto-start)"
    } elseif ($svc) {
        Write-Warn "Service terinstall tapi status: $($svc.Status)"
    } else {
        Write-Host '  [X] STOPPED' -ForegroundColor Red
    }
    
    # Docker
    Write-Host ''
    Write-Host '[2] Docker Containers:' -ForegroundColor Cyan
    docker compose ps 2>&1 | ForEach-Object { Write-Host "  $_" }
    
    # Node
    Write-Host ''
    Write-Host '[3] Node Processes:' -ForegroundColor Cyan
    $nodes = Get-Process node -ErrorAction SilentlyContinue
    if ($nodes) {
        foreach ($n in $nodes) {
            Write-Host "  PID $($n.Id) - Start: $($n.StartTime.ToString('HH:mm:ss'))" -ForegroundColor Green
        }
    } else {
        Write-Host '  [X] Tidak ada Node yang jalan' -ForegroundColor Red
    }
    
    # Ports
    Write-Host ''
    Write-Host '[4] Port Check:' -ForegroundColor Cyan
    $ports = @(
        @{Port=3000; Name='API'},
        @{Port=5173; Name='Web'},
        @{Port=5433; Name='Postgres'},
        @{Port=6379; Name='Redis'}
    )
    foreach ($p in $ports) {
        $conn = Get-NetTCPConnection -LocalPort $p.Port -State Listen -ErrorAction SilentlyContinue
        if ($conn) {
            Write-Host "  [$($p.Name)] Port $($p.Port): " -NoNewline
            Write-Host 'LISTENING' -ForegroundColor Green
        } else {
            Write-Host "  [$($p.Name)] Port $($p.Port): " -NoNewline
            Write-Host 'CLOSED' -ForegroundColor Red
        }
    }
    
    # Health
    Write-Host ''
    Write-Host '[5] Health Check:' -ForegroundColor Cyan
    
    try {
        $api = Invoke-RestMethod 'http://localhost:3000/health' -TimeoutSec 3 -ErrorAction Stop
        Write-OK "API: $($api.status)"
    } catch {
        Write-Host '  [X] API: tidak respon' -ForegroundColor Red
    }
    
    try {
        $face = Invoke-RestMethod 'http://localhost:8000/health' -TimeoutSec 3 -ErrorAction Stop
        Write-OK "Face Service: $($face.status) - model_ready: $($face.model_ready)"
    } catch {
        Write-Host '  [X] Face Service: tidak respon [opsional]' -ForegroundColor DarkGray
    }
    
    try {
        $web = Invoke-WebRequest 'http://localhost:5173' -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-OK "Web: $($web.StatusCode)"
    } catch {
        Write-Host '  [X] Web: tidak respon' -ForegroundColor Red
    }
    
    try {
        $pub = Invoke-WebRequest 'https://bukutamu.osvpn.id' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-OK "Publik: $($pub.StatusCode)"
    } catch {
        Write-Host '  [X] Publik: tidak respon (tunnel mungkin mati)' -ForegroundColor Yellow
    }
    
    Write-Host ''
}

# ============================================================
# [5] START TUNNEL MANUAL
# ============================================================
function Action-StartTunnel {
    Write-Header 'START CLOUDFLARE TUNNEL'
    
    $proc = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($proc) {
        Write-OK "Tunnel sudah jalan (PID: $($proc.Id))"
        return
    }
    
    if (-not (Test-Path $CF_BIN)) {
        Write-Err "cloudflared.exe tidak ditemukan di $Root"
        return
    }
    
    # Baca token dari config/cloudflare.json
    $configFile = Join-Path $Root 'config\cloudflare.json'
    $token = $CF_TOKEN  # fallback default
    
    if (Test-Path $configFile) {
        try {
            $config = Get-Content $configFile -Raw | ConvertFrom-Json
            if ($config.tunnelToken) {
                $token = $config.tunnelToken
                Write-Info "Menggunakan token dari config/cloudflare.json"
                if ($config.domain) {
                    Write-Info "Domain: $($config.domain)"
                }
            }
        } catch {
            Write-Warn "Gagal baca config: $($_.Exception.Message)"
        }
    } else {
        Write-Warn 'Token Cloudflare belum di-setup!'
        Write-Info 'Buka menu [8] Setup Token Cloudflare dulu'
        $continue = Read-Host 'Lanjut dengan token default? [y/n]'
        if ($continue -ne 'y') { return }
    }
    
    Write-Info 'Start tunnel...'
    Start-Process -FilePath $CF_BIN `
        -ArgumentList @('tunnel', 'run', '--token', $token) `
        -WindowStyle Minimized
    Start-Sleep 5
    
    $newProc = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($newProc) {
        Write-OK "Tunnel aktif (PID: $($newProc.Id))"
    } else {
        Write-Err 'Tunnel gagal start'
    }
}

# ============================================================
# [6] STOP TUNNEL
# ============================================================
function Action-StopTunnel {
    Write-Header 'STOP CLOUDFLARE TUNNEL'
    
    $proc = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($proc) {
        $proc | Stop-Process -Force
        Write-OK 'Tunnel dihentikan'
    } else {
        Write-Info 'Tidak ada tunnel yang jalan'
    }
}

# ============================================================
# [7] CEK STATUS TUNNEL
# ============================================================
function Action-StatusTunnel {
    Write-Header 'STATUS CLOUDFLARE TUNNEL'
    
    $proc = Get-Process cloudflared -ErrorAction SilentlyContinue
    $svc = Get-Service Cloudflared -ErrorAction SilentlyContinue
    
    Write-Host 'Proses:' -ForegroundColor Cyan
    if ($proc) {
        Write-OK "Jalan (PID: $($proc.Id))"
    } else {
        Write-Host '  [X] Tidak ada' -ForegroundColor Red
    }
    
    Write-Host ''
    Write-Host 'Service:' -ForegroundColor Cyan
    if ($svc) {
        Write-OK "Terinstall - Status: $($svc.Status) - StartupType: $($svc.StartType)"
    } else {
        Write-Host '  [X] Tidak terinstall' -ForegroundColor Red
    }
    
    Write-Host ''
    Write-Host 'Tes Koneksi:' -ForegroundColor Cyan
    try {
        $r = Invoke-WebRequest 'https://bukutamu.osvpn.id' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-OK "Publik OK - Status: $($r.StatusCode)"
    } catch {
        Write-Host '  [X] Publik tidak respon' -ForegroundColor Red
    }
}

# ============================================================
# [8] INSTALL TUNNEL SERVICE
# ============================================================
function Action-InstallService {
    Write-Header 'INSTALL TUNNEL SERVICE (24/7)'
    
    if (-not (Test-Admin)) {
        Write-Err 'Butuh PowerShell AS ADMINISTRATOR'
        Write-Info 'Buka PowerShell (Run as Administrator), lalu jalankan menu ini lagi'
        return
    }
    
    if (-not (Test-Path $CF_BIN)) {
        Write-Err 'cloudflared.exe tidak ditemukan'
        return
    }
    
    Write-Warn 'Service akan auto-start setiap Windows nyala (24/7)'
    Write-Host ''
    $confirm = Read-Host 'Lanjut install service? (y/n)'
    if ($confirm -ne 'y') {
        Write-Info 'Dibatalkan'
        return
    }
    
    Write-Info 'Uninstall service lama (kalau ada)...'
    & $CF_BIN service uninstall 2>&1 | Out-Null
    Start-Sleep 2
    
    Write-Info 'Install service baru...'
    & $CF_BIN service install $CF_TOKEN
    
    if ($LASTEXITCODE -ne 0) {
        Write-Err 'Gagal install service'
        return
    }
    
    Write-Info 'Set startup type: Automatic'
    Set-Service Cloudflared -StartupType Automatic
    
    Write-Info 'Start service...'
    Start-Service Cloudflared
    Start-Sleep 3
    
    $svc = Get-Service Cloudflared
    Write-OK "Service terinstall - Status: $($svc.Status)"
}

# ============================================================
# [9] UNINSTALL TUNNEL SERVICE
# ============================================================
function Action-UninstallService {
    Write-Header 'UNINSTALL TUNNEL SERVICE'
    
    if (-not (Test-Admin)) {
        Write-Err 'Butuh PowerShell AS ADMINISTRATOR'
        return
    }
    
    $svc = Get-Service Cloudflared -ErrorAction SilentlyContinue
    if (-not $svc) {
        Write-Info 'Service belum terinstall'
        return
    }
    
    Write-Info 'Stop service...'
    Stop-Service Cloudflared -Force -ErrorAction SilentlyContinue
    Start-Sleep 2
    
    Write-Info 'Uninstall service...'
    & $CF_BIN service uninstall
    
    Write-OK 'Service dihapus'
}

# ============================================================
# [10] START API
# ============================================================
function Action-StartAPI {
    Write-Header 'START API BACKEND'
    
    $port = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($port) {
        Write-OK 'API sudah jalan (port 3000)'
        return
    }
    
    Start-Process cmd -ArgumentList '/k', "cd /d $Root && title Buku Tamu API && pnpm --filter @buku-tamu/api dev"
    Write-OK 'Terminal API dibuka'
}

# ============================================================
# [11] START WEB
# ============================================================
function Action-StartWeb {
    Write-Header 'START WEB FRONTEND'
    
    $port = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
    if ($port) {
        Write-OK 'Web sudah jalan (port 5173)'
        return
    }
    
    Start-Process cmd -ArgumentList '/k', "cd /d $Root && title Buku Tamu Web && pnpm --filter @buku-tamu/web dev"
    Write-OK 'Terminal Web dibuka'
}

# ============================================================
# [12] STOP API + WEB
# ============================================================
function Action-StopNode {
    Write-Header 'STOP API + WEB'
    
    $nodes = Get-Process node -ErrorAction SilentlyContinue
    if ($nodes) {
        $nodes | Stop-Process -Force
        Write-OK "Stop $($nodes.Count) proses Node"
    } else {
        Write-Info 'Tidak ada Node yang jalan'
    }
}

# ============================================================
# [13] HEALTH CHECK API
# ============================================================
function Action-HealthAPI {
    Write-Header 'HEALTH CHECK API'
    
    try {
        $r = Invoke-RestMethod 'http://localhost:3000/health' -TimeoutSec 5 -ErrorAction Stop
        Write-Host ''
        Write-OK "API Status: $($r.status)"
        Write-Info "Environment: $($r.env)"
        Write-Info "Timestamp: $($r.ts)"
    } catch {
        Write-Err "API tidak respon: $($_.Exception.Message)"
    }
}

# ============================================================
# [14] START DOCKER CONTAINERS
# ============================================================
function Action-StartDocker {
    Write-Header 'START DOCKER CONTAINERS'
    
    docker compose up -d 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Info 'Tunggu 10 detik...'
    Start-Sleep 10
    docker compose ps 2>&1 | ForEach-Object { Write-Host "  $_" }
    Write-OK 'Selesai'
}

# ============================================================
# [15] STOP DOCKER CONTAINERS
# ============================================================
function Action-StopDocker {
    Write-Header 'STOP DOCKER CONTAINERS'
    
    docker compose down 2>&1 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-OK 'Docker containers dihentikan'
}

# ============================================================
# [16] LIHAT LOG DOCKER
# ============================================================
function Action-DockerLogs {
    Write-Header 'DOCKER LOGS (Last 30 lines)'
    
    Write-Host '=== Postgres ===' -ForegroundColor Cyan
    docker logs bt-postgres --tail 10 2>&1 | ForEach-Object { Write-Host "  $_" }
    
    Write-Host ''
    Write-Host '=== Redis ===' -ForegroundColor Cyan
    docker logs bt-redis --tail 10 2>&1 | ForEach-Object { Write-Host "  $_" }
}

# ============================================================
# [17-19] BUKA BROWSER
# ============================================================
function Action-OpenKiosk {
    Write-Info 'Membuka Kiosk...'
    Start-Process 'http://localhost:5173/kiosk'
}
function Action-OpenAdmin {
    Write-Info 'Membuka Admin Panel...'
    Start-Process 'http://localhost:5173/admin'
}
function Action-OpenTV {
    Write-Info 'Membuka TV Antrean...'
    Start-Process 'http://localhost:5173/tv'
}

# ============================================================
# [20] BACKUP DATABASE
# ============================================================
function Action-BackupDB {
    Write-Header 'BACKUP DATABASE'
    
    $backupDir = "$Root\backups"
    if (-not (Test-Path $backupDir)) {
        New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
    $file = "$backupDir\backup_$timestamp.sql"
    
    Write-Info "Backup ke: $file"
    docker exec bt-postgres pg_dump -U buku_tamu buku_tamu | Out-File -Encoding UTF8 $file
    
    if (Test-Path $file) {
        $size = [math]::Round((Get-Item $file).Length / 1KB, 2)
        Write-OK "Backup sukses: $size KB"
    } else {
        Write-Err 'Backup gagal'
    }
}


# ============================================================
# FUNGSI BARU: Setup Cloudflare Token (Wizard)
# ============================================================
function Action-SetupCloudflareToken {
    Write-Header 'SETUP TOKEN CLOUDFLARE TUNNEL'
    
    # Cek config folder
    $configDir = Join-Path $Root 'config'
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    $configFile = Join-Path $configDir 'cloudflare.json'
    
    # Cek existing
    if (Test-Path $configFile) {
        Write-Warn 'Token Cloudflare sudah ada!'
        $existing = Get-Content $configFile -Raw | ConvertFrom-Json
        Write-Host ''
        Write-Host '  Domain       : ' -NoNewline -ForegroundColor Gray
        Write-Host $existing.domain
        Write-Host '  Configured   : ' -NoNewline -ForegroundColor Gray
        Write-Host $existing.configuredAt
        Write-Host '  Token (10ch) : ' -NoNewline -ForegroundColor Gray
        Write-Host ($existing.tunnelToken.Substring(0, 10) + '...')
        Write-Host ''
        $confirm = Read-Host 'Ganti token dengan yang baru? (y/n)'
        if ($confirm -ne 'y') {
            Write-Info 'Dibatalkan'
            return
        }
    }
    
    Write-Host ''
    Write-Host 'Panduan singkat setup Cloudflare:' -ForegroundColor Yellow
    Write-Host '  1. Daftar gratis di https://dash.cloudflare.com/sign-up'
    Write-Host '  2. Tambahkan domain Anda ke Cloudflare'
    Write-Host '  3. Buka https://one.dash.cloudflare.com â†’ Networks â†’ Tunnels'
    Write-Host '  4. Create a tunnel â†’ Cloudflared â†’ beri nama "bukutamu"'
    Write-Host '  5. Copy token yang muncul (string panjang eyJhIjoi...)'
    Write-Host '  6. Paste di bawah ini'
    Write-Host ''
    Write-Host 'Detail lengkap: lihat docs/SETUP-CLOUDFLARE.md' -ForegroundColor Gray
    Write-Host ''
    
    Write-Host 'Token Cloudflare Tunnel:' -ForegroundColor Cyan
    Write-Host '  (paste lalu tekan Enter, kosongkan untuk batal)' -ForegroundColor Gray
    $token = Read-Host '  >'
    
    if ([string]::IsNullOrWhiteSpace($token)) {
        Write-Info 'Dibatalkan'
        return
    }
    
    if ($token.Length -lt 50) {
        Write-Err 'Token terlalu pendek. Token Cloudflare biasanya 100+ karakter.'
        Wait-User
        return
    }
    
    Write-Host ''
    Write-Host 'Domain (opsional, untuk referensi):' -ForegroundColor Cyan
    Write-Host '  Contoh: kantorsaya.com' -ForegroundColor Gray
    $domain = Read-Host '  >'
    
    Write-Host ''
    Write-Info 'Memvalidasi token... (bisa 10-30 detik)'
    
    # Test token dengan cloudflared (dry-run)
    $validateCmd = & $CF_BIN tunnel --token $token run --url http://localhost:5173 2>&1 | Out-String
    Start-Sleep 3
    
    # Cek proses cloudflared jalan (kalau iya, berarti token valid)
    $proc = Get-Process cloudflared -ErrorAction SilentlyContinue
    if ($proc) {
        # Kill proses test
        Stop-Process -Name cloudflared -Force -ErrorAction SilentlyContinue
        Start-Sleep 2
        Write-OK 'Token valid!'
    } else {
        # Cek apakah error karena token invalid
        if ($validateCmd -match 'invalid|Unauthorized|error') {
            Write-Err 'Token tidak valid!'
            Write-Host ''
            Write-Host 'Pesan error:' -ForegroundColor Yellow
            Write-Host $validateCmd -ForegroundColor Gray
            Wait-User
            return
        } else {
            Write-Info 'Token mungkin valid (tidak bisa konfirmasi)'
        }
    }
    
    # Simpan ke file
    $config = @{
        tunnelToken = $token
        domain = $domain
        configuredAt = (Get-Date).ToString('o')
        configuredBy = 'BukuTamu Setup Wizard'
    }
    
    $config | ConvertTo-Json | Set-Content $configFile -Encoding UTF8
    
    Write-Host ''
    Write-OK 'Token berhasil disimpan di config/cloudflare.json'
    Write-Info 'Sekarang Anda bisa pilih menu [1] Start Semua'
    Wait-User
}

# ============================================================
# FUNGSI BARU: Reset Cloudflare Token
# ============================================================
function Action-ResetCloudflareToken {
    Write-Header 'RESET TOKEN CLOUDFLARE'
    
    $configFile = Join-Path $Root 'config\cloudflare.json'
    
    if (-not (Test-Path $configFile)) {
        Write-Info 'Token Cloudflare belum di-setup'
        Wait-User
        return
    }
    
    Write-Warn 'Token Cloudflare akan dihapus!'
    Write-Host ''
    Write-Host 'Setelah dihapus, tunnel tidak bisa start.' -ForegroundColor Gray
    Write-Host 'Anda perlu setup ulang via menu [8].' -ForegroundColor Gray
    Write-Host ''
    
    $confirm = Read-Host 'Yakin hapus token? (y/n)'
    if ($confirm -eq 'y') {
        Remove-Item $configFile -Force
        Write-OK 'Token dihapus'
    } else {
        Write-Info 'Dibatalkan'
    }
    Wait-User
}

# ============================================================
# FUNGSI BARU: Panduan Cloudflare (Buka Notepad)
# ============================================================
function Action-ShowCloudflareGuide {
    Write-Header 'PANDUAN SETUP CLOUDFLARE'
    
    $guidePath = Join-Path $Root 'docs\SETUP-CLOUDFLARE.md'
    
    if (Test-Path $guidePath) {
        Write-Info 'Membuka panduan di Notepad...'
        Start-Process notepad.exe -ArgumentList $guidePath
        Write-OK 'Panduan terbuka di Notepad'
    } else {
        Write-Warn 'File panduan tidak ditemukan: docs/SETUP-CLOUDFLARE.md'
        Write-Info 'Baca online: https://developers.cloudflare.com/cloudflare-one/'
    }
    Wait-User
}

# ============================================================
# FUNGSI BARU: Setup Awal (Cek Docker, Node, Python)
# ============================================================
function Action-SetupAwal {
    Write-Header 'SETUP AWAL - CEK PRASYARAT'
    
    Write-Host 'Sistem akan cek semua prasyarat:' -ForegroundColor Gray
    Write-Host ''
    
    # 1. Cek Docker
    Write-Step 1 4 'Cek Docker Desktop...'
    $dockerCheck = docker --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-OK "Docker: $dockerCheck"
    } else {
        Write-Warn 'Docker Desktop belum terinstall!'
        Write-Host ''
        Write-Host 'Docker Desktop dibutuhkan untuk menjalankan aplikasi ini.' -ForegroundColor Yellow
        Write-Host ''
        Write-Host 'Pilihan:' -ForegroundColor Cyan
        Write-Host '  [1] Install otomatis via winget (butuh admin)'
        Write-Host '  [2] Buka link download manual'
        Write-Host '  [3] Skip'
        Write-Host ''
        $choice = Read-Host 'Pilihan (1/2/3)'
        
        if ($choice -eq '1') {
            Write-Info 'Menjalankan winget install...'
            try {
                winget install Docker.DockerDesktop
                Write-OK 'Docker Desktop terinstall. Restart Windows kemudian jalankan ulang menu ini.'
            } catch {
                Write-Err "Gagal install: $_"
                Write-Info 'Coba install manual: https://www.docker.com/products/docker-desktop'
            }
        } elseif ($choice -eq '2') {
            Start-Process 'https://www.docker.com/products/docker-desktop'
            Write-Info 'Link download dibuka di browser'
        }
    }
    
    # 2. Cek Node.js
    Write-Host ''
    Write-Step 2 4 'Cek Node.js...'
    $nodeCheck = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-OK "Node.js: $nodeCheck"
    } else {
        Write-Warn 'Node.js belum terinstall'
        Write-Info 'Install via winget: winget install OpenJS.NodeJS'
        $choice = Read-Host 'Install otomatis via winget? (y/n)'
        if ($choice -eq 'y') {
            winget install OpenJS.NodeJS
        }
    }
    
    # 3. Cek Python (opsional untuk face service)
    Write-Host ''
    Write-Step 3 4 'Cek Python 3.11...'
    $pyCheck = py -3.11 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-OK "Python: $pyCheck"
    } else {
        Write-Warn 'Python 3.11 belum terinstall'
        Write-Info 'Opsional â€” dibutuhkan untuk face recognition'
        Write-Info 'Install: winget install Python.Python.3.11'
    }
    
    # 4. Cek WSL2
    Write-Host ''
    Write-Step 4 4 'Cek WSL2...'
    $wslCheck = wsl --status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-OK 'WSL2 aktif'
    } else {
        Write-Warn 'WSL2 belum aktif â€” Docker Desktop butuh ini'
        Write-Info 'Aktifkan via admin: wsl --install'
    }
    
    Write-Host ''
    Write-Host '============================================================' -ForegroundColor Green
    Write-Host '  SETUP AWAL SELESAI' -ForegroundColor Green
    Write-Host '============================================================' -ForegroundColor Green
    Write-Host ''
    Write-Host 'Langkah selanjutnya:' -ForegroundColor Yellow
    Write-Host '  1. Kalau baru install Docker, restart Windows dulu'
    Write-Host '  2. Buka menu lagi â†’ [8] Setup Token Cloudflare [opsional]'
    Write-Host '  3. Menu â†’ [1] Start Semua'
    Write-Host ''
    Wait-User
}

# ============================================================
# MAIN: Dispatch berdasarkan $Action
# ============================================================
switch ($Action) {
    'start-all'         { Action-StartAll }
    'stop-all'          { Action-StopAll }
    'restart-all'       { Action-RestartAll }
    'status-all'        { Action-StatusAll }
    'start-tunnel'      { Action-StartTunnel }
    'stop-tunnel'       { Action-StopTunnel }
    'status-tunnel'     { Action-StatusTunnel }
    'setup-cf-token'    { Action-SetupCloudflareToken }
    'reset-cf-token'    { Action-ResetCloudflareToken }
    'cf-guide'          { Action-ShowCloudflareGuide }
    'setup-awal'        { Action-SetupAwal }
    'install-service'   { Action-InstallService }
    'uninstall-service' { Action-UninstallService }
    'start-api'         { Action-StartAPI }
    'start-web'         { Action-StartWeb }
    'stop-node'         { Action-StopNode }
    'health-api'        { Action-HealthAPI }
    'start-docker'      { Action-StartDocker }
    'stop-docker'       { Action-StopDocker }
    'docker-logs'       { Action-DockerLogs }
    'open-kiosk'        { Action-OpenKiosk }
    'open-admin'        { Action-OpenAdmin }
    'open-tv'           { Action-OpenTV }
    'backup-db'         { Action-BackupDB }
    default             { Write-Err "Action tidak dikenal: $Action" }
}