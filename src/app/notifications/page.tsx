'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, X, AlertCircle, CheckCircle, Info, AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'

interface Notification {
  id: string
  title: string
  message: string
  type: 'low_stock' | 'unpaid_invoice' | 'customer_debt' | 'expired_subscription' | 'info' | 'success' | 'error'
  timestamp: string
  read: boolean
  actionRequired: boolean
  actions?: Array<{
    label: string
    action: string
  }>
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Stock faible',
          message: 'Le produit "Huile végétale 1L" a moins de 10 unités en stock',
          type: 'low_stock',
          timestamp: '2024-03-10T10:30:00',
          read: false,
          actionRequired: true,
          actions: [
            { label: 'Voir le produit', action: 'view_product' },
            { label: 'Réapprovisionner', action: 'reorder' }
          ]
        },
        {
          id: '2',
          title: 'Facture impayée',
          message: 'Le client Mamadou Diallo a une facture de 25,000 XAF en retard',
          type: 'unpaid_invoice',
          timestamp: '2024-03-10T09:15:00',
          read: false,
          actionRequired: true,
          actions: [
            { label: 'Voir la facture', action: 'view_invoice' },
            { label: 'Contacter le client', action: 'contact' }
          ]
        },
        {
          id: '3',
          title: 'Nouveau client',
          message: 'Aminata Ndiaye a été ajoutée à votre liste de clients',
          type: 'success',
          timestamp: '2024-03-09T16:45:00',
          read: true,
          actionRequired: false
        },
        {
          id: '4',
          title: 'Rapport disponible',
          message: 'Le rapport mensuel de février est prêt pour consultation',
          type: 'info',
          timestamp: '2024-03-09T14:20:00',
          read: true,
          actionRequired: false,
          actions: [
            { label: 'Voir le rapport', action: 'view_report' }
          ]
        },
        {
          id: '5',
          title: 'Alerte sécurité',
          message: 'Une nouvelle connexion a été détectée sur votre compte',
          type: 'error',
          timestamp: '2024-03-09T11:30:00',
          read: false,
          actionRequired: true,
          actions: [
            { label: 'Vérifier la connexion', action: 'check_security' }
          ]
        },
        {
          id: '6',
          title: 'Dette client',
          message: 'Ibrahim Ba a une dette de 12,000 XAF',
          type: 'customer_debt',
          timestamp: '2024-03-08T17:00:00',
          read: true,
          actionRequired: false,
          actions: [
            { label: 'Voir le client', action: 'view_customer' }
          ]
        }
      ]
      setNotifications(mockNotifications)
      setLoading(false)
    }, 100)
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'read') return notification.read
    return true
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== id)
    )
  }

  const handleAction = (notificationId: string, action: string) => {
    alert(`Action: ${action} pour notification ${notificationId}`)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'unpaid_invoice':
      case 'customer_debt':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <X className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Il y a quelques minutes'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInHours < 48) return 'Hier'
    return date.toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="text-white mt-4">Chargement des notifications...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-900 p-4">
        {/* Header Mobile-First */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-slate-400 text-sm md:text-base">
            {unreadCount > 0 ? `${unreadCount} notifications non lues` : 'Toutes les notifications sont lues'}
          </p>
        </div>

        {/* Filter Tabs - Mobile First */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Non lues ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'read' 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Lues ({notifications.length - unreadCount})
          </button>
        </div>

        {/* Actions Bar */}
        {unreadCount > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={markAllAsRead}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <Check className="h-4 w-4" />
                <span>Tout marquer comme lu</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <Bell className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                {filter === 'unread' ? 'Aucune notification non lue' : 
                 filter === 'read' ? 'Aucune notification lue' : 
                 'Aucune notification'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-slate-800 border rounded-lg p-4 transition-all ${
                  !notification.read 
                    ? 'border-green-500/30 bg-slate-800/50' 
                    : 'border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium mb-1 ${
                          !notification.read ? 'text-white' : 'text-slate-300'
                        }`}>
                          {notification.title}
                        </h3>
                        <p className={`text-sm mb-2 ${
                          !notification.read ? 'text-slate-200' : 'text-slate-400'
                        }`}>
                          {notification.message}
                        </p>
                        
                        {/* Actions */}
                        {notification.actions && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {notification.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => handleAction(notification.id, action.action)}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-sm"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.actionRequired && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                              Action requise
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-green-400 hover:text-green-300"
                            title="Marquer comme lu"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile Back Button */}
        <div className="lg:hidden mt-6">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
