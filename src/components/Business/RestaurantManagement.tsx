'use client'

import { useState, useEffect } from 'react'
import { Utensils, Table, Clock, Users, TrendingUp, AlertTriangle, Package, Phone, CheckCircle, XCircle, Truck } from 'lucide-react'
import { RestaurantTable, RestaurantOrder } from '@/types/business'

interface RestaurantManagementProps {
  tenantId: string
}

export default function RestaurantManagement({ tenantId }: RestaurantManagementProps) {
  const [tables, setTables] = useState<RestaurantTable[]>([])
  const [orders, setOrders] = useState<RestaurantOrder[]>([])
  const [activeTab, setActiveTab] = useState<'tables' | 'commandes' | 'cuisine' | 'livraison'>('tables')
  const [newOrder, setNewOrder] = useState<Partial<RestaurantOrder>>({
    items: [],
    status: 'pending',
    paymentMethod: 'cash'
  })

  // Données de démonstration pour un restaurant
  useEffect(() => {
    setTables([
      {
        id: '1',
        number: 1,
        capacity: 4,
        status: 'occupied',
        location: 'interieur',
        currentOrder: '1'
      },
      {
        id: '2',
        number: 2,
        capacity: 2,
        status: 'available',
        location: 'interieur'
      },
      {
        id: '3',
        number: 3,
        capacity: 6,
        status: 'reserved',
        location: 'terrasse',
        currentOrder: '2'
      },
      {
        id: '4',
        number: 4,
        capacity: 4,
        status: 'available',
        location: 'interieur'
      },
      {
        id: '5',
        number: 5,
        capacity: 8,
        status: 'cleaning',
        location: 'privé'
      },
      {
        id: '6',
        number: 6,
        capacity: 2,
        status: 'occupied',
        location: 'terrasse',
        currentOrder: '3'
      }
    ])

    setOrders([
      {
        id: '1',
        tableId: '1',
        tableNumber: 1,
        items: [
          { productId: '1', quantity: 2, price: 2500, specialInstructions: 'Sans oignons' },
          { productId: '2', quantity: 1, price: 800 },
          { productId: '3', quantity: 2, price: 500 }
        ],
        customerCount: 3,
        status: 'served',
        totalAmount: 6800,
        paymentMethod: 'cash',
        staffName: 'Marie',
        createdAt: new Date(),
        servedAt: new Date()
      },
      {
        id: '2',
        tableId: '3',
        tableNumber: 3,
        items: [
          { productId: '4', quantity: 4, price: 3500 },
          { productId: '5', quantity: 1, price: 1500 }
        ],
        customerCount: 6,
        status: 'preparing',
        totalAmount: 15500,
        paymentMethod: 'card',
        staffName: 'Paul',
        createdAt: new Date()
      },
      {
        id: '3',
        tableId: '6',
        tableNumber: 6,
        items: [
          { productId: '1', quantity: 1, price: 2500 }
        ],
        customerCount: 2,
        status: 'pending',
        totalAmount: 2500,
        paymentMethod: 'mobile',
        staffName: 'Sophie',
        createdAt: new Date(),
        deliveryInfo: {
          type: 'delivery',
          address: 'Libreville, Plateau',
          deliveryTime: new Date(Date.now() + 45 * 60 * 1000),
          deliveryFee: 1000
        }
      }
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'occupied': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'reserved': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'cleaning': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'preparing': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'ready': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'served': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'paid': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible'
      case 'occupied': return 'Occupée'
      case 'reserved': return 'Réservée'
      case 'cleaning': return 'Nettoyage'
      case 'pending': return 'En attente'
      case 'preparing': return 'En préparation'
      case 'ready': return 'Prête'
      case 'served': return 'Servie'
      case 'paid': return 'Payée'
      default: return status
    }
  }

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'interieur': return '🏠'
      case 'terrasse': return '🌴'
      case 'privé': return '🎉'
      default: return '🏠'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-GA', { hour: '2-digit', minute: '2-digit' })
  }

  const getTotalOrder = () => {
    return newOrder.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0
  }

  const menuItems = [
    { id: '1', name: 'Riz sauce poisson', price: 2500, category: 'Plats principaux', available: true },
    { id: '2', name: 'Jus de fruit local', price: 800, category: 'Boissons', available: true },
    { id: '3', name: 'Salade tropicale', price: 500, category: 'Entrées', available: true },
    { id: '4', name: 'Poulet braisé', price: 3500, category: 'Plats principaux', available: true },
    { id: '5', name: 'Dessert maison', price: 1500, category: 'Desserts', available: true }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Utensils className="w-8 h-8 text-orange-500" />
            Gestion du Restaurant
          </h1>
          <p className="text-gray-400">
            Gestion des tables, commandes, cuisine et livraisons
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tables occupées</p>
                <p className="text-2xl font-bold text-orange-400">3/6</p>
              </div>
              <Table className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Commandes en cours</p>
                <p className="text-2xl font-bold text-blue-400">5</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-green-400">125 000 XAF</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Livraisons</p>
                <p className="text-2xl font-bold text-purple-400">8</p>
              </div>
              <Truck className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {['tables', 'commandes', 'cuisine', 'livraison'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'tables' ? 'Tables' : 
               tab === 'commandes' ? 'Commandes' : 
               tab === 'cuisine' ? 'Cuisine' : 'Livraison'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'tables' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion des tables</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`bg-gray-800 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                    table.status === 'available' ? 'border-green-500/50 hover:border-green-500' :
                    table.status === 'occupied' ? 'border-orange-500/50 hover:border-orange-500' :
                    table.status === 'reserved' ? 'border-blue-500/50 hover:border-blue-500' :
                    'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{getLocationIcon(table.location)}</div>
                    <h3 className="font-semibold text-lg">Table {table.number}</h3>
                    <p className="text-sm text-gray-400 mb-2">{table.capacity} personnes</p>
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(table.status)}`}>
                      {getStatusText(table.status)}
                    </span>
                    {table.currentOrder && (
                      <div className="mt-2 text-xs text-gray-400">
                        Commande #{table.currentOrder}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Légende des statuts</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-sm">Occupée</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm">Réservée</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-sm">Nettoyage</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'commandes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Menu */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Menu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <span className="text-lg font-bold text-orange-400">
                        {item.price.toLocaleString('fr-GA')} XAF
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{item.category}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${item.available ? 'text-green-400' : 'text-red-400'}`}>
                        {item.available ? 'Disponible' : 'Indisponible'}
                      </span>
                      <button
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors"
                        disabled={!item.available}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commandes en cours */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Commandes en cours</h2>
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Table className="w-4 h-4" />
                        <span className="font-medium">Table {order.tableNumber}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      <p>{order.customerCount} clients</p>
                      <p>Serveur: {order.staffName}</p>
                    </div>
                    <div className="border-t border-gray-700 pt-2">
                      <div className="space-y-1 text-sm">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span>{menuItems.find(m => m.id === item.productId)?.name} x{item.quantity}</span>
                            <span className="text-orange-400">
                              {(item.price * item.quantity).toLocaleString('fr-GA')} XAF
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                        <span className="font-semibold">Total:</span>
                        <span className="text-lg font-bold text-orange-400">
                          {order.totalAmount.toLocaleString('fr-GA')} XAF
                        </span>
                      </div>
                    </div>
                    {order.deliveryInfo && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <Truck className="w-3 h-3" />
                          <span>Livraison - {order.deliveryInfo.address}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      {order.status === 'pending' && (
                        <button className="flex-1 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors">
                          Commencer
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button className="flex-1 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors">
                          Prête
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button className="flex-1 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors">
                          Servir
                        </button>
                      )}
                      {order.status === 'served' && (
                        <button className="flex-1 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm transition-colors">
                          Payer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cuisine' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Vue Cuisine</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders
                .filter(order => order.status === 'preparing' || order.status === 'pending')
                .map((order) => (
                  <div key={order.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Table className="w-4 h-4" />
                        <span className="font-semibold">Table {order.tableNumber}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        Commandé: {formatTime(order.createdAt)}
                      </p>
                      <div className="border-t border-gray-700 pt-2">
                        <h4 className="font-medium mb-2">Articles à préparer:</h4>
                        <div className="space-y-1 text-sm">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>{menuItems.find(m => m.id === item.productId)?.name} x{item.quantity}</span>
                              {item.specialInstructions && (
                                <span className="text-xs text-yellow-400">
                                  Note: {item.specialInstructions}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors">
                          Prêt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'livraison' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion des livraisons</h2>
            <div className="space-y-4">
              {orders
                .filter(order => order.deliveryInfo)
                .map((order) => (
                  <div key={order.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold">Commande #{order.id}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Informations de livraison</h4>
                        <div className="space-y-1 text-sm text-gray-400">
                          <p>Type: {order.deliveryInfo?.type === 'delivery' ? 'Livraison' : 'À emporter'}</p>
                          <p>Adresse: {order.deliveryInfo?.address}</p>
                          {order.deliveryInfo?.deliveryTime && (
                            <p>Heure: {formatTime(order.deliveryInfo.deliveryTime)}</p>
                          )}
                          {order.deliveryInfo?.deliveryFee && (
                            <p>Frais: {order.deliveryInfo.deliveryFee.toLocaleString('fr-GA')} XAF</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Détails de la commande</h4>
                        <div className="space-y-1 text-sm">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{menuItems.find(m => m.id === item.productId)?.name} x{item.quantity}</span>
                              <span className="text-orange-400">
                                {(item.price * item.quantity).toLocaleString('fr-GA')} XAF
                              </span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700">
                            <span className="font-semibold">Total:</span>
                            <span className="text-lg font-bold text-orange-400">
                              {order.totalAmount.toLocaleString('fr-GA')} XAF
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors">
                        Appeler client
                      </button>
                      <button className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors">
                        Marquer livrée
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
