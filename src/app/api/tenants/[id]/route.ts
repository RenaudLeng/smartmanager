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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const tenant = await prisma.tenant.findUnique({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = updateTenantSchema.parse(body)

    const tenant = await prisma.tenant.update({
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Vérifier si le tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id }
    })

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'Tenant non trouvé' },
        { status: 404 }
      )
    }

    // Supprimer toutes les données associées dans le bon ordre (pour éviter les contraintes de clés étrangères)
    
    // 1. Supprimer les logs d'inventaire
    await prisma.inventoryLog.deleteMany({
      where: { tenantId: id }
    })

    // 2. Supprimer les items de ventes
    const sales = await prisma.sale.findMany({
      where: { tenantId: id },
      select: { id: true }
    })
    
    if (sales.length > 0) {
      await prisma.saleItem.deleteMany({
        where: { 
          saleId: { in: sales.map(s => s.id) }
        }
      })
    }

    // 3. Supprimer les dettes
    await prisma.debt.deleteMany({
      where: { tenantId: id }
    })

    // 4. Supprimer les dépenses
    await prisma.expense.deleteMany({
      where: { tenantId: id }
    })

    // 5. Supprimer les ventes
    await prisma.sale.deleteMany({
      where: { tenantId: id }
    })

    // 6. Supprimer les produits
    await prisma.product.deleteMany({
      where: { tenantId: id }
    })

    // 7. Supprimer les catégories
    await prisma.category.deleteMany({
      where: { tenantId: id }
    })

    // 8. Supprimer les fournisseurs
    await prisma.supplier.deleteMany({
      where: { tenantId: id }
    })

    // 9. Supprimer les clients
    await prisma.client.deleteMany({
      where: { tenantId: id }
    })

    // 10. Supprimer le personnel
    await prisma.staff.deleteMany({
      where: { tenantId: id }
    })

    // 11. Supprimer les abonnements
    await prisma.subscription.deleteMany({
      where: { tenantId: id }
    })

    // 12. Supprimer les notifications
    await prisma.notification.deleteMany({
      where: { tenantId: id }
    })

    // 13. Supprimer les configurations de dashboard
    await prisma.dashboardConfig.deleteMany({
      where: { tenantId: id }
    })

    // 14. Supprimer les logs d'audit
    await prisma.auditLog.deleteMany({
      where: { tenantId: id }
    })

    // 15. Supprimer les utilisateurs associés
    await prisma.user.deleteMany({
      where: { tenantId: id }
    })

    // 16. Supprimer le tenant
    await prisma.tenant.delete({
      where: { id }
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
