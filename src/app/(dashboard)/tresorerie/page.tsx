'use client'

import { useState } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  FileText, 
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Building,
  Target
} from 'lucide-react'
import { useFinancial } from '@/hooks/useFinancial'
import { BudgetLineManager } from '@/components/Financial/BudgetLineManager'
import { CashFlowTracker } from '@/components/Financial/CashFlowTracker'
import { FinancialAnalysis } from '@/components/Financial/FinancialAnalysis'
import { ReportsManager } from '@/components/Financial/ReportsManager'

type TabType = 'overview' | 'budget' | 'cashflow' | 'analysis' | 'reports'

export default function TresoreriePage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const { state: financialState } = useFinancial()

  const tabs = [
    { 
      id: 'overview' as TabType, 
      label: 'Aperçu', 
      icon: Wallet,
      description: 'Vue globale de votre trésorerie'
    },
    { 
      id: 'budget' as TabType, 
      label: 'Budget', 
      icon: Building,
      description: 'Gestion des lignes budgétaires'
    },
    { 
      id: 'cashflow' as TabType, 
      label: 'Flux', 
      icon: TrendingUp,
      description: 'Suivi des transactions'
    },
    { 
      id: 'analysis' as TabType, 
      label: 'Analyse', 
      icon: PieChart,
      description: 'Analyses financières'
    },
    { 
      id: 'reports' as TabType, 
      label: 'Rapports', 
      icon: FileText,
      description: 'Rapports détaillés'
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GA', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const renderOverview = () => {
    if (!financialState.metrics) return null

    const { metrics } = financialState

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-linear-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">Trésorerie disponible</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.availableCash)}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-linear-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm">Revenus totaux</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-linear-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">Dépenses totales</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalExpenses)}</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-linear-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm">Bénéfice net</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.netProfit)}</p>
                <p className="text-xs text-orange-300">{metrics.profitMargin.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Financial Health Indicators */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Indicateurs de santé financière</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">ROI</span>
                <span className={`text-sm font-medium ${metrics.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metrics.roi.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.roi >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(metrics.roi), 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Ratio Dette/Équité</span>
                <span className={`text-sm font-medium ${metrics.debtToEquityRatio <= 1 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {metrics.debtToEquityRatio.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.debtToEquityRatio <= 1 ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${Math.min(metrics.debtToEquityRatio * 50, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Runway (jours)</span>
                <span className={`text-sm font-medium ${metrics.runway >= 30 ? 'text-green-400' : metrics.runway >= 7 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(metrics.runway)}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${metrics.runway >= 30 ? 'bg-green-500' : metrics.runway >= 7 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min((metrics.runway / 90) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Transactions récentes</h3>
            <button className="text-orange-400 hover:text-orange-300 text-sm font-medium">
              Voir tout
            </button>
          </div>
          <div className="space-y-3">
            {financialState.transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {transaction.type === 'income' ? 
                      <ArrowUpRight className="h-5 w-5 text-green-400" /> :
                      <ArrowDownRight className="h-5 w-5 text-red-400" />
                    }
                  </div>
                  <div>
                    <p className="text-white font-medium">{transaction.description}</p>
                    <p className="text-gray-400 text-sm">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-gray-400 text-xs">{transaction.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-colors">
            <Plus className="h-6 w-6 text-orange-400 mb-2" />
            <h4 className="text-white font-medium">Ajouter une transaction</h4>
            <p className="text-gray-400 text-sm">Enregistrer revenu ou dépense</p>
          </button>

          <button className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-colors">
            <Building className="h-6 w-6 text-orange-400 mb-2" />
            <h4 className="text-white font-medium">Créer une ligne budgétaire</h4>
            <p className="text-gray-400 text-sm">Ajouter fonds ou prêt</p>
          </button>

          <button className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-colors">
            <FileText className="h-6 w-6 text-orange-400 mb-2" />
            <h4 className="text-white font-medium">Générer un rapport</h4>
            <p className="text-gray-400 text-sm">Analyse périodique</p>
          </button>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'budget':
        return <BudgetLineManager />
      case 'cashflow':
        return <CashFlowTracker />
      case 'analysis':
        return <FinancialAnalysis />
      case 'reports':
        return <ReportsManager />
      default:
        return renderOverview()
    }
  }

  if (financialState.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Chargement des données financières...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trésorerie</h1>
          <p className="text-gray-400">Gestion financière complète de votre entreprise</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/10">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}
