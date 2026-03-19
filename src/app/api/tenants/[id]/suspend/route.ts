import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/tenants/[id]/suspend - Suspendre un tenant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const { reason } = await request.json()

    // Suspendre tous les utilisateurs du tenant
    await prisma.user.updateMany({
      where: { tenantId: id },
      data: { isActive: false }
    })

    // Mettre à jour le statut du tenant
    const tenant = await prisma.tenant.update({
      where: { id },
      data: { 
        status: 'suspended'
      }
    })

    return NextResponse.json({
      success: true,
      data: tenant,
      message: 'Tenant suspendu avec succès'
    })
  } catch (error) {
    console.error('Erreur POST /api/tenants/[id]/suspend:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suspension du tenant' },
      { status: 500 }
    )
  }
}
