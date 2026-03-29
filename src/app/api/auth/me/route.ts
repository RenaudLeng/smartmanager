import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      )
    }

    // Vérifier le token avec la base de données
    const user = await prisma.user.findFirst({
      where: {
        isActive: true
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            businessType: true,
            email: true,
            phone: true,
            address: true,
            currency: true,
            status: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Vérifier si c'est un tenant ou un superadmin
    const isSuperAdmin = user.role === 'super_admin'
    
    if (!isSuperAdmin && !user.tenantId) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non associé à un tenant' },
        { status: 404 }
      )
    }

    // Récupérer les informations du tenant si ce n'est pas un superadmin
    let tenantInfo = null
    if (!isSuperAdmin && user.tenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: {
          id: true,
          name: true,
          businessType: true,
          email: true,
          phone: true,
          address: true,
          currency: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          features: true
        }
      })
      
      if (tenant) {
        tenantInfo = {
          ...tenant,
          features: tenant.features ? JSON.parse(tenant.features) : null
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        tenant: tenantInfo
      }
    })

  } catch (error) {
    console.error('Erreur dans /api/auth/me:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
