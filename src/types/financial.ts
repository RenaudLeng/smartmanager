// Types et interfaces pour la gestion financière

export interface BudgetLine {
  id: string
  name: string
  type: 'funds' | 'loan' | 'investment' | 'grant'
  initialAmount: number
  currentAmount: number
  currency: string
  createdAt: string
  description?: string
  
  // Spécifique aux prêts
  loanDetails?: {
    lender: string
    interestRate: number
    totalAmount: number
    monthlyPayment: number
    remainingPayments: number
    nextPaymentDate?: string
    startDate: string
  }
}

export interface FinancialTransaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  currency: string
  description: string
  category: string
  date: string
  source: {
    type: 'cash' | 'budget_line' | 'bank_transfer'
    budgetLineId?: string
    reference?: string
  }
  relatedEntity?: {
    type: 'sale' | 'purchase' | 'salary' | 'rent' | 'restock' | 'other'
    entityId: string
    entityName: string
  }
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface FinancialMetrics {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  availableCash: number
  totalBudgetAllocated: number
  totalBudgetUsed: number
  roi: number // Return on Investment
  breakEvenPoint: number
  
  // KPIs avancés
  averageDailyRevenue: number
  averageDailyExpenses: number
  cashBurnRate: number
  runway: number // Nombre de jours avant épuisement des fonds
  debtToEquityRatio: number
}

export interface FinancialReport {
  id: string
  title: string
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  period: {
    start: string
    end: string
  }
  metrics: FinancialMetrics
  transactions: FinancialTransaction[]
  insights: {
    profitability: string
    cashFlow: string
    recommendations: string[]
    risks: string[]
    opportunities: string[]
  }
  createdAt: string
}

export interface RestockFinancialInfo {
  totalCost: number
  source: {
    type: 'cash' | 'budget_line'
    budgetLineId?: string
  }
  justification?: string
  approved: boolean
  approvedBy?: string
  approvedAt?: string
}

// Types pour les hooks et services
export interface FinancialState {
  budgetLines: BudgetLine[]
  transactions: FinancialTransaction[]
  metrics: FinancialMetrics | null
  reports: FinancialReport[]
  loading: boolean
  error: string | null
}

export interface UseFinancialReturn {
  state: FinancialState
  actions: {
    createBudgetLine: (line: Omit<BudgetLine, 'id' | 'createdAt'>) => Promise<void>
    updateBudgetLine: (id: string, updates: Partial<BudgetLine>) => Promise<void>
    deleteBudgetLine: (id: string) => Promise<void>
    addTransaction: (transaction: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
    updateTransaction: (id: string, updates: Partial<FinancialTransaction>) => Promise<void>
    deleteTransaction: (id: string) => Promise<void>
    generateReport: (type: FinancialReport['type'], period: { start: string; end: string }) => Promise<void>
    calculateMetrics: () => void
    getBudgetLineById: (id: string) => BudgetLine | undefined
    getTransactionsByBudgetLine: (budgetLineId: string) => FinancialTransaction[]
  }
}
