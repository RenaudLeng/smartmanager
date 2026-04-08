import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireTenant } from '@/lib/auth'
import { validateRequest } from '@/lib/validation'
import { monitoring } from '@/lib/monitoring'

// Schéma de validation pour les fournisseurs
const createSupplierSchema = {
  safeParse: async (data: any) => {
    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: 'Le nom est requis' }
    }
    
    if (data.phone && data.phone.trim().length === 0) {
      return { success: false, error: 'Le téléphone ne peut pas être vide' }
    }
    
    return { success: true, data }
  }
}

async function getHandler(request: NextRequest) {
  try {
    const tenantId = (request as any).user.tenantId
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const where: any = { tenantId }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.supplier.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: suppliers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

async function postHandler(request: NextRequest) {
  try {
    const tenantId = (request as any).user.tenantId

    // Valider les données d'entrée
    const validation = await createSupplierSchema.safeParse(await request.json())
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { name, phone, email, address } = validation.data

    const supplier = await prisma.supplier.create({
      data: {
        name,
        phone,
        email,
        address,
        tenantId
      }
    })

    console.log('Fournisseur créé avec succès:', { supplierId: supplier.id, tenantId })

    return NextResponse.json({
      success: true,
      data: supplier,
      message: 'Fournisseur ajouté avec succès'
    })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}

async function putHandler(request: NextRequest) {
  try {
    const tenantId = (request as any).user.tenantId
    const { id, ...updateData } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID is required' },
        { status: 400 }
      )
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { 
        id,
        tenantId 
      },
      data: updateData
    })

    console.log('Fournisseur modifié avec succès:', { id, tenantId })

    return NextResponse.json({
      success: true,
      data: updatedSupplier,
      message: 'Fournisseur modifié avec succès'
    })
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update supplier' },
      { status: 500 }
    )
  }
}

async function deleteHandler(request: NextRequest) {
  try {
    const tenantId = (request as any).user.tenantId
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Supplier ID is required' },
        { status: 400 }
      )
    }

    await prisma.supplier.delete({
      where: { 
        id,
        tenantId 
      }
    })

    console.log('Fournisseur supprimé avec succès:', { id, tenantId })

    return NextResponse.json({
      success: true,
      message: 'Fournisseur supprimé avec succès'
    })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete supplier' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(monitoring.middleware()(getHandler))
export const POST = requireAuth(monitoring.middleware()(postHandler))
export const PUT = requireAuth(monitoring.middleware()(putHandler))
export const DELETE = requireAuth(monitoring.middleware()(deleteHandler))
