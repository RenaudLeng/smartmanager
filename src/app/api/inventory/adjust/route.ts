import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireTenant } from '@/lib/auth'

async function postHandler(request: NextRequest) {
  try {
    const { productId, quantity, type, reason } = await request.json()
    const tenantId = (request as any).user.tenantId
    const userId = (request as any).user.userId

    if (!productId || quantity === undefined || !type) {
      return NextResponse.json(
        { error: 'Product ID, quantity, and type are required' },
        { status: 400 }
      )
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        tenantId,
        isActive: true,
        deletedAt: null
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const oldQuantity = product.quantity
      let newQuantity = quantity

      if (type === 'in') {
        newQuantity = oldQuantity + quantity
      } else if (type === 'out') {
        newQuantity = Math.max(0, oldQuantity - quantity)
      } else if (type === 'adjustment') {
        newQuantity = quantity
      }

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { quantity: newQuantity }
      })

      await tx.inventoryLog.create({
        data: {
          productId,
          type,
          quantity: type === 'adjustment' ? newQuantity - oldQuantity : quantity,
          reason: reason || `Ajustement stock: ${type}`,
          userId,
          tenantId
        }
      })

      return {
        product: updatedProduct,
        oldQuantity,
        newQuantity,
        change: newQuantity - oldQuantity
      }
    })

    return NextResponse.json({
      message: 'Stock updated successfully',
      ...result
    })

  } catch (error) {
    console.error('Inventory adjustment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(requireTenant(postHandler))
