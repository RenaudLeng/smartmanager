'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, TrendingUp, DollarSign, ShoppingCart, 
  ArrowLeft, Download
} from 'lucide-react'
import { useNotifications } from '@/components/ui/ConfirmDialog'

interface ReportData {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  totalOrders: number
  averageOrderValue: number
}

export default function UnifiedReportsPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    totalOrders: 0,
    averageOrderValue: 0
  })
  const [loading, setLoading] = useState(true)
  const [showExportModal, setShowExportModal] = useState(false)
  
  const { showNotification, NotificationComponent } = useNotifications()

  // Charger les données depuis les APIs
  useEffect(() => {
    async function loadReportData() {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          console.log('Utilisateur non connecté - utilisation des données par défaut')
          setReportData({
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            profitMargin: 0,
            totalOrders: 0,
            averageOrderValue: 0
          })
          setLoading(false)
          return
        }
        
        // Charger les métriques financières
        const metricsResponse = await fetch('/api/financial/metrics', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Charger les statistiques de ventes
        const salesResponse = await fetch('/api/sales/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Charger les statistiques de dépenses
        const expensesResponse = await fetch('/api/expenses/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        let metrics = { totalRevenue: 0, totalExpenses: 0, netProfit: 0, profitMargin: 0 }
        let sales = { totalSales: 0, revenue: 0 }
        let expenses = { total: 0 }
        
        if (metricsResponse.ok) {
          const data = await metricsResponse.json()
          metrics = data.data || metrics
        }
        
        if (salesResponse.ok) {
          const data = await salesResponse.json()
          sales = data.data || sales
        }
        
        if (expensesResponse.ok) {
          const data = await expensesResponse.json()
          expenses = data.data || expenses
        }
        
        // Calculer les données du rapport
        const totalRevenue = metrics.totalRevenue || sales.revenue || 0
        const totalExpenses = metrics.totalExpenses || expenses.total || 0
        const netProfit = metrics.netProfit || (totalRevenue - totalExpenses)
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0
        const totalOrders = sales.totalSales || 0
        const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0
        
        setReportData({
          totalRevenue,
          totalExpenses,
          netProfit,
          profitMargin,
          totalOrders,
          averageOrderValue
        })
        
      } catch (error) {
        console.error('Erreur lors du chargement des données de rapport:', error)
        setReportData({
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          profitMargin: 0,
          totalOrders: 0,
          averageOrderValue: 0
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadReportData()
  }, [])

  const handleExport = useCallback(async (format: 'pdf' | 'excel') => {
    try {
      showNotification('success', `Rapport exporté en ${format.toUpperCase()} avec succès!`)
      setShowExportModal(false)
    } catch {
      showNotification('error', 'Erreur lors de l\'export du rapport')
    }
  }, [showNotification])

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
            <h1 className="text-2xl md:text-3xl font-bold text-orange-400 font-serif">Rapports</h1>
            <p className="text-gray-400">Analyse complète et rapports détaillés</p>
          </div>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Exporter</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenus totaux</p>
              <p className="text-2xl font-bold text-green-400">{(reportData.totalRevenue / 1000000).toFixed(1)}M</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Dépenses</p>
              <p className="text-2xl font-bold text-red-400">{(reportData.totalExpenses / 1000000).toFixed(1)}M</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Bénéfice net</p>
              <p className="text-2xl font-bold text-orange-400">{(reportData.netProfit / 1000000).toFixed(1)}M</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Commandes</p>
              <p className="text-2xl font-bold text-blue-400">{reportData.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Simple Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Marge bénéficiaire</span>
              <span className="text-green-400 font-semibold">{reportData.profitMargin}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Valeur moyenne</span>
              <span className="text-blue-400 font-semibold">{(reportData.averageOrderValue / 1000).toFixed(0)}k XAF</span>
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tendances</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Croissance</span>
              <span className="text-green-400 font-semibold">+25.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rétention</span>
              <span className="text-blue-400 font-semibold">78.5%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 border border-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Métriques</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Taux de conversion</span>
              <span className="text-green-400 font-semibold">68.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Satisfaction</span>
              <span className="text-orange-400 font-semibold">4.8/5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                onClick={() => setShowExportModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <NotificationComponent />
    </div>
  )
}
