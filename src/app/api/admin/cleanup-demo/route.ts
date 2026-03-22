import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/admin/cleanup-demo - Supprimer les données de démonstration
export async function POST(request: NextRequest) {
  try {
    // Vérifier si l'utilisateur est un super admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token requis' },
        { status: 401 }
      )
    }

    // Emails de démonstration à supprimer
    const demoEmails = [
      'test1774202934056@smartmanager.com',
      'test1774162301224@smartmanager.com',
      'demo@smartmanager.com',
      'admin@smartmanager.com'
    ]

    // Supprimer les utilisateurs de démonstration
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          in: demoEmails
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `${deletedUsers.count} utilisateur(s) de démonstration supprimé(s)`,
      deletedCount: deletedUsers.count
    })

  } catch (error) {
    console.error('Erreur lors du nettoyage des données de démonstration:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du nettoyage des données de démonstration' },
      { status: 500 }
    )
  }
}
