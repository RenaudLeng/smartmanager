import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireTenant } from '@/lib/auth'
import { validateRequest, createSaleSchema } from '@/lib/validation'
import { monitoring } from '@/lib/monitoring'

async function postHandler(request: NextRequest) {
  try {
    const tenantId = (request as any).user.tenantId
    const userId = (request as any).user.userId

    // Valider les données d'entrée
    const validation = await validateRequest(createSaleSchema)(request)
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      )
    }

    const { items, paymentMethod, discount, customerName, customerPhone } = validation.data
    
    // Calculer les montants à partir des items
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const finalAmount = totalAmount - (totalAmount * discount / 100)
    const paymentType = paymentMethod
    const paymentStatus = 'completed' // Statut par défaut

    const sale = await prisma.$transaction(async (tx: any) => {
      const newSale = await tx.sale.create({
        data: {
          totalAmount,
          discountAmount: totalAmount - finalAmount,
          finalAmount,
          paymentType,
          paymentStatus,
          userId,
          tenantId
        }
      })

      await tx.saleItem.createMany({
        data: items.map((item: any) => ({
          saleId: newSale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        }))
      })

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        })

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'out',
            quantity: item.quantity,
            reason: `Vente #${newSale.id}`,
            userId,
            tenantId
          }
        })
      }

      return newSale
    })

    const fullSale = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                barcode: true
              }
            }
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(fullSale)

  } catch (error) {
    console.error('Sale creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getHandler(request: NextRequest) {
  try {
    const tenantId = (request as any).user.tenantId
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      tenantId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  barcode: true
                }
              }
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              phone: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.sale.count({ where })
    ])

    return NextResponse.json({
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Sales fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(monitoring.middleware()(postHandler))
export const GET = requireAuth(monitoring.middleware()(getHandler))
