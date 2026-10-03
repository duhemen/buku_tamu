# start-dev.ps1 (simpan di C:\buku_tamu\)
Set-Location C:\buku_tamu
Write-Host '1. Start Docker...' -ForegroundColor Cyan
docker compose up -d

Write-Host '2. Wait for Postgres...' -ForegroundColor Cyan
Start-Sleep 15
docker compose ps

Write-Host '3. All services ready!' -ForegroundColor Green
Write-Host '   - Postgres: localhost:5433'
Write-Host '   - Redis: localhost:6379'
Write-Host '   - MailHog: localhost:8025'
Write-Host ''
Write-Host 'Start API and Web manually:' -ForegroundColor Yellow
Write-Host '  pnpm --filter @buku-tamu/api dev'
Write-Host '  pnpm --filter @buku-tamu/web dev'