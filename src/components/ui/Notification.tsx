'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
  persistent?: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto-suppression après la durée spécifiée
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }
  }, [removeNotification])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

interface NotificationToastProps {
  notification: Notification
  onRemove: () => void
}

export function NotificationToast({ notification, onRemove }: NotificationToastProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-gray-500" />
    }
  }

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500 text-white border-green-200'
      case 'error':
        return 'bg-red-500 text-white border-red-200'
      case 'info':
        return 'bg-blue-500 text-white border-blue-200'
      case 'warning':
        return 'bg-yellow-500 text-white border-yellow-200'
      default:
        return 'bg-gray-500 text-white border-gray-200'
    }
  }

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-80 p-4 rounded-lg shadow-lg border ${getColors()} transform transition-all duration-300 ease-in-out`}>
      <div className="flex items-start space-x-3">
        <div className="shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">{notification.title}</h4>
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            </div>
            {!notification.persistent && (
              <button
                onClick={onRemove}
                className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                title="Fermer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface NotificationContainerProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxNotifications?: number
  children?: React.ReactNode
}

export function NotificationContainer({ 
  position = 'top-right', 
  maxNotifications = 5,
  children 
}: NotificationContainerProps) {
  const { notifications, removeNotification } = useNotifications()

  return (
    <>
      <div className={`fixed ${position} z-50 space-y-2 p-4`}>
        {notifications.slice(-maxNotifications).map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onRemove={() => removeNotification(notification.id)}
          />
        ))}
      </div>
      {children}
    </>
  )
}

// Fonction utilitaire pour afficher des notifications
// Note: Cette fonction doit être utilisée à l'intérieur d'un composant React
export const showNotification = (
  title: string,
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info'
) => {
  // Cette fonction sera surchargée dans les composants qui l'utilisent
  console.log(`Notification: ${title} - ${message} (${type})`)
}
