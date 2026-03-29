import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireTenant } from '@/lib/auth'
import { AuthenticatedRequest } from '@/lib/auth'

async function getHandler(request: NextRequest) {
  try {
    const tenantId = (request as AuthenticatedRequest).user.tenantId
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const where: { tenantId: string } = {
      tenantId
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
    const { name, description } = await request.json()
    const tenantId = (request as AuthenticatedRequest).user.tenantId

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        tenantId
      }
    })

    return NextResponse.json(category)

  } catch (error) {
    console.error('Category creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(requireTenant(getHandler))
export const POST = requireAuth(requireTenant(postHandler))
