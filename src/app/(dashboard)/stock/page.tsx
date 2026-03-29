'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Package, Search, AlertTriangle, Plus, Edit, Trash2, TrendingUp, TrendingDown, ArrowLeft, Grid, List, X } from 'lucide-react'
import { useFinancial } from '@/hooks/useFinancial'
import { useOptimizedData } from '@/hooks/useOptimizedData'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'
import { getCategoriesForBusinessType } from '@/config/businessCategories'
import OptimizedLoading from '@/components/ui/OptimizedLoading'
import { useToastNotification, ToastNotification } from '@/components/ui/ToastNotification'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Product {
  id: string
  name: string
  price: number
  purchasePrice?: number
  margin?: number
  profitability?: number
  stock: number
  minStock: number
  category: string
  lastUpdated: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  supplier?: string
  image?: string
}

export default function StockPage() {
  const { state: financialState } = useFinancial()
  const { tenant } = useTenant()
  const { user, token } = useAuth()
  const router = useRouter()
  
  // Rediriger vers login si non authentifié
  useEffect(() => {
    if (!token || !user) {
      router.push('/')
    }
  }, [token, user, router])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // États pour les notifications et modales
  const { success, error: showError, info, notifications, removeNotification } = useToastNotification()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmTitle, setConfirmTitle] = useState('')
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [stockValue, setStockValue] = useState('')
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    purchasePrice: '',
    margin: '',
    profitability: '',
    stock: '',
    minStock: '',
    category: tenant ? getCategoriesForBusinessType(tenant.businessType)[0]?.name || 'Alimentaire' : 'Alimentaire',
    supplier: '',
    imageFile: null as File | null,
    imagePreview: '',
    financialSource: 'cash',
    budgetLineId: '',
    restockCost: ''
  })

  // Hook optimisé pour charger les produits avec cache
  const { data: productsData, loading: productsLoading, refetch } = useOptimizedData<Product[]>({
    fetchFn: async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('Token from localStorage:', token ? 'exists' : 'missing')
        
        if (!token) {
          console.log('Utilisateur non connecté - utilisation des données par défaut')
          return []
        }
        
        console.log('Fetching products with token:', token.substring(0, 20) + '...')
        const response = await fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('API Response:', result)
        
        // Transformation simple et robuste des données
        return result.data?.map((product: {
          id: string
          name: string
          sellingPrice?: number
          purchasePrice?: number
          quantity?: number
          minStock?: number
          category?: { name?: string }
          supplier?: { name?: string }
          updatedAt?: string
        }) => ({
          id: product.id,
          name: product.name,
          price: product.sellingPrice || 0,
          purchasePrice: product.purchasePrice || 0,
          stock: product.quantity || 0,
          minStock: product.minStock || 0,
          category: product.category?.name || 'Non catégorisé',
          supplier: product.supplier?.name || 'Non spécifié',
          status: (product.quantity || 0) === 0 ? 'out_of_stock' : 
                  (product.quantity || 0) <= (product.minStock || 0) ? 'low_stock' : 'in_stock',
          lastUpdated: product.updatedAt || new Date().toISOString()
        })) || []
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error)
        return []
      }
    },
    cacheKey: 'products_cache',
    staleTime: 300000 // 5 minutes
  })

  const products = useMemo(() => {
  console.log('Products data:', productsData)
  return productsData || []
}, [productsData])

  // Memoization pour les catégories et filtres
  const categoryNames = useMemo(() => 
    ['all', ...new Set(products.map(p => p.category))], 
    [products]
  )

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    console.log('Filtered products:', filtered.length, 'from', products.length, 'products')
    console.log('Search term:', searchTerm, 'Selected category:', selectedCategory)
    return filtered
  }, 
    [products, searchTerm, selectedCategory]
  )

  // Charger les catégories depuis l'API ou créer les catégories par défaut selon le business type
  const loadCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        const existingCategories = data.data || []
        
        // Si aucune catégorie n'existe, créer les catégories par défaut selon le business type
        if (existingCategories.length === 0 && tenant) {
          const defaultCategories = getCategoriesForBusinessType(tenant.businessType)
          
          // Créer les catégories par défaut
          for (const category of defaultCategories) {
            const createResponse = await fetch('/api/categories', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: category.name,
                description: category.description
              })
            })
            
            if (createResponse.ok) {
              const createdCategory = await createResponse.json()
              existingCategories.push(createdCategory.data)
            }
          }
        }
        
        setCategories(existingCategories)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
      
      // En cas d'erreur, utiliser les catégories par défaut selon le business type
      if (tenant) {
        const defaultCategories = getCategoriesForBusinessType(tenant.businessType)
        setCategories(defaultCategories.map(cat => ({ 
          id: `default-${cat.name}`, 
          name: cat.name 
        })))
      }
    }
  }, [tenant])

  // Charger les catégories au montage du composant et quand le tenant change
  useEffect(() => {
    loadCategories()
  }, [tenant, loadCategories])

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.minStock) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showError('Erreur d\'authentification', 'Vous devez être connecté pour ajouter un produit')
        return
      }

      // Calculer le coût total du ravitaillement
      const totalCost = parseInt(newProduct.purchasePrice || '0') * parseInt(newProduct.stock || '0')

      // Créer la transaction financière pour le ravitaillement
      if (totalCost > 0) {
        const restockTransaction = {
          type: 'expense' as const,
          amount: totalCost,
          currency: 'XAF',
          description: `Ravitaillement stock - ${newProduct.name}`,
          category: 'restock',
          date: new Date().toISOString().split('T')[0],
          source: {
            type: newProduct.financialSource as 'cash' | 'budget_line' | 'bank_transfer',
            budgetLineId: newProduct.budgetLineId
          }
        }
        
        // Envoyer la transaction financière
        await fetch('/api/financial/transactions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(restockTransaction)
        })
      }

      // Créer le produit avec les calculs automatiques
      const purchase = parseFloat(newProduct.purchasePrice) || 0
      const selling = parseFloat(newProduct.price)
      const margin = selling - purchase
      const profitability = purchase > 0 ? (margin / purchase) * 100 : 0

      // Trouver l'ID de catégorie correspondant au nom
      const selectedCategory = categories.find(cat => cat.name === newProduct.category)
      const categoryId = selectedCategory ? selectedCategory.id : null

      if (!categoryId) {
        showError('Erreur de validation', 'Veuillez sélectionner une catégorie valide')
        return
      }

      const productData = {
        name: newProduct.name,
        description: `${newProduct.name} - ${newProduct.category}`,
        barcode: '',
        purchasePrice: purchase,
        sellingPrice: selling,
        margin,
        profitability,
        quantity: parseInt(newProduct.stock),
        minStock: parseInt(newProduct.minStock),
        categoryId: categoryId, // Utiliser l'ID réel de la catégorie
        supplierId: null
      }

      // Envoyer le produit à l'API
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création du produit'
        
        // Gérer spécifiquement les erreurs 401
        if (response.status === 401) {
          errorMessage = 'Vous devez être connecté pour ajouter un produit'
        } else {
          try {
            const error = await response.json()
            errorMessage = error.error || errorMessage
          } catch {
            // Si la réponse n'est pas du JSON, utiliser le statut
            errorMessage = `Erreur ${response.status}: ${response.statusText}`
          }
        }
        
        throw new Error(errorMessage)
      }

      const createdProduct = await response.json()
      console.log('Produit créé:', createdProduct)

      // Rafraîchir les données
      refetch()

      // Réinitialiser le formulaire
      setNewProduct({
        name: '',
        price: '',
        purchasePrice: '',
        margin: '',
        profitability: '',
        stock: '',
        minStock: '',
        category: 'Alimentaire',
        supplier: '',
        imageFile: null,
        imagePreview: '',
        financialSource: 'cash',
        budgetLineId: '',
        restockCost: ''
      })
      setIsEditMode(false)
      setShowAddModal(false)
      
      success('Produit ajouté', 'Le produit a été ajouté avec succès !')

    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error)
      showError('Erreur', 'Erreur lors de l\'ajout du produit: ' + (error as Error).message)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewProduct({
          ...newProduct,
          imageFile: file,
          imagePreview: reader.result as string
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
    setShowDetailsModal(true)
  }

  const handleEditProduct = () => {
    if (selectedProduct) {
      // Pré-remplir le formulaire avec les données du produit
      setNewProduct({
        name: selectedProduct.name,
        price: selectedProduct.price.toString(),
        purchasePrice: '',
        margin: '',
        profitability: '',
        stock: selectedProduct.stock.toString(),
        minStock: selectedProduct.minStock.toString(),
        category: selectedProduct.category,
        supplier: selectedProduct.supplier || '',
        imageFile: null,
        imagePreview: selectedProduct.image || '',
        financialSource: 'cash',
        budgetLineId: '',
        restockCost: ''
      })
      setIsEditMode(true)
      setShowAddModal(true)
    }
  }

  const handleAdjustStock = () => {
    if (selectedProduct) {
      setStockValue(selectedProduct.stock.toString())
      setIsStockModalOpen(true)
    }
  }

  const confirmStockAdjustment = async () => {
    if (!selectedProduct || stockValue === '') return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        showError('Erreur d\'authentification', 'Vous devez être connecté pour modifier le stock')
        return
      }

      const updatedStock = parseInt(stockValue)
      
      // Envoyer la mise à jour à l'API
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: updatedStock })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Erreur HTTP: ${response.status}`
        throw new Error(errorMessage)
      }

      // Rafraîchir les données
      refetch()
      setShowDetailsModal(false)
      setSelectedProduct(null)
      setIsStockModalOpen(false)
      
      success('Stock mis à jour', 'Le stock a été mis à jour avec succès !')

    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error)
      showError('Erreur', 'Erreur lors de la mise à jour du stock: ' + (error as Error).message)
    }
  }

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      setConfirmTitle('Supprimer le produit')
      setConfirmMessage(`Êtes-vous sûr de vouloir supprimer "${selectedProduct.name}" ?`)
      setConfirmAction(async () => {
        try {
          const token = localStorage.getItem('token')
          if (!token) {
            showError('Erreur d\'authentification', 'Vous devez être connecté pour supprimer un produit')
            return
          }

          // Envoyer la suppression à l'API
          const response = await fetch(`/api/products/${selectedProduct!.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (!response.ok) {
            let errorMessage = 'Erreur lors de la suppression du produit'
            
            if (response.status === 401) {
              errorMessage = 'Vous devez être connecté pour supprimer un produit'
            } else {
              try {
                const error = await response.json()
                errorMessage = error.error || errorMessage
              } catch {
                errorMessage = `Erreur ${response.status}: ${response.statusText}`
              }
            }
            
            throw new Error(errorMessage)
          }

          // Rafraîchir les données
          refetch()
          setShowDetailsModal(false)
          setSelectedProduct(null)
          
          success('Produit supprimé', 'Le produit a été supprimé avec succès !')

        } catch (error) {
          console.error('Erreur lors de la suppression du produit:', error)
          showError('Erreur', 'Erreur lors de la suppression du produit: ' + (error as Error).message)
        }
      })
      setIsConfirmModalOpen(true)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'low_stock':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'out_of_stock':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'En stock'
      case 'low_stock':
        return 'Stock faible'
      case 'out_of_stock':
        return 'Rupture'
      default:
        return status
    }
  }

  return (
      <div className="p-4">
        {/* Header Mobile-First */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Gestion des Stocks</h1>
          <p className="text-gray-400 text-sm md:text-base">Suivi des stocks et alertes de réapprovisionnement</p>
        </div>

        {/* Stats Cards - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Package className="h-8 w-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">{products.length}</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Total produits</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">
                {products.filter(p => p.status === 'in_stock').length}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">En stock</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
              <span className="text-2xl font-bold text-white">
                {products.filter(p => p.status === 'low_stock').length}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Stock faible</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <TrendingDown className="h-8 w-8 text-red-400" />
              <span className="text-2xl font-bold text-white">
                {products.filter(p => p.status === 'out_of_stock').length}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Rupture</p>
          </div>
        </div>

        {/* Search and Filter - Mobile First */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Toutes catégories</option>
                {categoryNames.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
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
            </div>
          </div>
        </div>

        {/* Products Display - Grid or List View */}
        {viewMode === 'list' ? (
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {productsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8">
                        <OptimizedLoading size="lg" message="Chargement des produits..." showSkeleton skeletonLines={5} />
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        {searchTerm || selectedCategory !== 'all' 
                          ? 'Aucun produit trouvé correspondant à votre recherche' 
                          : 'Aucun produit en stock. Ajoutez votre premier produit !'}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-700/50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center cursor-pointer hover:bg-white/5 p-2 rounded -mx-2" onClick={() => handleProductClick(product)}>
                          {product.image ? (
                            <Image src={product.image} alt={product.name} width={32} height={32} className="rounded-lg object-cover mr-3" />
                          ) : (
                            <Package className="h-8 w-8 text-orange-400 mr-3" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-white">{product.name}</div>
                            <div className="text-sm text-gray-400">Min: {product.minStock}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                        {product.category}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${product.stock <= product.minStock ? 'text-red-400' : 'text-green-400'}`}>
                            {product.stock}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-white">
                        {product.price} XAF
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(product.status)}`}>
                          {getStatusText(product.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-blue-400 hover:text-blue-300"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedProduct(product)
                              handleEditProduct()
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-red-400 hover:text-red-300"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedProduct(product)
                              handleDeleteProduct()
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200 cursor-pointer" onClick={() => handleProductClick(product)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} width={48} height={48} className="rounded-lg object-cover" />
                    ) : (
                      <Package className="h-12 w-12 text-orange-400" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-400">{product.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(product.status)}`}>
                    {getStatusText(product.status)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stock:</span>
                    <span className={`font-medium ${product.stock <= product.minStock ? 'text-red-400' : 'text-green-400'}`}>
                      {product.stock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min:</span>
                    <span className="text-gray-300">{product.minStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prix:</span>
                    <span className="text-white font-medium">{product.price} XAF</span>
                  </div>
                </div>

                <div className="flex space-x-2 mt-3 pt-3 border-t border-white/10">
                  <button 
                    className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProduct(product)
                      handleEditProduct()
                    }}
                  >
                    <Edit className="h-3 w-3 inline mr-1" />
                    Modifier
                  </button>
                  <button 
                    className="flex-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedProduct(product)
                      handleDeleteProduct()
                    }}
                  >
                    <Trash2 className="h-3 w-3 inline mr-1" />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Details Modal */}
        {showDetailsModal && selectedProduct && (
          <>
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowDetailsModal(false)}
            />
            <div 
              className="fixed inset-0 flex items-center justify-center p-4 z-50"
            >
              <div 
                className="bg-slate-900 backdrop-blur-xl border border-white/20 rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                {selectedProduct.image ? (
                  <Image src={selectedProduct.image} alt={selectedProduct.name} width={48} height={48} className="rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Package className="h-6 w-6 text-orange-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedProduct.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(selectedProduct.status)}`}>
                      {getStatusText(selectedProduct.status)}
                    </span>
                    <span className="text-gray-400 text-xs">{selectedProduct.category}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Product Info */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Prix:</span>
                <span className="text-white font-medium">{selectedProduct.price} XAF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Stock:</span>
                <span className={`font-medium ${selectedProduct.stock <= selectedProduct.minStock ? 'text-red-400' : 'text-green-400'}`}>
                  {selectedProduct.stock}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Min:</span>
                <span className="text-white">{selectedProduct.minStock}</span>
              </div>
              {selectedProduct.supplier && (
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Fournisseur:</span>
                  <span className="text-white text-sm">{selectedProduct.supplier}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Valeur stock:</span>
                <span className="text-white font-medium">
                  {(selectedProduct.stock * selectedProduct.price).toLocaleString('fr-GA')} XAF
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 mt-4 pt-3 border-t border-white/20">
              <button 
                onClick={handleEditProduct}
                className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium transition-colors"
              >
                <Edit className="h-3 w-3 inline mr-1" />
                Modifier
              </button>
              <button 
                onClick={handleAdjustStock}
                className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-medium transition-colors"
              >
                <Package className="h-3 w-3 inline mr-1" />
                Stock
              </button>
              <button 
                onClick={handleDeleteProduct}
                className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-medium transition-colors"
              >
                <Trash2 className="h-3 w-3 inline mr-1" />
                Suppr
              </button>
            </div>
              </div>
            </div>
          </>
        )}

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

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-lg shadow-2xl my-auto">
              <h2 className="text-xl font-bold text-white mb-4">{isEditMode ? 'Modifier un produit' : 'Ajouter un produit'}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom du produit</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Riz gabonais 1kg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prix de vente (XAF)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => {
                      const price = e.target.value
                      const purchasePrice = newProduct.purchasePrice || '0'
                      const selling = parseFloat(price) || 0
                      const purchase = parseFloat(purchasePrice) || 0
                      const margin = selling - purchase
                      const profitability = purchase > 0 ? (margin / purchase) * 100 : 0
                      
                      setNewProduct({
                        ...newProduct, 
                        price,
                        margin: margin.toString(),
                        profitability: profitability.toFixed(2)
                      })
                    }}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: 1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prix d&apos;achat unitaire (XAF)</label>
                  <input
                    type="number"
                    value={newProduct.purchasePrice}
                    onChange={(e) => {
                      const purchasePrice = e.target.value
                      const selling = parseFloat(newProduct.price) || 0
                      const purchase = parseFloat(purchasePrice) || 0
                      const margin = selling - purchase
                      const profitability = purchase > 0 ? (margin / purchase) * 100 : 0
                      
                      setNewProduct({
                        ...newProduct, 
                        purchasePrice,
                        margin: margin.toString(),
                        profitability: profitability.toFixed(2)
                      })
                    }}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: 1200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Marge bénéficiaire (XAF)</label>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                      <span className="text-white font-medium">
                        {newProduct.margin || '0'} XAF
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rentabilité (%)</label>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                      <span className="text-white font-medium">
                        {newProduct.profitability || '0'}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Quantité</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: 50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stock minimum</label>
                    <input
                      type="number"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: 10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.length > 0 ? (
                      categories.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))
                    ) : tenant ? (
                      // Afficher les catégories par défaut selon le business type
                      getCategoriesForBusinessType(tenant.businessType).map(category => (
                        <option key={category.name} value={category.name}>{category.name}</option>
                      ))
                    ) : (
                      // Fallback si pas de tenant
                      <>
                        <option value="Alimentaire">Alimentaire</option>
                        <option value="Boissons">Boissons</option>
                        <option value="Boulangerie">Boulangerie</option>
                        <option value="Hygiène">Hygiène</option>
                        <option value="Autre">Autre</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Source de financement</label>
                  <select
                    value={newProduct.financialSource}
                    onChange={(e) => setNewProduct({...newProduct, financialSource: e.target.value as 'cash' | 'budget_line'})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="cash">Caisse (fonds des ventes)</option>
                    <option value="budget_line">Ligne budgétaire</option>
                  </select>
                </div>

                {newProduct.financialSource === 'budget_line' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ligne budgétaire</label>
                    <select
                      value={newProduct.budgetLineId}
                      onChange={(e) => setNewProduct({...newProduct, budgetLineId: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Sélectionner une ligne</option>
                      {financialState.budgetLines.map((line) => (
                        <option key={line.id} value={line.id}>
                          {line.name} ({line.currentAmount.toLocaleString('fr-GA')} XAF disponibles)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Coût total du ravitaillement</label>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                    <span className="text-white font-medium">
                      {newProduct.purchasePrice && newProduct.stock ? 
                        (parseInt(newProduct.purchasePrice) * parseInt(newProduct.stock)).toLocaleString('fr-GA') : 
                        '0'
                      } XAF
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fournisseur (optionnel)</label>
                  <input
                    type="text"
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Fournisseur ABC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Image du produit (optionnel)</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg cursor-pointer transition-colors"
                      >
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-gray-300 text-sm">
                          {newProduct.imagePreview ? 'Changer l\'image' : 'Choisir une image'}
                        </span>
                      </label>
                    </div>
                    {newProduct.imagePreview && (
                      <div className="relative">
                        <Image
                          src={newProduct.imagePreview}
                          alt="Aperçu"
                          width={64}
                          height={64}
                          className="rounded-lg object-cover border border-white/20"
                        />
                        <button
                          onClick={() => setNewProduct({...newProduct, imageFile: null, imagePreview: ''})}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddProduct}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  {isEditMode ? 'Modifier' : 'Ajouter le produit'}
                </button>
              </div>
            </div>
          </div>
        )}
      
      {/* Toast Notifications */}
      <ToastNotification notifications={notifications} onRemove={removeNotification} />
      
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Confirmer"
        cancelText="Annuler"
        type="danger"
      />
      
      {/* Stock Adjustment Modal */}
      {isStockModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Ajuster le stock - {selectedProduct.name}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nouveau stock
              </label>
              <input
                type="number"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
                className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Entrez la nouvelle quantité"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="px-4 py-2 text-gray-300 bg-black/40 border border-white/20 rounded-lg hover:bg-black/60 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmStockAdjustment}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
