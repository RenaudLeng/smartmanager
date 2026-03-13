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

// Mock data pour développement
const mockBudgetLines: BudgetLine[] = [
  {
    id: '1',
    name: 'Fonds propres initiaux',
    type: 'funds',
    initialAmount: 1000000,
    currentAmount: 850000,
    currency: 'XAF',
    createdAt: '2024-01-01',
    description: 'Investissement personnel de départ'
  },
  {
    id: '2',
    name: 'Prêt bancaire BGFIBank',
    type: 'loan',
    initialAmount: 500000,
    currentAmount: 450000,
    currency: 'XAF',
    createdAt: '2024-01-15',
    description: 'Prêt pour expansion',
    loanDetails: {
      lender: 'BGFIBank',
      interestRate: 8.5,
      totalAmount: 500000,
      monthlyPayment: 25000,
      remainingPayments: 18,
      nextPaymentDate: '2024-04-01',
      startDate: '2024-01-15'
    }
  }
]

const mockTransactions: FinancialTransaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 150000,
    currency: 'XAF',
    description: 'Ventes journalières',
    category: 'ventes',
    date: '2024-03-10',
    source: { type: 'cash' },
    relatedEntity: {
      type: 'sale',
      entityId: 'sale_1',
      entityName: 'Ventes du jour'
    },
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z'
  },
  {
    id: '2',
    type: 'expense',
    amount: 50000,
    currency: 'XAF',
    description: 'Ravitaillement stock',
    category: 'restock',
    date: '2024-03-10',
    source: { type: 'cash' },
    relatedEntity: {
      type: 'restock',
      entityId: 'restock_1',
      entityName: 'Achat produits'
    },
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-10T09:00:00Z'
  }
]

export function useFinancial(): UseFinancialReturn {
  const [state, setState] = useState<FinancialState>({
    budgetLines: [],
    transactions: [],
    metrics: null,
    reports: [],
    loading: true,
    error: null
  })

  // Initialisation des données
  useEffect(() => {
    const initializeData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }))
        
        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setState({
          budgetLines: mockBudgetLines,
          transactions: mockTransactions,
          metrics: calculateMetrics(mockBudgetLines, mockTransactions),
          reports: [],
          loading: false,
          error: null
        })
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Erreur lors du chargement des données financières'
        }))
      }
    }

    initializeData()
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
