@echo off
echo ========================================
echo SERVEUR CONTINU - REDÉMARRAGE AUTO
echo ========================================
echo.
echo Le serveur va démarrer et redémarrer automatiquement en cas de plantage
echo Pour arrêter : Ctrl+C
echo.

:loop
echo.
echo [%date% %time%] Démarrage du serveur...
npm run dev

echo.
echo [%date% %time%] Serveur arrêté. Redémarrage dans 5 secondes...
timeout /t 5 /nobreak >nul
goto loop
