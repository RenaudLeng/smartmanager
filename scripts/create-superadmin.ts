import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    // Supprimer tous les utilisateurs existants
    await prisma.user.deleteMany({})
    console.log('✅ Tous les utilisateurs existants ont été supprimés')

    // Supprimer tous les tenants existants
    await prisma.tenant.deleteMany({})
    console.log('✅ Tous les tenants existants ont été supprimés')

    // Créer le superadmin unique
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

    console.log('✅ SuperAdmin créé avec succès:')
    console.log(`   Email: ${superAdmin.email}`)
    console.log(`   Nom: ${superAdmin.name}`)
    console.log(`   Role: ${superAdmin.role}`)
    console.log(`   ID: ${superAdmin.id}`)

  } catch (error) {
    console.error('❌ Erreur lors de la création du superadmin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
