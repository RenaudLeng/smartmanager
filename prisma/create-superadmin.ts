import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

async function createSuperAdmin() {
  try {
    console.log('Création du compte SuperAdmin...')
    
    // Vérifier si le superadmin existe déjà
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        email: 'admin@smartmanager.com'
      }
    })
    
    if (existingSuperAdmin) {
      console.log('✅ Le compte SuperAdmin existe déjà:')
      console.log(`📧 Email: ${existingSuperAdmin.email}`)
      console.log(`👤 Nom: ${existingSuperAdmin.name}`)
      console.log(`🎭 Rôle: ${existingSuperAdmin.role}`)
      console.log(`🆔 ID: ${existingSuperAdmin.id}`)
      console.log(`📅 Créé le: ${existingSuperAdmin.createdAt}`)
      console.log(`🔄 Dernière connexion: ${existingSuperAdmin.lastLogin || 'Jamais'}`)
      console.log(`✅ Actif: ${existingSuperAdmin.isActive ? 'Oui' : 'Non'}`)
      return
    }
    
    // Créer le superadmin
    const hashedPassword = await hashPassword('admin123')
    
    const superAdmin = await prisma.user.create({
      data: {
        email: 'admin@smartmanager.com',
        name: 'SuperAdmin',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
        tenantId: null // SuperAdmin n'a pas de tenant
      }
    })
    
    console.log('✅ Compte SuperAdmin créé avec succès!')
    console.log('')
    console.log('📋 INFORMATIONS DE CONNEXION:')
    console.log('─'.repeat(40))
    console.log(`📧 Email: admin@smartmanager.com`)
    console.log(`🔑 Mot de passe: admin123`)
    console.log(`👤 Nom: ${superAdmin.name}`)
    console.log(`🆔 ID: ${superAdmin.id}`)
    console.log(`🎭 Rôle: ${superAdmin.role}`)
    console.log(`✅ Statut: Actif`)
    console.log(`🏢 Tenant: Aucun (SuperAdmin global)`)
    console.log('─'.repeat(40))
    console.log('')
    console.log('⚠️  SÉCURITÉ:')
    console.log('• Pensez à changer le mot de passe après la première connexion')
    console.log('• Utilisez des identifiants plus sécurisés en production')
    console.log('• Activez l\'authentification à deux facteurs si disponible')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du SuperAdmin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()
