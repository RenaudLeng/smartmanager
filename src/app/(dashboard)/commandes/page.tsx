'use client'

import { useState } from 'react'
import { Search, Edit2, Trash2, ShoppingCart, Truck, Calendar, Edit, Grid, List, Users, Clock, CheckCircle } from 'lucide-react'
import { useTenant } from '../../../contexts/TenantContext'

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  items: OrderItem[]
  totalAmount: number
  finalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled'
  orderDate: string
  deliveryDate?: string
  paymentMethod: string
  notes: string
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  notes: string
}

interface Table {
  id: string
  number: string
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  currentOrder?: string
}

export default function CommandesPage() {
  const tenantData = useTenant()
  const businessFeatures = tenantData.getBusinessFeatures()
  const businessType = tenantData.getBusinessLabel()
  
  // Tables pour restaurant
  const [tables] = useState<Table[]>([
    { id: '1', number: 'T1', capacity: 4, status: 'available' },
    { id: '2', number: 'T2', capacity: 2, status: 'occupied', currentOrder: 'CMD-2024-001' },
    { id: '3', number: 'T3', capacity: 6, status: 'reserved' },
    { id: '4', number: 'T4', capacity: 4, status: 'available' },
    { id: '5', number: 'T5', capacity: 8, status: 'occupied', currentOrder: 'CMD-2024-002' },
    { id: '6', number: 'T6', capacity: 2, status: 'cleaning' }
  ])
  // Optimisé : données mock chargées directement sans délai artificiel
  const [orders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'CMD-2024-001',
      customerName: 'Jean-Baptiste Ondo',
      customerPhone: '+241 66 12 34 56',
      items: [
        { id: '1', productId: '1', productName: 'Riz gabonais 1kg', quantity: 5, unitPrice: 1500, totalPrice: 7500, notes: '' },
        { id: '2', productId: '2', productName: 'Poulet braisé', quantity: 2, unitPrice: 3500, totalPrice: 7000, notes: '' }
      ],
      totalAmount: 14500,
      finalAmount: 14500,
      status: 'pending',
      orderDate: '2024-03-15',
      paymentMethod: 'Espèces',
      notes: 'Client fidèle',
      createdAt: '2024-03-15T10:30:00Z',
      updatedAt: '2024-03-15T10:30:00Z'
    },
    {
      id: '2',
      orderNumber: 'CMD-2024-002',
      customerName: 'Marie Nguema',
      customerPhone: '+241 77 23 45 67',
      items: [
        { id: '3', productId: '3', productName: 'Attiéké', quantity: 3, unitPrice: 2000, totalPrice: 6000, notes: '' }
      ],
      totalAmount: 6000,
      finalAmount: 6000,
      status: 'confirmed',
      orderDate: '2024-03-14',
      deliveryDate: '2024-03-16',
      paymentMethod: 'Mobile Money',
      notes: 'Livraison prévue',
      createdAt: '2024-03-14T14:20:00Z',
      updatedAt: '2024-03-14T14:20:00Z'
    },
    {
      id: '3',
      orderNumber: 'CMD-2024-003',
      customerName: 'Paul Ondo',
      customerPhone: '+241 62 98 76 54',
      items: [
        { id: '4', productId: '4', productName: 'Huile de palme 1L', quantity: 2, unitPrice: 2500, totalPrice: 5000, notes: '' }
      ],
      totalAmount: 5000,
      finalAmount: 5000,
      status: 'delivered',
      orderDate: '2024-03-13',
      deliveryDate: '2024-03-13',
      paymentMethod: 'Virement bancaire',
      notes: 'Livré le jour même',
      createdAt: '2024-03-13T09:15:00Z',
      updatedAt: '2024-03-13T18:30:00Z'
    }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [activeTab, setActiveTab] = useState<'orders' | 'tables'>('orders')

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm)
  ).filter(order =>
    selectedStatus === 'all' || order.status === selectedStatus
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'preparing':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'delivering':
        return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente'
      case 'confirmed':
        return 'Confirmée'
      case 'preparing':
        return 'En préparation'
      case 'delivering':
        return 'En livraison'
      case 'delivered':
        return 'Livrée'
      case 'cancelled':
        return 'Annulée'
      default:
        return status
    }
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setShowModal(true)
  }

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    // Logique de changement de statut à implémenter
    console.log('Changement de statut:', orderId, newStatus)
  }

  return (
    <div className="p-4">
      {/* Header Mobile-First */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Commandes</h1>
          <div className="bg-orange-500/20 backdrop-blur-sm px-3 py-1 rounded-lg">
            <span className="text-orange-400 text-sm font-medium">{businessType}</span>
          </div>
        </div>
        <p className="text-gray-400 text-sm md:text-base">Suivi des commandes et livraisons</p>
        {businessFeatures.allowsTableService && (
          <p className="text-green-400 text-xs mt-2">✓ Service de table activé</p>
        )}
      </div>

      {/* Tabs pour Restaurant */}
      {businessFeatures.allowsTableService && (
        <div className="flex space-x-1 mb-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'orders'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Commandes</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'tables'
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Tables</span>
          </button>
        </div>
      )}

      {/* Contenu selon l'onglet actif */}
      {activeTab === 'orders' ? (
        <>
          {/* Stats Cards - Mobile First */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <ShoppingCart className="h-8 w-8 text-orange-400" />
            <span className="text-2xl font-bold text-white">{orders.length}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Total Commandes</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Truck className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              {orders.filter(o => o.status === 'delivering').length}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">En Livraison</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Calendar className="h-8 w-8 text-green-400" />
            <span className="text-2xl font-bold text-white">
              {orders.filter(o => o.status === 'delivered').length}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Livrées</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Edit className="h-8 w-8 text-purple-400" />
            <span className="text-2xl font-bold text-white">
              {orders.filter(o => o.status === 'preparing').length}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">En Préparation</p>
        </div>
      </div>

      {/* Filters and Search - Mobile First */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher une commande..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all" className="bg-slate-800">Tous les statuts</option>
            <option value="pending" className="bg-slate-800">En attente</option>
            <option value="confirmed" className="bg-slate-800">Confirmée</option>
            <option value="preparing" className="bg-slate-800">En préparation</option>
            <option value="delivering" className="bg-slate-800">En livraison</option>
            <option value="delivered" className="bg-slate-800">Livrée</option>
            <option value="cancelled" className="bg-slate-800">Annulée</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedOrder(order)
              setShowDetails(true)
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{order.orderNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <span className="font-medium">Client:</span> {order.customerName}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Téléphone:</span> {order.customerPhone}
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium">Date:</span> {order.orderDate}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{order.finalAmount.toLocaleString('fr-GA')} XAF</p>
                  <p className="text-sm text-gray-400">{order.paymentMethod}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(order)
                    }}
                    className="p-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 rounded hover:bg-blue-500/20"
                    title="Modifier"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded hover:bg-red-500/20"
                    title="Supprimer"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Action de suppression à implémenter
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucune commande trouvée</h3>
          <p className="text-gray-400">
            {searchTerm || selectedStatus !== 'all' 
              ? 'Essayez de modifier vos filtres de recherche' 
              : 'Commencez par ajouter une nouvelle commande'
            }
          </p>
        </div>
      )}
        </>
      ) : (
        /* Section Tables pour Restaurant */
        <div>
          {/* Stats Tables */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Users className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold text-white">{tables.length}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Total Tables</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <span className="text-2xl font-bold text-white">
                  {tables.filter(t => t.status === 'available').length}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Disponibles</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Clock className="h-8 w-8 text-orange-400" />
                <span className="text-2xl font-bold text-white">
                  {tables.filter(t => t.status === 'occupied').length}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Occupées</p>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <Calendar className="h-8 w-8 text-purple-400" />
                <span className="text-2xl font-bold text-white">
                  {tables.filter(t => t.status === 'reserved').length}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Réservées</p>
            </div>
          </div>

          {/* Grid des Tables */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <div 
                key={table.id}
                className={`bg-black/40 backdrop-blur-md border rounded-lg p-4 cursor-pointer transition-all hover:border-orange-500 ${
                  table.status === 'available' ? 'border-green-500/30' :
                  table.status === 'occupied' ? 'border-red-500/30' :
                  table.status === 'reserved' ? 'border-yellow-500/30' :
                  'border-gray-500/30'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    table.status === 'available' ? 'bg-green-500/20 text-green-400' :
                    table.status === 'occupied' ? 'bg-red-500/20 text-red-400' :
                    table.status === 'reserved' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{table.number}</h3>
                  <p className="text-gray-400 text-sm">{table.capacity} personnes</p>
                  <p className={`text-xs mt-2 px-2 py-1 rounded-full ${
                    table.status === 'available' ? 'bg-green-500/20 text-green-400' :
                    table.status === 'occupied' ? 'bg-red-500/20 text-red-400' :
                    table.status === 'reserved' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {table.status === 'available' ? 'Disponible' :
                     table.status === 'occupied' ? 'Occupée' :
                     table.status === 'reserved' ? 'Réservée' :
                     'Nettoyage'}
                  </p>
                  {table.currentOrder && (
                    <p className="text-orange-400 text-xs mt-1">
                      Commande: {table.currentOrder}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
