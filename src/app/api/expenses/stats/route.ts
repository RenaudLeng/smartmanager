import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Vérifier si une réinitialisation est demandée
    const resetFlag = request.headers.get('x-reset-flag') || 
                     request.cookies.get('smartmanager-reset')?.value

    // Retourner toujours des données vides (pas de données codées en dur)
    const emptyStats = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      total: 0,
      averageExpense: 0
    }

    return NextResponse.json({
      success: true,
      data: emptyStats,
      message: resetFlag === 'true' ? 'Données dépenses réinitialisées' : 'Aucune donnée de dépense'
    })
  } catch (error) {
    console.error('Erreur GET /api/expenses/stats:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des statistiques de dépenses' },
      { status: 500 }
    )
  }
}
