# Documentation API SmartManager

## Overview

Cette documentation décrit l'API REST de SmartManager, une plateforme de gestion pour commerces africains.

## Base URL

- **Développement**: `http://localhost:3000/api`
- **Production**: `https://smartmanager.vercel.app/api`

## Authentification

L'API utilise l'authentification JWT (JSON Web Token). Pour accéder aux endpoints protégés, incluez le token dans l'en-tête `Authorization` :

```
Authorization: Bearer <votre_token_jwt>
```

## Endpoints

### Authentification

#### POST /auth/login
Authentifier un utilisateur et obtenir un token JWT.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "manager",
    "tenantId": "tenant_123"
  }
}
```

#### POST /auth/register
Créer un nouveau compte utilisateur.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "manager",
    "tenantId": "tenant_123"
  }
}
```

### Catégories

#### GET /categories
Lister toutes les catégories du tenant.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "cat_123",
    "name": "Boissons",
    "description": "Toutes les boissons",
    "color": "#FF5733",
    "tenantId": "tenant_123",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /categories
Créer une nouvelle catégorie.

**Request Body:**
```json
{
  "name": "Nouvelle catégorie",
  "description": "Description de la catégorie",
  "color": "#FF5733"
}
```

**Response:**
```json
{
  "id": "cat_124",
  "name": "Nouvelle catégorie",
  "description": "Description de la catégorie",
  "color": "#FF5733",
  "tenantId": "tenant_123",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### PUT /categories/{id}
Mettre à jour une catégorie existante.

**Request Body:**
```json
{
  "name": "Catégorie mise à jour",
  "description": "Description mise à jour",
  "color": "#00FF00"
}
```

#### DELETE /categories/{id}
Supprimer une catégorie.

**Response:**
- Code `204`: Catégorie supprimée avec succès
- Code `404`: Catégorie non trouvée

### Produits

#### GET /products
Lister les produits avec pagination et filtrage.

**Parameters:**
- `page` (query): Numéro de la page (default: 1)
- `limit` (query): Nombre d'éléments par page (default: 20)
- `category` (query): Filtrer par catégorie

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_123",
      "name": "Coca-Cola 33cl",
      "description": "Boisson gazeuse Coca-Cola",
      "price": 500.00,
      "currentStock": 100,
      "minStock": 10,
      "categoryId": "cat_123",
      "tenantId": "tenant_123",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### POST /products
Créer un nouveau produit.

**Request Body:**
```json
{
  "name": "Nouveau produit",
  "description": "Description du produit",
  "price": 1000.00,
  "currentStock": 50,
  "minStock": 5,
  "categoryId": "cat_123"
}
```

### Ventes

#### GET /sales/stats
Obtenir les statistiques des ventes.

**Parameters:**
- `period` (query): `daily`, `weekly`, `monthly`, `yearly` (default: daily)

**Response:**
```json
{
  "success": true,
  "data": {
    "daily": 150000,
    "weekly": 1050000,
    "monthly": 4500000,
    "yearly": 54000000,
    "totalSales": 1250,
    "averageSale": 120.00
  }
}
```

### Dépenses

#### GET /expenses
Lister les dépenses avec filtrage par date.

**Parameters:**
- `page` (query): Numéro de la page (default: 1)
- `limit` (query): Nombre d'éléments par page (default: 20)
- `startDate` (query): Date de début (format: YYYY-MM-DD)
- `endDate` (query): Date de fin (format: YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "expenses": [
    {
      "id": "exp_123",
      "amount": 5000.00,
      "description": "Achat de fournitures",
      "categoryId": "cat_456",
      "tenantId": "tenant_123",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### POST /expenses
Créer une nouvelle dépense.

**Request Body:**
```json
{
  "amount": 5000.00,
  "description": "Achat de matériel",
  "categoryId": "cat_456"
}
```

### Dashboard

#### GET /dashboard/stats
Obtenir les statistiques du tableau de bord.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 1500000,
    "totalExpenses": 450000,
    "netProfit": 1050000,
    "totalProducts": 150,
    "lowStockProducts": 12,
    "todaySales": 50000,
    "todayExpenses": 15000
  }
}
```

## Codes d'Erreur

### Codes HTTP Communs

- `200`: Succès
- `201`: Ressource créée
- `400`: Requête invalide
- `401`: Non authentifié
- `403`: Non autorisé
- `404`: Ressource non trouvée
- `500`: Erreur serveur interne

### Format d'Erreur

```json
{
  "success": false,
  "error": "Message d'erreur",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

L'API est limitée à 100 requêtes par 15 minutes par IP. En cas de dépassement, vous recevrez un code `429`.

## Validation

Les données sont validées selon les schémas définis dans la documentation OpenAPI. Les erreurs de validation retournent un code `400` avec des détails sur les champs invalides.

## Sécurité

- Tous les endpoints (sauf `/auth/login` et `/auth/register`) nécessitent une authentification JWT
- Les tokens expirent après 7 jours
- L'isolation multi-tenant garantit que chaque utilisateur ne voit que ses propres données
- Les entrées sont validées pour prévenir les injections SQL et XSS

## Outils

### Postman Collection
Une collection Postman est disponible pour tester facilement l'API.

### Swagger UI
L'interface Swagger est disponible à `/api/docs` en développement.

## Support

Pour toute question sur l'API, contactez :
- Email: api-support@smartmanager.forever-inc.com
- Documentation: https://docs.smartmanager.forever-inc.com
