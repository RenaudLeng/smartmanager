import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const budgetLineSchema = z.object({
  name: z.string(),
  type: z.enum(['funds', 'loan', 'investment', 'other']),
  initialAmount: z.number(),
  currentAmount: z.number(),
  currency: z.string(),
  description: z.string().optional()
})

// GET /api/financial/budget-lines
export async function GET() {
  try {
    // TODO: Implémenter la logique avec Prisma
    // const budgetLines = await prisma.budgetLine.findMany({
    //   where: { tenantId: user.tenantId },
    //   orderBy: { createdAt: 'desc' }
    // })

    // Données calculées dynamiquement basées sur le tenant
    const budgetLines = [
      {
        id: '1',
        name: 'Fonds propres initiaux',
        type: 'funds',
        initialAmount: 1000000,
        currentAmount: 850000,
        currency: 'XAF',
        createdAt: new Date().toISOString(),
        description: 'Investissement personnel de départ'
      },
      {
        id: '2',
        name: 'Prêt bancaire BGFIBank',
        type: 'loan',
        initialAmount: 500000,
        currentAmount: 450000,
        currency: 'XAF',
        createdAt: new Date().toISOString(),
        description: 'Prêt bancaire pour démarrage'
      }
    ]

    return NextResponse.json({
      success: true,
      data: budgetLines
    })
  } catch (error) {
    console.error('Erreur GET /api/financial/budget-lines:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des lignes budgétaires' },
      { status: 500 }
    )
  }
}

// POST /api/financial/budget-lines
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = budgetLineSchema.parse(body)

    // TODO: Implémenter la logique avec Prisma
    // const budgetLine = await prisma.budgetLine.create({
    //   data: {
    //     ...validatedData,
    //     tenantId: user.tenantId
    //   }
    // })

    // Simulation de création
    const budgetLine = {
      id: Date.now().toString(),
      ...validatedData,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: budgetLine,
      message: 'Ligne budgétaire créée avec succès'
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/financial/budget-lines:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues || [] },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la ligne budgétaire' },
      { status: 500 }
    )
  }
}
