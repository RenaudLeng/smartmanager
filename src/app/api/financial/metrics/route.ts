import { NextResponse } from 'next/server'

// GET /api/financial/metrics
export async function GET() {
  try {
    // TODO: Implémenter la logique avec Prisma pour calculer les métriques réelles
    // const transactions = await prisma.financialTransaction.findMany({
    //   where: { tenantId: user.tenantId }
    // })
    // const budgetLines = await prisma.budgetLine.findMany({
    //   where: { tenantId: user.tenantId }
    // })

    // Vérifier si les données ont été réinitialisées (via header ou logique de session)
    // Pour l'instant, retournons des données vides si pas de données réelles
    const isEmpty = true // TODO: remplacer par une vraie logique de détection

    if (isEmpty) {
      // Données vides après réinitialisation
      const emptyMetrics = {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        availableCash: 0,
        totalBudgetAllocated: 0,
        totalBudgetUsed: 0,
        roi: 0,
        cashBurnRate: 0,
        runway: 0,
        debtToEquityRatio: 0,
        currentRatio: 0,
        quickRatio: 0,
        grossMargin: 0,
        operatingMargin: 0,
        netMargin: 0,
        revenueGrowth: 0,
        expenseGrowth: 0
      }

      return NextResponse.json({
        success: true,
        data: emptyMetrics
      })
    }

    // Calcul des métriques basé sur les données réelles
    const metrics = {
      totalRevenue: 2500000,
      totalExpenses: 1800000,
      netProfit: 700000,
      profitMargin: 28,
      availableCash: 850000,
      totalBudgetAllocated: 1500000,
      totalBudgetUsed: 650000,
      roi: 25,
      cashBurnRate: 60000,
      runway: 14,
      debtToEquityRatio: 0.5,
      currentRatio: 1.8,
      quickRatio: 1.2,
      grossMargin: 35,
      operatingMargin: 20,
      netMargin: 28,
      revenueGrowth: 15,
      expenseGrowth: 8
    }

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Erreur GET /api/financial/metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des métriques' },
      { status: 500 }
    )
  }
}
