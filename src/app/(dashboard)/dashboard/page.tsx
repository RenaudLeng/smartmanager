'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  AlertTriangle, 
  Wallet, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Package, 
  Calculator,
  Activity,
  Target,
  Zap,
  BarChart3,
  Clock,
  Star,
  Award,
  TrendingDown,
  Eye,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronRight,
  Calendar,
  PieChart,
  FileText,
  Truck,
  CreditCard,
  UserCheck,
  AlertCircle
} from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
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
  monthSales: number
  monthProfit: number
  monthExpenses: number
  averageTicket: number
  conversionRate: number
  customerSatisfaction: number
  topPerformingProducts: Array<{
    id: string
    name: string
    quantity: number
    sales: number
    profit: number
    trend: 'up' | 'down' | 'stable'
    category: string
  }>
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    customer?: string
    description?: string
    time: string
    status: string
    paymentMethod?: string
  }>
  topProducts: Array<{
    name: string
    quantity: number
    sales: number
  }>
  performanceMetrics: {
    salesGrowth: number
    profitGrowth: number
    customerGrowth: number
    efficiency: number
  }
  alerts: Array<{
    type: 'warning' | 'error' | 'success' | 'info'
    title: string
    message: string
    time: string
    action?: string
  }>
}

function StatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color,
  subtitle,
  trend,
  target
}: { 
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  target?: string
}) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
  const changeColor = change !== undefined && change >= 0 ? 'text-green-400' : change !== undefined && change < 0 ? 'text-red-400' : 'text-gray-400'
  
  return (
    <div className={`${color} rounded-xl p-6 text-white shadow-xl backdrop-blur-md border border-white/10 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors duration-300" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm opacity-75 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              {icon}
            </div>
            {change !== undefined && (
              <div className={`flex items-center text-xs font-medium ${changeColor}`}>
                {change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        {target && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-75">Objectif</span>
              <span className="font-medium">{target}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RecentTransactions({ transactions }: { transactions: DashboardStats['recentTransactions'] }) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2 text-orange-400" />
          Transactions récentes
        </h3>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Eye className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        {transactions.slice(0, 6).map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 group">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  transaction.type === 'sale' ? 'bg-green-500' : 
                  transaction.type === 'expense' ? 'bg-red-500' : 'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {transaction.type === 'sale' ? 'Vente' : 
                     transaction.type === 'expense' ? 'Dépense' : 'Autre'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {transaction.customer || transaction.description || 'Transaction'}
                  </p>
                  {transaction.paymentMethod && (
                    <div className="flex items-center mt-1">
                      <CreditCard className="h-3 w-3 text-gray-500 mr-1" />
                      <span className="text-xs text-gray-500">{transaction.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">
                {transaction.type === 'expense' ? '-' : '+'}{transaction.amount.toLocaleString('fr-GA')} XAF
              </p>
              <div className="flex items-center justify-end mt-1">
                <Clock className="h-3 w-3 text-gray-500 mr-1" />
                <p className="text-slate-400 text-xs">{transaction.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {transactions.length > 6 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <button className="w-full text-center text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
            Voir toutes les transactions
          </button>
        </div>
      )}
    </div>
  )
}

function LowStockAlert({ products }: { products: DashboardStats['topProducts'] }) {
  const lowStockItems = products.filter(p => p.quantity < 20)
  
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-orange-400" />
          Stock critique
        </h3>
        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
          {lowStockItems.length} items
        </span>
      </div>
      {lowStockItems.length > 0 ? (
        <div className="space-y-2">
          {lowStockItems.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <p className="text-white font-medium">{product.name}</p>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-gray-400 text-sm">Stock: {product.quantity}</span>
                  <span className="text-gray-400 text-sm">Ventes: {product.sales}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="text-orange-400 font-bold text-sm">Commander</p>
                  <p className="text-gray-500 text-xs">Urgent</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="h-6 w-6 text-green-400" />
          </div>
          <p className="text-green-400 font-medium">Tous les produits ont un stock suffisant</p>
          <p className="text-gray-500 text-sm mt-1">Aucune action requise</p>
        </div>
      )}
    </div>
  )
}

// Nouveau composant pour les indicateurs de performance
function PerformanceMetrics({ metrics }: { metrics: DashboardStats['performanceMetrics'] }) {
  const metricItems = [
    { label: 'Croissance ventes', value: metrics.salesGrowth, icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-400' },
    { label: 'Croissance profit', value: metrics.profitGrowth, icon: <DollarSign className="h-4 w-4" />, color: 'text-blue-400' },
    { label: 'Croissance clients', value: metrics.customerGrowth, icon: <Users className="h-4 w-4" />, color: 'text-purple-400' },
    { label: 'Efficacité', value: metrics.efficiency, icon: <Zap className="h-4 w-4" />, color: 'text-orange-400' }
  ]

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <BarChart3 className="h-5 w-5 mr-2 text-orange-400" />
        Performance
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {metricItems.map((item, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">{item.label}</span>
              <div className={item.color}>{item.icon}</div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xl font-bold ${item.color}`}>
                {item.value > 0 ? '+' : ''}{item.value}%
              </span>
              {item.value > 0 && (
                <ArrowUp className="h-3 w-3 text-green-400" />
              )}
              {item.value < 0 && (
                <ArrowDown className="h-3 w-3 text-red-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Nouveau composant pour les produits vedettes
function TopPerformingProducts({ products }: { products: DashboardStats['topPerformingProducts'] }) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Star className="h-5 w-5 mr-2 text-orange-400" />
          Produits vedettes
        </h3>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Filter className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-3">
        {products.slice(0, 5).map((product, index) => (
          <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <span className="text-orange-400 font-bold text-sm">{index + 1}</span>
              </div>
              <div>
                <p className="text-white font-medium">{product.name}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-gray-400 text-xs">{product.category}</span>
                  <div className="flex items-center space-x-1">
                    {product.trend === 'up' && <ArrowUp className="h-3 w-3 text-green-400" />}
                    {product.trend === 'down' && <ArrowDown className="h-3 w-3 text-red-400" />}
                    {product.trend === 'stable' && <div className="w-3 h-3 bg-gray-400 rounded-full" />}
                    <span className="text-xs text-gray-400">{product.trend}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold">{product.sales.toLocaleString('fr-GA')} XAF</p>
              <p className="text-gray-400 text-xs">{product.quantity} ventes</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Nouveau composant pour les alertes intelligentes
function SmartAlertsPanel({ alerts }: { alerts: DashboardStats['alerts'] }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      case 'success': return <Award className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'success': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Bell className="h-5 w-5 mr-2 text-orange-400" />
          Alertes intelligentes
        </h3>
        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
          {alerts.length} actives
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
            <div className="flex items-start space-x-3">
              <div className="mt-1">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm opacity-75 mt-1">{alert.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-60">{alert.time}</span>
                  {alert.action && (
                    <button className="text-xs font-medium hover:opacity-80 transition-opacity">
                      {alert.action}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const tenantData = useTenant()
  const businessType = tenantData.getBusinessLabel()
  const businessFeatures = tenantData.getBusinessFeatures()
  const subscriptionStatus = tenantData.getSubscriptionStatus()
  
  // 👑 PROTECTION ANTI-SUPERADMIN
  useEffect(() => {
    if (user?.role === 'super_admin') {
      console.log('🚫 SuperAdmin détecté dans dashboard tenant - Redirection forcée vers /superadmin')
      window.location.href = '/superadmin'
      return
    }
  }, [user])
  
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
  }, []) // Supprimé showNotification pour éviter la boucle

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
    <div className="min-h-screen bg-slate-900 p-4">
      {/* Header moderne avec branding et actions */}
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-linear-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
              <p className="text-gray-400 text-sm">Vue d'ensemble de votre activité</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-orange-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-orange-500/30">
              <span className="text-orange-400 text-sm font-medium">{businessType}</span>
            </div>
            {subscriptionStatus.isTrial && (
              <div className="bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-green-500/30">
                <span className="text-green-400 text-sm font-medium">
                  🎁 Essai {subscriptionStatus.trialDaysLeft}j restants
                </span>
              </div>
            )}
            {subscriptionStatus.plan === 'premium' && (
              <div className="bg-purple-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-500/30">
                <span className="text-purple-400 text-sm font-medium">
                  💎 {subscriptionStatus.plan.toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Actions rapides */}
            <div className="flex items-center space-x-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`${action.color} text-white p-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2`}
                  title={action.label}
                >
                  {action.icon}
                  <span className="hidden sm:inline text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats principales - plus compact et moderne */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Ventes du jour"
          value={`${(stats.todaySales / 1000).toFixed(1)}k XAF`}
          change={12.5}
          icon={<DollarSign className="h-6 w-6" />}
          color="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700"
          subtitle="+15% vs hier"
          trend="up"
          target="500k XAF"
        />
        
        <StatCard
          title="Profit du jour"
          value={`${(stats.todayProfit / 1000).toFixed(1)}k XAF`}
          change={8.3}
          icon={<TrendingUp className="h-6 w-6" />}
          color="bg-gradient-to-br from-orange-500 via-orange-600 to-red-700"
          subtitle="Marge: 23%"
          trend="up"
          target="150k XAF"
        />
        
        {/* Carte conditionnelle selon les fonctionnalités */}
        {businessFeatures.allowsDebt ? (
          <StatCard
            title="Dettes clients"
            value={`${(stats.customerDebts / 1000).toFixed(1)}k XAF`}
            change={-5.2}
            icon={<Wallet className="h-6 w-6" />}
            color="bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700"
            subtitle="12 clients"
            trend="down"
            target="< 50k XAF"
          />
        ) : (
          <StatCard
            title="Solde caisse"
            value={`${(stats.cashBalance / 1000).toFixed(1)}k XAF`}
            change={3.1}
            icon={<Wallet className="h-6 w-6" />}
            color="bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-700"
            subtitle="Disponible"
            trend="up"
            target="200k XAF"
          />
        )}
        
        <StatCard
          title="Produits en stock"
          value={stats.totalProducts}
          change={-2.1}
          icon={<Package className="h-6 w-6" />}
          color="bg-gradient-to-br from-red-500 via-red-600 to-pink-700"
          subtitle={`${stats.lowStockProducts} alertes`}
          trend="down"
          target="0 alerte"
        />
      </div>

      {/* Alertes intelligentes - plus visible */}
      <div className="mb-6">
        <SmartAlertsPanel alerts={stats.alerts || [
          {
            type: 'warning',
            title: 'Stock faible',
            message: '3 produits nécessitent un réapprovisionnement urgent',
            time: 'Il y a 2h',
            action: 'Voir'
          },
          {
            type: 'success',
            title: 'Objectif atteint',
            message: 'Ventes quotidiennes dépassées de 15%',
            time: 'Il y a 4h',
            action: 'Détails'
          }
        ]} />
      </div>

      {/* Section principale avec 3 colonnes */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Performance - 2/3 */}
        <div className="xl:col-span-2">
          <PerformanceMetrics metrics={stats.performanceMetrics || {
            salesGrowth: 15.3,
            profitGrowth: 8.7,
            customerGrowth: 12.1,
            efficiency: 94.2
          }} />
        </div>
        
        {/* Produits vedettes - 1/3 */}
        <div>
          <TopPerformingProducts products={stats.topPerformingProducts || [
            {
              id: '1',
              name: 'Riz Gabonais',
              quantity: 45,
              sales: 675000,
              profit: 135000,
              trend: 'up',
              category: 'Alimentaire'
            },
            {
              id: '2',
              name: 'Huile Palme',
              quantity: 32,
              sales: 480000,
              profit: 96000,
              trend: 'stable',
              category: 'Alimentaire'
            }
          ]} />
        </div>
      </div>

      {/* Transactions récentes - pleine largeur */}
      <div className="mb-6">
        <RecentTransactions transactions={stats.recentTransactions || [
          {
            id: '1',
            type: 'sale',
            amount: 15000,
            customer: 'Client A',
            description: 'Vente POS',
            time: '10:30',
            status: 'completed',
            paymentMethod: 'Mobile Money'
          },
          {
            id: '2',
            type: 'expense',
            amount: 5000,
            description: 'Achat fournitures',
            time: '09:15',
            status: 'completed',
            paymentMethod: 'Espèces'
          }
        ]} />
      </div>

      {/* Section alertes existantes */}
      <div className="mb-6">
        <SmartAlerts />
      </div>

      {/* Footer avec actions rapides */}
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Actualiser</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <Download className="h-4 w-4" />
              <span className="text-sm">Exporter</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Période</span>
            </button>
          </div>
          <div className="text-gray-400 text-sm">
            Dernière mise à jour: {new Date().toLocaleTimeString('fr-GA')}
          </div>
        </div>
      </div>

      {/* Composants partagés */}
      {ConfirmDialogComponent}
      {NotificationComponent}
    </div>
  )
}
