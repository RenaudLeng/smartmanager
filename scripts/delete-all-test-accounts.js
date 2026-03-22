const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllTestAccounts() {
  try {
    console.log('🔍 Recherche de tous les comptes de test...');
    
    // Rechercher tous les tenants avec email test*@smartmanager.com
    const tenants = await prisma.tenant.findMany({
      where: {
        email: {
          startsWith: 'test',
          endsWith: '@smartmanager.com'
        }
      },
      include: {
        users: true,
        categories: true,
        products: true
      }
    });

    if (tenants.length === 0) {
      console.log('❌ Aucun compte de test trouvé');
      return;
    }

    console.log(`🏪 ${tenants.length} comptes de test trouvés:`);
    
    for (const tenant of tenants) {
      console.log(`\n🗑️ Suppression du compte: ${tenant.name} (${tenant.email})`);
      console.log(`   👥 Utilisateurs: ${tenant.users.length}`);
      console.log(`   📂 Catégories: ${tenant.categories.length}`);
      console.log(`   📦 Produits: ${tenant.products.length}`);

      // Supprimer dans l'ordre pour respecter les contraintes de clé étrangère
      
      // 1. Supprimer les produits
      if (tenant.products.length > 0) {
        await prisma.product.deleteMany({
          where: { tenantId: tenant.id }
        });
        console.log(`   ✅ ${tenant.products.length} produits supprimés`);
      }

      // 2. Supprimer les catégories
      if (tenant.categories.length > 0) {
        await prisma.category.deleteMany({
          where: { tenantId: tenant.id }
        });
        console.log(`   ✅ ${tenant.categories.length} catégories supprimées`);
      }

      // 3. Supprimer les utilisateurs
      if (tenant.users.length > 0) {
        await prisma.user.deleteMany({
          where: { tenantId: tenant.id }
        });
        console.log(`   ✅ ${tenant.users.length} utilisateurs supprimés`);
      }

      // 4. Supprimer le tenant
      await prisma.tenant.delete({
        where: { id: tenant.id }
      });
      console.log(`   ✅ Tenant supprimé`);
    }

    console.log(`\n🎉 ${tenants.length} comptes de test supprimés avec succès !`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllTestAccounts();
