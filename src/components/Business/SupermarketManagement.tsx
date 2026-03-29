'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, TrendingUp, AlertTriangle, Barcode, Users, CreditCard } from 'lucide-react'
import { SupermarketProduct, SupermarketSale } from '@/types/business'

interface SupermarketManagementProps {
  tenantId: string
}

export default function SupermarketManagement({ tenantId }: SupermarketManagementProps) {
  const [products, setProducts] = useState<SupermarketProduct[]>([])
  const [sales, setSales] = useState<SupermarketSale[]>([])
  const [activeTab, setActiveTab] = useState<'ventes' | 'stocks' | 'caisses' | 'promotions'>('ventes')
  const [newSale, setNewSale] = useState<Partial<SupermarketSale>>({
    items: [],
    paymentMethod: 'cash',
    totalAmount: 0,
    discountAmount: 0,
    finalAmount: 0
  })

  // Données de démonstration pour un supermarché
  useEffect(() => {
    setProducts([
      {
        id: '1',
        name: 'Riz gabonais 1kg',
        barcode: 'GA123456789',
        category: 'Alimentaire',
        subcategory: 'Céréales',
        price: 1500,
        cost: 1200,
        stock: 250,
        stockUnit: 'sac',
        location: 'rayon',
        shelfLocation: 'A1-2',
        supplier: 'Rizerie du Gabon',
        lastRestock: new Date('2024-03-20'),
        expiryDate: new Date('2025-03-20'),
        promotionalPrice: 1300,
        promotionalStart: new Date('2024-03-15'),
        promotionalEnd: new Date('2024-03-25'),
        minStock: 50,
        maxStock: 500,
        reorderPoint: 75
      },
      {
        id: '2',
        name: 'Huile de palme 1L',
        barcode: 'GA987654321',
        category: 'Alimentaire',
        subcategory: 'Huiles',
        price: 1500,
        cost: 1100,
        stock: 180,
        stockUnit: 'bouteille',
        location: 'rayon',
        shelfLocation: 'B2-3',
        supplier: 'SOGEPA',
        lastRestock: new Date('2024-03-18'),
        expiryDate: new Date('2025-06-18'),
        minStock: 30,
        maxStock: 300,
        reorderPoint: 45
      },
      {
        id: '3',
        name: 'Sucre 1kg',
        barcode: 'GA456789123',
        category: 'Alimentaire',
        subcategory: 'Sucre',
        price: 1000,
        cost: 800,
        stock: 320,
        stockUnit: 'paquet',
        location: 'rayon',
        shelfLocation: 'A1-4',
        supplier: 'Sucrerie Gabonaise',
        lastRestock: new Date('2024-03-22'),
        expiryDate: new Date('2026-03-22'),
        minStock: 40,
        maxStock: 400,
        reorderPoint: 60
      },
      {
        id: '4',
        name: 'Savon 200g',
        barcode: 'GA789123456',
        category: 'Hygiène',
        subcategory: 'Savons',
        price: 500,
        cost: 350,
        stock: 450,
        stockUnit: 'unité',
        location: 'rayon',
        shelfLocation: 'C3-1',
        supplier: 'Unilever Gabon',
        lastRestock: new Date('2024-03-19'),
        expiryDate: new Date('2027-03-19'),
        minStock: 100,
        maxStock: 600,
        reorderPoint: 150
      },
      {
        id: '5',
        name: 'Lait 1L',
        barcode: 'GA321654987',
        category: 'Produits frais',
        subcategory: 'Lait',
        price: 800,
        cost: 600,
        stock: 80,
        stockUnit: 'bouteille',
        location: 'réfrigéré',
        shelfLocation: 'D1-2',
        supplier: 'Laiterie Gabon',
        lastRestock: new Date('2024-03-23'),
        expiryDate: new Date('2024-04-02'),
        minStock: 20,
        maxStock: 150,
        reorderPoint: 30
      }
    ])

    setSales([
      {
        id: '1',
        items: [
          { productId: '1', quantity: 2, price: 1500, discount: 200 },
          { productId: '2', quantity: 1, price: 1500 },
          { productId: '4', quantity: 3, price: 500 }
        ],
        totalAmount: 5500,
        discountAmount: 400,
        finalAmount: 5100,
        paymentMethod: 'card',
        customerInfo: {
          name: 'Ondo Oba',
          fidelityCard: 'FID123456',
          points: 150
        },
        cashierId: 'CASH001',
        checkoutNumber: 1,
        createdAt: new Date()
      },
      {
        id: '2',
        items: [
          { productId: '3', quantity: 1, price: 1000 },
          { productId: '5', quantity: 2, price: 800 }
        ],
        totalAmount: 2600,
        discountAmount: 0,
        finalAmount: 2600,
        paymentMethod: 'mobile',
        customerInfo: {
          name: 'Marie Nze',
          fidelityCard: 'FID789012',
          points: 80
        },
        cashierId: 'CASH002',
        checkoutNumber: 2,
        createdAt: new Date()
      }
    ])
  }, [])

  const getStockStatus = (product: SupermarketProduct) => {
    if (product.stock <= product.minStock) {
      return { text: 'Stock critique', color: 'text-red-400 bg-red-500/20' }
    } else if (product.stock <= product.reorderPoint) {
      return { text: 'À réapprovisionner', color: 'text-orange-400 bg-orange-500/20' }
    } else if (product.stock >= product.maxStock) {
      return { text: 'Stock excessif', color: 'text-blue-400 bg-blue-500/20' }
    } else {
      return { text: 'Stock normal', color: 'text-green-400 bg-green-500/20' }
    }
  }

  const getPromotionStatus = (product: SupermarketProduct) => {
    const now = new Date()
    if (product.promotionalStart && product.promotionalEnd) {
      if (now >= product.promotionalStart && now <= product.promotionalEnd) {
        return { active: true, text: 'En promotion', color: 'text-green-400 bg-green-500/20' }
      } else if (now < product.promotionalStart) {
        return { active: false, text: 'Promotion bientôt', color: 'text-blue-400 bg-blue-500/20' }
      }
    }
    return { active: false, text: 'Pas de promotion', color: 'text-gray-400 bg-gray-500/20' }
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵'
      case 'card': return '💳'
      case 'mobile': return '📱'
      case 'ticket': return '🎫'
      default: return '💵'
    }
  }

  const addToSale = (product: SupermarketProduct) => {
    const price = product.promotionalStart && product.promotionalEnd && 
                 new Date() >= product.promotionalStart && new Date() <= product.promotionalEnd 
                 ? (product.promotionalPrice ?? product.price) : product.price
    
    setNewSale(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          productId: product.id,
          quantity: 1,
          price: price
        }
      ]
    }))
  }

  const getTotalSale = () => {
    const total = newSale.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
    const discount = newSale.discountAmount || 0
    return {
      total,
      discount,
      final: total - discount
    }
  }

  const checkouts = [
    { id: 'CASH001', number: 1, status: 'open', cashier: 'Alice', totalSales: 125000, customerCount: 45 },
    { id: 'CASH002', number: 2, status: 'open', cashier: 'Bob', totalSales: 98000, customerCount: 38 },
    { id: 'CASH003', number: 3, status: 'closed', cashier: 'Charlie', totalSales: 156000, customerCount: 52 },
    { id: 'CASH004', number: 4, status: 'open', cashier: 'Diana', totalSales: 112000, customerCount: 41 }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-red-500" />
            Gestion du Supermarché
          </h1>
          <p className="text-gray-400">
            Gestion avancée des stocks, caisses multiples et promotions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ventes du jour</p>
                <p className="text-2xl font-bold text-green-400">485 000 XAF</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Caisses actives</p>
                <p className="text-2xl font-bold text-blue-400">3/4</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Stocks critiques</p>
                <p className="text-2xl font-bold text-orange-400">5</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Clients fidèles</p>
                <p className="text-2xl font-bold text-purple-400">128</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {['ventes', 'stocks', 'caisses', 'promotions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'ventes' | 'stocks' | 'caisses' | 'promotions')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'ventes' ? 'Ventes' : 
               tab === 'stocks' ? 'Stocks' : 
               tab === 'caisses' ? 'Caisses' : 'Promotions'}
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
                {products.map((product) => {
                  const stockStatus = getStockStatus(product)
                  const promotionStatus = getPromotionStatus(product)
                  const currentPrice = promotionStatus.active ? product.promotionalPrice! : product.price
                  
                  return (
                    <div key={product.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Barcode className="w-4 h-4" />
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-xs text-gray-400">{product.barcode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-red-400">
                            {currentPrice.toLocaleString('fr-GA')} XAF
                          </span>
                          {promotionStatus.active && (
                            <div className="text-xs text-green-400 line-through">
                              {product.price.toLocaleString('fr-GA')} XAF
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Stock:</span>
                          <span>{product.stock} {product.stockUnit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Emplacement:</span>
                          <span>{product.shelfLocation}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Statut:</span>
                          <span className={`px-2 py-1 rounded text-xs ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                        {promotionStatus.active && (
                          <div className="flex items-center gap-2 text-green-400">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-xs">{promotionStatus.text}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => addToSale(product)}
                        className="w-full mt-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                      >
                        Ajouter à la vente
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Vente en cours */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Vente en cours - Caisse 1</h2>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
                <h3 className="font-medium mb-3">Nouvelle vente</h3>
                {newSale.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-sm">
                      {products.find(p => p.id === item.productId)?.name} x{item.quantity}
                    </span>
                    <span className="text-red-400">
                      {(item.price * item.quantity).toLocaleString('fr-GA')} XAF
                    </span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>{getTotalSale().total.toLocaleString('fr-GA')} XAF</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>Remise:</span>
                    <span>-{getTotalSale().discount.toLocaleString('fr-GA')} XAF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total final:</span>
                    <span className="text-xl font-bold text-red-400">
                      {getTotalSale().final.toLocaleString('fr-GA')} XAF
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <input
                    type="number"
                    placeholder="Remise (XAF)"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400"
                    value={newSale.discountAmount || ''}
                    onChange={(e) => setNewSale(prev => ({ ...prev, discountAmount: Number(e.target.value) }))}
                  />
                  <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
                    Finaliser la vente
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {sales.slice(0, 3).map((sale) => (
                  <div key={sale.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Caisse {sale.checkoutNumber}</span>
                      <span className="text-sm text-red-400">
                        {sale.finalAmount.toLocaleString('fr-GA')} XAF
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>Caissier: {sale.cashierId}</p>
                      <div className="flex items-center gap-2">
                        <span>{getPaymentIcon(sale.paymentMethod)}</span>
                        <span>{sale.paymentMethod}</span>
                      </div>
                      {sale.customerInfo?.fidelityCard && (
                        <p className="text-blue-400">Fidélité: {sale.customerInfo.points} pts</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stocks' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion avancée des stocks</h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Produit</th>
                    <th className="px-4 py-3 text-left">Code-barres</th>
                    <th className="px-4 py-3 text-left">Stock actuel</th>
                    <th className="px-4 py-3 text-left">Seuil</th>
                    <th className="px-4 py-3 text-left">Emplacement</th>
                    <th className="px-4 py-3 text-left">Dernier réappro.</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product)
                    return (
                      <tr key={product.id} className="border-t border-gray-700">
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-gray-400">{product.category} - {product.subcategory}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{product.barcode}</td>
                        <td className="px-4 py-3">{product.stock} {product.stockUnit}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div>Min: {product.minStock}</div>
                            <div>Max: {product.maxStock}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{product.shelfLocation}</td>
                        <td className="px-4 py-3">
                          {product.lastRestock.toLocaleDateString('fr-GA')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'caisses' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion des caisses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {checkouts.map((checkout) => (
                <div key={checkout.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Caisse {checkout.number}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      checkout.status === 'open' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {checkout.status === 'open' ? 'Ouverte' : 'Fermée'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Caissier:</span>
                      <span>{checkout.cashier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ventes:</span>
                      <span className="text-green-400">
                        {checkout.totalSales.toLocaleString('fr-GA')} XAF
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Clients:</span>
                      <span>{checkout.customerCount}</span>
                    </div>
                  </div>
                  <button className={`w-full mt-3 py-2 rounded text-sm transition-colors ${
                    checkout.status === 'open'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}>
                    {checkout.status === 'open' ? 'Fermer' : 'Ouvrir'}
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Résumé des caisses</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Total ventes</p>
                    <p className="text-2xl font-bold text-green-400">
                      {checkouts.reduce((sum, c) => sum + c.totalSales, 0).toLocaleString('fr-GA')} XAF
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Total clients</p>
                    <p className="text-2xl font-bold text-blue-400">
                      {checkouts.reduce((sum, c) => sum + c.customerCount, 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Panier moyen</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {Math.round(checkouts.reduce((sum, c) => sum + c.totalSales, 0) / 
                       checkouts.reduce((sum, c) => sum + c.customerCount, 0)).toLocaleString('fr-GA')} XAF
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">Caisses actives</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {checkouts.filter(c => c.status === 'open').length}/{checkouts.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'promotions' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion des promotions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.filter(p => p.promotionalStart && p.promotionalEnd).map((product) => {
                const promotionStatus = getPromotionStatus(product)
                return (
                  <div key={product.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{product.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${promotionStatus.color}`}>
                        {promotionStatus.text}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Prix normal:</span>
                        <span className="line-through text-gray-500">
                          {product.price.toLocaleString('fr-GA')} XAF
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Prix promo:</span>
                        <span className="text-green-400 font-medium">
                          {product.promotionalPrice!.toLocaleString('fr-GA')} XAF
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Remise:</span>
                        <span className="text-orange-400">
                          {Math.round((1 - product.promotionalPrice! / product.price) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Du:</span>
                        <span>{product.promotionalStart!.toLocaleDateString('fr-GA')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Au:</span>
                        <span>{product.promotionalEnd!.toLocaleDateString('fr-GA')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors">
                        Modifier
                      </button>
                      <button className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors">
                        Arrêter
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
