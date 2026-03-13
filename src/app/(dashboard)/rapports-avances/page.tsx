'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface AnalyticsData {
  monthlyTrend: Array<{ month: string; revenue: number; expenses: number; profit: number }>
  categorySales: Array<{ category: string; value: number; color: string }>
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  customerGrowthRate: number
  salesByDay: Array<{ day: string; sales: number; profit: number }>
  conversionRate: number
  profitMargin: number
  averageTransactionValue: number
}

export default function RapportsAvancesPage() {
  const [reportData, setReportData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showExportModal, setShowExportModal] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      const mockData: AnalyticsData = {
        monthlyTrend: [
          { month: 'Jan', revenue: 1850000, expenses: 1200000, profit: 650000 },
          { month: 'Fev', revenue: 1980000, expenses: 1320000, profit: 660000 },
          { month: 'Mar', revenue: 1920000, expenses: 1450000, profit: 470000 },
          { month: 'Avr', revenue: 2100000, expenses: 1580000, profit: 520000 },
          { month: 'Mai', revenue: 2250000, expenses: 1750000, profit: 500000 },
          { month: 'Jun', revenue: 2150000, expenses: 1900000, profit: 250000 }
        ],
        categorySales: [
          { category: 'Alimentaire', value: 45, color: '#10b981' },
          { category: 'Boissons', value: 25, color: '#3b82f6' },
          { category: 'Hygiène', value: 15, color: '#8b5cf6' },
          { category: 'Boulangerie', value: 10, color: '#f59e0b' },
          { category: 'Autres', value: 5, color: '#6b7280' },
          { category: 'Fournitures', value: 10, color: '#fbbf24' }
        ],
        topProducts: [
          { name: 'Riz gabonais 1kg', quantity: 156, revenue: 234000 },
          { name: 'Huile de palme 1L', quantity: 89, revenue: 222500 },
          { name: 'Farine de manioc 1kg', quantity: 67, revenue: 134000 },
          { name: 'Sucre local 1kg', quantity: 45, revenue: 45000 },
          { name: 'Lait en poudre Nido', quantity: 34, revenue: 8500 }
        ],
        customerGrowthRate: 15.3,
        salesByDay: [
          { day: 'Lun', sales: 85000, profit: 12000 },
          { day: 'Mar', sales: 45000, profit: 15000 },
          { day: 'Mer', sales: 52000, profit: 25000 },
          { day: 'Jeu', sales: 72000, profit: 35000 },
          { day: 'Ven', sales: 95000, profit: 30000 },
          { day: 'Sam', sales: 120000, profit: 40000 },
          { day: 'Dim', sales: 5000, profit: -5000 }
        ],
        conversionRate: 88.2,
        averageTransactionValue: 15000,
        profitMargin: 35.5
      }
      setReportData(mockData)
    }, 1000)
  }, [])

  const filteredData = reportData ? {
    monthlyTrend: reportData.monthlyTrend.filter(item => item.month === selectedPeriod),
    categorySales: reportData.categorySales.filter(item => item.category === selectedPeriod),
    topProducts: reportData.topProducts.filter(item => item.quantity < 20),
    salesByDay: reportData.salesByDay.filter(item => item.day === selectedPeriod)
  } : {}

  const getConversionRate = () => {
    if (!reportData) return 0
    const totalRevenue = reportData.monthlyTrend.reduce((sum, item) => sum + item.revenue, 0)
    const totalExpenses = reportData.monthlyTrend.reduce((sum, item) => sum + item.expenses, 0)
    return totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
  }

  const getProfitMargin = () => {
    if (!reportData) return 0
    const totalProfit = reportData.monthlyTrend.reduce((sum, item) => sum + item.profit, 0)
    const totalRevenue = reportData.monthlyTrend.reduce((sum, item) => sum + item.revenue, 0)
    return totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0
  }

  const handleDownload = () => {
    // Ici vous ajouteriez la logique de téléchargement
    console.log('Téléchargement des rapports:', selectedPeriod)
    setShowExportModal(false)
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-400 mb-2 font-serif">Rapports Analytiques</h1>
                <p className="text-gray-300">Analyses avancées de vos performances commerciales</p>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['week', 'month', 'year'].map(period => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm border ${
              selectedPeriod === period 
                ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white border-orange-400/20' 
                : 'bg-black/40 text-gray-300 hover:bg-white/20 border-white/20 hover:text-orange-400'
            }`}
          >
            <span className={selectedPeriod === period ? 'text-white' : 'text-gray-300'}>
              {period === 'week' ? 'Semaine' : 
               period === 'month' ? 'Mois' : 'Année'}
            </span>
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Taux de conversion</p>
                <p className="text-2xl font-bold text-green-400">{getConversionRate().toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-orange-400" />
            <div>
              <p className="text-gray-400 text-sm">Marge bénéficiaire</p>
              <p className="text-2xl font-bold text-orange-400">{getProfitMargin().toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-gray-400 text-sm">Chiffre d&apos;affaires</p>
                <p className="text-2xl font-bold text-white">{reportData ? (reportData.monthlyTrend.reduce((sum, item) => sum + item.revenue, 0) / 1000).toFixed(1) : '0'}k XAF</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Tendance des ventes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData.salesByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fill="#8884d8"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Sales Pie Chart */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Répartition des ventes par catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={filteredData.categorySales || []}
                cx="50%"
                cy="50%"
                label={({ payload, value }) => `${payload?.category || ''}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {filteredData.categorySales?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Table */}
        <div className="bg-linear-to-br from-yellow-900/20 to-amber-800/10 border border-yellow-700/30 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Produits les plus vendus</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="bg-black/60">
                  <th className="px-4 py-3 text-left text-orange-400">Produit</th>
                  <th className="px-4 py-3 text-left text-orange-400">Quantité</th>
                  <th className="px-4 py-3 text-left text-orange-400">Total ventes</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.topProducts?.map((product, index) => (
                  <tr key={index} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                    <td className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="text-right text-gray-400 text-sm">{product.quantity}</td>
                    <td className="text-right text-green-400 font-medium">
                      {product.revenue.toLocaleString('fr-GA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-white mb-4">
                Exporter les rapports
              </h2>
              <div className="space-y-4">
                <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Format d&apos;export</label>
                  <select
                    value="pdf"
                    onChange={(e) => console.log('Format sélectionné:', e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium shadow-lg shadow-orange-500/25"
                  >
                    Télécharger
                  </button>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
