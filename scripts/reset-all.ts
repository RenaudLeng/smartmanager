import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetAll() {
  try {
    console.log('🔄 Réinitialisation complète de la base de données...')
    
    // Supprimer toutes les données
    await prisma.auditLog.deleteMany({})
    await prisma.dashboardConfig.deleteMany({})
    await prisma.subscription.deleteMany({})
    await prisma.debt.deleteMany({})
    await prisma.supplier.deleteMany({})
    await prisma.client.deleteMany({})
    await prisma.staff.deleteMany({})
    await prisma.inventoryLog.deleteMany({})
    await prisma.expense.deleteMany({})
    await prisma.sale.deleteMany({})
    await prisma.product.deleteMany({})
    await prisma.category.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.tenant.deleteMany({})
    
    console.log('✅ Toutes les données ont été supprimées')

    // Recréer le superadmin
    const hashedPassword = await bcrypt.hash('password123', 12)
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'arleys4u@gmail.com',
        name: 'Super Administrateur',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
      }
    })

    console.log('✅ SuperAdmin recréé:')
    console.log(`   Email: ${superAdmin.email}`)
    console.log(`   ID: ${superAdmin.id}`)

    console.log('\n🎉 Réinitialisation terminée!')
    console.log('📝 Utilisez les identifiants:')
    console.log('   Email: arleys4u@gmail.com')
    console.log('   Mot de passe: password123')

  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetAll()
