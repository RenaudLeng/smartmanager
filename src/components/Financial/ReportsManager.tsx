'use client'

import { useState, useCallback } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  Plus, 
  Eye,
  Trash2,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { useFinancial } from '@/hooks/useFinancial'
import { FinancialReport } from '@/types/financial'
import { useNotifications, useConfirmDialog } from '@/components/ui/ConfirmDialog'

export function ReportsManager() {
  const { state, actions } = useFinancial()
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('all')
  
  const { showNotification, NotificationComponent } = useNotifications()
  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  const [generateForm, setGenerateForm] = useState({
    type: 'monthly' as FinancialReport['type'],
    start: '',
    end: ''
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GA', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-GA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Fonction de suppression avec confirmation
  const handleDeleteReport = useCallback(async (report: FinancialReport) => {
    const confirmed = await confirm({
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le rapport "${report.title}" ?`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    })

    if (confirmed) {
      try {
        // Simuler la suppression du rapport
        // await actions.deleteReport(report.id)
        
        // Afficher la notification de succès
        showNotification(`Rapport "${report.title}" supprimé avec succès!`, 'success')

        console.log('Rapport supprimé:', report.id)
      } catch (error) {
        showNotification('Erreur lors de la suppression du rapport. Veuillez réessayer.', 'error')
        console.error('Erreur suppression rapport:', error)
      }
    }
  }, [confirm, showNotification])

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await actions.generateReport(generateForm.type, {
        start: generateForm.start,
        end: generateForm.end
      })
      
      setShowGenerateModal(false)
      setGenerateForm({
        type: 'monthly',
        start: '',
        end: ''
      })
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
    }
  }

  const filteredReports = state.reports.filter(report => 
    filterType === 'all' || report.type === filterType
  )

  const getReportTypeIcon = (type: FinancialReport['type']) => {
    switch (type) {
      case 'daily':
        return <Calendar className="h-4 w-4" />
      case 'weekly':
        return <Calendar className="h-4 w-4" />
      case 'monthly':
        return <Calendar className="h-4 w-4" />
      case 'quarterly':
        return <Calendar className="h-4 w-4" />
      case 'yearly':
        return <Calendar className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getReportTypeLabel = (type: FinancialReport['type']) => {
    switch (type) {
      case 'daily':
        return 'Quotidien'
      case 'weekly':
        return 'Hebdomadaire'
      case 'monthly':
        return 'Mensuel'
      case 'quarterly':
        return 'Trimestriel'
      case 'yearly':
        return 'Annuel'
      default:
        return type
    }
  }

  // Mock reports pour démonstration
  const mockReports: FinancialReport[] = [
    {
      id: '1',
      title: 'Rapport mensuel Mars 2024',
      type: 'monthly',
      period: {
        start: '2024-03-01',
        end: '2024-03-31'
      },
      metrics: {
        totalRevenue: 1500000,
        totalExpenses: 1200000,
        netProfit: 300000,
        profitMargin: 20,
        availableCash: 850000,
        totalBudgetAllocated: 1500000,
        totalBudgetUsed: 650000,
        roi: 25,
        breakEvenPoint: 1000000,
        averageDailyRevenue: 50000,
        averageDailyExpenses: 40000,
        cashBurnRate: 40000,
        runway: 21,
        debtToEquityRatio: 0.5
      },
      transactions: [],
      insights: {
        profitability: 'Bonne performance avec marge de 20%',
        cashFlow: 'Cash flow positif et stable',
        recommendations: ['Continuer la stratégie actuelle', 'Optimiser les coûts fixes'],
        risks: ['Dépendance excessive aux ventes quotidiennes'],
        opportunities: ['Expansion possible avec ROI de 25%']
      },
      createdAt: '2024-04-01T10:00:00Z'
    },
    {
      id: '2',
      title: 'Rapport hebdomadaire Semaine 12',
      type: 'weekly',
      period: {
        start: '2024-03-18',
        end: '2024-03-24'
      },
      metrics: {
        totalRevenue: 375000,
        totalExpenses: 300000,
        netProfit: 75000,
        profitMargin: 20,
        availableCash: 850000,
        totalBudgetAllocated: 1500000,
        totalBudgetUsed: 650000,
        roi: 25,
        breakEvenPoint: 1000000,
        averageDailyRevenue: 53571,
        averageDailyExpenses: 42857,
        cashBurnRate: 42857,
        runway: 20,
        debtToEquityRatio: 0.5
      },
      transactions: [],
      insights: {
        profitability: 'Semaine performante',
        cashFlow: 'Flux de trésorerie positif',
        recommendations: ['Maintenir le rythme actuel'],
        risks: ['Aucun risque majeur identifié'],
        opportunities: ['Potentiel d\'amélioration des ventes']
      },
      createdAt: '2024-03-25T15:00:00Z'
    }
  ]

  const allReports = [...mockReports, ...filteredReports]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Rapports financiers</h2>
          <p className="text-gray-400">Analysez votre performance sur différentes périodes</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Générer un rapport</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Type de rapport</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Tous les rapports</option>
              <option value="daily">Quotidiens</option>
              <option value="weekly">Hebdomadaires</option>
              <option value="monthly">Mensuels</option>
              <option value="quarterly">Trimestriels</option>
              <option value="yearly">Annuels</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allReports.map((report) => (
          <div key={report.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-orange-500 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  {getReportTypeIcon(report.type)}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{report.title}</h3>
                  <p className="text-gray-400 text-sm">{getReportTypeLabel(report.type)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteReport(report)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Supprimer le rapport"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-400">
                <p>Période: {formatDate(report.period.start)} - {formatDate(report.period.end)}</p>
                <p>Créé le: {formatDate(report.createdAt)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-500/10 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="text-green-400 font-semibold">{formatCurrency(report.metrics.totalRevenue)}</p>
                  <p className="text-gray-400 text-xs">Revenus</p>
                </div>
                <div className="text-center p-3 bg-red-500/10 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  </div>
                  <p className="text-red-400 font-semibold">{formatCurrency(report.metrics.totalExpenses)}</p>
                  <p className="text-gray-400 text-xs">Dépenses</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                <div>
                  <p className="text-blue-400 font-semibold">{formatCurrency(report.metrics.netProfit)}</p>
                  <p className="text-gray-400 text-xs">Bénéfice net</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{report.metrics.profitMargin.toFixed(1)}%</p>
                  <p className="text-gray-400 text-xs">Marge</p>
                </div>
              </div>

              <button className="w-full bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-2 text-orange-400 font-medium transition-colors flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Télécharger</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-6">Générer un rapport</h3>

            <form onSubmit={handleGenerateReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type de rapport</label>
                <select
                  value={generateForm.type}
                  onChange={(e) => setGenerateForm({ ...generateForm, type: e.target.value as any })}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                  <option value="quarterly">Trimestriel</option>
                  <option value="yearly">Annuel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date de début</label>
                <input
                  type="date"
                  value={generateForm.start}
                  onChange={(e) => setGenerateForm({ ...generateForm, start: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={generateForm.end}
                  onChange={(e) => setGenerateForm({ ...generateForm, end: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowGenerateModal(false)
                    setGenerateForm({ type: 'monthly', start: '', end: '' })
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Générer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">{selectedReport.title}</h3>
                <p className="text-gray-400">
                  {getReportTypeLabel(selectedReport.type)} - {formatDate(selectedReport.period.start)} au {formatDate(selectedReport.period.end)}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ×
              </button>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-green-400 text-sm">Revenus</p>
                <p className="text-white font-bold">{formatCurrency(selectedReport.metrics.totalRevenue)}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">Dépenses</p>
                <p className="text-white font-bold">{formatCurrency(selectedReport.metrics.totalExpenses)}</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-400 text-sm">Bénéfice</p>
                <p className="text-white font-bold">{formatCurrency(selectedReport.metrics.netProfit)}</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                <p className="text-purple-400 text-sm">Marge</p>
                <p className="text-white font-bold">{selectedReport.metrics.profitMargin.toFixed(1)}%</p>
              </div>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-400 font-semibold mb-3">Recommandations</h4>
                <ul className="space-y-2">
                  {selectedReport.insights.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                      <span className="text-blue-400">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-yellow-400 font-semibold mb-3">Risques identifiés</h4>
                <ul className="space-y-2">
                  {selectedReport.insights.risks.map((risk, index) => (
                    <li key={index} className="text-gray-300 text-sm flex items-start space-x-2">
                      <span className="text-yellow-400">•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Fermer
              </button>
              <button className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Télécharger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Composants partagés */}
      {ConfirmDialogComponent}
      {NotificationComponent}
    </div>
  )
}
