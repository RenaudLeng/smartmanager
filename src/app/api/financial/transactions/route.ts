import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number(),
  currency: z.string(),
  description: z.string(),
  category: z.string(),
  date: z.string(),
  source: z.object({
    type: z.enum(['cash', 'bank_transfer', 'mobile_money', 'budget_line']),
    budgetLineId: z.string().optional(),
    reference: z.string().optional()
  }),
  relatedEntity: z.object({
    type: z.string(),
    entityId: z.string(),
    entityName: z.string()
  }).optional(),
  tags: z.array(z.string()).optional()
})

// GET /api/financial/transactions
export async function GET() {
  try {
    // TODO: Implémenter la logique avec Prisma
    // const transactions = await prisma.financialTransaction.findMany({
    //   where: { tenantId: user.tenantId },
    //   orderBy: { createdAt: 'desc' }
    // })

    // Données mockées pour le moment
    const transactions = [
      {
        id: '1',
        type: 'income',
        amount: 250000,
        currency: 'XAF',
        description: 'Ventes journalières',
        category: 'Revenus',
        date: '2024-01-15',
        source: {
          type: 'cash',
          reference: 'CA-2024-01-15'
        },
        createdAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        type: 'expense',
        amount: 50000,
        currency: 'XAF',
        description: 'Achat de stock',
        category: 'Achats',
        date: '2024-01-15',
        source: {
          type: 'bank_transfer',
          reference: 'ACH-2024-01-15'
        },
        createdAt: '2024-01-15T09:00:00Z'
      }
    ]

    return NextResponse.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Erreur GET /api/financial/transactions:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des transactions' },
      { status: 500 }
    )
  }
}

// POST /api/financial/transactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = transactionSchema.parse(body)

    // TODO: Implémenter la logique avec Prisma
    // const transaction = await prisma.financialTransaction.create({
    //   data: {
    //     ...validatedData,
    //     tenantId: user.tenantId
    //   }
    // })

    // Simulation de création
    const transaction = {
      id: Date.now().toString(),
      ...validatedData,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: transaction,
      message: 'Transaction créée avec succès'
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/financial/transactions:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues || [] },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la transaction' },
      { status: 500 }
    )
  }
}
