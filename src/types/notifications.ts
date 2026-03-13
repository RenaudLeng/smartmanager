export type NotificationType = 
  | 'stock_low'
  | 'stock_out'
  | 'sales_high'
  | 'sales_low'
  | 'payment_overdue'
  | 'expense_high'
  | 'profit_low'
  | 'customer_new'
  | 'supplier_late'
  | 'system_error'
  | 'success'
  | 'warning'
  | 'info'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionText?: string
  metadata?: Record<string, unknown>
  autoDismiss?: boolean
  dismissAfter?: number // en secondes
}

export interface NotificationRule {
  id: string
  name: string
  type: NotificationType
  enabled: boolean
  conditions: {
    threshold?: number
    operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte'
    field?: string
  }
  actions: {
    email?: boolean
    push?: boolean
    inApp?: boolean
    sound?: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface NotificationPreferences {
  userId: string
  enabled: boolean
  rules: NotificationRule[]
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
  soundEnabled: boolean
  desktopNotifications: boolean
  emailNotifications: boolean
}

export interface NotificationStats {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
  recent: Notification[]
}

export interface SmartAlertConfig {
  stockThresholds: {
    low: number // pourcentage
    critical: number // pourcentage
  }
  salesTargets: {
    daily: number
    weekly: number
    monthly: number
  }
  expenseLimits: {
    daily: number
    weekly: number
    monthly: number
  }
  profitMargins: {
    minimum: number // pourcentage
  }
  paymentTerms: {
    overdueDays: number
  }
}
