import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Vérifier si les données ont été réinitialisées
    // Pour l'instant, retournons des données vides si pas de données réelles
    const isEmpty = true // TODO: remplacer par une vraie logique de détection

    if (isEmpty) {
      // Données vides après réinitialisation
      const emptyStats = {
        todaySales: 0,
        todayProfit: 0,
        todayExpenses: 0,
        lowStockProducts: 0,
        customerDebts: 0,
        cashBalance: 0,
        totalProducts: 0,
        totalSales: 0,
        totalCustomers: 0,
        recentTransactions: [],
        topProducts: []
      }

      return NextResponse.json(emptyStats)
    }

    // Mode démo - statistiques simulées
    const stats = {
      todaySales: 150000,
      todayProfit: 45000,
      todayExpenses: 12000,
      lowStockProducts: 3,
      customerDebts: 75000,
      cashBalance: 125000,
      totalProducts: 25,
      totalSales: 2500000,
      totalCustomers: 45,
      recentTransactions: [
        {
          id: '1',
          type: 'sale',
          amount: 15000,
          customer: 'Client A',
          time: '10:30',
          status: 'completed'
        },
        {
          id: '2', 
          type: 'sale',
          amount: 8000,
          customer: 'Client B',
          time: '09:45',
          status: 'completed'
        },
        {
          id: '3',
          type: 'expense',
          amount: 5000,
          description: 'Achat stock',
          time: '08:30',
          status: 'completed'
        }
      ],
      topProducts: [
        { name: 'Poulet DG', quantity: 45, sales: 12 },
        { name: 'Jus de fruits', quantity: 95, sales: 28 },
        { name: 'Salade verte', quantity: 25, sales: 8 }
      ]
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques' },
      { status: 500 }
    )
  }
}
