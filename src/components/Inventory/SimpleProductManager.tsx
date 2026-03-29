'use client'

import React, { useState } from 'react'
import { 
  Plus, Search, Camera, QrCode, Package, Edit2, Trash2,
  Save, X, DollarSign, Box, Barcode, Tag, Upload
} from 'lucide-react'
import { useValidationMessages, validateForm, FieldError, ValidationMessages } from '@/components/ui/ValidationMessages'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  barcode?: string
  quickCode?: string
  image?: string
  description?: string
  minStock?: number
  supplier?: string
  costPrice?: number
}

const CATEGORIES = [
  'Boissons',
  'Plats préparés',
  'Boulangerie',
  'Épicerie',
  'Produits frais',
  'Produits ménagers',
  'Hygiène',
  'Autres'
]

export default function SimpleProductManager() {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Régab 33cl', price: 500, stock: 100, category: 'Boissons', quickCode: 'REG33', costPrice: 350, minStock: 20 },
    { id: '2', name: 'Poulet Moambe', price: 3500, stock: 20, category: 'Plats préparés', quickCode: 'MOAM', costPrice: 2500, minStock: 5 },
    { id: '3', name: 'Pain Baguette', price: 250, stock: 50, category: 'Boulangerie', quickCode: 'PAIN', costPrice: 180, minStock: 10 },
    { id: '4', name: 'Riz 1kg', price: 1500, stock: 30, category: 'Épicerie', quickCode: 'RIZ1', costPrice: 1200, minStock: 15 },
    { id: '5', name: 'Huile Palme 1L', price: 2000, stock: 25, category: 'Épicerie', quickCode: 'HUIL', costPrice: 1600, minStock: 8 }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [validationWarnings, setValidationWarnings] = useState<string[]>([])
  const { messages, success, error, warning, info, removeMessage } = useValidationMessages()
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    price: 0,
    stock: 0,
    category: CATEGORIES[0],
    quickCode: '',
    costPrice: 0,
    minStock: 5,
    description: '',
    supplier: ''
  })

  // Règles de validation
  const validationRules = {
    name: {
      required: true,
      label: 'Nom du produit',
      minLength: 2,
      maxLength: 100,
      custom: (value: string) => {
        if (products.some(p => p.name.toLowerCase() === value.toLowerCase() && p.id !== editingProduct?.id)) {
          return 'Ce produit existe déjà'
        }
      }
    },
    price: {
      required: true,
      type: 'number',
      label: 'Prix de vente',
      min: 50,
      max: 1000000,
      custom: (value: number) => {
        if (formData.costPrice && value <= formData.costPrice) {
          return 'Le prix de vente doit être supérieur au prix d\'achat'
        }
      }
    },
    costPrice: {
      type: 'number',
      label: 'Prix d\'achat',
      min: 0,
      max: 500000
    },
    stock: {
      required: true,
      type: 'number',
      label: 'Stock initial',
      min: 0,
      max: 10000
    },
    minStock: {
      type: 'number',
      label: 'Stock minimum',
      min: 0,
      max: 1000
    },
    quickCode: {
      maxLength: 10,
      label: 'Code rapide',
      custom: (value: string) => {
        if (value && products.some(p => p.quickCode?.toLowerCase() === value.toLowerCase() && p.id !== editingProduct?.id)) {
          return 'Ce code rapide existe déjà'
        }
      }
    },
    barcode: {
      maxLength: 50,
      label: 'Code barre'
    },
    supplier: {
      maxLength: 100,
      label: 'Fournisseur'
    },
    description: {
      maxLength: 500,
      label: 'Description'
    }
  }

  // Filtrer produits
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.quickCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Générer code rapide automatiquement
  const generateQuickCode = (name: string): string => {
    const words = name.split(' ')
    let code = ''
    
    if (words.length >= 2) {
      // Prendre les 2 premières lettres des 2 premiers mots
      code = words[0].substring(0, 2).toUpperCase() + words[1].substring(0, 2).toUpperCase()
    } else if (words.length === 1) {
      // Prendre les 4 premières lettres
      code = words[0].substring(0, 4).toUpperCase()
    }
    
    // Ajouter nombre si code existe déjà
    let finalCode = code
    let counter = 1
    while (products.some(p => p.quickCode === finalCode)) {
      finalCode = code + counter.toString()
      counter++
    }
    
    return finalCode
  }

  // Ajouter/Mettre à jour produit
  const saveProduct = () => {
    // Validation du formulaire
    const validation = validateForm(formData, validationRules)
    
    if (validation.errors.length > 0) {
      setValidationErrors(validation.errors)
      setValidationWarnings(validation.warnings)
      
      // Afficher les erreurs dans des popups
      error('Erreur de validation', validation.errors.join(', '))
      
      // Afficher les warnings séparément
      if (validation.warnings.length > 0) {
        warning('Attention', validation.warnings.join(', '))
      }
      return
    }

    // Si warnings mais pas d'erreurs
    if (validation.warnings.length > 0) {
      warning('Attention', validation.warnings.join(', '))
    }

    const productData = {
      ...formData,
      quickCode: formData.quickCode || generateQuickCode(formData.name || ''),
      id: editingProduct?.id || Date.now().toString()
    } as Product

    if (editingProduct) {
      // Mise à jour
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p))
      success('Produit mis à jour', `${productData.name} a été modifié avec succès`)
    } else {
      // Ajout
      setProducts(prev => [...prev, productData])
      success('Produit ajouté', `${productData.name} a été ajouté avec succès`)
    }

    resetForm()
  }

  // Supprimer produit
  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id)
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product?.name}"?`)) {
      setProducts(prev => prev.filter(p => p.id !== id))
      success('Produit supprimé', `${product?.name} a été supprimé avec succès`)
    }
  }

  // Modifier produit
  const editProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData(product)
    setShowAddForm(true)
    info('Modification', `Modification de ${product.name}`)
  }

  // Reset formulaire
  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      stock: 0,
      category: CATEGORIES[0],
      quickCode: '',
      costPrice: 0,
      minStock: 5,
      description: '',
      supplier: ''
    })
    setEditingProduct(null)
    setShowAddForm(false)
    setValidationErrors([])
    setValidationWarnings([])
  }

  // Scan code barre (simulation)
  const scanBarcode = (barcode: string) => {
    setFormData(prev => ({ ...prev, barcode }))
    setShowCamera(false)
    success('Code scanné', `Code barre ${barcode} ajouté`)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <ValidationMessages messages={messages} onRemove={removeMessage} />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-orange-500">Gestion des Produits</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter Produit</span>
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Formulaire d'ajout/modification */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-black/90 border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {editingProduct ? 'Modifier' : 'Ajouter'} un produit
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom du produit */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Régab 33cl"
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.some(e => e.toLowerCase().includes('nom')) 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-white/20 focus:ring-orange-500'
                    }`}
                  />
                  <FieldError field="nom" errors={validationErrors} warnings={validationWarnings} />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Code rapide */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code rapide (auto)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.quickCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, quickCode: e.target.value.toUpperCase() }))}
                      placeholder="REG33"
                      maxLength={6}
                      className={`flex-1 px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                        validationErrors.some(e => e.toLowerCase().includes('code')) 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-white/20 focus:ring-orange-500'
                      }`}
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, quickCode: generateQuickCode(prev.name || '') }))}
                      className="px-3 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                    >
                      <Tag className="w-4 h-4" />
                    </button>
                  </div>
                  <FieldError field="code" errors={validationErrors} warnings={validationWarnings} />
                </div>

                {/* Prix de vente */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix de vente (FCFA) *
                  </label>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="500"
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.some(e => e.toLowerCase().includes('prix')) 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-white/20 focus:ring-orange-500'
                    }`}
                  />
                  <FieldError field="prix" errors={validationErrors} warnings={validationWarnings} />
                </div>

                {/* Prix d'achat */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix d'achat (FCFA)
                  </label>
                  <input
                    type="number"
                    value={formData.costPrice || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPrice: Number(e.target.value) }))}
                    placeholder="350"
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.some(e => e.toLowerCase().includes('achat')) 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-white/20 focus:ring-orange-500'
                    }`}
                  />
                  <FieldError field="achat" errors={validationErrors} warnings={validationWarnings} />
                </div>

                {/* Stock initial */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock initial *
                  </label>
                  <input
                    type="number"
                    value={formData.stock || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))}
                    placeholder="100"
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.some(e => e.toLowerCase().includes('stock')) 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-white/20 focus:ring-orange-500'
                    }`}
                  />
                  <FieldError field="stock" errors={validationErrors} warnings={validationWarnings} />
                </div>

                {/* Stock minimum */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Stock minimum (alerte)
                  </label>
                  <input
                    type="number"
                    value={formData.minStock || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                    placeholder="10"
                    className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                      validationErrors.some(e => e.toLowerCase().includes('minimum')) 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-white/20 focus:ring-orange-500'
                    }`}
                  />
                  <FieldError field="minimum" errors={validationErrors} warnings={validationWarnings} />
                </div>

                {/* Fournisseur */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Nom du fournisseur"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description du produit..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                </div>

                {/* Code barre */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Code barre / QR Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formData.barcode || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      placeholder="Scanner ou entrer le code"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={() => setShowCamera(!showCamera)}
                      className="px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={saveProduct}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Mettre à jour' : 'Ajouter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des produits */}
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">Liste des produits ({filteredProducts.length})</h3>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Aucun produit trouvé</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                Ajouter le premier produit
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Produit</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Catégorie</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Code</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Prix</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Stock</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">{product.name}</div>
                          {product.description && (
                            <div className="text-xs text-gray-400">{product.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-mono text-orange-400">{product.quickCode}</span>
                          {product.barcode && <Barcode className="w-3 h-3 text-gray-400" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-white">{product.price} FCFA</div>
                        {product.costPrice && (
                          <div className="text-xs text-gray-400">Achat: {product.costPrice} FCFA</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`text-sm font-medium ${
                          product.stock <= (product.minStock || 5) ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {product.stock}
                        </div>
                        {product.stock <= (product.minStock || 5) && (
                          <div className="text-xs text-red-400">Stock bas</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => editProduct(product)}
                            className="p-1 text-blue-400 hover:text-blue-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
