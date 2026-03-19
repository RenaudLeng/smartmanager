import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const updateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  businessType: z.enum(['retail', 'bar', 'restaurant', 'hair_salon', 'pharmacy', 'supermarket']).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
})

// GET /api/tenants/[id] - Récupérer un tenant spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tenant
    })
  } catch (error) {
    console.error('Erreur GET /api/tenants/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du tenant' },
      { status: 500 }
    )
  }
}

// PUT /api/tenants/[id] - Mettre à jour un tenant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const validatedData = updateTenantSchema.parse(body)

    const tenant = await prisma.tenant.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json({
      success: true,
      data: tenant,
      message: 'Tenant mis à jour avec succès'
    })
  } catch (error) {
    console.error('Erreur PUT /api/tenants/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du tenant' },
      { status: 500 }
    )
  }
}

// DELETE /api/tenants/[id] - Supprimer un tenant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier si le tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: params.id }
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer d'abord les utilisateurs associés
    await prisma.user.deleteMany({
      where: { tenantId: params.id }
    })

    // Supprimer le tenant
    await prisma.tenant.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Tenant supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur DELETE /api/tenants/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du tenant' },
      { status: 500 }
    )
  }
}
