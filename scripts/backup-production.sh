#!/bin/bash

# Script de backup pour la production SmartManager
set -e

BACKUP_DIR="/backups/smartmanager"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="smartmanager_backup_$DATE.sql"

echo "🔄 Début du backup SmartManager Production..."

# Créer le répertoire de backup s'il n'existe pas
mkdir -p $BACKUP_DIR

# Backup de la base de données
echo "💾 Backup de la base de données..."
if command -v pg_dump &> /dev/null; then
    # PostgreSQL
    pg_dump $DATABASE_URL > "$BACKUP_DIR/$BACKUP_FILE"
    echo "✅ Backup PostgreSQL créé: $BACKUP_FILE"
else
    echo "❌ pg_dump non trouvé. Veuillez installer PostgreSQL client tools"
    exit 1
fi

# Compression du backup
echo "🗜️ Compression du backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"
COMPRESSED_FILE="$BACKUP_FILE.gz"

# Backup des fichiers uploadés
echo "📁 Backup des fichiers uploadés..."
if [ -d "public/uploads" ]; then
    tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" public/uploads/
    echo "✅ Backup fichiers créé: uploads_backup_$DATE.tar.gz"
fi

# Nettoyage des anciens backups (garder 30 jours)
echo "🧹 Nettoyage des anciens backups..."
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Upload vers stockage externe (optionnel)
if [ ! -z "$AWS_S3_BUCKET" ]; then
    echo "☁️ Upload vers AWS S3..."
    aws s3 cp "$BACKUP_DIR/$COMPRESSED_FILE" "s3://$AWS_S3_BUCKET/backups/"
    echo "✅ Upload S3 terminé"
fi

# Notification Slack (optionnel)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    echo "📢 Notification Slack..."
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ Backup SmartManager terminé: $COMPRESSED_FILE\"}" \
        $SLACK_WEBHOOK_URL
fi

echo "🎉 Backup terminé avec succès!"
echo "📁 Fichier: $BACKUP_DIR/$COMPRESSED_FILE"
echo "📊 Taille: $(du -h "$BACKUP_DIR/$COMPRESSED_FILE" | cut -f1)"

# Afficher l'espace disque utilisé
echo "💽 Espace disque utilisé:"
du -sh $BACKUP_DIR
