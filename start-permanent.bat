@echo off
echo ========================================
echo SERVEUR PERMANENT - CONFIG MINIMALISTE
echo ========================================

echo 1. Nettoyage radical...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo 2. Démarrage serveur permanent...
echo.
echo Le serveur va démarrer et rester actif
echo Accès: http://localhost:3000
echo.

npm run dev

pause
