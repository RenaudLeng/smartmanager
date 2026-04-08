#!/bin/bash

# Script de déploiement SmartManager sur Vercel
set -e

echo "🚀 Début du déploiement SmartManager sur Vercel..."

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Vérifier les variables d'environnement
if [ ! -f ".env.production" ]; then
    echo "❌ Fichier .env.production manquant"
    echo "Veuillez créer un fichier .env.production avec les variables de production"
    exit 1
fi

# Build de l'application
echo "🔨 Build de l'application..."
npm run build

# Vérification du build
if [ ! -d ".next" ]; then
    echo "❌ Le build a échoué"
    exit 1
fi

# Déploiement sur Vercel
echo "🌍 Déploiement sur Vercel..."
vercel --prod

# Vérification du déploiement
echo "🔍 Vérification du déploiement..."
sleep 10

# Health check
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://smartmanager.vercel.app/api/health)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Déploiement réussi! Application en ligne et fonctionnelle"
else
    echo "⚠️ Déploiement terminé mais le health check a échoué (HTTP $HEALTH_CHECK)"
    echo "Veuillez vérifier manuellement l'application"
fi

# Nettoyage
echo "🧹 Nettoyage des fichiers temporaires..."
rm -rf .next

echo "🎉 Déploiement SmartManager terminé!"
echo "📊 Accédez à l'application: https://smartmanager.vercel.app"
echo "📈 Monitoring: https://vercel.com/dashboard/forever-inc/smartmanager"
