# backup.ps1 - Backup database PostgreSQL harian
$ErrorActionPreference = 'Stop'

$BackupDir = 'C:\buku_tamu\backups'
$ContainerName = 'bt-postgres'
$DbUser = 'buku_tamu'
$DbName = 'buku_tamu'
$KeepDays = 30

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$status = docker ps --filter "name=$ContainerName" --format "{{.Status}}"
if (-not $status) {
    Write-Host "[ERROR] Container $ContainerName tidak berjalan" -ForegroundColor Red
    exit 1
}

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$filename = "buku-tamu_$timestamp.sql"
$filepath = Join-Path $BackupDir $filename

Write-Host "[BACKUP] Menyimpan ke $filename..." -ForegroundColor Cyan
$sql = docker exec $ContainerName pg_dump -U $DbUser $DbName
[System.IO.File]::WriteAllText($filepath, ($sql -join "`n"), (New-Object System.Text.UTF8Encoding $false))

$zipPath = $filepath + '.zip'
Compress-Archive -Path $filepath -DestinationPath $zipPath -Force
Remove-Item $filepath -Force

$size = [math]::Round((Get-Item $zipPath).Length / 1KB, 2)
Write-Host "[OK] Backup: $zipPath ($size KB)" -ForegroundColor Green

$cutoff = (Get-Date).AddDays(-$KeepDays)
Get-ChildItem $BackupDir -Filter '*.zip' -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt $cutoff } | ForEach-Object {
    Write-Host "[CLEANUP] Hapus backup lama: $($_.Name)" -ForegroundColor Yellow
    Remove-Item $_.FullName -Force
}

$count = (Get-ChildItem $BackupDir -Filter '*.zip').Count
Write-Host "[DONE] Total backup tersimpan: $count file" -ForegroundColor Cyan