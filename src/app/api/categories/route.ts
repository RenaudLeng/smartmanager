import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { monitoring } from '@/lib/monitoring'

async function getHandler(request: NextRequest) {
  try {
    const user = (request as any).user
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (user.tenantId) {
      where.tenantId = user.tenantId
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit
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
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function postHandler(request: NextRequest) {
  try {
    const user = (request as any).user
    const body = await request.json()
    
    console.log('POST /api/categories - Body reçu:', body)
    console.log('POST /api/categories - User:', user)

    const { name, description, tenantId: providedTenantId } = body
    
    // Valider les données de base
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom est requis' },
        { status: 400 }
      )
    }

    // Déterminer le tenantId
    let tenantId = providedTenantId
    if (!tenantId && user.tenantId) {
      tenantId = user.tenantId
    }

    // Pour les super_admin, permettre de créer sans tenant
    if (!tenantId && user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Tenant ID requis' },
        { status: 400 }
      )
    }

    // Vérifier si la catégorie existe déjà
    const whereCondition: any = { name: name.trim() }
    if (tenantId) {
      whereCondition.tenantId = tenantId
    }

    const existingCategory = await prisma.category.findFirst({
      where: whereCondition
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Une catégorie avec ce nom existe déjà' },
        { status: 400 }
      )
    }

    // Créer la catégorie
    const createData: any = {
      name: name.trim(),
      description: description?.trim() || null
    }
    
    if (tenantId) {
      createData.tenantId = tenantId
    }

    const category = await prisma.category.create({
      data: createData
    })

    console.log('Catégorie créée avec succès:', { 
      userId: user?.id, 
      tenantId, 
      categoryName: name 
    })

    return NextResponse.json(category)

  } catch (error) {
    console.error('Erreur création catégorie:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return getHandler(request)
}

export async function POST(request: NextRequest) {
  return postHandler(request)
}
