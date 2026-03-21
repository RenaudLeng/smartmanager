import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dailyObjective, dailyExpenseLimit, minProfitMargin, lowStockThreshold } = body

    // Pour l'instant, on retourne juste un succès
    // Plus tard, on pourra sauvegarder en base de données
    console.log('Configuration du tableau de bord sauvegardée:', {
      dailyObjective,
      dailyExpenseLimit,
      minProfitMargin,
      lowStockThreshold
    })

    return NextResponse.json({
      success: true,
      message: 'Configuration du tableau de bord sauvegardée avec succès',
      data: {
        dailyObjective,
        dailyExpenseLimit,
        minProfitMargin,
        lowStockThreshold
      }
    })
  } catch (error) {
    console.error('Erreur sauvegarde configuration tableau de bord:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la sauvegarde' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Retourner les valeurs par défaut
  const defaultConfig = {
    dailyObjective: 100000,
    dailyExpenseLimit: 50000,
    minProfitMargin: 15,
    lowStockThreshold: 10
  }

  return NextResponse.json({
    success: true,
    data: defaultConfig
  })
}
