'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Wallet } from 'lucide-react'

interface DashboardStats {
  todaySales: number
  todayProfit: number
  todayExpenses: number
  lowStockProducts: number
  customerDebts: number
  cashBalance: number
}

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GA', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const cards = [
    {
      title: 'Ventes du jour',
      value: formatCurrency(stats.todaySales),
      icon: DollarSign,
      trend: 'up',
      color: 'text-green-600'
    },
    {
      title: 'Bénéfice du jour',
      value: formatCurrency(stats.todayProfit),
      icon: TrendingUp,
      trend: stats.todayProfit >= 0 ? 'up' : 'down',
      color: stats.todayProfit >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: 'Dépenses du jour',
      value: formatCurrency(stats.todayExpenses),
      icon: TrendingDown,
      trend: 'down',
      color: 'text-red-600'
    },
    {
      title: 'Stock critique',
      value: stats.lowStockProducts.toString(),
      icon: Package,
      trend: stats.lowStockProducts === 0 ? 'up' : 'down',
      color: stats.lowStockProducts === 0 ? 'text-green-600' : 'text-orange-600'
    },
    {
      title: 'Dettes clients',
      value: formatCurrency(stats.customerDebts),
      icon: Users,
      trend: 'down',
      color: 'text-orange-600'
    },
    {
      title: 'Trésorerie',
      value: formatCurrency(stats.cashBalance),
      icon: Wallet,
      trend: 'up',
      color: 'text-blue-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="bg-slate-800 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                {card.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span>
                  {card.trend === 'up' ? 'Positif' : 'Négatif'}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
