@echo off
chcp 65001 >nul
title Buku Tamu Digital - Command Center
color 0B

:MENU
cls
echo.
echo  ============================================================
echo    BUKU TAMU DIGITAL - COMMAND CENTER
echo  ============================================================
echo.
echo    [1]  Start Semua        (Docker + Tunnel + API + Web)
echo    [2]  Stop Semua
echo    [3]  Restart Semua
echo    [4]  Cek Status Semua
echo.
echo    --- Cloudflare Tunnel ---
echo    [5]  Start Tunnel (Manual)
echo    [6]  Stop Tunnel
echo    [7]  Cek Status Tunnel
echo    [8]  * SETUP TOKEN CLOUDFLARE (Wajib Pertama Kali)
echo    [9]  Reset Token Cloudflare
echo.
echo    --- Aplikasi ---
echo    [10] Start API Backend
echo    [11] Start Web Frontend
echo    [12] Stop API + Web
echo    [13] Cek Health API
echo.
echo    --- Docker ---
echo    [14] Start Docker Containers
echo    [15] Stop Docker Containers
echo    [16] Lihat Log Docker
echo.
echo    --- Utilitas ---
echo    [17] Buka Browser Kiosk
echo    [18] Buka Browser Admin
echo    [19] Buka Browser TV Antrean
echo    [20] Backup Database
echo    [21] Lihat Panduan Setup Cloudflare
echo    [22] Setup Awal (Cek Docker + Prasyarat)
echo.
echo    [0]  Keluar
echo.
echo  ============================================================
set /p choice="   Pilihan Anda: "

if "%choice%"=="1"  call :RUN start-all
if "%choice%"=="2"  call :RUN stop-all
if "%choice%"=="3"  call :RUN restart-all
if "%choice%"=="4"  call :RUN status-all
if "%choice%"=="5"  call :RUN start-tunnel
if "%choice%"=="6"  call :RUN stop-tunnel
if "%choice%"=="7"  call :RUN status-tunnel
if "%choice%"=="8"  call :RUN setup-cf-token
if "%choice%"=="9"  call :RUN reset-cf-token
if "%choice%"=="10" call :RUN start-api
if "%choice%"=="11" call :RUN start-web
if "%choice%"=="12" call :RUN stop-node
if "%choice%"=="13" call :RUN health-api
if "%choice%"=="14" call :RUN start-docker
if "%choice%"=="15" call :RUN stop-docker
if "%choice%"=="16" call :RUN docker-logs
if "%choice%"=="17" call :RUN open-kiosk
if "%choice%"=="18" call :RUN open-admin
if "%choice%"=="19" call :RUN open-tv
if "%choice%"=="20" call :RUN backup-db
if "%choice%"=="21" call :RUN cf-guide
if "%choice%"=="22" call :RUN setup-awal
if "%choice%"=="0"  exit /b 0

echo.
echo   Pilihan tidak valid.
timeout /t 2 /nobreak >nul
goto MENU

:RUN
cls
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0buku-tamu-tools.ps1" -Action %1
echo.
echo   --------------------------------------------
echo.
pause
goto MENU