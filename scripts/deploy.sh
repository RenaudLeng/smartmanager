#!/bin/bash

# Script de déploiement pour SmartManager
set -e

echo "Déploiement SmartManager - $(date)"

# Configuration
APP_DIR="/var/www/smartmanager"
BACKUP_DIR="/var/backups/smartmanager"
SERVICE_NAME="smartmanager"

# Créer les répertoires nécessaires
mkdir -p $BACKUP_DIR
mkdir -p $APP_DIR/logs

# Backup de la version actuelle
if [ -d "$APP_DIR/current" ]; then
    echo "Création du backup..."
    tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$APP_DIR" current/
fi

# Déploiement de la nouvelle version
echo "Déploiement de la nouvelle version..."
cp -r . $APP_DIR/new

# Installation des dépendances
cd $APP_DIR/new
npm ci --production

# Build de l'application
npm run build

# Migration de la base de données
echo "Migration de la base de données..."
npx prisma migrate deploy

# Health check
echo "Vérification du health check..."
curl -f http://localhost:3000/api/health || {
    echo "Health check failed!"
    exit 1
}

# Rotation des versions
echo "Rotation des versions..."
if [ -d "$APP_DIR/current" ]; then
    mv $APP_DIR/current $APP_DIR/previous
fi
mv $APP_DIR/new $APP_DIR/current
rm -rf $APP_DIR/previous

# Redémarrage du service
echo "Redémarrage du service..."
if systemctl is-active --quiet $SERVICE_NAME; then
    systemctl restart $SERVICE_NAME
else
    systemctl start $SERVICE_NAME
fi

# Vérification finale
sleep 10
if curl -f http://localhost:3000/api/health; then
    echo "Déploiement réussi!"
else
    echo "Déploiement échoué - Rollback..."
    if [ -d "$APP_DIR/previous" ]; then
        mv $APP_DIR/current $APP_DIR/failed
        mv $APP_DIR/previous $APP_DIR/current
        systemctl restart $SERVICE_NAME
    fi
    exit 1
fi

echo "Déploiement terminé avec succès!"
