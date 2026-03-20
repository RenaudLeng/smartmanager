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

    // Vérifier si les données ont été réinitialisées
    // Pour l'instant, retournons des données vides si pas de données réelles
    const isEmpty = true // TODO: remplacer par une vraie logique de détection

    if (isEmpty) {
      // Données vides après réinitialisation
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Données calculées dynamiquement
    const transactions = [
      {
        id: '1',
        type: 'income',
        amount: 250000,
        currency: 'XAF',
        description: 'Ventes journalières',
        category: 'Revenus',
        date: new Date().toISOString().split('T')[0],
        source: {
          type: 'cash',
          reference: `CA-${new Date().toISOString().split('T')[0]}`
        },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'expense',
        amount: 50000,
        currency: 'XAF',
        description: 'Achat de stock',
        category: 'Achats',
        date: new Date().toISOString().split('T')[0],
        source: {
          type: 'bank_transfer',
          reference: `ACH-${new Date().toISOString().split('T')[0]}`
        },
        createdAt: new Date().toISOString()
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
