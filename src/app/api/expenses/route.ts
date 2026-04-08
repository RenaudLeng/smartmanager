import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireTenant } from '@/lib/auth'
import { validateRequest } from '@/lib/validation'
import { monitoring } from '@/lib/monitoring'

// Schéma de validation pour les dépenses
const createExpenseSchema = {
  safeParse: async (data: any) => {
    // Validation basique pour les dépenses
    if (!data.amount || data.amount <= 0) {
      return { success: false, error: 'Le montant doit être positif' }
    }
    
    if (!data.description || data.description.trim().length === 0) {
      return { success: false, error: 'La description est requise' }
    }
    
    if (!data.category) {
      return { success: false, error: 'La catégorie est requise' }
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
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = { tenantId }
    
    if (category) {
      where.category = category
    }
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.expense.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erreur récupération dépenses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

async function postHandler(request: NextRequest) {
  try {
    const tenantId = (request as any).user.tenantId
    const userId = (request as any).user.userId

    // Valider les données d'entrée
    const validation = await createExpenseSchema.safeParse(await request.json())
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { amount, description, category, date, ...otherData } = validation.data

    const expense = await prisma.expense.create({
      data: {
        amount,
        description,
        category,
        date: date ? new Date(date) : new Date(),
        tenantId,
        userId,
        ...otherData
      }
    })

    console.log('Dépense créée avec succès:', {
      userId,
      tenantId,
      amount,
      category
    })

    return NextResponse.json({
      success: true,
      data: expense,
      message: 'Dépense ajoutée avec succès'
    })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create expense' },
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
        { success: false, error: 'Expense ID is required' },
        { status: 400 }
      )
    }

    const updatedExpense = await prisma.expense.update({
      where: { 
        id,
        tenantId 
      },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    })

    console.log('Dépense modifiée avec succès:', { id, tenantId })

    return NextResponse.json({
      success: true,
      data: updatedExpense,
      message: 'Dépense modifiée avec succès'
    })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update expense' },
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
        { success: false, error: 'Expense ID is required' },
        { status: 400 }
      )
    }

    await prisma.expense.delete({
      where: { 
        id,
        tenantId 
      }
    })

    console.log('Dépense supprimée avec succès:', { id, tenantId })

    return NextResponse.json({
      success: true,
      message: 'Dépense supprimée avec succès'
    })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}

export const GET = requireAuth(monitoring.middleware()(getHandler))
export const POST = requireAuth(monitoring.middleware()(postHandler))
export const PUT = requireAuth(requireTenant(monitoring.middleware()(putHandler)))
export const DELETE = requireAuth(requireTenant(monitoring.middleware()(deleteHandler)))
