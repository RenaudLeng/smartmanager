'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { 
  Notification as NotificationType, 
  NotificationPriority, 
  NotificationPreferences,
  SmartAlertConfig 
} from '@/types/notifications'

const DEFAULT_CONFIG: SmartAlertConfig = {
  stockThresholds: {
    low: 20,
    critical: 5
  },
  salesTargets: {
    daily: 100000,
    weekly: 700000,
    monthly: 3000000
  },
  expenseLimits: {
    daily: 50000,
    weekly: 300000,
    monthly: 1000000
  },
  profitMargins: {
    minimum: 15
  },
  paymentTerms: {
    overdueDays: 7
  }
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  userId: '',
  enabled: false, // Désactiver les notifications par défaut
  rules: [],
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
  soundEnabled: false, // Désactiver le son par défaut
  desktopNotifications: false, // Désactiver les notifications desktop par défaut
  emailNotifications: false
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [config, setConfig] = useState<SmartAlertConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    const loadSavedData = () => {
      // Effacer toutes les notifications existantes au chargement
      localStorage.removeItem('notifications')
      setNotifications([])
      
      const savedPreferences = localStorage.getItem('notificationPreferences')
      const savedConfig = localStorage.getItem('smartAlertConfig')

      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences))
        } catch (error) {
          console.error('Erreur lors du chargement des préférences:', error)
        }
      }

      if (savedConfig) {
        try {
          setConfig(JSON.parse(savedConfig))
        } catch (error) {
          console.error('Erreur lors du chargement de la configuration:', error)
        }
      }
    }
    
    loadSavedData()
  }, [])

  useEffect(() => {
    const updateLocalStorage = () => {
      localStorage.setItem('notifications', JSON.stringify(notifications))
    }
    updateLocalStorage()
  }, [notifications])

  const isQuietHours = useCallback(() => {
    if (!preferences.quietHours.enabled) return false
    
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const [startHour, startMin] = preferences.quietHours.start.split(':').map(Number)
    const [endHour, endMin] = preferences.quietHours.end.split(':').map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime
    } else {
      return currentTime >= startTime || currentTime <= endTime
    }
  }, [preferences.quietHours])

  const shouldShowNotification = useCallback((notification: NotificationType) => {
    if (!preferences.enabled) return false
    if (isQuietHours() && notification.priority !== 'urgent') return false
    
    const rule = preferences.rules.find(r => r.type === notification.type)
    if (rule && !rule.enabled) return false
    
    return true
  }, [preferences, isQuietHours])

  const addNotification = useCallback((
    type: NotificationType['type'],
    title: string,
    message: string,
    priority: NotificationPriority = 'medium',
    options: Partial<NotificationType> = {}
  ) => {
    const notification: NotificationType = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      priority,
      timestamp: new Date(),
      read: false,
      autoDismiss: priority === 'low',
      dismissAfter: priority === 'low' ? 5000 : undefined,
      ...options
    }

    if (shouldShowNotification(notification)) {
      setNotifications(prev => [notification, ...prev])

      if (!isQuietHours()) {
        const toastOptions = {
          duration: notification.dismissAfter || 4000,
          icon: getNotificationIcon(type),
          style: getToastStyle(priority)
        }

        if (notification.actionText && notification.actionUrl) {
          toast(
            `${notification.title}: ${notification.message}. ${notification.actionText}`,
            toastOptions
          )
        } else {
          toast(`${notification.title}: ${notification.message}`, toastOptions)
        }
      }

      if (preferences.desktopNotifications && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon-32x32.png',
            tag: notification.id
          })
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission()
        }
      }
    }

    return notification
  }, [shouldShowNotification, isQuietHours, preferences.desktopNotifications])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    )
  }, [])

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences }
    setPreferences(updated)
    localStorage.setItem('notificationPreferences', JSON.stringify(updated))
  }, [preferences])

  const updateConfig = useCallback((newConfig: Partial<SmartAlertConfig>) => {
    const updated = { ...config, ...newConfig }
    setConfig(updated)
    localStorage.setItem('smartAlertConfig', JSON.stringify(updated))
  }, [config])

  const checkStockAlerts = useCallback((products: Array<{ name: string; stock: number; minStock: number }>) => {
    products.forEach(product => {
      const stockPercentage = (product.stock / product.minStock) * 100
      
      if (stockPercentage <= config.stockThresholds.critical) {
        addNotification(
          'stock_out',
          'Stock critique',
          `${product.name} est en rupture de stock (${product.stock} unités)`,
          'urgent',
          {
            actionUrl: '/products',
            actionText: 'Voir les produits',
            metadata: { productId: product.name, stock: product.stock }
          }
        )
      } else if (stockPercentage <= config.stockThresholds.low) {
        addNotification(
          'stock_low',
          'Stock faible',
          `${product.name} a un stock faible (${product.stock} unités)`,
          'high',
          {
            actionUrl: '/products',
            actionText: 'Réapprovisionner',
            metadata: { productId: product.name, stock: product.stock }
          }
        )
      }
    })
  }, [config.stockThresholds, addNotification])

  const checkSalesAlerts = useCallback((sales: { daily: number; weekly: number; monthly: number }) => {
    if (sales.daily < config.salesTargets.daily * 0.5) {
      addNotification(
        'sales_low',
        'Ventes quotidiennes faibles',
        `Ventes du jour: ${sales.daily.toLocaleString('fr-GA')} XAF (objectif: ${config.salesTargets.daily.toLocaleString('fr-GA')} XAF)`,
        'medium',
        {
          actionUrl: '/dashboard',
          actionText: 'Voir les ventes'
        }
      )
    }

    if (sales.daily > config.salesTargets.daily * 1.2) {
      addNotification(
        'sales_high',
        'Excellentes ventes quotidiennes',
        `Ventes du jour: ${sales.daily.toLocaleString('fr-GA')} XAF (objectif dépassé de 20%)`,
        'success',
        {
          autoDismiss: true,
          dismissAfter: 3000
        }
      )
    }
  }, [config.salesTargets, addNotification])

  const checkExpenseAlerts = useCallback((expenses: { daily: number; weekly: number; monthly: number }) => {
    if (expenses.daily > config.expenseLimits.daily) {
      addNotification(
        'expense_high',
        'Limite de dépenses dépassée',
        `Dépenses du jour: ${expenses.daily.toLocaleString('fr-GA')} XAF (limite: ${config.expenseLimits.daily.toLocaleString('fr-GA')} XAF)`,
        'high',
        {
          actionUrl: '/expenses',
          actionText: 'Voir les dépenses'
        }
      )
    }
  }, [config.expenseLimits, addNotification])

  const checkProfitAlerts = useCallback((profitMargin: number) => {
    if (profitMargin < config.profitMargins.minimum) {
      addNotification(
        'profit_low',
        'Marge bénéficiaire faible',
        `Marge actuelle: ${profitMargin.toFixed(1)}% (minimum: ${config.profitMargins.minimum}%)`,
        'medium',
        {
          actionUrl: '/rapports-avances',
          actionText: 'Analyser les marges'
        }
      )
    }
  }, [config.profitMargins.minimum, addNotification])

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  const getUrgentCount = useCallback(() => {
    return notifications.filter(n => n.priority === 'urgent' && !n.read).length
  }, [notifications])

  return {
    notifications,
    preferences,
    config,
    unreadCount: getUnreadCount(),
    urgentCount: getUrgentCount(),
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
    updateConfig,
    checkStockAlerts,
    checkSalesAlerts,
    checkExpenseAlerts,
    checkProfitAlerts
  }
}

function getNotificationIcon(type: NotificationType['type']): string {
  const icons: Record<NotificationType['type'], string> = {
    stock_low: '📦',
    stock_out: '🚨',
    sales_high: '📈',
    sales_low: '📉',
    payment_overdue: '💰',
    expense_high: '💸',
    profit_low: '📊',
    customer_new: '👥',
    supplier_late: '🚚',
    system_error: '⚠️',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || '🔔'
}

function getToastStyle(priority: NotificationPriority): React.CSSProperties {
  const styles: Record<NotificationPriority, React.CSSProperties> = {
    low: {
      background: '#374151',
      color: '#fff',
      border: '1px solid #4b5563'
    },
    medium: {
      background: '#f59e0b',
      color: '#fff',
      border: '1px solid #d97706'
    },
    high: {
      background: '#ea580c',
      color: '#fff',
      border: '1px solid #c2410c'
    },
    urgent: {
      background: '#dc2626',
      color: '#fff',
      border: '1px solid #b91c1c'
    }
  }
  return styles[priority]
}
