import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function testSuperAdmin() {
  try {
    console.log('🔍 Vérification du superadmin...')
    
    // Vérifier si le superadmin existe
    const superAdmin = await prisma.user.findUnique({
      where: { email: 'arleys4u@gmail.com' }
    })

    if (!superAdmin) {
      console.log('❌ SuperAdmin non trouvé')
      return
    }

    console.log('✅ SuperAdmin trouvé:')
    console.log(`   Email: ${superAdmin.email}`)
    console.log(`   Nom: ${superAdmin.name}`)
    console.log(`   Role: ${superAdmin.role}`)
    console.log(`   Actif: ${superAdmin.isActive}`)
    console.log(`   Tenant ID: ${superAdmin.tenantId || 'NULL (superadmin)'}`)

    // Tester le mot de passe
    const isPasswordValid = await bcrypt.compare('password123', superAdmin.password)
    console.log(`   Mot de passe valide: ${isPasswordValid ? '✅ Oui' : '❌ Non'}`)

    // Vérifier qu'il n'y a pas d'autres utilisateurs
    const allUsers = await prisma.user.findMany()
    console.log(`\n📊 Nombre total d'utilisateurs: ${allUsers.length}`)
    
    // Vérifier qu'il n'y a pas de tenants
    const allTenants = await prisma.tenant.findMany()
    console.log(`📊 Nombre total de tenants: ${allTenants.length}`)

    if (allUsers.length === 1 && allTenants.length === 0) {
      console.log('\n🎉 Configuration parfaite! Un seul superadmin, aucun tenant.')
    }

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSuperAdmin()
