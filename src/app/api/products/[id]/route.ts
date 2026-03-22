import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireTenant } from '@/lib/auth'

async function putHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { quantity } = await request.json()
    const tenantId = (request as any).user.tenantId

    // Vérifier que le produit appartient au tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        tenantId
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Mettre à jour la quantité
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        quantity,
        updatedAt: new Date()
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

    return NextResponse.json(updatedProduct)

  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function deleteHandler(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const tenantId = (request as any).user.tenantId

    // Vérifier que le produit appartient au tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        tenantId
      }
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Supprimer le produit
    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Product deleted successfully' })

  } catch (error) {
    console.error('Product deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const PUT = requireAuth(requireTenant(putHandler))
export const DELETE = requireAuth(requireTenant(deleteHandler))
