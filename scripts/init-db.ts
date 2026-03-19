import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initialisation de la base de données...')

  try {
    // Créer l'utilisateur SuperAdmin
    const superAdminEmail = 'admin@smartmanager.com'
    const superAdminPassword = 'admin123' // À changer en production

    // Vérifier si le SuperAdmin existe déjà
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail }
    })

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10)

      const superAdmin = await prisma.user.create({
        data: {
          email: superAdminEmail,
          name: 'SuperAdmin',
          password: hashedPassword,
          role: 'super_admin',
          isActive: true,
          lastLogin: new Date()
        }
      })

      console.log('✅ SuperAdmin créé:', superAdmin.email)
      console.log('🔑 Mot de passe:', superAdminPassword)
    } else {
      console.log('ℹ️ SuperAdmin existe déjà:', existingSuperAdmin.email)
    }

    // Créer un tenant de démonstration
    const demoTenantEmail = 'demo@smartmanager.com'
    
    const existingDemoTenant = await prisma.tenant.findUnique({
      where: { email: demoTenantEmail }
    })

    if (!existingDemoTenant) {
      // Créer le tenant de démo
      const demoTenant = await prisma.tenant.create({
        data: {
          name: 'Boutique Démo',
          email: demoTenantEmail,
          phone: '+241 123 456 789',
          address: 'Libreville, Gabon',
          businessType: 'retail',
          status: 'active'
        }
      })

      console.log('✅ Tenant de démo créé:', demoTenant.name)

      // Créer l'admin du tenant
      const demoAdminPassword = 'demo123'
      const hashedDemoPassword = await bcrypt.hash(demoAdminPassword, 10)

      const demoAdmin = await prisma.user.create({
        data: {
          email: demoTenantEmail,
          name: 'Admin Démo',
          password: hashedDemoPassword,
          role: 'admin',
          tenantId: demoTenant.id,
          isActive: true,
          lastLogin: new Date()
        }
      })

      console.log('✅ Admin démo créé:', demoAdmin.email)
      console.log('🔑 Mot de passe:', demoAdminPassword)

      // Créer des catégories par défaut
      const categories = [
        { name: 'Boissons', description: 'Toutes sortes de boissons' },
        { name: 'Alimentaire', description: 'Produits alimentaires de base' },
        { name: 'Snacks', description: 'Chips, biscuits, fruits secs' },
        { name: 'Hygiène', description: 'Produits de soin et hygiène' }
      ]

      for (const category of categories) {
        await prisma.category.create({
          data: {
            ...category,
            tenantId: demoTenant.id
          }
        })
      }

      console.log('✅ Catégories par défaut créées')

      // Créer des produits par défaut
      const products = [
        { name: 'Coca-Cola 33cl', price: 500, category: 'Boissons', quantity: 50 },
        { name: 'Eau Minérale 50cl', price: 200, category: 'Boissons', quantity: 100 },
        { name: 'Pain de mie', price: 1500, category: 'Alimentaire', quantity: 20 },
        { name: 'Lait concentré', price: 800, category: 'Alimentaire', quantity: 30 },
        { name: 'Chips Pringles', price: 1200, category: 'Snacks', quantity: 25 },
        { name: 'Savon Dove', price: 600, category: 'Hygiène', quantity: 40 }
      ]

      // Récupérer les catégories créées
      const createdCategories = await prisma.category.findMany({
        where: { tenantId: demoTenant.id }
      })

      for (const product of products) {
        const category = createdCategories.find(cat => cat.name === product.category)
        if (category) {
          await prisma.product.create({
            data: {
              name: product.name,
              description: `Description pour ${product.name}`,
              sellingPrice: product.price,
              purchasePrice: Math.floor(product.price * 0.7), // 30% de marge
              quantity: product.quantity,
              minStock: Math.floor(product.quantity * 0.2),
              categoryId: category.id,
              tenantId: demoTenant.id,
              isActive: true
            }
          })
        }
      }

      console.log('✅ Produits par défaut créés')

      // Créer l'abonnement
      await prisma.subscription.create({
        data: {
          tenantId: demoTenant.id,
          plan: 'free',
          price: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
          status: 'active',
          features: JSON.stringify(['3 utilisateurs', '50 produits', '500 MB stockage'])
        }
      })

      console.log('✅ Abonnement créé')

    } else {
      console.log('ℹ️ Tenant de démo existe déjà:', existingDemoTenant.name)
    }

    console.log('🎉 Initialisation terminée avec succès !')
    console.log('')
    console.log('📋 Comptes créés:')
    console.log('🔐 SuperAdmin:', superAdminEmail, '| Mot de passe:', superAdminPassword)
    console.log('🏪 Admin Démo:', demoTenantEmail, '| Mot de passe: demo123')
    console.log('')
    console.log('🌐 URL: http://localhost:3000')
    console.log('🔗 SuperAdmin: http://localhost:3000/superadmin')

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
