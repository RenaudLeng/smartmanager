'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Edit2, Trash2, ShoppingCart, Truck, FileText, X, Grid, List, Calendar, Edit } from 'lucide-react'

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

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'CMD-2024-001',
          customerName: 'Jean-Baptiste Ondo',
          customerPhone: '+241 07 23 45 67',
          items: [
            {
              id: '1',
              productId: '1',
              productName: 'Riz gabonais 1kg',
              quantity: 5,
              unitPrice: 1500,
              totalPrice: 7500,
              notes: ''
            },
            {
              id: '2',
              productId: '2',
              productName: 'Huile de palme 1L',
              quantity: 2,
              unitPrice: 2500,
              totalPrice: 5000,
              notes: ''
            }
          ],
          totalAmount: 12500,
          finalAmount: 12500,
          status: 'delivered',
          orderDate: '2024-03-10',
          deliveryDate: '2024-03-10',
          paymentMethod: 'cash',
          notes: 'Livraison au domicile',
          createdAt: '2024-03-10',
          updatedAt: '2024-03-10'
        },
        {
          id: '2',
          orderNumber: 'CMD-2024-002',
          customerName: 'Marie Léontine Obame',
          customerPhone: '+241 06 45 67 89',
          items: [
            {
              id: '1',
              productId: '3',
              productName: 'Sucre local 1kg',
              quantity: 3,
              unitPrice: 1200,
              totalPrice: 3600,
              notes: ''
            }
          ],
          totalAmount: 3600,
          finalAmount: 3600,
          status: 'confirmed',
          orderDate: '2024-03-12',
          deliveryDate: '2024-03-13',
          paymentMethod: 'mobile_money',
          notes: 'Livraison prévue pour demain',
          createdAt: '2024-03-12',
          updatedAt: '2024-03-12'
        },
        {
          id: '3',
          orderNumber: 'CMD-2024-003',
          customerName: 'Paul Nguema',
          customerPhone: '+241 02 34 56 78',
          items: [
            {
              id: '1',
              productId: '4',
              productName: 'Coca-Cola 33cl',
              quantity: 12,
              unitPrice: 300,
              totalPrice: 3600,
              notes: ''
            }
          ],
          totalAmount: 3600,
          finalAmount: 3600,
          status: 'preparing',
          orderDate: '2024-03-15',
          deliveryDate: '2024-03-15',
          paymentMethod: 'mixed',
          notes: 'Commande en préparation',
          createdAt: '2024-03-15',
          updatedAt: '2024-03-15'
        }
      ]
      setOrders(mockOrders)
    }, 1000)
  }, [])

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status === selectedStatus
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'preparing':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'delivering':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
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
      case 'pending': return 'En attente'
      case 'confirmed': return 'Confirmée'
      case 'preparing': return 'En préparation'
      case 'delivering': return 'En livraison'
      case 'delivered': return 'Livrée'
      case 'cancelled': return 'Annulée'
      default: return status
    }
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setShowModal(true)
  }

  const handleSave = () => {
    if (editingOrder) {
      console.log('Sauvegarde de la commande:', editingOrder)
      setShowModal(false)
      setEditingOrder(null)
    }
  }

  const handleStatusChange = (orderId: string, newStatus: string) => {
    console.log('Changement de statut:', orderId, newStatus)
    // Ici vous ajouteriez la logique pour mettre à jour le statut
  }

  const generateInvoice = (order: Order) => {
    console.log('Génération de la facture pour:', order.orderNumber)
    // Ici vous ajouteriez la logique pour générer la facture
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-400 mb-2 font-serif">Commandes</h1>
        <p className="text-gray-200 text-sm md:text-base">Gérez vos commandes et factures</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-l-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Vue grille"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-r-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-orange-500/25 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            Nouvelle commande
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="preparing">En préparation</option>
          <option value="delivering">En livraison</option>
          <option value="delivered">Livrées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>

      {/* Orders Display - Grid or List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200 cursor-pointer"
              onClick={() => {
                setSelectedOrder(order)
                setShowDetails(true)
              }}
            >
              {/* Order Header - Optimized */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <ShoppingCart className="h-4 w-4 text-orange-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 truncate">{order.customerName}</p>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>
                <div className="flex space-x-1 shrink-0">
                  <button 
                    className="p-1.5 text-orange-400 hover:text-orange-300 bg-orange-500/10 rounded hover:bg-orange-500/20"
                    title="Modifier"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(order)
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded hover:bg-red-500/20"
                    title="Supprimer"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Suppression de la commande:', order.id)
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Essential Info Only */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-400">
                  <Calendar className="h-3.5 w-3.5 mr-2 shrink-0" />
                  <span className="text-xs">{order.orderDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Total:</span>
                  <span className="text-white font-semibold text-sm">{(order.totalAmount / 1000).toFixed(0)}k XAF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Articles:</span>
                  <span className="text-gray-300 text-xs">{order.items.length} produits</span>
                </div>
              </div>

              {/* Quick Actions - Compact */}
              <div className="flex space-x-1 mt-3 pt-3 border-t border-white/20">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange(order.id, order.status === 'delivered' ? 'cancelled' : 'delivered')
                  }}
                  className={`flex-1 px-2 py-1 text-xs rounded font-medium transition-colors ${
                    order.status === 'delivered' 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }`}
                >
                  {order.status === 'delivered' ? 'Annuler' : 'Livrée'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    generateInvoice(order)
                  }}
                  className="px-2 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-xs font-medium transition-colors"
                  title="Facture"
                >
                  <FileText className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/60 border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Commande</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Articles</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-white">{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white">{order.customerName}</div>
                      <div className="text-sm text-gray-400">{order.customerPhone}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">
                      <div>{order.orderDate}</div>
                      {order.deliveryDate && (
                        <div className="flex items-center space-x-1">
                          <Truck className="h-3 w-3" />
                          <span>{order.deliveryDate}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-green-400 font-semibold">
                      {order.totalAmount.toLocaleString('fr-GA')} XAF
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="text-gray-400">
                            {item.quantity}x {item.productName}
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <div className="text-gray-500 text-xs">+{order.items.length - 2} autres...</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => generateInvoice(order)}
                          className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-medium transition-colors"
                          title="Facture"
                        >
                          <FileText className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, order.status === 'delivered' ? 'cancelled' : 'delivered')}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                          title={order.status === 'delivered' ? 'Annuler' : 'Marquer livrée'}
                        >
                          {order.status === 'delivered' ? 'X' : '✓'}
                        </button>
                        <button
                          onClick={() => {
                            console.log('Suppression de la commande:', order.id)
                          }}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingOrder ? 'Modifier la commande' : 'Nouvelle commande'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {editingOrder ? 'Mettez à jour les informations de la commande' : 'Créez une nouvelle commande'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Numéro de commande</label>
                <input
                  type="text"
                  value={editingOrder?.orderNumber || ''}
                  onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, orderNumber: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom du client</label>
                <input
                  type="text"
                  value={editingOrder?.customerName || ''}
                  onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, customerName: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone du client</label>
                <input
                  type="tel"
                  value={editingOrder?.customerPhone || ''}
                  onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, customerPhone: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date de commande</label>
                <input
                  type="date"
                  value={editingOrder?.orderDate || ''}
                  onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, orderDate: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date de livraison</label>
                <input
                  type="date"
                  value={editingOrder?.deliveryDate || ''}
                  onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, deliveryDate: e.target.value} : null)}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                <select
                  value={editingOrder?.status || ''}
                  onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, status: e.target.value as Order['status']} : null)}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="preparing">En préparation</option>
                  <option value="delivering">En livraison</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={editingOrder?.notes || ''}
                  onChange={(e) => setEditingOrder(editingOrder ? {...editingOrder, notes: e.target.value} : null)}
                  rows={4}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium shadow-lg shadow-orange-500/25"
              >
                {editingOrder ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{selectedOrder.orderNumber}</h2>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                  <span className="text-gray-400">Client: {selectedOrder.customerName}</span>
                  <span className="text-gray-400">{selectedOrder.customerPhone}</span>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Order Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Items List */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Articles commandés</h3>
                  <div className="bg-black/40 rounded-lg p-4 space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-white">{item.productName}</div>
                          <div className="text-sm text-gray-400">{item.notes || 'Sans notes'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">{item.quantity} × {(item.unitPrice / 1000).toFixed(0)}k XAF</div>
                          <div className="font-semibold text-green-400">{(item.totalPrice / 1000).toFixed(0)}k XAF</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Notes de commande</h3>
                    <div className="bg-black/40 rounded-lg p-4">
                      <p className="text-gray-300">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="space-y-6">
                {/* Dates */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Informations</h3>
                  <div className="bg-black/40 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date commande:</span>
                      <span className="text-white">{selectedOrder.orderDate}</span>
                    </div>
                    {selectedOrder.deliveryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Date livraison:</span>
                        <span className="text-white">{selectedOrder.deliveryDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Paiement:</span>
                      <span className="text-white">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Résumé financier</h3>
                  <div className="bg-black/40 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sous-total:</span>
                      <span className="text-white">{(selectedOrder.totalAmount / 1000).toFixed(0)}k XAF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Réduction:</span>
                      <span className="text-green-400">-{((selectedOrder.totalAmount - selectedOrder.finalAmount) / 1000).toFixed(0)}k XAF</span>
                    </div>
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-white">Total:</span>
                        <span className="text-green-400">{(selectedOrder.finalAmount / 1000).toFixed(0)}k XAF</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Actions rapides</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => generateInvoice(selectedOrder)}
                      className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Générer facture</span>
                    </button>
                    <button
                      onClick={() => {
                        handleEdit(selectedOrder)
                        setShowDetails(false)
                      }}
                      className="w-full px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium transition-colors"
                    >
                      Modifier la commande
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, selectedOrder.status === 'delivered' ? 'cancelled' : 'delivered')}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedOrder.status === 'delivered' 
                          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' 
                          : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                      }`}
                    >
                      {selectedOrder.status === 'delivered' ? 'Annuler la commande' : 'Marquer comme livrée'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-white/20">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
