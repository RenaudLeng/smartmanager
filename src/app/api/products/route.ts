import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireTenant } from '@/lib/auth'
import { validateRequest, createProductSchema, safeParseFloat, safeParseDate } from '@/lib/validation'
import { monitoring } from '@/lib/monitoring'

async function getHandler(request: NextRequest) {
  try {
    const user = (request as any).user
    const tenantId = user.tenantId
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')

    const where: any = {
      isActive: true,
      deletedAt: null
    }

    // Ajouter le filtre tenant si disponible
    if (tenantId) {
      where.tenantId = tenantId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          supplier: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: [
          { name: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function postHandler(request: NextRequest) {
  try {
    const user = (request as any).user
    const tenantId = user.tenantId

    // Valider les données d'entrée
    const validation = await validateRequest(createProductSchema)(request)
    if (!validation.success || !validation.data) {
      return NextResponse.json(
        { error: validation.error, details: validation.details },
        { status: 400 }
      )
    }

    const {
      name,
      description,
      barcode,
      purchasePrice,
      sellingPrice,
      quantity,
      minStock,
      categoryId,
      supplierId,
      expirationDate
    } = validation.data

    // Valider que la catégorie existe (avec ou sans tenant)
    const categoryWhere: any = { id: categoryId }
    if (tenantId) {
      categoryWhere.tenantId = tenantId
    }

    const categoryExists = await prisma.category.findFirst({
      where: categoryWhere
    })
    
    if (!categoryExists) {
      return NextResponse.json(
        { error: 'Catégorie invalide ou non trouvée' },
        { status: 400 }
      )
    }

    // Valider le fournisseur si spécifié
    let supplier = null
    if (supplierId) {
      supplier = await prisma.supplier.findFirst({
        where: { 
          id: supplierId,
          ...(tenantId && { tenantId })
        }
      })
      
      if (!supplier) {
        return NextResponse.json(
          { error: 'Fournisseur invalide ou non trouvé' },
          { status: 400 }
        )
      }
    }

    // Calculer automatiquement la marge et la rentabilité
    const purchase = safeParseFloat(purchasePrice, 0)
    const selling = safeParseFloat(sellingPrice)
    const margin = selling - purchase
    const profitability = purchase > 0 ? (margin / purchase) * 100 : 0

    // Créer le produit
    const productData: any = {
      name,
      description,
      barcode: String(barcode),
      purchasePrice: String(purchasePrice),
      sellingPrice: String(sellingPrice),
      margin: String(margin),
      profitability: String(profitability),
      quantity: String(parseInt(quantity) || 0),
      minStock: String(parseInt(minStock) || 0),
      categoryId: String(categoryId),
      expirationDate: safeParseDate(expirationDate),
      ...(tenantId && { tenantId })
    }

    const product = await prisma.product.create({
      data: productData
    })

    console.log('Product created successfully:', { 
      userId: user.id, 
      tenantId, 
      productName: name 
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error('Product creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(requireTenant(monitoring.middleware()(getHandler)))
export const POST = requireAuth(requireTenant(monitoring.middleware()(postHandler)))
