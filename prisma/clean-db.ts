import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanDatabase() {
  try {
    console.log('Début du nettoyage de la base de données...')
    
    // Supprimer d'abord les données qui dépendent d'autres tables
    console.log('Suppression des ventes...')
    const deletedSales = await prisma.sale.deleteMany({})
    console.log(`Supprimé ${deletedSales.count} ventes`)
    
    console.log('Suppression des dépenses...')
    const deletedExpenses = await prisma.expense.deleteMany({})
    console.log(`Supprimé ${deletedExpenses.count} dépenses`)
    
    console.log('Suppression des produits...')
    const deletedProducts = await prisma.product.deleteMany({})
    console.log(`Supprimé ${deletedProducts.count} produits`)
    
    console.log('Suppression des catégories...')
    const deletedCategories = await prisma.category.deleteMany({})
    console.log(`Supprimé ${deletedCategories.count} catégories`)
    
    console.log('Suppression des notifications...')
    const deletedNotifications = await prisma.notification.deleteMany({})
    console.log(`Supprimé ${deletedNotifications.count} notifications`)
    
    console.log('Suppression des abonnements...')
    const deletedSubscriptions = await prisma.subscription.deleteMany({})
    console.log(`Supprimé ${deletedSubscriptions.count} abonnements`)
    
    console.log('Suppression des configurations de dashboard...')
    const deletedDashboardConfigs = await prisma.dashboardConfig.deleteMany({})
    console.log(`Supprimé ${deletedDashboardConfigs.count} configurations de dashboard`)
    
    console.log('Suppression des utilisateurs avec tenant...')
    const deletedUsers = await prisma.user.deleteMany({
      where: { tenantId: { not: null } }
    })
    console.log(`Supprimé ${deletedUsers.count} utilisateurs avec tenant`)
    
    // Maintenant supprimer les tenants
    console.log('Suppression des tenants...')
    const deletedTenants = await prisma.tenant.deleteMany({})
    console.log(`Supprimé ${deletedTenants.count} tenants`)
    
    // Supprimer les utilisateurs restants (sans tenant)
    console.log('Suppression des utilisateurs orphelins...')
    const deletedOrphanUsers = await prisma.user.deleteMany({
      where: { tenantId: null }
    })
    console.log(`Supprimé ${deletedOrphanUsers.count} utilisateurs orphelins`)
    
    console.log('Nettoyage terminé avec succès!')
    
  } catch (error) {
    console.error('Erreur lors du nettoyage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
