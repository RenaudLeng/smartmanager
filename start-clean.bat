@echo off
echo Arrêt des processus Node.js existants...
taskkill /F /IM node.exe 2>nul

echo Nettoyage du port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo Processus trouvé sur le port 3000: PID %%a
    taskkill /F /PID %%a 2>nul
)

echo Attente de la libération des ports...
timeout /t 3 /nobreak >nul

echo Démarrage du serveur de développement...
npm run dev

pause
