const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteDemoAccount() {
  try {
    console.log('🔍 Recherche du compte demo...');
    
    // Rechercher le tenant demo@demo.com
    const tenant = await prisma.tenant.findUnique({
      where: { email: 'demo@demo.com' },
      include: {
        users: true,
        categories: true,
        products: true
      }
    });

    if (!tenant) {
      console.log('❌ Aucun compte demo@demo.com trouvé');
      return;
    }

    console.log(`🏪 Commerce trouvé: ${tenant.name} (${tenant.id})`);
    console.log(`👥 Utilisateurs: ${tenant.users.length}`);
    console.log(`📂 Catégories: ${tenant.categories.length}`);
    console.log(`📦 Produits: ${tenant.products.length}`);

    // Supprimer dans l'ordre pour respecter les contraintes de clé étrangère
    console.log('🗑️ Suppression en cours...');
    
    // 1. Supprimer les produits
    if (tenant.products.length > 0) {
      await prisma.product.deleteMany({
        where: { tenantId: tenant.id }
      });
      console.log(`✅ ${tenant.products.length} produits supprimés`);
    }

    // 2. Supprimer les catégories
    if (tenant.categories.length > 0) {
      await prisma.category.deleteMany({
        where: { tenantId: tenant.id }
      });
      console.log(`✅ ${tenant.categories.length} catégories supprimées`);
    }

    // 3. Supprimer les utilisateurs
    if (tenant.users.length > 0) {
      await prisma.user.deleteMany({
        where: { tenantId: tenant.id }
      });
      console.log(`✅ ${tenant.users.length} utilisateurs supprimés`);
    }

    // 4. Supprimer le tenant
    await prisma.tenant.delete({
      where: { id: tenant.id }
    });
    console.log('✅ Tenant supprimé');

    console.log('🎉 Compte demo@demo.com supprimé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDemoAccount();
