'use client'

import { useState, useEffect } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Target, 
  Clock,
  DollarSign
} from 'lucide-react'
import { useFinancial } from '@/hooks/useFinancial'

interface FinancialMetrics {
  cashAvailable: number
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  roi: number
  runway: number
  dailyAvgRevenue: number
  dailyAvgExpenses: number
  cashBurnRate: number
}

export default function TresoreriePage() {
  const { state, actions } = useFinancial()
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    cashAvailable: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    roi: 0,
    runway: 0,
    dailyAvgRevenue: 0,
    dailyAvgExpenses: 0,
    cashBurnRate: 0
  })
  const [loading, setLoading] = useState(true)

  // États pour les modaux
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  // État du formulaire de transaction
  const [transactionForm, setTransactionForm] = useState({
    type: 'revenue' as 'revenue' | 'expense',
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    source: {
      type: 'cash' as 'cash' | 'bank' | 'mobile',
      budgetLineId: ''
    }
  })

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (!transactionForm.amount || !transactionForm.description) {
        alert('Veuillez remplir tous les champs obligatoires')
        return
      }

      const transaction = {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount),
        description: transactionForm.description,
        category: transactionForm.category || 'Général',
        date: transactionForm.date,
        source: transactionForm.source,
        currency: 'XAF'
      }

      await actions.addTransaction(transaction)
      
      // Réinitialiser le formulaire et fermer le modal
      setTransactionForm({
        type: 'revenue',
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        source: {
          type: 'cash',
          budgetLineId: ''
        }
      })
      setShowTransactionModal(false)
      
      alert('Transaction ajoutée avec succès!')
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error)
      alert('Erreur lors de l\'ajout de la transaction')
    }
  }

  useEffect(() => {
    loadFinancialMetrics()
  }, [])

  const loadFinancialMetrics = async () => {
    try {
      const token = localStorage.getItem('token')
      const resetFlag = localStorage.getItem('smartmanager-reset')

      const response = await fetch('/api/financial/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-reset-flag': resetFlag || 'false'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setMetrics(result.data || {
          cashAvailable: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          roi: 0,
          runway: 0,
          dailyAvgRevenue: 0,
          dailyAvgExpenses: 0,
          cashBurnRate: 0
        })
      } else {
        console.error('Failed to load financial metrics')
        setMetrics({
          cashAvailable: 0,
          totalRevenue: 0,
          totalExpenses: 0,
          netProfit: 0,
          roi: 0,
          runway: 0,
          dailyAvgRevenue: 0,
          dailyAvgExpenses: 0,
          cashBurnRate: 0
        })
      }
    } catch (error) {
      console.error('Error loading financial metrics:', error)
      setMetrics({
        cashAvailable: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        roi: 0,
        runway: 0,
        dailyAvgRevenue: 0,
        dailyAvgExpenses: 0,
        cashBurnRate: 0
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Trésorerie</h1>
        <p className="text-gray-400 text-sm md:text-base">Gestion financière et suivi de trésorerie</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-1 overflow-x-auto">
        {['overview', 'budget', 'cashflow', 'analysis', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'overview' ? 'Aperçu' : 
             tab === 'budget' ? 'Budget' :
             tab === 'cashflow' ? 'Flux' :
             tab === 'analysis' ? 'Analyse' : 'Rapports'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des métriques financières...</p>
          </div>
        ) : activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {metrics.cashAvailable > 0 ? `${(metrics.cashAvailable / 1000).toFixed(0)}k` : '0k'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Trésorerie disponible</p>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {metrics.totalRevenue > 0 ? `${(metrics.totalRevenue / 1000000).toFixed(1)}M` : '0M'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Revenus totaux</p>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {metrics.roi > 0 ? `${metrics.roi}%` : '0%'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">ROI</p>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {metrics.runway > 0 ? `${metrics.runway}j` : '0j'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Runway</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Résumé financier</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Revenus totaux</span>
                    <span className="text-green-400 font-medium">
                      {metrics.totalRevenue > 0 ? `${metrics.totalRevenue.toLocaleString('fr-GA')} XAF` : '0 XAF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Dépenses totales</span>
                    <span className="text-red-400 font-medium">
                      {metrics.totalExpenses > 0 ? `${metrics.totalExpenses.toLocaleString('fr-GA')} XAF` : '0 XAF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-white font-medium">Bénéfice net</span>
                    <span className="text-green-400 font-bold">
                      {metrics.netProfit > 0 ? `${metrics.netProfit.toLocaleString('fr-GA')} XAF` : '0 XAF'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">KPIs quotidiens</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Revenu moyen/jour</span>
                    <span className="text-blue-400 font-medium">
                      {metrics.dailyAvgRevenue > 0 ? `${metrics.dailyAvgRevenue.toLocaleString('fr-GA')} XAF` : '0 XAF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Dépense moyenne/jour</span>
                    <span className="text-orange-400 font-medium">
                      {metrics.dailyAvgExpenses > 0 ? `${metrics.dailyAvgExpenses.toLocaleString('fr-GA')} XAF` : '0 XAF'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Cash burn rate</span>
                    <span className="text-red-400 font-medium">
                      {metrics.cashBurnRate > 0 ? `${metrics.cashBurnRate.toLocaleString('fr-GA')} XAF` : '0 XAF'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setShowTransactionModal(true)}
                className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-colors"
              >
                <div className="text-orange-400 text-2xl mb-2">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h4 className="text-white font-medium">Ajouter une transaction</h4>
                <p className="text-gray-400 text-sm">Enregistrer revenu ou dépense</p>
              </button>

              <button 
                onClick={() => setShowBudgetModal(true)}
                className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-colors"
              >
                <div className="text-orange-400 text-2xl mb-2">
                  <PieChart className="h-6 w-6" />
                </div>
                <h4 className="text-white font-medium">Créer une ligne budgétaire</h4>
                <p className="text-gray-400 text-sm">Ajouter fonds ou prêt</p>
              </button>

              <button 
                onClick={() => setShowReportModal(true)}
                className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-colors"
              >
                <div className="text-orange-400 text-2xl mb-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h4 className="text-white font-medium">Générer un rapport</h4>
                <p className="text-gray-400 text-sm">Analyse périodique</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <PieChart className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aperçu non disponible</h3>
            <p className="text-gray-400">Veuillez sélectionner un autre onglet</p>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <PieChart className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Gestion budgétaire</h3>
            <p className="text-gray-400">Module de gestion des lignes budgétaires en cours de développement</p>
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <TrendingUp className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Suivi des flux</h3>
            <p className="text-gray-400">Module de suivi des transactions en cours de développement</p>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <Target className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Analyse financière</h3>
            <p className="text-gray-400">Module d&apos;analyse financière en cours de développement</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <DollarSign className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Rapports financiers</h3>
            <p className="text-gray-400">Module de génération de rapports en cours de développement</p>
          </div>
        )}
      </div>

      {/* Modal Transaction */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-9999">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-2xl relative">
            <h3 className="text-xl font-bold text-white mb-6">Ajouter une transaction</h3>
            
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type de transaction</label>
                  <select
                    value={transactionForm.type}
                    onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'revenue' | 'expense' })}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="revenue">Revenu</option>
                    <option value="expense">Dépense</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Montant (XAF)</label>
                  <input
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    placeholder="Description de la transaction"
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                  <input
                    type="text"
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                    placeholder="Général"
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                  <select
                    value={transactionForm.source.type}
                    onChange={(e) => setTransactionForm({ 
                      ...transactionForm, 
                      source: { ...transactionForm.source, type: e.target.value as 'cash' | 'bank' | 'mobile' }
                    })}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="cash">Espèces</option>
                    <option value="bank">Banque</option>
                    <option value="mobile">Mobile Money</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  Ajouter la transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Budget */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-bold text-white mb-6">Créer une ligne budgétaire</h3>
            <p className="text-gray-400 mb-4">Module de budget en cours de développement</p>
            <button
              onClick={() => setShowBudgetModal(false)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Modal Report */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md relative">
            <h3 className="text-xl font-bold text-white mb-6">Générer un rapport</h3>
            <p className="text-gray-400 mb-4">Module de rapport en cours de développement</p>
            <button
              onClick={() => setShowReportModal(false)}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
