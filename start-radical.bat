@echo off
echo ========================================
echo ARRET RADICAL DES PROCESSUS NODE.JS
echo ========================================

echo 1. Arrêt de tous les processus Node.js...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 2. Arrêt des processus éventuels sur port 59161...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":59161" ^| find "LISTENING"') do (
    echo Processus trouvé sur le port 59161: PID %%a
    taskkill /F /PID %%a 2>nul
)

echo 3. Arrêt des processus éventuels sur port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Processus trouvé sur le port 3000: PID %%a
    taskkill /F /PID %%a 2>nul
)

echo 4. Nettoyage des connexions residuelles...
netsh winsock reset >nul 2>&1

echo 5. Attente de la libération complete...
timeout /t 5 /nobreak >nul

echo ========================================
echo DEMARRAGE SANS TURBOPACK NI HMR
echo ========================================
echo.
set NEXT_HMR_DISABLE=1
set NEXT_TURBOPACK_DISABLE=1
set NODE_OPTIONS=--max-old-space-size=4096

echo Lancement: npm run dev -- --no-turbopack
npm run dev -- --no-turbopack

pause
