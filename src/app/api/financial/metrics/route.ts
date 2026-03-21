import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Vérifier si une réinitialisation est demandée
    const resetFlag = request.headers.get('x-reset-flag') || 
                     request.cookies.get('smartmanager-reset')?.value

    if (resetFlag === 'true') {
      // Retourner des données vides après réinitialisation
      const emptyMetrics = {
        cashAvailable: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        roi: 0,
        runway: 0,
        dailyAvgRevenue: 0,
        dailyAvgExpenses: 0,
        cashBurnRate: 0
      }

      return NextResponse.json({
        success: true,
        data: emptyMetrics,
        message: 'Données financières réinitialisées'
      })
    }

    // Retourner des données vides par défaut (pas de données codées en dur)
    const emptyMetrics = {
      cashAvailable: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      roi: 0,
      runway: 0,
      dailyAvgRevenue: 0,
      dailyAvgExpenses: 0,
      cashBurnRate: 0
    }

    return NextResponse.json({
      success: true,
      data: emptyMetrics
    })
  } catch (error) {
    console.error('Erreur GET /api/financial/metrics:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des métriques' },
      { status: 500 }
    )
  }
}
