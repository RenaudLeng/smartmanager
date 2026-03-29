# Accès SuperAdmin - SmartManager

## Identifiants uniques

**Email:** `arleys4u@gmail.com`  
**Mot de passe:** `password123`

## Accès à l'application

1. Ouvrir le navigateur: http://localhost:3000
2. Aller sur la page de login: http://localhost:3000/auth/login
3. Entrer les identifiants ci-dessus
4. Accéder au tableau de bord SuperAdmin: http://localhost:3000/superadmin

## Configuration actuelle

- ✅ **1 seul utilisateur** - SuperAdmin unique
- ✅ **0 tenant** - Aucune entreprise créée
- ✅ **Base de données propre** - Toutes les données précédentes supprimées
- ✅ **Accès sécurisé** - Mot de passe hashé avec bcrypt

## Fonctionnalités SuperAdmin

- Gestion des tenants (création, modification, suppression)
- Métriques système en temps réel
- Rapports globaux
- Configuration système
- Logs d'audit

## Sécurité

- Le superadmin n'a pas de tenantId (accès global)
- Le mot de passe est hashé avec bcrypt (12 rounds)
- Session de 8 heures pour les superadmins
- Protection contre les accès non autorisés

---
*Créé le 28 mars 2026 - Configuration unique SuperAdmin*
