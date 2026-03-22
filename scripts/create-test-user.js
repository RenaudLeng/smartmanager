const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    // Email unique avec timestamp
    const timestamp = Date.now();
    const uniqueEmail = `test${timestamp}@smartmanager.com`;
    
    // Creation du tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Demo Restaurant',
        email: uniqueEmail,
        businessType: 'restaurant',
        currency: 'XAF',
        status: 'active',
        address: 'Libreville, Gabon',
        phone: '+241 77 77 77 77'
      }
    });

    // Creation de l'utilisateur admin
    const user = await prisma.user.create({
      data: {
        name: 'Admin Demo',
        email: uniqueEmail,
        password: hashedPassword,
        role: 'admin',
        tenant: {
          connect: { id: tenant.id }
        }
      }
    });

    // Creation des categories de base pour restaurant
    const entreesCategory = await prisma.category.create({
      data: {
        name: 'Entrees',
        tenantId: tenant.id
      }
    });
    
    const platsCategory = await prisma.category.create({
      data: {
        name: 'Plats principaux',
        tenantId: tenant.id
      }
    });
    
    const dessertsCategory = await prisma.category.create({
      data: {
        name: 'Desserts',
        tenantId: tenant.id
      }
    });
    
    const boissonsCategory = await prisma.category.create({
      data: {
        name: 'Boissons',
        tenantId: tenant.id
      }
    });
    
    const alcoolsCategory = await prisma.category.create({
      data: {
        name: 'Alcools',
        tenantId: tenant.id
      }
    });

    // Creation de produits de base
    const products = await Promise.all([
      prisma.product.createMany({
        data: [
          {
            name: 'Poulet DG',
            description: 'Specialite gabonaise',
            sellingPrice: 5000,
            categoryId: platsCategory.id,
            tenantId: tenant.id
          },
          {
            name: 'Jus de fruits',
            description: 'Jus frais tropical',
            sellingPrice: 1000,
            categoryId: boissonsCategory.id,
            tenantId: tenant.id
          },
          {
            name: 'Salade verte',
            description: 'Salade fraiche',
            sellingPrice: 2000,
            categoryId: entreesCategory.id,
            tenantId: tenant.id
          }
        ]
      })
    ]);

    console.log('✅ Compte test créé avec succès !');
    console.log('📧 Email:', uniqueEmail);
    console.log('🔑 Mot de passe: demo123');
    console.log('🏪 Commerce: Demo Restaurant');
    console.log('🍽️ Type: Restaurant');
    
    return { 
      tenant, 
      user, 
      categories: [entreesCategory, platsCategory, dessertsCategory, boissonsCategory, alcoolsCategory], 
      products 
    };
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
