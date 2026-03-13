import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireTenant } from '@/lib/auth'

async function getHandler(request: NextRequest) {
  try {
    const tenantId = (request as any).user.tenantId
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')

    const where: any = {
      tenantId,
      isActive: true,
      deletedAt: null
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
          { quantity: 'asc' },
          { name: 'asc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    return NextResponse.json({
      products,
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
    } = await request.json()
    
    const tenantId = (request as any).user.tenantId

    if (!name || !sellingPrice || !categoryId) {
      return NextResponse.json(
        { error: 'Name, selling price, and category are required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        barcode,
        purchasePrice: purchasePrice || 0,
        sellingPrice,
        quantity: quantity || 0,
        minStock: minStock || 0,
        categoryId,
        supplierId,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        tenantId
      },
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
      }
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

export const GET = requireAuth(requireTenant(getHandler))
export const POST = requireAuth(requireTenant(postHandler))
