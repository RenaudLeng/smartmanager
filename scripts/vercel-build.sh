#!/bin/bash

# Générer le client Prisma
npx prisma generate

# Créer la base de données SQLite si elle n'existe pas
mkdir -p .next
touch ./dev.db

# Lancer les migrations
npx prisma migrate deploy

# Builder l'application
npm run build
