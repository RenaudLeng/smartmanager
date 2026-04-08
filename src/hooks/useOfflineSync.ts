import { useState, useEffect, useCallback } from 'react'

interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  endpoint: string
  method: 'POST' | 'PUT' | 'DELETE'
  payload: any
  timestamp: number
}

export function useOfflineSync(token: string | null) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  // Charger les actions en attente au démarrage
  useEffect(() => {
    const loadPendingActions = () => {
      try {
        const stored = localStorage.getItem('smartmanager_offline_actions')
        if (stored) {
          setPendingActions(JSON.parse(stored))
        }
      } catch (error) {
        console.error('Erreur chargement actions offline:', error)
      }
    }

    loadPendingActions()
  }, [])

  // Écouter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('syncing')
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Synchroniser automatiquement quand on passe en ligne
  useEffect(() => {
    if (isOnline && pendingActions.length > 0 && syncStatus === 'syncing') {
      syncPendingActions()
    }
  }, [isOnline, pendingActions.length, syncStatus])

  // Ajouter une action à la liste d'attente
  const addOfflineAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    }

    const updatedActions = [...pendingActions, newAction]
    setPendingActions(updatedActions)

    // Sauvegarder dans localStorage
    try {
      localStorage.setItem('smartmanager_offline_actions', JSON.stringify(updatedActions))
    } catch (error) {
      console.error('Erreur sauvegarde action offline:', error)
    }

    return newAction.id
  }, [pendingActions])

  // Synchroniser les actions en attente
  const syncPendingActions = useCallback(async () => {
    if (!token || pendingActions.length === 0) {
      setSyncStatus('idle')
      return
    }

    try {
      const actionsToSync = [...pendingActions]
      
      for (const action of actionsToSync) {
        try {
          const response = await fetch(action.endpoint, {
            method: action.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(action.payload)
          })

          if (response.ok) {
            // Retirer l'action synchronisée
            const updatedActions = pendingActions.filter(a => a.id !== action.id)
            setPendingActions(updatedActions)
            localStorage.setItem('smartmanager_offline_actions', JSON.stringify(updatedActions))
          } else {
            console.error(`Erreur synchronisation action ${action.id}:`, response.statusText)
          }
        } catch (error) {
          console.error(`Erreur synchronisation action ${action.id}:`, error)
        }
      }

      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 2000)
    } catch (error) {
      console.error('Erreur synchronisation globale:', error)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }, [token, pendingActions])

  // Nettoyer les actions synchronisées
  const clearPendingActions = useCallback(() => {
    setPendingActions([])
    localStorage.removeItem('smartmanager_offline_actions')
  }, [])

  // Fonction utilitaire pour effectuer une requête avec fallback offline
  const fetchWithOfflineFallback = useCallback(async (
    endpoint: string,
    options: RequestInit = {},
    fallbackAction?: Omit<OfflineAction, 'id' | 'timestamp' | 'endpoint' | 'method'>
  ) => {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      if (!isOnline && fallbackAction) {
        const actionId = addOfflineAction({
          ...fallbackAction,
          endpoint,
          method: (options.method as any) || 'POST'
        })
        
        console.log(`Action ${actionId} ajoutée à la file d'attente offline`)
        
        // Retourner une réponse simulée
        return {
          success: false,
          offline: true,
          message: 'Action enregistrée pour synchronisation',
          actionId
        }
      }
      
      throw error
    }
  }, [token, isOnline, addOfflineAction])

  return {
    isOnline,
    pendingActions,
    syncStatus,
    addOfflineAction,
    syncPendingActions,
    clearPendingActions,
    fetchWithOfflineFallback
  }
}

// Hook pour les notifications PWA
export function usePWANotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)

  useEffect(() => {
    // Vérifier la permission de notification
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }

    // Vérifier l'abonnement aux notifications push
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.pushManager.getSubscription()
      }).then((sub) => {
        setSubscription(sub)
      }).catch((error) => {
        console.error('Erreur abonnement notifications:', error)
      })
    }
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications non supportées')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }, [])

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      return new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      })
    }
  }, [permission])

  return {
    permission,
    subscription,
    requestNotificationPermission,
    showNotification
  }
}
