'use client'

import { useState, useCallback } from 'react'
import { X, AlertTriangle, CheckCircle } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  itemDetails?: {
    title: string
    subtitle?: string
    amount?: string
  }
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger',
  itemDetails
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          buttonBg: 'bg-red-600 hover:bg-red-700'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-orange-400" />,
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30',
          textColor: 'text-orange-400',
          buttonBg: 'bg-orange-600 hover:bg-orange-700'
        }
      case 'info':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-blue-400" />,
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          buttonBg: 'bg-blue-600 hover:bg-blue-700'
        }
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          buttonBg: 'bg-red-600 hover:bg-red-700'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10000">
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            {styles.icon}
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Message */}
        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <p className="text-gray-300 mb-3">{message}</p>
          
          {/* Détails de l'élément si fournis */}
          {itemDetails && (
            <div className="bg-black/40 rounded-lg p-3">
              <h4 className="text-white font-medium">{itemDetails.title}</h4>
              {itemDetails.subtitle && (
                <p className="text-gray-400 text-sm">{itemDetails.subtitle}</p>
              )}
              {itemDetails.amount && (
                <p className="text-orange-400 text-sm font-medium">{itemDetails.amount}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Avertissement */}
        {type === 'danger' && (
          <div className={`${styles.bgColor} ${styles.borderColor} rounded-lg p-3 mb-6`}>
            <p className={`${styles.textColor} text-sm`}>
              ⚠️ Cette action est irréversible. Cette modification sera définitivement enregistrée.
            </p>
          </div>
        )}
        
        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${styles.buttonBg} text-white py-3 rounded-lg font-medium transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook pour gérer les notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationIdCounter, setNotificationIdCounter] = useState(0)

  const showNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 3000) => {
    const id = `notification-${notificationIdCounter + 1}`
    setNotificationIdCounter(prev => prev + 1)
    setNotifications(prev => [...prev, { id, type, message, duration }])
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }, duration)
    }
  }, [notificationIdCounter])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const NotificationComponent = () => (
    <>
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`fixed top-4 right-4 z-10000 max-w-sm p-4 rounded-lg shadow-xl backdrop-blur-xl border transition-all transform ${
            notification.type === 'success' 
              ? 'bg-green-500/90 border-green-500/30 text-white' 
              : notification.type === 'error'
              ? 'bg-red-500/90 border-red-500/30 text-white'
              : notification.type === 'warning'
              ? 'bg-orange-500/90 border-orange-500/30 text-white'
              : 'bg-blue-500/90 border-blue-500/30 text-white'
          }`}
        >
          <div className="flex items-start space-x-3">
            <div className="shrink-0">
              {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
              {notification.type === 'error' && <AlertTriangle className="h-5 w-5" />}
              {notification.type === 'warning' && <AlertTriangle className="h-5 w-5" />}
              {notification.type === 'info' && <CheckCircle className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </>
  )

  return {
    showNotification,
    removeNotification,
    NotificationComponent,
    notifications
  }
}

// Hook pour gérer les confirmations
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<ConfirmDialogProps>()

  const confirm = useCallback((config: Omit<ConfirmDialogProps, 'isOpen' | 'onClose' | 'onConfirm'>) => {
    return new Promise<boolean>((resolve) => {
      const handleConfirm = () => {
        setIsOpen(false)
        resolve(true)
      }
      
      const handleCancel = () => {
        setIsOpen(false)
        resolve(false)
      }
      
      // Mettre à jour le config avec les handlers
      setConfig({
        ...config,
        isOpen: true,
        onConfirm: handleConfirm,
        onClose: handleCancel
      })
      setIsOpen(true)
    })
  }, [])

  const ConfirmDialogComponent = () => {
    if (!config) return null
    
    return (
      <ConfirmDialog
        {...config}
      />
    )
  }

  return {
    confirm,
    ConfirmDialogComponent,
    isOpen
  }
}
