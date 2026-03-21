'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, DollarSign, ShoppingCart, Users, AlertTriangle, Wallet, ArrowUp, ArrowDown, Plus, Package, Calculator } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'
import SmartAlerts from '@/components/Notifications/SmartAlerts'
import { useNotifications, useConfirmDialog } from '@/components/ui/ConfirmDialog'

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
  const router = useRouter()
  const tenantData = useTenant()
  const businessType = tenantData.getBusinessLabel()
  const businessFeatures = tenantData.getBusinessFeatures()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  
  const { showNotification, NotificationComponent } = useNotifications()
  const { ConfirmDialogComponent } = useConfirmDialog()

  // Actions rapides adaptées selon le type de commerce
  const quickActions = [
    { icon: <Plus className="h-5 w-5" />, label: 'POS', action: () => router.push('/pos'), color: 'bg-green-500 hover:bg-green-600' },
    { icon: <Package className="h-5 w-5" />, label: 'Stock', action: () => router.push('/stock'), color: 'bg-blue-500 hover:bg-blue-600' },
    { icon: <Calculator className="h-5 w-5" />, label: 'Dépenses', action: () => router.push('/depenses'), color: 'bg-red-500 hover:bg-red-600' }
  ]

  // Actions supplémentaires selon les fonctionnalités
  if (businessFeatures.allowsTableService) {
    quickActions.push({ 
      icon: <Users className="h-5 w-5" />, 
      label: 'Tables', 
      action: () => router.push('/commandes'), 
      color: 'bg-purple-500 hover:bg-purple-600' 
    })
  }

  if (businessFeatures.allowsDebt) {
    quickActions.push({ 
      icon: <Wallet className="h-5 w-5" />, 
      label: 'Clients', 
      action: () => router.push('/clients'), 
      color: 'bg-orange-500 hover:bg-orange-600' 
    })
  }

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

        if (!response.ok) throw new Error('Erreur lors du chargement des statistiques')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Erreur:', error)
        showNotification('Erreur lors du chargement des statistiques', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [showNotification])

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
      {/* Barre d'actions rapides - Même ligne que les notifications */}
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/10 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-white font-semibold">Tableau de bord</div>
            <div className="bg-orange-500/20 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="text-orange-400 text-sm font-medium">{businessType}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 flex items-center space-x-2`}
                title={action.label}
              >
                {action.icon}
                <span className="hidden sm:inline text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
        
        {/* Carte conditionnelle selon les fonctionnalités */}
        {businessFeatures.allowsDebt ? (
          <StatCard
            title="Dettes clients"
            value={`${(stats.customerDebts / 1000).toFixed(1)}k XAF`}
            change={-5.2}
            icon={<Wallet className="h-6 w-6" />}
            color="bg-gradient-to-r from-purple-500 to-purple-600"
          />
        ) : (
          <StatCard
            title="Solde caisse"
            value={`${(stats.cashBalance / 1000).toFixed(1)}k XAF`}
            change={3.1}
            icon={<Wallet className="h-6 w-6" />}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
          />
        )}
        
        <StatCard
          title="Produits en stock"
          value={stats.totalProducts}
          change={-2.1}
          icon={<Package className="h-6 w-6" />}
          color="bg-gradient-to-r from-red-500 to-red-600"
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

      {/* Composants partagés */}
      {ConfirmDialogComponent}
      {NotificationComponent}
    </div>
  )
}
