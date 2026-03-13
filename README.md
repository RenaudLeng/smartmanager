# SmartManager

Plateforme mobile-first de gestion intelligente pour petits commerces africains, développée par Forever Inc.

## Fonctionnalités

### Core Features
- **POS (Caisse)**: Ventes rapides avec scan de codes barres et paiements multiples
- **Gestion de Stock**: Suivi en temps réel, alertes de stock faible, inventaires
- **Dépenses**: Suivi des dépenses et analyse de rentabilité
- **Personnel**: Gestion des employés et suivi des salaires
- **Clients & Dettes**: Gestion des crédits clients et suivi des paiements
- **Analytics**: Rapports détaillés et graphiques de performance
- **PWA**: Application installable, fonctionne offline

### Architecture SaaS Multi-tenant
- **Isolation stricte** des données entre commerces
- **Système RBAC** avec rôles et permissions granulaires
- **Configuration automatique** selon le type de commerce

## Types de commerces supportés

- Bar
- Restaurant  
- Bar + Restaurant
- Épicerie
- Salon de coiffure

Chaque type dispose de catégories, produits et dépenses préconfigurés.

## Stack Technique

### Frontend
- **Next.js 15** avec TypeScript
- **React 19** et TailwindCSS
- **PWA** avec Service Worker
- **Mobile-first** design

### Backend
- **Next.js API Routes**
- **Prisma ORM** avec PostgreSQL
- **JWT** pour l'authentification
- **RBAC** pour les permissions

### Offline & Performance
- **Service Worker** pour le mode offline
- **IndexedDB** pour le stockage local
- **Cache intelligent** des données

## Démarrage rapide

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd smartmanager
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**
```bash
# Copier .env.example vers .env
cp .env.example .env

# Configurer DATABASE_URL dans .env
DATABASE_URL="postgresql://user:password@localhost:5432/smartmanager"
```

4. **Lancer la migration**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Démarrer l'application**
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

## Structure du projet

```
smartmanager/
├── src/
│   ├── app/                    # Pages Next.js
│   │   ├── api/               # API routes
│   │   ├── dashboard/          # Dashboard
│   │   ├── pos/               # Point de vente
│   │   ├── stock/             # Gestion de stock
│   │   └── ...
│   ├── components/            # Composants React
│   │   ├── ui/                # Composants UI de base
│   │   └── Dashboard/         # Composants du dashboard
│   ├── lib/                   # Utilitaires
│   │   ├── prisma.ts          # Client Prisma
│   │   ├── auth.ts            # Authentification
│   │   └── utils.ts           # Fonctions utilitaires
│   └── types/                 # Types TypeScript
├── prisma/
│   └── schema.prisma          # Schéma de base de données
└── public/                    # Fichiers statiques
```

## Sécurité

- **Isolation multi-tenant**: Chaque tenant ne voit que ses données
- **RBAC**: Contrôle d'accès basé sur les rôles
- **JWT**: Tokens sécurisés avec expiration
- **Validation**: Validation des entrées API
- **Soft delete**: Suppression réversible des données

## Rôles et Permissions

### Super Admin (Forever Inc)
- Accès à tous les tenants
- Gestion des abonnements
- Support technique

### Admin du commerce
- Gestion complète du commerce
- Utilisateurs et permissions
- Configuration du système

### Manager
- Produits et ventes
- Dépenses et rapports
- Personnel et clients

### Caissière/Vendeur
- Ventes et clients
- Consultation des rapports

## PWA Features

L'application est une **Progressive Web App**:

- **Installable**: Ajouter à l'écran d'accueil
- **Offline**: Fonctionne sans connexion internet
- **Fast**: Temps de chargement optimisé
- **Responsive**: Adaptée à tous les écrans

## Mode Offline

En mode offline, l'application permet de:

- Enregistrer des ventes
- Gérer le stock
- Ajouter des dépenses
- Consulter les données synchronisées

La synchronisation automatique se fait dès le retour de la connexion.

## Design System

### Couleurs
- **Fond**: `#0F172A` (Slate-900)
- **Cartes**: `#1E293B` (Slate-800)
- **Accent**: `#22C55E` (Green-500)
- **Texte**: `#F8FAFC` (Slate-50)

### Typographie
- **Police**: Inter
- **Mobile-first**: Optimisé pour petits écrans

## Analytics et Rapports

### KPIs principaux
- Ventes du jour
- Bénéfice journalier
- Dépenses du jour
- Stock critique
- Dettes clients
- Trésorerie

### Rapports disponibles
- Ventes par période
- Produits les plus vendus
- Rentabilité par produit
- Évolution des dépenses

## Configuration des types de commerce

Chaque type de commerce dispose d'une configuration spécifique:

```typescript
// Exemple pour un bar
{
  categories: ['Bières', 'Vins', 'Spirits', 'Softs', 'Snacks'],
  defaultProducts: [
    { name: 'Castel 33cl', price: 500, category: 'Bières' },
    { name: 'Coca-Cola 33cl', price: 300, category: 'Softs' }
  ],
  defaultExpenses: ['electricity', 'rent', 'salaries', 'purchases']
}
```

## Déploiement

### Production
```bash
# Build pour production
npm run build

# Démarrer en production
npm start
```

### Variables d'environnement requises
```env
DATABASE_URL=postgresql://...
JWT_SECRET=votre-secret-key
JWT_EXPIRES_IN=7d
NEXTAUTH_URL=https://votredomaine.com
```

## Contribuer

1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

## Licence

Propriétaire - Forever Inc. Tous droits réservés.

## Support

Pour toute question ou support technique:
- Email: support@forever-inc.com
- Téléphone: +241 XX XX XX XX

---

**SmartManager** - La gestion intelligente pour votre commerce 
