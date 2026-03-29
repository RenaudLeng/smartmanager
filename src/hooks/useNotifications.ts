'use client'

import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import apiService from '@/services/api'

type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

interface NotificationType {
  id: string
  type: string
  title: string
  message: string
  priority: NotificationPriority
  read: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
  dismissAfter?: number
  metadata?: Record<string, any>
  autoDismiss?: boolean
  data?: {
    actionUrl?: string
    actionText?: string
    metadata?: Record<string, any>
  }
}

interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  desktopNotifications: boolean
  soundEnabled: boolean
  enabled: boolean
  rules: Array<{
    type: NotificationType['type']
    enabled: boolean
  }>
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface SmartAlertConfig {
  profitMargins: {
    minimum: number
  }
  salesTargets: {
    daily: number
  }
  expenseLimits: {
    daily: number
  }
  stockThresholds: {
    critical: number
    low: number
  }
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  emailNotifications: false,
  pushNotifications: false,
  desktopNotifications: false,
  soundEnabled: false,
  enabled: true,
  rules: [],
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00'
  },
}

const DEFAULT_CONFIG: SmartAlertConfig = {
  profitMargins: {
    minimum: 10
  },
  salesTargets: {
    daily: 100000
  },
  expenseLimits: {
    daily: 50000
  },
  stockThresholds: {
    critical: 10,
    low: 20
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const [config, setConfig] = useState<SmartAlertConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Charger les notifications depuis la base de données
  const loadNotifications = useCallback(async () => {
    if (!user?.tenantId) return

    try {
      setLoading(true)
      const response = await apiService.getNotifications()
      
      if (response.success && response.data) {
        const formattedNotifications = response.data.map((notification: any) => ({
          ...notification,
          createdAt: new Date(notification.createdAt).toISOString()
        }))
        
        setNotifications(formattedNotifications)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.tenantId])

  // Charger les préférences utilisateur
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return

    try {
      const response = await apiService.getUserNotificationPreferences()
      
      if (response.success && response.data) {
        setPreferences(response.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences:', error)
    }
  }, [user?.id])

  // Charger la configuration des alertes
  const loadConfig = useCallback(async () => {
    try {
      const response = await apiService.getNotificationConfig()
      
      if (response.success && response.data) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error)
    }
  }, [user?.tenantId])

  // Vérifier si c'est pendant les heures silencieuses
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

  // Vérifier si une notification doit être affichée
  const shouldShowNotification = useCallback((notification: NotificationType) => {
    if (!preferences.enabled) return false
    if (isQuietHours() && notification.priority === 'low') return false
    
    const rule = preferences.rules.find(r => r.type === notification.type)
    if (rule && !rule.enabled) return false
    
    return true
  }, [preferences.rules, isQuietHours])

  // Ajouter une notification
  const addNotification = useCallback(async (
    type: NotificationType['type'],
    title: string,
    message: string,
    priority: NotificationPriority = 'medium',
    options: Partial<NotificationType> = {}
  ) => {
    if (!user?.tenantId) return null

    try {
      // Créer la notification dans la base de données
      const notificationData = {
        type,
        title,
        message,
        priority,
        data: {
          actionUrl: options.actionUrl,
          actionText: options.actionText,
          metadata: options.metadata
        }
      }

      const response = await apiService.createNotification(notificationData)
      
      if (response.success && response.data) {
        const newNotification: NotificationType = {
          id: response.data.id,
          type,
          title,
          message,
          priority,
          read: false,
          createdAt: new Date().toISOString(),
          data: response.data
        }

        setNotifications(prev => [newNotification, ...prev])
        
        // Afficher la notification toast (optionnel - peut être implémenté plus tard)
        if (!isQuietHours()) {
          console.log(`Notification: ${newNotification.title}: ${newNotification.message}`)
        }

        return newNotification
      }
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error)
      return null
    }
  }, [user?.tenantId])

  // Obtenir le nombre de notifications non lues
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length
  }, [notifications])

  // Obtenir le nombre de notifications urgentes
  const getUrgentCount = useCallback(() => {
    return notifications.filter(n => n.priority === 'urgent' && !n.read).length
  }, [notifications])

  // Rafraîchir les notifications
  const refreshNotifications = useCallback(() => {
    loadNotifications()
  }, [loadNotifications])

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id)
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error)
    }
  }, [])

  // Supprimer une notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiService.deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error)
    }
  }, [])

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await apiService.markAllNotificationsAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Erreur lors du marquage de tout comme lu:', error)
    }
  }, [])

  // Vider toutes les notifications
  const clearAll = useCallback(async () => {
    try {
      await apiService.clearAllNotifications()
      setNotifications([])
    } catch (error) {
      console.error('Erreur lors du nettoyage des notifications:', error)
    }
  }, [])

  // Mettre à jour les préférences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await apiService.updateNotificationPreferences(newPreferences)
      
      if (response.success) {
        setPreferences(prev => ({ ...prev, ...newPreferences }))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error)
    }
  }, [])

  // Mettre à jour la configuration
  const updateConfig = useCallback(async (newConfig: Partial<SmartAlertConfig>) => {
    try {
      const response = await apiService.updateNotificationConfig(newConfig)
      
      if (response.success) {
        setConfig(prev => ({ ...prev, ...newConfig }))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la configuration:', error)
    }
  }, [])

  // Alertes de bénéfices
  const checkProfitAlerts = useCallback(async (profitMargin: number) => {
    if (config && config.profitMargins && profitMargin < config.profitMargins.minimum) {
      await addNotification(
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
  }, [config?.profitMargins?.minimum]) // Supprimé addNotification pour éviter la boucle

  // Alertes de ventes
  const checkSalesAlerts = useCallback(async (sales: { daily: number; weekly: number; monthly: number }) => {
    if (sales.daily > config.salesTargets.daily * 0.5) {
      await addNotification(
        'sales_low',
        'Ventes quotidiennes faibles',
        `Ventes du jour: ${sales.daily.toLocaleString('fr-GA')} XAF (objectif: ${config.salesTargets.daily.toLocaleString('fr-GA')} XAF)`,
        'medium' as NotificationPriority,
        {
          autoDismiss: true,
          dismissAfter: 3000
        }
      )
    } else if (sales.daily > config.salesTargets.daily * 1.2) {
      await addNotification(
        'sales_high',
        'Excellentes ventes quotidiennes',
        `Ventes du jour: ${sales.daily.toLocaleString('fr-GA')} XAF (objectif dépassé de 20%)`,
        'medium' as NotificationPriority,
        {
          autoDismiss: true,
          dismissAfter: 3000
        }
      )
    }
  }, [config.salesTargets]) // Supprimé addNotification pour éviter la boucle

  // Alertes de dépenses
  const checkExpenseAlerts = useCallback(async (expenses: { daily: number; weekly: number; monthly: number }) => {
    if (expenses.daily > config.expenseLimits.daily) {
      await addNotification(
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
  }, [config.expenseLimits]) // Supprimé addNotification pour éviter la boucle

  // Alertes de stock
  const checkStockAlerts = useCallback(async (products: Array<{ id: string; name: string; quantity: number; minStock: number }>) => {
    for (const product of products) {
      const stockPercentage = (product.quantity / product.minStock) * 100
      
      if (stockPercentage <= config.stockThresholds.critical) {
        await addNotification(
          'stock_out',
          'Stock critique',
          `${product.name} est en rupture de stock (${product.quantity} unités)`,
          'urgent',
          {
            actionUrl: '/stock',
            actionText: 'Voir les produits',
            metadata: { productId: product.id, stock: product.quantity }
          }
        )
      } else if (stockPercentage <= config.stockThresholds.low) {
        await addNotification(
          'stock_low',
          'Stock faible',
          `${product.name} a un stock faible (${product.quantity} unités)`,
          'high',
          {
            actionUrl: '/stock',
            actionText: 'Voir les produits'
          }
        )
      }
    }
  }, [config.stockThresholds]) // Supprimé addNotification pour éviter la boucle

  useEffect(() => {
    if (user?.tenantId) {
      loadNotifications()
      loadPreferences()
      loadConfig()
    }
  }, [user?.tenantId]) // Supprimé les fonctions des dépendances

  return {
    loading,
    unreadCount: getUnreadCount(),
    urgentCount: getUrgentCount(),
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    notifications,
    preferences,
    config,
    updatePreferences,
    updateConfig,
    checkProfitAlerts,
    checkSalesAlerts,
    checkExpenseAlerts,
    checkStockAlerts,
    refreshNotifications
  }
}

// Fonctions utilitaires - déplacées vers des composants React
export const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'stock_out': return 'alert'
    case 'stock_low': return 'trending-down'
    case 'expense_high': return 'trending-up'
    case 'sales_low': return 'trending-down'
    case 'sales_high': return 'trending-up'
    case 'profit_low': return 'trending-down'
    case 'info': return 'bell'
    case 'success': return 'check-circle'
    case 'warning': return 'alert'
    default: return 'bell'
  }
}

export const getToastStyle = (priority: NotificationPriority) => {
  switch (priority) {
    case 'urgent': return 'bg-red-500'
    case 'high': return 'bg-orange-500'
    case 'medium': return 'bg-blue-500'
    case 'low': return 'bg-gray-500'
    default: return 'bg-gray-500'
  }
}
