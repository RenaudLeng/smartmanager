@echo off
echo =============================================
echo SERVEUR ROBUSTE - SURVEILLANCE & REDÉMARRAGE
echo =============================================
echo.

:cleanup
echo Nettoyage des processus Node.js existants...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

:start_server
echo.
echo [%date% %time%] Démarrage du serveur Next.js...
echo Accès: http://localhost:3000
echo.

:server_loop
npm run dev
set exit_code=%errorlevel%

echo.
echo [%date% %time%] Serveur arrêté (code: %exit_code%)

if %exit_code% equ 0 (
    echo Arrêt normal - Pas de redémarrage
    pause
    exit /b 0
) else (
    echo Erreur détectée - Redémarrage dans 3 secondes...
    timeout /t 3 /nobreak >nul
    goto cleanup
)
