'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { 
  TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Download, Filter, ArrowLeft, 
  BarChart3, FileText, Eye, Settings, Activity, Target, Zap
} from 'lucide-react'
import { useNotifications, useConfirmDialog } from '@/components/ui/ConfirmDialog'

interface UnifiedReportData {
  // Basic Reports Data
  dailySales: Array<{ date: string; sales: number; profit: number }>
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  categorySales: Array<{ category: string; value: number; color: string }>
  monthlyTrend: Array<{ month: string; revenue: number; expenses: number; profit: number }>
  
  // Advanced Analytics Data
  customerGrowthRate: number
  salesByDay: Array<{ day: string; sales: number; profit: number }>
  conversionRate: number
  profitMargin: number
  averageTransactionValue: number
  topCustomers: Array<{ name: string; revenue: number; orders: number }>
  seasonalTrends: Array<{ season: string; revenue: number; profit: number }>
  performanceMetrics: {
    revenueGrowth: number
    expenseControl: number
    inventoryTurnover: number
    customerRetention: number
  }
}

type ReportView = 'overview' | 'sales' | 'products' | 'customers' | 'analytics' | 'advanced'

export default function UnifiedReportsPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<UnifiedReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [activeView, setActiveView] = useState<ReportView>('overview')
  const [showExportModal, setShowExportModal] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState('revenue')
  
  const { showNotification, NotificationComponent } = useNotifications()
  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  const reportViews = [
    {
      id: 'overview' as ReportView,
      label: 'Vue d\'ensemble',
      icon: BarChart3,
      description: 'Tableau de bord complet',
      color: 'text-orange-400'
    },
    {
      id: 'sales' as ReportView,
      label: 'Ventes',
      icon: TrendingUp,
      description: 'Analyse des ventes',
      color: 'text-green-400'
    },
    {
      id: 'products' as ReportView,
      label: 'Produits',
      icon: ShoppingCart,
      description: 'Performance produits',
      color: 'text-blue-400'
    },
    {
      id: 'customers' as ReportView,
      label: 'Clients',
      icon: Users,
      description: 'Analyse clients',
      color: 'text-purple-400'
    },
    {
      id: 'analytics' as ReportView,
      label: 'Analytics',
      icon: Activity,
      description: 'Métriques avancées',
      color: 'text-cyan-400'
    },
    {
      id: 'advanced' as ReportView,
      label: 'Avancé',
      icon: Target,
      description: 'Rapports détaillés',
      color: 'text-pink-400'
    }
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const mockData: UnifiedReportData = {
        // Basic Reports Data
        dailySales: [
          { date: 'Lun', sales: 45000, profit: 12000 },
          { date: 'Mar', sales: 52000, profit: 15000 },
          { date: 'Mer', sales: 48000, profit: 13500 },
          { date: 'Jeu', sales: 61000, profit: 18000 },
          { date: 'Ven', sales: 58000, profit: 16500 },
          { date: 'Sam', sales: 72000, profit: 22000 },
          { date: 'Dim', sales: 35000, profit: 8000 }
        ],
        topProducts: [
          { name: 'Riz gabonais 1kg', quantity: 145, revenue: 217500 },
          { name: 'Huile de palme 1L', quantity: 89, revenue: 222500 },
          { name: 'Coca-Cola 33cl', quantity: 234, revenue: 70200 },
          { name: 'Sucre local 1kg', quantity: 67, revenue: 80400 },
          { name: 'Lait en poudre Nido', quantity: 45, revenue: 157500 }
        ],
        categorySales: [
          { category: 'Alimentaire', value: 45, color: '#10b981' },
          { category: 'Boissons', value: 25, color: '#3b82f6' },
          { category: 'Hygiène', value: 15, color: '#8b5cf6' },
          { category: 'Boulangerie', value: 10, color: '#f59e0b' },
          { category: 'Autres', value: 5, color: '#6b7280' }
        ],
        monthlyTrend: [
          { month: 'Jan', revenue: 1250000, expenses: 980000, profit: 270000 },
          { month: 'Fev', revenue: 1380000, expenses: 1020000, profit: 360000 },
          { month: 'Mar', revenue: 1420000, expenses: 1050000, profit: 370000 },
          { month: 'Avr', revenue: 1560000, expenses: 1120000, profit: 440000 },
          { month: 'Mai', revenue: 1480000, expenses: 1080000, profit: 400000 },
          { month: 'Jun', revenue: 1650000, expenses: 1180000, profit: 470000 }
        ],
        
        // Advanced Analytics Data
        customerGrowthRate: 15.3,
        salesByDay: [
          { day: 'Lundi', sales: 125000, profit: 35000 },
          { day: 'Mardi', sales: 145000, profit: 42000 },
          { day: 'Mercredi', sales: 132000, profit: 38000 },
          { day: 'Jeudi', sales: 168000, profit: 52000 },
          { day: 'Vendredi', sales: 189000, profit: 58000 },
          { day: 'Samedi', sales: 225000, profit: 75000 },
          { day: 'Dimanche', sales: 98000, profit: 28000 }
        ],
        conversionRate: 68.5,
        profitMargin: 32.8,
        averageTransactionValue: 12500,
        topCustomers: [
          { name: 'Client VIP A', revenue: 450000, orders: 45 },
          { name: 'Client Régulier B', revenue: 320000, orders: 38 },
          { name: 'Client Entreprise C', revenue: 280000, orders: 25 },
          { name: 'Client Particulier D', revenue: 185000, orders: 22 },
          { name: 'Client Premium E', revenue: 156000, orders: 18 }
        ],
        seasonalTrends: [
          { season: 'Printemps', revenue: 3200000, profit: 950000 },
          { season: 'Été', revenue: 3800000, profit: 1200000 },
          { season: 'Automne', revenue: 3500000, profit: 1050000 },
          { season: 'Hiver', revenue: 2900000, profit: 850000 }
        ],
        performanceMetrics: {
          revenueGrowth: 18.5,
          expenseControl: 12.3,
          inventoryTurnover: 8.7,
          customerRetention: 76.2
        }
      }
      setReportData(mockData)
      setLoading(false)
    }, 1000)
  }, [selectedPeriod])

  const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      showNotification('success', `Rapport exporté en ${format.toUpperCase()} avec succès!`)
      setShowExportModal(false)
    } catch (error) {
      showNotification('error', 'Erreur lors de l\'export du rapport')
    }
  }, [showNotification])

  const renderOverview = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Croissance revenus</p>
                <p className="text-2xl font-bold text-green-400">+{reportData.performanceMetrics.revenueGrowth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Marge bénéficiaire</p>
                <p className="text-2xl font-bold text-orange-400">{reportData.profitMargin}%</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Taux conversion</p>
                <p className="text-2xl font-bold text-blue-400">{reportData.conversionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Croissance clients</p>
                <p className="text-2xl font-bold text-purple-400">+{reportData.customerGrowthRate}%</p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tendance mensuelle</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="profit" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Sales */}
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ventes par catégorie</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.categorySales}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ category, value }) => `${category}: ${value}%`}
                >
                  {reportData.categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  const renderSalesAnalytics = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        {/* Sales Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ventes quotidiennes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Bar dataKey="sales" fill="#10b981" />
                <Bar dataKey="profit" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ventes par jour de semaine</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Line type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Seasonal Trends */}
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tendances saisonnières</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.seasonalTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="season" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              <Bar dataKey="revenue" fill="#10b981" />
              <Bar dataKey="profit" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  const renderProductsAnalytics = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        {/* Top Products */}
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top produits</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2">Produit</th>
                  <th className="text-right py-2">Quantité</th>
                  <th className="text-right py-2">Revenu</th>
                  <th className="text-right py-2">Prix moyen</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topProducts.map((product, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="py-2">{product.name}</td>
                    <td className="text-right">{product.quantity}</td>
                    <td className="text-right">{product.revenue.toLocaleString('fr-GA')} XAF</td>
                    <td className="text-right">{Math.round(product.revenue / product.quantity).toLocaleString('fr-GA')} XAF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderCustomersAnalytics = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        {/* Customer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h4 className="text-white font-medium mb-2">Taux de conversion</h4>
            <p className="text-2xl font-bold text-green-400">{reportData.conversionRate}%</p>
            <p className="text-gray-400 text-sm">Visiteurs → Clients</p>
          </div>
          
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h4 className="text-white font-medium mb-2">Valeur moyenne</h4>
            <p className="text-2xl font-bold text-blue-400">{reportData.averageTransactionValue.toLocaleString('fr-GA')} XAF</p>
            <p className="text-gray-400 text-sm">Par transaction</p>
          </div>
          
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h4 className="text-white font-medium mb-2">Croissance clients</h4>
            <p className="text-2xl font-bold text-purple-400">+{reportData.customerGrowthRate}%</p>
            <p className="text-gray-400 text-sm">Ce mois</p>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top clients</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-2">Client</th>
                  <th className="text-right py-2">Revenu</th>
                  <th className="text-right py-2">Commandes</th>
                  <th className="text-right py-2">Panier moyen</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topCustomers.map((customer, index) => (
                  <tr key={index} className="border-b border-white/10">
                    <td className="py-2">{customer.name}</td>
                    <td className="text-right">{customer.revenue.toLocaleString('fr-GA')} XAF</td>
                    <td className="text-right">{customer.orders}</td>
                    <td className="text-right">{Math.round(customer.revenue / customer.orders).toLocaleString('fr-GA')} XAF</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderAdvancedAnalytics = () => {
    if (!reportData) return null

    const radarData = [
      { subject: 'Croissance', A: reportData.performanceMetrics.revenueGrowth, fullMark: 100 },
      { subject: 'Contrôle dépenses', A: reportData.performanceMetrics.expenseControl, fullMark: 100 },
      { subject: 'Rotation stock', A: reportData.performanceMetrics.inventoryTurnover * 10, fullMark: 100 },
      { subject: 'Rétention clients', A: reportData.performanceMetrics.customerRetention, fullMark: 100 }
    ]

    return (
      <div className="space-y-6">
        {/* Performance Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance globale</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#374151" />
                <Radar name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Metrics */}
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Métriques clés</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Croissance revenus</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${reportData.performanceMetrics.revenueGrowth}%` }}
                    />
                  </div>
                  <span className="text-green-400 font-medium">{reportData.performanceMetrics.revenueGrowth}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Contrôle dépenses</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${reportData.performanceMetrics.expenseControl}%` }}
                    />
                  </div>
                  <span className="text-blue-400 font-medium">{reportData.performanceMetrics.expenseControl}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rotation stock</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${reportData.performanceMetrics.inventoryTurnover * 10}%` }}
                    />
                  </div>
                  <span className="text-purple-400 font-medium">{reportData.performanceMetrics.inventoryTurnover}x</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rétention clients</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${reportData.performanceMetrics.customerRetention}%` }}
                    />
                  </div>
                  <span className="text-orange-400 font-medium">{reportData.performanceMetrics.customerRetention}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAdvancedReports = () => {
    if (!reportData) return null

    return (
      <div className="space-y-6">
        {/* Comprehensive Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Analyse comparative</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-black/40 border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Distribution des revenus</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.categorySales}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reportData.categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Métriques détaillées</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Revenu total</p>
              <p className="text-xl font-bold text-green-400">
                {reportData.monthlyTrend.reduce((sum, item) => sum + item.revenue, 0).toLocaleString('fr-GA')} XAF
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Dépenses totales</p>
              <p className="text-xl font-bold text-red-400">
                {reportData.monthlyTrend.reduce((sum, item) => sum + item.expenses, 0).toLocaleString('fr-GA')} XAF
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Bénéfice net</p>
              <p className="text-xl font-bold text-blue-400">
                {reportData.monthlyTrend.reduce((sum, item) => sum + item.profit, 0).toLocaleString('fr-GA')} XAF
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Marge moyenne</p>
              <p className="text-xl font-bold text-orange-400">
                {(reportData.monthlyTrend.reduce((sum, item) => sum + item.profit, 0) / 
                  reportData.monthlyTrend.reduce((sum, item) => sum + item.revenue, 0) * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des rapports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-400 font-serif">Rapports unifiés</h1>
            <p className="text-gray-400">Analyse complète et rapports détaillés</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          
          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-white/20">
        {reportViews.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={`px-4 py-2 font-medium transition-colors flex items-center space-x-2 ${
              activeView === view.id
                ? `${view.color} border-b-2 border-current`
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <view.icon className="h-4 w-4" />
            <span>{view.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'sales' && renderSalesAnalytics()}
        {activeView === 'products' && renderProductsAnalytics()}
        {activeView === 'customers' && renderCustomersAnalytics()}
        {activeView === 'analytics' && renderAdvancedAnalytics()}
        {activeView === 'advanced' && renderAdvancedReports()}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10000">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Exporter le rapport</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('pdf')}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Exporter en PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Exporter en Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Exporter en CSV
              </button>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Composants partagés */}
      <ConfirmDialogComponent />
      <NotificationComponent />
    </div>
  )
}
