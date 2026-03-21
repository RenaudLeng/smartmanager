import { NextResponse } from 'next/server'

// GET /api/expenses/stats
export async function GET() {
  try {
    // TODO: Implémenter la logique avec Prisma
    // const expenses = await prisma.expense.findMany({
    //   where: { tenantId: user.tenantId }
    // })

    // Vérifier si les données ont été réinitialisées
    // Pour l'instant, retournons des données vides si pas de données réelles
    const isEmpty = true // TODO: remplacer par une vraie logique de détection

    if (isEmpty) {
      // Données vides après réinitialisation
      const emptyStats = {
        daily: 0,
        weekly: 0,
        monthly: 0,
        total: 0,
        averageExpense: 0
      }

      return NextResponse.json({
        success: true,
        data: emptyStats
      })
    }

    // Calculer les statistiques de dépenses réelles
    const stats = {
      daily: 65000,
      weekly: 320000,
      monthly: 1200000,
      total: 1200000,
      averageExpense: 4800
    }

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Erreur GET /api/expenses/stats:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des statistiques de dépenses' },
      { status: 500 }
    )
  }
}
