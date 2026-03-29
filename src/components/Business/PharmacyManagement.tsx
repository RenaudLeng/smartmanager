'use client'

import { useState, useEffect } from 'react'
import { Pill, AlertTriangle, Calendar, FileText, Shield, Clock, TrendingUp, Users, Package } from 'lucide-react'
import { PharmacyProduct, PharmacySale } from '@/types/business'

interface PharmacyManagementProps {
  tenantId: string
}

export default function PharmacyManagement({ tenantId }: PharmacyManagementProps) {
  const [products, setProducts] = useState<PharmacyProduct[]>([])
  const [sales, setSales] = useState<PharmacySale[]>([])
  const [activeTab, setActiveTab] = useState<'ventes' | 'stocks' | 'ordonnances' | 'assurances'>('ventes')
  const [newSale, setNewSale] = useState<Partial<PharmacySale>>({
    items: [],
    paymentMethod: 'cash',
    totalAmount: 0,
    paidAmount: 0
  })

  // Données de démonstration pour une pharmacie
  useEffect(() => {
    setProducts([
      {
        id: '1',
        name: 'Paracétamol 500mg',
        genericName: 'Acétaminophène',
        category: 'medicament',
        price: 250,
        stock: 150,
        stockUnit: 'boîte',
        requiresPrescription: false,
        expiryDate: new Date('2025-12-31'),
        batchNumber: 'PA2024001',
        supplier: 'PharmaGab',
        storageCondition: 'normal',
        minStock: 30,
        insuranceCoverage: ['CNAMGS', 'CNAO']
      },
      {
        id: '2',
        name: 'Amoxicilline 1g',
        genericName: 'Amoxicilline trihydratée',
        category: 'medicament',
        price: 1500,
        stock: 80,
        stockUnit: 'boîte',
        requiresPrescription: true,
        expiryDate: new Date('2025-08-15'),
        batchNumber: 'AM2024002',
        supplier: 'Sanofi Gabon',
        storageCondition: 'normal',
        minStock: 20,
        insuranceCoverage: ['CNAMGS']
      },
      {
        id: '3',
        name: 'Vitamine C 500mg',
        category: 'parapharmacie',
        price: 800,
        stock: 200,
        stockUnit: 'flacon',
        requiresPrescription: false,
        expiryDate: new Date('2026-03-31'),
        batchNumber: 'VC2024003',
        supplier: 'PharmaPlus',
        storageCondition: 'normal',
        minStock: 25
      },
      {
        id: '4',
        name: 'Thermomètre digital',
        category: 'accessoire',
        price: 3500,
        stock: 30,
        stockUnit: 'unité',
        requiresPrescription: false,
        expiryDate: new Date('2027-01-01'),
        batchNumber: 'TH2024004',
        supplier: 'Medical Supply',
        storageCondition: 'normal',
        minStock: 10
      }
    ])

    setSales([
      {
        id: '1',
        items: [
          { productId: '1', quantity: 2, price: 250 },
          { productId: '3', quantity: 1, price: 800 }
        ],
        customerName: 'Mba Aboubakar',
        customerInsurance: 'CNAMGS',
        totalAmount: 1300,
        insuranceAmount: 800,
        paidAmount: 500,
        paymentMethod: 'insurance',
        pharmacistName: 'Dr. Ndong Essame',
        createdAt: new Date()
      }
    ])
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medicament': return <Pill className="w-4 h-4" />
      case 'parapharmacie': return <Package className="w-4 h-4" />
      case 'accessoire': return <Shield className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getStorageConditionColor = (condition: string) => {
    switch (condition) {
      case 'refrigerated': return 'text-blue-400 bg-blue-500/20'
      case 'controlled': return 'text-red-400 bg-red-500/20'
      default: return 'text-green-400 bg-green-500/20'
    }
  }

  const getExpiryStatus = (expiryDate: Date) => {
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 30) {
      return { text: 'Expiré bientôt', color: 'text-red-400 bg-red-500/20' }
    } else if (daysUntilExpiry < 90) {
      return { text: `${daysUntilExpiry} jours`, color: 'text-orange-400 bg-orange-500/20' }
    } else {
      return { text: `${daysUntilExpiry} jours`, color: 'text-green-400 bg-green-500/20' }
    }
  }

  const addToSale = (product: PharmacyProduct) => {
    setNewSale(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          productId: product.id,
          quantity: 1,
          price: product.price
        }
      ]
    }))
  }

  const getTotalSale = () => {
    return newSale.items?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Pill className="w-8 h-8 text-green-500" />
            Gestion de la Pharmacie
          </h1>
          <p className="text-gray-400">
            Gestion des médicaments, ordonnances et assurances
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ventes du jour</p>
                <p className="text-2xl font-bold text-green-400">45 000 XAF</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ordonnances</p>
                <p className="text-2xl font-bold text-blue-400">12</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Médicaments expirés</p>
                <p className="text-2xl font-bold text-red-400">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Assurances</p>
                <p className="text-2xl font-bold text-purple-400">8</p>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {['ventes', 'stocks', 'ordonnances', 'assurances'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'ventes' ? 'Ventes' : 
               tab === 'stocks' ? 'Stocks' : 
               tab === 'ordonnances' ? 'Ordonnances' : 'Assurances'}
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
                  const expiryStatus = getExpiryStatus(product.expiryDate)
                  return (
                    <div key={product.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(product.category)}
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            {product.genericName && (
                              <p className="text-xs text-gray-400">{product.genericName}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-lg font-bold text-green-400">
                          {product.price.toLocaleString('fr-GA')} XAF
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Stock:</span>
                          <span>{product.stock} {product.stockUnit}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Expiration:</span>
                          <span className={`px-2 py-1 rounded text-xs ${expiryStatus.color}`}>
                            {expiryStatus.text}
                          </span>
                        </div>
                        {product.requiresPrescription && (
                          <div className="flex items-center gap-2 text-orange-400">
                            <FileText className="w-3 h-3" />
                            <span>Ordonnance requise</span>
                          </div>
                        )}
                        {product.insuranceCoverage && product.insuranceCoverage.length > 0 && (
                          <div className="flex items-center gap-2 text-blue-400">
                            <Shield className="w-3 h-3" />
                            <span>{product.insuranceCoverage.join(', ')}</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => addToSale(product)}
                        className="w-full mt-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
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
              <h2 className="text-xl font-semibold mb-4">Vente en cours</h2>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
                <h3 className="font-medium mb-3">Nouvelle vente</h3>
                {newSale.items?.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700">
                    <span className="text-sm">
                      {products.find(p => p.id === item.productId)?.name} x{item.quantity}
                    </span>
                    <span className="text-green-400">
                      {(item.price * item.quantity).toLocaleString('fr-GA')} XAF
                    </span>
                  </div>
                ))}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Total:</span>
                    <span className="text-xl font-bold text-green-400">
                      {getTotalSale().toLocaleString('fr-GA')} XAF
                    </span>
                  </div>
                  <button className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">
                    Enregistrer la vente
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {sales.map((sale) => (
                  <div key={sale.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{sale.customerName}</span>
                      <span className="text-sm text-green-400">
                        {sale.totalAmount.toLocaleString('fr-GA')} XAF
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>Pharmacien: {sale.pharmacistName}</p>
                      {sale.customerInsurance && (
                        <p className="text-blue-400">Assurance: {sale.customerInsurance}</p>
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
            <h2 className="text-xl font-semibold mb-4">Gestion des stocks</h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Médicament</th>
                    <th className="px-4 py-3 text-left">Stock actuel</th>
                    <th className="px-4 py-3 text-left">Stock min</th>
                    <th className="px-4 py-3 text-left">Date expiration</th>
                    <th className="px-4 py-3 text-left">Stockage</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const expiryStatus = getExpiryStatus(product.expiryDate)
                    const isLowStock = product.stock <= product.minStock
                    return (
                      <tr key={product.id} className="border-t border-gray-700">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(product.category)}
                            <div>
                              <div className="font-medium">{product.name}</div>
                              {product.genericName && (
                                <div className="text-xs text-gray-400">{product.genericName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{product.stock} {product.stockUnit}</td>
                        <td className="px-4 py-3">{product.minStock} {product.stockUnit}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${expiryStatus.color}`}>
                            {expiryStatus.text}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${getStorageConditionColor(product.storageCondition)}`}>
                            {product.storageCondition === 'refrigerated' ? 'Réfrigéré' : 
                             product.storageCondition === 'controlled' ? 'Contrôlé' : 'Normal'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isLowStock ? (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                              Stock faible
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

        {activeTab === 'ordonnances' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion des ordonnances</h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="text-center text-gray-400">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Module ordonnances en développement</p>
                <p className="text-sm mt-2">Numérisation et gestion des ordonnances médicales</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assurances' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion des assurances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['CNAMGS', 'CNAO', 'Mutuelles privées'].map((insurance) => (
                <div key={insurance} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold">{insurance}</h3>
                    </div>
                    <span className="text-green-400">Actif</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <div className="flex justify-between">
                      <span>Ventes du mois:</span>
                      <span>45</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remboursements:</span>
                      <span>120 000 XAF</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux couverture:</span>
                      <span>70%</span>
                    </div>
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
