'use client'

import { useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target, 
  DollarSign, 
  Activity,
  PieChart,
  BarChart3,
  Lightbulb,
  Shield
} from 'lucide-react'
import { useFinancial } from '@/hooks/useFinancial'

export function FinancialAnalysis() {
  const { state } = useFinancial()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GA', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const analysis = useMemo(() => {
    if (!state.metrics) return null

    const { metrics, transactions, budgetLines } = state

    // Analyse des tendances
    const recentTransactions = transactions.slice(-30)
    const lastWeekTransactions = recentTransactions.slice(-7)
    const thisWeekRevenue = lastWeekTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const thisWeekExpenses = lastWeekTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    // Analyse des catégories
    const categoryAnalysis = transactions.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { income: 0, expense: 0, count: 0 }
      }
      if (t.type === 'income') {
        acc[t.category].income += t.amount
      } else {
        acc[t.category].expense += t.amount
      }
      acc[t.category].count += 1
      return acc
    }, {} as Record<string, { income: number; expense: number; count: number }>)

    // Analyse des sources de financement
    const sourceAnalysis = transactions.reduce((acc, t) => {
      const sourceKey = t.source.type
      if (!acc[sourceKey]) {
        acc[sourceKey] = { income: 0, expense: 0, count: 0 }
      }
      if (t.type === 'income') {
        acc[sourceKey].income += t.amount
      } else {
        acc[sourceKey].expense += t.amount
      }
      acc[sourceKey].count += 1
      return acc
    }, {} as Record<string, { income: number; expense: number; count: number }>)

    // Génération des recommandations
    const recommendations = []
    const risks = []
    const opportunities = []

    // Recommandations basées sur les métriques
    if (metrics.profitMargin < 10) {
      recommendations.push('Augmenter les prix ou réduire les coûts pour améliorer la marge bénéficiaire')
    }
    if (metrics.runway < 30) {
      risks.push('Runway faible : moins de 30 jours de trésorerie disponible')
      recommendations.push('Réduire les dépenses ou augmenter les revenus rapidement')
    }
    if (metrics.debtToEquityRatio > 2) {
      risks.push('Ratio dette/équité élevé : considérer la renégociation des prêts')
      recommendations.push('Explorer des options de refinancement à meilleur taux')
    }
    if (metrics.roi > 20) {
      opportunities.push('Excellent ROI : envisager d\'investir davantage')
    }
    if (thisWeekRevenue > thisWeekExpenses * 1.5) {
      opportunities.push('Semaine performante : analyser les facteurs de succès')
    }

    // Top catégories
    const topCategories = Object.entries(categoryAnalysis)
      .sort(([, a], [, b]) => (b.income + b.expense) - (a.income + a.expense))
      .slice(0, 5)

    return {
      thisWeekRevenue,
      thisWeekExpenses,
      categoryAnalysis,
      sourceAnalysis,
      topCategories,
      recommendations,
      risks,
      opportunities
    }
  }, [state])

  if (!state.metrics || !analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Chargement de l'analyse...</div>
      </div>
    )
  }

  const { metrics } = state
  const {
    thisWeekRevenue,
    thisWeekExpenses,
    categoryAnalysis,
    sourceAnalysis,
    topCategories,
    recommendations,
    risks,
    opportunities
  } = analysis

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Analyse financière</h2>
        <p className="text-gray-400">Vue détaillée de la performance de votre entreprise</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm">Performance cette semaine</h3>
            <Activity className="h-5 w-5 text-orange-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Revenus:</span>
              <span className="text-green-400 font-medium">{formatCurrency(thisWeekRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Dépenses:</span>
              <span className="text-red-400 font-medium">{formatCurrency(thisWeekExpenses)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Net:</span>
              <span className={`font-medium ${thisWeekRevenue > thisWeekExpenses ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(thisWeekRevenue - thisWeekExpenses)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm">Rentabilité</h3>
            <Target className="h-5 w-5 text-purple-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Marge:</span>
              <span className={`font-medium ${metrics.profitMargin >= 20 ? 'text-green-400' : metrics.profitMargin >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                {metrics.profitMargin.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">ROI:</span>
              <span className={`font-medium ${metrics.roi >= 15 ? 'text-green-400' : metrics.roi >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                {metrics.roi.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Point mort:</span>
              <span className="text-white font-medium">{formatCurrency(metrics.breakEvenPoint)}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm">Santé financière</h3>
            <Shield className="h-5 w-5 text-blue-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Runway:</span>
              <span className={`font-medium ${metrics.runway >= 90 ? 'text-green-400' : metrics.runway >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
                {Math.round(metrics.runway)} jours
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Dette/Équité:</span>
              <span className={`font-medium ${metrics.debtToEquityRatio <= 1 ? 'text-green-400' : metrics.debtToEquityRatio <= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                {metrics.debtToEquityRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Burn rate:</span>
              <span className="text-white font-medium">{formatCurrency(metrics.cashBurnRate)}/jour</span>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm">Liquidités</h3>
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Disponible:</span>
              <span className="text-green-400 font-medium">{formatCurrency(metrics.availableCash)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Budget utilisé:</span>
              <span className="text-white font-medium">{formatCurrency(metrics.totalBudgetUsed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Total alloué:</span>
              <span className="text-white font-medium">{formatCurrency(metrics.totalBudgetAllocated)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risks */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-400">Risques identifiés</h3>
          </div>
          <div className="space-y-3">
            {risks.length > 0 ? (
              risks.map((risk, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 shrink-0" />
                  <p className="text-gray-300 text-sm">{risk}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Aucun risque critique identifié</p>
            )}
          </div>
        </div>

        {/* Opportunities */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-green-400">Opportunités</h3>
          </div>
          <div className="space-y-3">
            {opportunities.length > 0 ? (
              opportunities.map((opportunity, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0" />
                  <p className="text-gray-300 text-sm">{opportunity}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Continuez à analyser pour identifier des opportunités</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-blue-400">Recommandations</h3>
          </div>
          <div className="space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 shrink-0" />
                  <p className="text-gray-300 text-sm">{recommendation}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">Performance stable, continuez comme ça !</p>
            )}
          </div>
        </div>
      </div>

      {/* Category Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Top catégories</h3>
          </div>
          <div className="space-y-3">
            {topCategories.map(([category, data]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-white font-medium">{category}</span>
                    <span className="text-gray-400 text-sm">{data.count} transactions</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-linear-to-r from-green-500 to-red-500 h-2 rounded-full"
                      style={{ 
                        width: `${(data.income / (data.income + data.expense)) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-green-400 text-xs">{formatCurrency(data.income)}</span>
                    <span className="text-red-400 text-xs">{formatCurrency(data.expense)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Analysis */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="h-5 w-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Sources de financement</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(sourceAnalysis).map(([source, data]) => (
              <div key={source} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium capitalize">
                    {source === 'cash' ? 'Caisse' : source === 'budget_line' ? 'Budget' : source}
                  </p>
                  <p className="text-gray-400 text-sm">{data.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 text-sm">{formatCurrency(data.income)}</p>
                  <p className="text-red-400 text-sm">{formatCurrency(data.expense)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-linear-to-r from-orange-600/20 to-purple-600/20 border border-orange-500/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Synthèse de performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <h4 className="text-white font-medium mb-1">Rentabilité</h4>
            <p className={`text-2xl font-bold ${metrics.profitMargin >= 15 ? 'text-green-400' : metrics.profitMargin >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
              {metrics.profitMargin.toFixed(1)}%
            </p>
            <p className="text-gray-400 text-sm">Marge bénéficiaire</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
            <h4 className="text-white font-medium mb-1">Croissance</h4>
            <p className="text-2xl font-bold text-blue-400">
              {metrics.roi >= 0 ? '+' : ''}{metrics.roi.toFixed(1)}%
            </p>
            <p className="text-gray-400 text-sm">ROI</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <h4 className="text-white font-medium mb-1">Stabilité</h4>
            <p className={`text-2xl font-bold ${metrics.runway >= 60 ? 'text-green-400' : metrics.runway >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>
              {Math.round(metrics.runway)}j
            </p>
            <p className="text-gray-400 text-sm">Runway</p>
          </div>
        </div>
      </div>
    </div>
  )
}
