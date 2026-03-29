const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    const user = await prisma.user.findFirst({
      where: { 
        email: 'arleys4u@gmail.com',
        role: 'super_admin'
      }
    });
    console.log('SuperAdmin trouvé:', user ? 'OUI' : 'NON');
    if (user) {
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Actif:', user.isActive);
      console.log('ID:', user.id);
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();
