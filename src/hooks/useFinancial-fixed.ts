'use client'

import { useState, useCallback } from 'react'
import { 
  FinancialState, 
  UseFinancialReturn, 
  BudgetLine, 
  FinancialTransaction, 
  FinancialMetrics, 
  FinancialReport 
} from '@/types/financial'
import { useTenantData } from '@/hooks/useCachedData'

export function useFinancial(): UseFinancialReturn {
  // État local pour les opérations qui modifient les données
  const [localState, setLocalState] = useState<FinancialState>({
    budgetLines: [],
    transactions: [],
    metrics: null,
    reports: [],
    loading: false,
    error: null
  })

  // Fonctions pour récupérer les données financières
  const fetchBudgetLines = async () => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token non trouvé')
    
    const response = await fetch('/api/financial/budget-lines', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.budgetLines || []
  }

  const fetchTransactions = async () => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token non trouvé')
    
    const response = await fetch('/api/financial/transactions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.transactions || []
  }

  const fetchMetrics = async () => {
    const token = localStorage.getItem('token')
    if (!token) throw new Error('Token non trouvé')
    
    const response = await fetch('/api/financial/metrics', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.metrics || null
  }

  // Utiliser le cache pour chaque type de données avec des TTL différents
  const budgetLinesResult = useTenantData('budget-lines', fetchBudgetLines, { 
    ttl: 600000 // 10 minutes pour les données budget
  })
  
  const transactionsResult = useTenantData('transactions', fetchTransactions, { 
    ttl: 300000 // 5 minutes pour les transactions
  })
  
  const metricsResult = useTenantData('metrics', fetchMetrics, { 
    ttl: 120000 // 2 minutes pour les métriques
  })

  // État combiné
  const state: FinancialState = {
    budgetLines: budgetLinesResult.data || localState.budgetLines,
    transactions: transactionsResult.data || localState.transactions,
    metrics: metricsResult.data || localState.metrics,
    reports: localState.reports,
    loading: budgetLinesResult.loading || transactionsResult.loading || metricsResult.loading || localState.loading,
    error: budgetLinesResult.error || transactionsResult.error || metricsResult.error || localState.error
  }

  const calculateMetrics = useCallback((
    budgetLines: BudgetLine[] = state.budgetLines,
    transactions: FinancialTransaction[] = state.transactions
  ): FinancialMetrics => {
    const totalRevenue = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    const availableCash = budgetLines.reduce((sum, line) => sum + line.currentAmount, 0)
    const totalBudgetAllocated = budgetLines.reduce((sum, line) => sum + line.initialAmount, 0)
    const totalBudgetUsed = totalBudgetAllocated - availableCash

    const initialInvestment = budgetLines
      .filter(line => line.type === 'funds' || line.type === 'investment')
      .reduce((sum, line) => sum + line.initialAmount, 0)

    const roi = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0

    // KPIs avancés
    const days = 30 // Période d'analyse
    const averageDailyRevenue = totalRevenue / days
    const averageDailyExpenses = totalExpenses / days
    const cashBurnRate = totalExpenses / days
    const runway = availableCash > 0 ? availableCash / cashBurnRate : 0

    const totalDebt = budgetLines
      .filter(line => line.type === 'loan')
      .reduce((sum, line) => sum + line.currentAmount, 0)

    const debtToEquityRatio = initialInvestment > 0 ? totalDebt / initialInvestment : 0

    // Calcul du point mort (simplifié)
    const totalFixedCosts = transactions
      .filter(t => t.type === 'expense' && (t.category === 'rent' || t.category === 'salary'))
      .reduce((sum, t) => sum + t.amount, 0)

    const variableCostRatio = totalRevenue > 0 ? 
      ((totalExpenses - totalFixedCosts) / totalRevenue) * 100 : 50

    const breakEvenPoint = averageDailyExpenses > 0 ? 
      totalFixedCosts / (1 - (variableCostRatio / 100)) : 0

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      availableCash,
      totalBudgetAllocated,
      totalBudgetUsed,
      roi,
      breakEvenPoint,
      averageDailyRevenue,
      averageDailyExpenses,
      cashBurnRate,
      runway,
      debtToEquityRatio
    }
  }, [state.budgetLines, state.transactions])

  // Actions
  const createBudgetLine = useCallback(async (line: Omit<BudgetLine, 'id' | 'createdAt'>) => {
    try {
      const newBudgetLine: BudgetLine = {
        ...line,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      }

      setLocalState(prev => ({
        ...prev,
        budgetLines: [...prev.budgetLines, newBudgetLine]
      }))

      // Recalculer les métriques
      setLocalState(prev => ({
        ...prev,
        metrics: calculateMetrics([...prev.budgetLines, newBudgetLine], prev.transactions)
      }))
    } catch (error) {
      console.error('Erreur lors de la création de la ligne budgétaire:', error)
      setLocalState(prev => ({ ...prev, error: 'Erreur lors de la création de la ligne budgétaire' }))
    }
  }, [calculateMetrics])

  const updateBudgetLine = useCallback(async (id: string, updates: Partial<BudgetLine>) => {
    try {
      setLocalState(prev => ({
        ...prev,
        budgetLines: prev.budgetLines.map(line => 
          line.id === id ? { ...line, ...updates } : line
        )
      }))
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la ligne budgétaire:', error)
      setLocalState(prev => ({ ...prev, error: 'Erreur lors de la mise à jour de la ligne budgétaire' }))
    }
  }, [])

  const deleteBudgetLine = useCallback(async (id: string) => {
    try {
      setLocalState(prev => ({
        ...prev,
        budgetLines: prev.budgetLines.filter(line => line.id !== id)
      }))
    } catch (error) {
      console.error('Erreur lors de la suppression de la ligne budgétaire:', error)
      setLocalState(prev => ({ ...prev, error: 'Erreur lors de la suppression de la ligne budgétaire' }))
    }
  }, [])

  const addTransaction = useCallback(async (transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token non trouvé')
      }

      const newTransaction: FinancialTransaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Appeler l'API pour persister la transaction
      const response = await fetch('/api/financial/transactions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTransaction)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la transaction')
      }

      setLocalState(prev => ({
        ...prev,
        transactions: [...prev.transactions, newTransaction]
      }))

      // Mettre à jour le montant de la ligne budgétaire si nécessaire
      if (transaction.source.budgetLineId) {
        const budgetLine = state.budgetLines.find(line => line.id === transaction.source.budgetLineId)
        if (budgetLine && transaction.type === 'expense') {
          const updatedAmount = budgetLine.currentAmount - transaction.amount
          updateBudgetLine(budgetLine.id, { currentAmount: Math.max(0, updatedAmount) })
        }
      }

      // Recalculer les métriques
      setLocalState(prev => ({
        ...prev,
        metrics: calculateMetrics(prev.budgetLines, [...prev.transactions, newTransaction])
      }))
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error)
      setLocalState(prev => ({ ...prev, error: 'Erreur lors de l\'ajout de la transaction' }))
    }
  }, [state.budgetLines, calculateMetrics, updateBudgetLine])

  const updateTransaction = useCallback(async (id: string, updates: Partial<FinancialTransaction>) => {
    try {
      setLocalState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        )
      }))
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction:', error)
      setLocalState(prev => ({ ...prev, error: 'Erreur lors de la mise à jour de la transaction' }))
    }
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setLocalState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }))
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction:', error)
      setLocalState(prev => ({ ...prev, error: 'Erreur lors de la suppression de la transaction' }))
    }
  }, [])

  const generateReport = useCallback(async (type: FinancialReport['type'], period: { start: string; end: string }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token non trouvé')
      }

      const periodTransactions = state.transactions.filter(t => 
        t.date >= period.start && t.date <= period.end
      )

      const report: FinancialReport = {
        id: Date.now().toString(),
        title: `Rapport ${type}`,
        type,
        period,
        metrics: calculateMetrics(state.budgetLines, periodTransactions),
        transactions: periodTransactions,
        insights: {
          profitability: 'Analyse en cours...',
          cashFlow: 'Analyse en cours...',
          recommendations: [],
          risks: [],
          opportunities: []
        },
        createdAt: new Date().toISOString()
      }

      // Appeler l'API pour persister le rapport
      const response = await fetch('/api/financial/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(report)
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du rapport')
      }

      setLocalState(prev => ({
        ...prev,
        reports: [...prev.reports, report]
      }))
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error)
      setLocalState(prev => ({ ...prev, error: 'Erreur lors de la génération du rapport' }))
    }
  }, [state.transactions, state.budgetLines, calculateMetrics])

  const getBudgetLineById = useCallback((id: string): BudgetLine | undefined => {
    return state.budgetLines.find(line => line.id === id)
  }, [state.budgetLines])

  const getTransactionsByBudgetLine = useCallback((budgetLineId: string): FinancialTransaction[] => {
    return state.transactions.filter(t => t.source.budgetLineId === budgetLineId)
  }, [state.transactions])

  // Vérifier si les données ont été réinitialisées
  const isReset = typeof window !== 'undefined' ? localStorage.getItem('smartmanager-reset') : null
  if (isReset === 'true') {
    console.log('Données réinitialisées - utilisation de données vides')
    localStorage.removeItem('smartmanager-reset')
    return {
      state: {
        budgetLines: [],
        transactions: [],
        metrics: null,
        reports: [],
        loading: false,
        error: null
      },
      actions: {
        createBudgetLine,
        updateBudgetLine,
        deleteBudgetLine,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        generateReport,
        calculateMetrics: () => setLocalState(prev => ({ ...prev, metrics: calculateMetrics(prev.budgetLines, prev.transactions) })),
        getBudgetLineById,
        getTransactionsByBudgetLine
      }
    }
  }

  return {
    state,
    actions: {
      createBudgetLine,
      updateBudgetLine,
      deleteBudgetLine,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      generateReport,
      calculateMetrics: () => setLocalState(prev => ({ ...prev, metrics: calculateMetrics(state.budgetLines, state.transactions) })),
      getBudgetLineById,
      getTransactionsByBudgetLine
    }
  }
}
