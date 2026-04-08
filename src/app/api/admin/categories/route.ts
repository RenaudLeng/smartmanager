import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requirePermission } from '@/lib/auth'
import { AuthenticatedRequest } from '@/lib/auth'
import { PERMISSIONS } from '@/types'

async function getHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const tenantId = searchParams.get('tenantId')

    // SuperAdmin peut voir toutes les catégories ou filtrer par tenant
    const where: any = tenantId ? { tenantId } : {}

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          tenant: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.category.count({ where })
    ])

    return NextResponse.json({
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Admin categories fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function postHandler(request: NextRequest) {
  try {
    const { name, description, tenantId } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // SuperAdmin peut créer des catégories pour n'importe quel tenant
    const category = await prisma.category.create({
      data: {
        name,
        description,
        tenantId
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(category)

  } catch (error) {
    console.error('Admin category creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(getHandler)
export const POST = requireAuth(postHandler)
