import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/admin/cleanup-all - Supprimer toutes les données de démonstration
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

    let deletedCount = 0

    try {
      // Supprimer tous les tenants (cascade supprimera les données associées)
      const result = await prisma.tenant.deleteMany({})
      deletedCount = result.count

      // Supprimer les utilisateurs restants (sans tenant)
      const usersResult = await prisma.user.deleteMany({
        where: { tenantId: null }
      })

      return NextResponse.json({
        success: true,
        message: 'Nettoyage complet effectué',
        deletedTenants: deletedCount,
        deletedOrphanUsers: usersResult.count
      })

    } catch (dbError) {
      console.error('Erreur lors du nettoyage de la base de données:', dbError)
      return NextResponse.json(
        { success: false, error: 'Erreur lors du nettoyage: ' + (dbError as Error).message },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erreur lors du nettoyage complet:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du nettoyage complet' },
      { status: 500 }
    )
  }
}
