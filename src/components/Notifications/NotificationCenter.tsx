'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Package,
  DollarSign,
  Users,
  Truck,
  Settings,
  Trash2,
  Eye
} from 'lucide-react'
import { Notification, NotificationType, NotificationPriority } from '@/types/notifications'

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onDelete: (id: string) => void
  onClearAll: () => void
  className?: string
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  stock_low: <Package className="h-4 w-4 text-yellow-500" />,
  stock_out: <Package className="h-4 w-4 text-red-500" />,
  sales_high: <TrendingUp className="h-4 w-4 text-green-500" />,
  sales_low: <TrendingDown className="h-4 w-4 text-orange-500" />,
  payment_overdue: <DollarSign className="h-4 w-4 text-red-500" />,
  expense_high: <TrendingUp className="h-4 w-4 text-red-500" />,
  profit_low: <TrendingDown className="h-4 w-4 text-red-500" />,
  customer_new: <Users className="h-4 w-4 text-blue-500" />,
  supplier_late: <Truck className="h-4 w-4 text-orange-500" />,
  system_error: <AlertTriangle className="h-4 w-4 text-red-500" />,
  success: <Check className="h-4 w-4 text-green-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  info: <Bell className="h-4 w-4 text-blue-500" />
}

const priorityColors: Record<NotificationPriority, string> = {
  low: 'border-gray-500',
  medium: 'border-yellow-500',
  high: 'border-orange-500',
  urgent: 'border-red-500'
}

const priorityBgColors: Record<NotificationPriority, string> = {
  low: 'bg-gray-500/10',
  medium: 'bg-yellow-500/10',
  high: 'bg-orange-500/10',
  urgent: 'bg-red-500/10'
}

export function NotificationCenter({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onClearAll,
  className = ''
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationPriority>('all')
  const [showSettings, setShowSettings] = useState(false)
  const router = useRouter()

  const unreadCount = notifications.filter(n => !n.read).length
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'all') return true
    return notification.priority === filter
  })

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours} h`
    if (days < 7) return `Il y a ${days} j`
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id)
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Bouton de notification */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        {urgentCount > 0 ? (
          <BellRing className="h-5 w-5 text-red-400 animate-pulse" />
        ) : unreadCount > 0 ? (
          <Bell className="h-5 w-5 text-orange-400" />
        ) : (
          <Bell className="h-5 w-5 text-gray-400" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panneau de notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-2xl z-50 max-h-96 overflow-hidden">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Filtres et actions */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  filter === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Tout
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  filter === 'unread' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                Non lues
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste des notifications */}
          <div className="overflow-y-auto max-h-64">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer border-l-4 ${priorityColors[notification.priority]} ${priorityBgColors[notification.priority]} ${
                      !notification.read ? 'font-semibold' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="shrink-0 mt-1">
                        {notificationIcons[notification.type]}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-sm truncate">{notification.title}</p>
                          <div className="flex items-center space-x-2 ml-2">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onMarkAsRead(notification.id)
                                }}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                              >
                                <Eye className="h-3 w-3 text-gray-400" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(notification.id)
                              }}
                              className="p-1 hover:bg-white/10 rounded transition-colors"
                            >
                              <Trash2 className="h-3 w-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-xs mt-1">{notification.message}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-500 text-xs">
                            {formatTime(notification.timestamp)}
                          </span>
                          
                          {notification.actionText && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationClick(notification)
                              }}
                              className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                            >
                              {notification.actionText}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pied de page */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-white/10 flex justify-between">
              <button
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Tout supprimer
              </button>
              <span className="text-xs text-gray-400">
                {notifications.length} notification{notifications.length > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Overlay pour fermer le panneau */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
