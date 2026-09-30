# install-backup-task.ps1 - Daftarkan backup harian ke Windows Task Scheduler
# Jalankan sebagai Administrator

$ErrorActionPreference = 'Stop'
$ScriptPath = 'C:\buku_tamu\scripts\backup.ps1'
$TaskName = 'BukuTamu-DailyBackup'
$Time = '02:00'

if (-not (Test-Path $ScriptPath)) {
    Write-Host "[ERROR] $ScriptPath tidak ditemukan" -ForegroundColor Red
    exit 1
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "[INFO] Hapus task lama..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""

$trigger = New-ScheduledTaskTrigger -Daily -At $Time

$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName $TaskName `
    -Action $action -Trigger $trigger -Principal $principal -Settings $settings `
    -Description 'Backup database Buku Tamu Digital setiap hari jam 02:00' | Out-Null

Write-Host "[OK] Task '$TaskName' terdaftar. Backup otomatis tiap hari jam $Time." -ForegroundColor Green
Write-Host "[INFO] Cek: Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Cyan
Write-Host "[INFO] Test: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Cyan
Write-Host "[INFO] Hapus: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false" -ForegroundColor Cyan