'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Download, Filter, ArrowLeft } from 'lucide-react'

interface ReportData {
  dailySales: Array<{ date: string; sales: number; profit: number }>
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  categorySales: Array<{ category: string; value: number; color: string }>
  monthlyTrend: Array<{ month: string; revenue: number; expenses: number; profit: number }>
}

export default function RapportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  useEffect(() => {
    setTimeout(() => {
      const mockData: ReportData = {
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
        ]
      }
      setReportData(mockData)
      setLoading(false)
    }, 100)
  }, [])

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white mt-4">Chargement des rapports...</p>
          </div>
        </div>
    )
  }

  if (!reportData) return null

  const totalRevenue = reportData.dailySales.reduce((sum, day) => sum + day.sales, 0)
  const totalProfit = reportData.dailySales.reduce((sum, day) => sum + day.profit, 0)
  const avgDailySales = totalRevenue / reportData.dailySales.length
  const growthRate = 15.3

  return (
      <div className="p-4">
        {/* Header Mobile-First */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Rapports et Analyses</h1>
          <p className="text-gray-400 text-sm md:text-base">Analyses avancées et rapports de performance</p>
        </div>

        {/* Period Selector - Mobile First */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['day', 'week', 'month', 'year'].map(period => (
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
                {period === 'day' ? "Aujourd'hui" : 
               period === 'week' ? 'Semaine' : 
               period === 'month' ? 'Mois' : 'Année'}
              </span>
            </button>
          ))}
        </div>

        {/* KPI Cards - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-400" />
              <span className="text-xs text-green-400 font-medium">+{growthRate}%</span>
            </div>
            <p className="text-2xl font-bold text-white">{(totalRevenue / 1000).toFixed(0)}k XAF</p>
            <p className="text-gray-400 text-sm">Revenus totaux</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-orange-400" />
              <span className="text-xs text-orange-400 font-medium">+12.5%</span>
            </div>
            <p className="text-2xl font-bold text-white">{(totalProfit / 1000).toFixed(0)}k XAF</p>
            <p className="text-gray-400 text-sm">Bénéfices</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <ShoppingCart className="h-8 w-8 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">+8.2%</span>
            </div>
            <p className="text-2xl font-bold text-white">{(avgDailySales / 1000).toFixed(0)}k XAF</p>
            <p className="text-gray-400 text-sm">Moy. ventes/jour</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-yellow-400" />
              <span className="text-xs text-yellow-400 font-medium">+5.7%</span>
            </div>
            <p className="text-2xl font-bold text-white">1,247</p>
            <p className="text-gray-400 text-sm">Transactions</p>
          </div>
        </div>

        {/* Charts Grid - Mobile First */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Sales Chart */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Ventes quotidiennes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="sales" fill="#10b981" name="Ventes" />
                <Bar dataKey="profit" fill="#f97316" name="Bénéfices" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Sales Pie Chart */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Ventes par catégorie</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.categorySales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, value }) => `${payload.name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.categorySales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-linear-to-br from-yellow-900/20 to-amber-800/10 border border-yellow-700/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Tendance mensuelle</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenus" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Dépenses" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Bénéfices" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products Table */}
        <div className="bg-linear-to-br from-yellow-900/20 to-amber-800/10 border border-yellow-700/30 rounded-lg p-4 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Produits les plus vendus</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-slate-400">Produit</th>
                  <th className="text-right py-3 px-4 text-slate-400">Quantité</th>
                  <th className="text-right py-3 px-4 text-slate-400">Revenus</th>
                  <th className="text-right py-3 px-4 text-slate-400">%</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topProducts.map((product, index) => (
                  <tr key={product.name} className="border-b border-slate-700">
                    <td className="py-3 px-4 text-white">{product.name}</td>
                    <td className="text-right py-3 px-4 text-slate-300">{product.quantity}</td>
                    <td className="text-right py-3 px-4 text-green-400">{(product.revenue / 1000).toFixed(0)}k XAF</td>
                    <td className="text-right py-3 px-4 text-slate-300">
                      {((product.revenue / totalRevenue) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Back Button */}
        <div className="lg:hidden mt-6">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
        </div>
      </div>
  )
}
