# SmartManager - Backend API Documentation

## 🚀 Overview

SmartManager est une application de gestion multi-tenants avec un backend complet basé sur Next.js API Routes, Prisma ORM et PostgreSQL.

## 📋 Features Implémentées

### ✅ SuperAdmin Module
- **Gestion des Tenants**: CRUD complet avec statistiques
- **Gestion des Utilisateurs**: Création, modification, suspension, suppression
- **Configuration Système**: Email, sécurité, sauvegardes
- **Rapports Globaux**: Ventes, produits, tenants, utilisateurs, financier

### ✅ Authentification & Sécurité
- **JWT Tokens**: Authentification stateless
- **Hashing mots de passe**: bcryptjs
- **Rôles & Permissions**: super_admin, admin, manager, cashier, seller
- **Middleware d'auth**: Vérification automatique des tokens

### ✅ Base de Données
- **Schéma complet**: 15+ modèles avec relations
- **Multi-tenancy**: Isolation des données par tenant
- **Migrations Prisma**: Gestion des schémas versionnée

### ✅ API Endpoints

#### Authentification
```
POST /api/auth          - Login/Connexion
POST /api/auth/register - Inscription
POST /api/auth/logout   - Déconnexion
```

#### Tenants
```
GET    /api/tenants           - Lister tous les tenants
POST   /api/tenants           - Créer un tenant
PUT    /api/tenants/[id]      - Mettre à jour un tenant
DELETE /api/tenants/[id]      - Supprimer un tenant
POST   /api/tenants/[id]/suspend - Suspendre un tenant
GET    /api/tenants/stats      - Statistiques globales
```

#### Utilisateurs
```
GET    /api/users           - Lister les utilisateurs
POST   /api/users           - Créer un utilisateur
PUT    /api/users/[id]      - Mettre à jour un utilisateur
DELETE /api/users/[id]      - Supprimer un utilisateur
POST   /api/users/[id]/suspend - Suspendre un utilisateur
POST   /api/users/[id]/activate - Activer un utilisateur
```

#### Configuration Système
```
GET    /api/system/config           - Récupérer la configuration
PUT    /api/system/config           - Mettre à jour la configuration
POST   /api/system/config/test-email - Tester l'email
```

#### Sauvegardes
```
GET    /api/system/backup           - Lister les sauvegardes
POST   /api/system/backup           - Créer une sauvegarde
DELETE /api/system/backup/[id]      - Supprimer une sauvegarde
POST   /api/system/backup/[id]/restore - Restaurer une sauvegarde
GET    /api/system/backup/[id]/download - Télécharger une sauvegarde
```

#### Rapports
```
GET /api/reports?type=sales&period=month      - Rapport ventes
GET /api/reports?type=products&period=week    - Rapport produits
GET /api/reports?type=tenants&period=quarter  - Rapport tenants
GET /api/reports?type=users&period=year       - Rapport utilisateurs
GET /api/reports?type=financial&period=month  - Rapport financier
```

## 🛠️ Installation & Configuration

### 1. Prérequis
```bash
Node.js 18+
PostgreSQL 14+
```

### 2. Installation
```bash
# Clone du projet
git clone <repository-url>
cd smartmanager

# Installation des dépendances
npm install

# Variables d'environnement
cp .env.example .env.local
```

### 3. Configuration Base de Données
```bash
# Configurer DATABASE_URL dans .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/smartmanager"

# Générer le client Prisma
npx prisma generate

# Lancer les migrations
npx prisma migrate dev --name init
```

### 4. Initialisation des Données
```bash
# Créer le SuperAdmin et données de démo
npx ts-node scripts/init-db.ts
```

### 5. Démarrage
```bash
# Serveur de développement
npm run dev

# Build production
npm run build
npm start
```

## 📊 Modèles de Données

### Core Models
```typescript
Tenant {
  id, name, email, businessType, status
  users[], products[], sales[], subscriptions[]
}

User {
  id, email, password, name, role, tenantId
  sales[], expenses[]
}

Product {
  id, name, price, quantity, categoryId, tenantId
  saleItems[], inventoryLogs[]
}

Sale {
  id, totalAmount, paymentType, userId, tenantId
  items[], client[]
}
```

### Relations
- **Tenant → Users**: One-to-Many
- **Tenant → Products**: One-to-Many  
- **User → Sales**: One-to-Many
- **Sale → SaleItems**: One-to-Many
- **Product → SaleItems**: One-to-Many

## 🔐 Sécurité

### Authentification
- JWT tokens avec expiration 7 jours
- Hashing bcryptjs (12 rounds)
- Validation des entrées avec Zod

### Permissions
```typescript
const ROLE_PERMISSIONS = {
  super_admin: ['*'],
  admin: ['read', 'write', 'delete', 'manage_users'],
  manager: ['read', 'write', 'manage_products'],
  cashier: ['read', 'write_sales'],
  seller: ['read', 'write_sales']
}
```

### Middleware
```typescript
// Authentification requise
requireAuth(handler)

// Permission spécifique requise  
requirePermission('delete_tenants')(handler)

// Tenant requis
requireTenant(handler)
```

## 🧪 Tests

### Tests API
```bash
# Lancer les tests API
node scripts/test-api.js
```

### Tests Couverture
```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e
```

## 📈 Monitoring & Logging

### Logs
- Console logging pour le développement
- Error tracking avec status codes
- Request/response logging

### Monitoring
- Health checks: `/api/health`
- Metrics: `/api/metrics`
- Performance monitoring

## 🚀 Déploiement

### Environment Variables
```bash
# Production
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=votre-secret-production
SMTP_HOST=smtp.gmail.com
```

### Docker
```dockerfile
FROM node:18-alpine
COPY . .
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

### Vercel
```bash
# Build
vercel build

# Deploy
vercel --prod
```

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Opération réussie"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Message d'erreur",
  "details": [...]
}
```

## 📝 Notes de Développement

### Conventions
- TypeScript strict mode activé
- ESLint + Prettier configurés
- Git hooks pour la qualité

### Architecture
- API Routes dans `/src/app/api/`
- Services dans `/src/services/`
- Types dans `/src/types/`
- Utils dans `/src/lib/`

### Performance
- Prisma connection pooling
- Response caching
- Pagination pour les listes

## 🤝 Contributing

1. Fork le projet
2. Créer une feature branch
3. Commit les changements
4. Push vers la branch
5. Ouvrir une Pull Request

## 📞 Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@smartmanager.com

---

**SmartManager** - © 2026 Tous droits réservés
