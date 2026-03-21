import { useState, Fragment } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export function useConfirmDialog() {
  const [dialog, setDialog] = useState<ConfirmDialogProps | null>(null)

  const confirm = (props: Omit<ConfirmDialogProps, 'isOpen' | 'onClose'>) => {
    return new Promise<boolean>((resolve) => {
      setDialog({
        ...props,
        isOpen: true,
        onClose: () => {
          setDialog(null)
          resolve(false)
        },
        onConfirm: () => {
          setDialog(null)
          resolve(true)
        }
      })
    })
  }

  const ConfirmDialogComponent = dialog ? (
    <ConfirmDialog {...dialog} />
  ) : (
    <Fragment />
  )

  return { confirm, ConfirmDialogComponent }
}

function ConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const typeStyles = {
    danger: 'bg-red-500 hover:bg-red-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    info: 'bg-blue-500 hover:bg-blue-600'
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${typeStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  }>>([])

  const addNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, message, type }])
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 3000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const showNotification = addNotification

  const NotificationComponent = notifications.length > 0 ? (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' :
            notification.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  ) : (
    <Fragment />
  )

  return {
    notifications,
    addNotification,
    removeNotification,
    showNotification,
    NotificationComponent
  }
}
