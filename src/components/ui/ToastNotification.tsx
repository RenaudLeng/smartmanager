'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, X, Info } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

interface ToastNotificationProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export function ToastNotification({ notifications, onRemove }: ToastNotificationProps) {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => onRemove(notification.id), notification.duration)
        return () => clearTimeout(timer)
      }
    })
  }, [notifications]) // Supprimé onRemove des dépendances

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'error': return AlertTriangle
      case 'warning': return AlertTriangle
      case 'info': return Info
      default: return Info
    }
  }

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-400 shadow-lg shadow-green-500/10'
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-400 shadow-lg shadow-red-500/10'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400 shadow-lg shadow-yellow-500/10'
      case 'info':
        return 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-lg shadow-orange-500/10'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400 shadow-lg shadow-gray-500/10'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => {
        const Icon = getIcon(notification.type)
        return (
          <div
            key={notification.id}
            className={`flex items-center justify-between p-4 rounded-lg border backdrop-blur-md ${getStyles(
              notification.type
            )} transform transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-center space-x-3">
              <Icon className="w-5 h-5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{notification.title}</h4>
                <p className="text-sm opacity-80">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() => onRemove(notification.id)}
              className="shrink-0 ml-4 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// Hook pour gérer les notifications
export function useToastNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (
    type: NotificationType,
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    const id = Date.now().toString()
    const newNotification: Notification = { id, type, title, message, duration }
      setNotifications(prev => [...prev, newNotification])
      return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  // Méthodes rapides
  const success = (title: string, message: string, duration?: number) =>
    addNotification('success', title, message, duration)
  const error = (title: string, message: string, duration?: number) =>
    addNotification('error', title, message, duration)
  const warning = (title: string, message: string, duration?: number) =>
    addNotification('warning', title, message, duration)
  const info = (title: string, message: string, duration?: number) =>
    addNotification('info', title, message, duration)

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info
  }
}
