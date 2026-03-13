const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    // Création du tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Demo Restaurant',
        email: 'demo@demo.com',
        businessType: 'restaurant',
        currency: 'XAF',
        status: 'active',
        address: 'Libreville, Gabon',
        phone: '+241 77 77 77 77'
      }
    });

    // Création de l'utilisateur admin
    const user = await prisma.user.create({
      data: {
        name: 'Admin Demo',
        email: 'demo@demo.com',
        password: hashedPassword,
        role: 'admin',
        tenantId: tenant.id,
        status: 'active'
      }
    });

    // Création des catégories de base pour restaurant
    const categories = await Promise.all([
      prisma.category.createMany({
        data: [
          { name: 'Entrées', tenantId: tenant.id },
          { name: 'Plats principaux', tenantId: tenant.id },
          { name: 'Desserts', tenantId: tenant.id },
          { name: 'Boissons', tenantId: tenant.id },
          { name: 'Alcools', tenantId: tenant.id }
        ]
      })
    ]);

    // Création de produits de base
    const products = await Promise.all([
      prisma.product.createMany({
        data: [
          {
            name: 'Poulet DG',
            description: 'Spécialité gabonaise',
            price: 5000,
            stock: 50,
            categoryId: 2, // Plats principaux
            tenantId: tenant.id
          },
          {
            name: 'Jus de fruits',
            description: 'Jus frais tropical',
            price: 1000,
            stock: 100,
            categoryId: 4, // Boissons
            tenantId: tenant.id
          },
          {
            name: 'Salade verte',
            description: 'Salade fraîche',
            price: 2000,
            stock: 30,
            categoryId: 1, // Entrées
            tenantId: tenant.id
          }
        ]
      })
    ]);

    console.log('✅ Compte test créé avec succès !');
    console.log('📧 Email: demo@demo.com');
    console.log('🔑 Mot de passe: demo123');
    console.log('🏪 Commerce: Demo Restaurant');
    console.log('🍽️ Type: Restaurant');
    
    return { tenant, user, categories, products };
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
