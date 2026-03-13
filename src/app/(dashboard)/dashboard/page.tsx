'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, AlertTriangle, Wallet, ArrowUp, ArrowDown } from 'lucide-react'
import { SmartAlerts } from '@/components/Notifications/SmartAlerts'

interface DashboardStats {
  todaySales: number
  todayProfit: number
  todayExpenses: number
  lowStockProducts: number
  customerDebts: number
  cashBalance: number
  totalProducts: number
  totalSales: number
  totalCustomers: number
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    customer?: string
    description?: string
    time: string
    status: string
  }>
  topProducts: Array<{
    name: string
    quantity: number
    sales: number
  }>
}

function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color 
}: { 
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className={`${color} rounded-xl p-6 text-white shadow-xl backdrop-blur-md border border-white/10 transform transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="flex items-center space-x-1">
          {icon}
          {change !== undefined && (
            <div className={`flex items-center text-xs ${change >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {change >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              <span className="font-medium ml-1">{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RecentTransactions({ transactions }: { transactions: DashboardStats['recentTransactions'] }) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <ShoppingCart className="h-5 w-5 mr-2 text-orange-400" />
        Transactions récentes
      </h3>
      <div className="space-y-3">
        {transactions.slice(0, 5).map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  transaction.type === 'sale' ? 'bg-green-500' : 
                  transaction.type === 'expense' ? 'bg-red-500' : 'bg-orange-500'
                }`} />
                <div>
                  <p className="text-white font-medium">
                    {transaction.type === 'sale' ? 'Vente' : 
                     transaction.type === 'expense' ? 'Dépense' : 'Autre'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {transaction.customer || transaction.description || 'Transaction'}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">
                {transaction.type === 'expense' ? '-' : '+'}{transaction.amount.toLocaleString('fr-GA')} XAF
              </p>
              <p className="text-slate-400 text-xs">{transaction.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LowStockAlert({ products }: { products: DashboardStats['topProducts'] }) {
  const lowStockItems = products.filter(p => p.quantity < 20)
  
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-orange-400" />
        Stock critique
      </h3>
      {lowStockItems.length > 0 ? (
        <div className="space-y-2">
          {lowStockItems.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
              <div>
                <p className="text-white font-medium">{product.name}</p>
                <p className="text-gray-400 text-sm">Stock: {product.quantity}</p>
              </div>
              <div className="text-orange-400 font-bold">
                Commander
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-green-400">Tous les produits ont un stock suffisant</p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        // Set mock stats for demo
        const mockStats: DashboardStats = {
          todaySales: 125000,
          todayProfit: 45000,
          todayExpenses: 80000,
          lowStockProducts: 3,
          customerDebts: 65000,
          cashBalance: 125000,
          totalProducts: 156,
          totalSales: 1850000,
          totalCustomers: 48,
          recentTransactions: [
            {
              id: '1',
              type: 'sale',
              amount: 15000,
              customer: 'Jean-Baptiste Ondo',
              time: '10:30',
              status: 'completed'
            },
            {
              id: '2',
              type: 'sale',
              amount: 8500,
              customer: 'Marie Léontine Obame',
              time: '09:45',
              status: 'completed'
            },
            {
              id: '3',
              type: 'expense',
              amount: 5000,
              description: 'Achat de fournitures',
              time: '08:15',
              status: 'completed'
            },
            {
              id: '4',
              type: 'sale',
              amount: 22000,
              customer: 'Paul Nguema',
              time: '11:20',
              status: 'completed'
            },
            {
              id: '5',
              type: 'sale',
              amount: 6500,
              customer: 'Simone Eya',
              time: '14:30',
              status: 'completed'
            }
          ],
          topProducts: [
            { name: 'Riz gabonais 1kg', quantity: 45, sales: 675000 },
            { name: 'Huile de palme 1L', quantity: 12, sales: 180000 },
            { name: 'Sucre local 1kg', quantity: 8, sales: 96000 },
            { name: 'Farine de manioc 1kg', quantity: 15, sales: 225000 },
            { name: 'Lait en poudre Nido', quantity: 5, sales: 125000 }
          ]
        }
        setStats(mockStats)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white mt-4">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-xl font-semibold">Erreur de chargement</p>
          <p className="text-slate-400 mt-2">Impossible de charger les statistiques</p>
        </div>
      </div>
    )
  }

  return (
      <div className="p-4">
        {/* Header - Mobile First */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-400 mb-2 font-serif">Tableau de bord</h1>
          <p className="text-gray-200 text-sm md:text-base">Vue d&apos;ensemble de votre activité commerciale</p>
        </div>

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Ventes du jour"
          value={`${(stats.todaySales / 1000).toFixed(1)}k XAF`}
          change={12.5}
          icon={<DollarSign className="h-6 w-6" />}
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
        
        <StatCard
          title="Profit du jour"
          value={`${(stats.todayProfit / 1000).toFixed(1)}k XAF`}
          change={8.3}
          icon={<TrendingUp className="h-6 w-6" />}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        
        <StatCard
          title="Dépenses"
          value={`${(stats.todayExpenses / 1000).toFixed(1)}k XAF`}
          change={-5.2}
          icon={<TrendingDown className="h-6 w-6" />}
          color="bg-gradient-to-r from-red-500 to-red-600"
        />
        
        <StatCard
          title="Stock bas"
          value={stats.lowStockProducts}
          change={-15}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="bg-gradient-to-r from-yellow-500 to-orange-500"
        />
        
        <StatCard
          title="Dettes clients"
          value={`${(stats.customerDebts / 1000).toFixed(1)}k XAF`}
          change={3.1}
          icon={<Users className="h-6 w-6" />}
          color="bg-gradient-to-r from-purple-500 to-purple-600"
        />
        
        <StatCard
          title="Solde caisse"
          value={`${(stats.cashBalance / 1000).toFixed(1)}k XAF`}
          change={2.4}
          icon={<Wallet className="h-6 w-6" />}
          color="bg-gradient-to-r from-emerald-500 to-green-600"
        />
      </div>

      {/* Bottom Sections - Mobile First */}
      <div className="space-y-6">
        <SmartAlerts />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions transactions={stats.recentTransactions} />
          <LowStockAlert products={stats.topProducts} />
        </div>
      </div>
    </div>
  )
}
