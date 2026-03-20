'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  FinancialState, 
  UseFinancialReturn, 
  BudgetLine, 
  FinancialTransaction, 
  FinancialMetrics, 
  FinancialReport 
} from '@/types/financial'

export function useFinancial(): UseFinancialReturn {
  const [state, setState] = useState<FinancialState>({
    budgetLines: [],
    transactions: [],
    metrics: null,
    reports: [],
    loading: true,
    error: null
  })

  // Load data from API
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem('token')
        
        // Load budget lines
        const budgetResponse = await fetch('/api/financial/budget-lines', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Load transactions
        const transactionsResponse = await fetch('/api/financial/transactions', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Load metrics
        const metricsResponse = await fetch('/api/financial/metrics', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        const [budgetData, transactionsData, metricsData] = await Promise.all([
          budgetResponse.json(),
          transactionsResponse.json(),
          metricsResponse.json()
        ])

        setState({
          budgetLines: budgetData.data || [],
          transactions: transactionsData.data || [],
          metrics: metricsData.data || null,
          reports: [],
          loading: false,
          error: null
        })
      } catch (error) {
        console.error('Erreur lors du chargement des données financières:', error)
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Erreur lors du chargement des données'
        }))
      }
    }

    loadData()
  }, [])

  // Calcul des métriques financières
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

      setState(prev => ({
        ...prev,
        budgetLines: [...prev.budgetLines, newBudgetLine]
      }))

      // Recalculer les métriques
      setState(prev => ({
        ...prev,
        metrics: calculateMetrics([...prev.budgetLines, newBudgetLine], prev.transactions)
      }))
    } catch (error) {
      console.error('Erreur lors de la création de la ligne budgétaire:', error)
      setState(prev => ({ ...prev, error: 'Erreur lors de la création de la ligne budgétaire' }))
    }
  }, [calculateMetrics])

  const updateBudgetLine = useCallback(async (id: string, updates: Partial<BudgetLine>) => {
    try {
      setState(prev => ({
        ...prev,
        budgetLines: prev.budgetLines.map(line => 
          line.id === id ? { ...line, ...updates } : line
        )
      }))
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la ligne budgétaire:', error)
      setState(prev => ({ ...prev, error: 'Erreur lors de la mise à jour de la ligne budgétaire' }))
    }
  }, [])

  const deleteBudgetLine = useCallback(async (id: string) => {
    try {
      setState(prev => ({
        ...prev,
        budgetLines: prev.budgetLines.filter(line => line.id !== id)
      }))
    } catch (error) {
      console.error('Erreur lors de la suppression de la ligne budgétaire:', error)
      setState(prev => ({ ...prev, error: 'Erreur lors de la suppression de la ligne budgétaire' }))
    }
  }, [])

  const addTransaction = useCallback(async (transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTransaction: FinancialTransaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setState(prev => ({
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
      setState(prev => ({
        ...prev,
        metrics: calculateMetrics(prev.budgetLines, [...prev.transactions, newTransaction])
      }))
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error)
      setState(prev => ({ ...prev, error: 'Erreur lors de l\'ajout de la transaction' }))
    }
  }, [state.budgetLines, calculateMetrics, updateBudgetLine])

  const updateTransaction = useCallback(async (id: string, updates: Partial<FinancialTransaction>) => {
    try {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
        )
      }))
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la transaction:', error)
      setState(prev => ({ ...prev, error: 'Erreur lors de la mise à jour de la transaction' }))
    }
  }, [])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      }))
    } catch (error) {
      console.error('Erreur lors de la suppression de la transaction:', error)
      setState(prev => ({ ...prev, error: 'Erreur lors de la suppression de la transaction' }))
    }
  }, [])

  const generateReport = useCallback(async (type: FinancialReport['type'], period: { start: string; end: string }) => {
    try {
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

      setState(prev => ({
        ...prev,
        reports: [...prev.reports, report]
      }))
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Erreur lors de la génération du rapport' }))
    }
  }, [state.budgetLines, state.transactions, calculateMetrics])

  const getBudgetLineById = useCallback((id: string): BudgetLine | undefined => {
    return state.budgetLines.find(line => line.id === id)
  }, [state.budgetLines])

  const getTransactionsByBudgetLine = useCallback((budgetLineId: string): FinancialTransaction[] => {
    return state.transactions.filter(t => t.source.budgetLineId === budgetLineId)
  }, [state.transactions])

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
      calculateMetrics: () => setState(prev => ({ ...prev, metrics: calculateMetrics() })),
      getBudgetLineById,
      getTransactionsByBudgetLine
    }
  }
}

// Helper function pour calculer les métriques
function calculateMetrics(budgetLines: BudgetLine[], transactions: FinancialTransaction[]): FinancialMetrics {
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
  const days = 30
  const averageDailyRevenue = totalRevenue / days
  const averageDailyExpenses = totalExpenses / days
  const cashBurnRate = totalExpenses / days
  const runway = availableCash > 0 ? availableCash / cashBurnRate : 0

  const totalDebt = budgetLines
    .filter(line => line.type === 'loan')
    .reduce((sum, line) => sum + line.currentAmount, 0)

  const debtToEquityRatio = initialInvestment > 0 ? totalDebt / initialInvestment : 0

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    profitMargin,
    availableCash,
    totalBudgetAllocated,
    totalBudgetUsed,
    roi,
    breakEvenPoint: 0,
    averageDailyRevenue,
    averageDailyExpenses,
    cashBurnRate,
    runway,
    debtToEquityRatio
  }
}
