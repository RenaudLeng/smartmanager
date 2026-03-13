import { NextResponse } from 'next/server'

export async function GET() {
  try {
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
