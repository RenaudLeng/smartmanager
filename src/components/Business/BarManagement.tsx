'use client'

import { useState, useEffect } from 'react'
import { Beer, Wine, Coffee, Cookie, AlertTriangle, TrendingUp, Clock, Users } from 'lucide-react'
import { BarProduct, BarOrder, BarInventory } from '@/types/business'

interface BarManagementProps {
  tenantId: string
}

export default function BarManagement({ tenantId }: BarManagementProps) {
  const [products, setProducts] = useState<BarProduct[]>([])
  const [orders, setOrders] = useState<BarOrder[]>([])
  const [inventory, setInventory] = useState<BarInventory[]>([])
  const [activeTab, setActiveTab] = useState<'ventes' | 'stocks' | 'inventaire'>('ventes')
  const [newOrder, setNewOrder] = useState<Partial<BarOrder>>({
    items: [],
    status: 'pending',
    paymentMethod: 'cash'
  })

  // Données de démonstration pour un bar
  useEffect(() => {
    setProducts([
      {
        id: '1',
        name: 'Castel Beer 33cl',
        category: 'alcool',
        price: 800,
        stock: 120,
        stockUnit: 'bouteille',
        alcoholPercentage: 5.5,
        supplier: 'SOGBRA',
        minStock: 20
      },
      {
        id: '2',
        name: 'Coca-Cola 33cl',
        category: 'soft',
        price: 500,
        stock: 80,
        stockUnit: 'canette',
        supplier: 'Coca-Cola Gabon',
        minStock: 15
      },
      {
        id: '3',
        name: 'Café expresso',
        category: 'chaud',
        price: 300,
        stock: 1000,
        stockUnit: 'litre',
        supplier: 'Café Gabonais',
        minStock: 50
      },
      {
        id: '4',
        name: 'Chips',
        category: 'snack',
        price: 200,
        stock: 50,
        stockUnit: 'unité',
        supplier: 'Snack Master',
        minStock: 10
      }
    ])

    setOrders([
      {
        id: '1',
        tableNumber: 5,
        items: [
          { productId: '1', quantity: 2, price: 800, total: 1600 },
          { productId: '2', quantity: 1, price: 500, total: 500 }
        ],
        customerName: 'Client Table 5',
        status: 'served',
        paymentMethod: 'cash',
        totalAmount: 2100,
        createdAt: new Date(),
        servedAt: new Date()
      }
    ])

    setInventory([
      {
        productId: '1',
        currentStock: 120,
        lastRestock: new Date(),
        consumptionRate: 15,
        daysUntilEmpty: 8,
        needsRestock: false
      }
    ])
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alcool': return <Beer className="w-4 h-4" />
      case 'soft': return <Coffee className="w-4 h-4" />
      case 'chaud': return <Coffee className="w-4 h-4" />
      case 'snack': return <Cookie className="w-4 h-4" />
      default: return <Wine className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'preparing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'served': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'paid': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const addToOrder = (product: BarProduct) => {
    setNewOrder(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          productId: product.id,
          quantity: 1,
          price: product.price,
          total: product.price
        }
      ]
    }))
  }

  const getTotalOrder = () => {
    return newOrder.items?.reduce((total, item) => total + item.total, 0) || 0
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Beer className="w-8 h-8 text-orange-500" />
            Gestion du Bar
          </h1>
          <p className="text-gray-400">
            Gestion des consommations, stocks et commandes du bar
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ventes du jour</p>
                <p className="text-2xl font-bold text-green-400">125 000 XAF</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Commandes en cours</p>
                <p className="text-2xl font-bold text-blue-400">8</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Stocks critiques</p>
                <p className="text-2xl font-bold text-orange-400">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Clients ce soir</p>
                <p className="text-2xl font-bold text-purple-400">45</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {['ventes', 'stocks', 'inventaire'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'ventes' ? 'Ventes' : tab === 'stocks' ? 'Stocks' : 'Inventaire'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'ventes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Produits */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Produits disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(product.category)}
                        <h3 className="font-semibold">{product.name}</h3>
                      </div>
                      <span className="text-lg font-bold text-orange-400">
                        {product.price.toLocaleString('fr-GA')} XAF
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Stock: {product.stock} {product.stockUnit}</span>
                      <button
                        onClick={() => addToOrder(product)}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Commandes */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Commandes en cours</h2>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
                <h3 className="font-medium mb-3">Nouvelle commande</h3>
                {newOrder.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-sm">
                      {products.find(p => p.id === item.productId)?.name} x{item.quantity}
                    </span>
                    <span className="text-orange-400">
                      {item.total.toLocaleString('fr-GA')} XAF
                    </span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-orange-400">
                      {getTotalOrder().toLocaleString('fr-GA')} XAF
                    </span>
                  </div>
                  <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
                    Enregistrer la commande
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Table {order.tableNumber}</span>
                      <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>{order.customerName}</p>
                      <p className="text-orange-400 font-medium">
                        {order.totalAmount.toLocaleString('fr-GA')} XAF
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stocks' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion des stocks</h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Produit</th>
                    <th className="px-4 py-3 text-left">Stock actuel</th>
                    <th className="px-4 py-3 text-left">Stock min</th>
                    <th className="px-4 py-3 text-left">Consommation/jour</th>
                    <th className="px-4 py-3 text-left">Jours restants</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => {
                    const product = products.find(p => p.id === item.productId)
                    return (
                      <tr key={item.productId} className="border-t border-gray-700">
                        <td className="px-4 py-3">{product?.name}</td>
                        <td className="px-4 py-3">{item.currentStock} {product?.stockUnit}</td>
                        <td className="px-4 py-3">{product?.minStock} {product?.stockUnit}</td>
                        <td className="px-4 py-3">{item.consumptionRate} {product?.stockUnit}</td>
                        <td className="px-4 py-3">{item.daysUntilEmpty} jours</td>
                        <td className="px-4 py-3">
                          {item.needsRestock ? (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                              À réapprovisionner
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventaire' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Inventaire complet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon(product.category)}
                    <h3 className="font-semibold">{product.name}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prix:</span>
                      <span>{product.price.toLocaleString('fr-GA')} XAF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stock:</span>
                      <span>{product.stock} {product.stockUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Fournisseur:</span>
                      <span>{product.supplier}</span>
                    </div>
                    {product.alcoholPercentage && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Alcool:</span>
                        <span>{product.alcoholPercentage}%</span>
                      </div>
                    )}
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
