'use client'

import { useState, useCallback } from 'react'
import { ShoppingCart, Plus, Minus, Trash2, Search, Package, CreditCard, Smartphone, Receipt, History, CheckCircle, X, Grid, List, Camera } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'
import { bluetoothPrintService } from '@/services/BluetoothPrintService'
import { ScannerModal } from '@/components/ScannerModal'
import { Result } from '@zxing/library'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  barcode?: string  // 🔥 NOUVEAU : Code-barres EAN-13
  image?: string
}

interface CartItem extends Product {
  quantity: number
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

interface Sale {
  id: string
  items: CartItem[]
  total: number
  paymentMethod: string
  date: Date
  customerName?: string
}

export default function POSPage() {
  const tenantData = useTenant()
  const businessType = tenantData.getBusinessLabel()
  
  // Initialize products data from API
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  
  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setProducts(data.data || [])
        } else {
          console.error('Erreur lors du chargement des produits')
          setProducts([])
        }
      } catch (error) {
        console.error('Erreur:', error)
        setProducts([])
      } finally {
        setProductsLoading(false)
      }
    }
    
    loadProducts()
  }, [])
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showPayment, setShowPayment] = useState(false)
  const [showTicket, setShowTicket] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [currentSale, setCurrentSale] = useState<Sale | null>(null)
  const [salesHistory, setSalesHistory] = useState<Sale[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationIdCounter, setNotificationIdCounter] = useState(0)
  const [showScanner, setShowScanner] = useState(false)  // 🔥 NOUVEAU : État du scanner
  
  // États pour le processus de paiement
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
  const [customerAmount, setCustomerAmount] = useState<string>('')
  const [paymentStep, setPaymentStep] = useState<'method' | 'amount' | 'confirm'>('method')

  // Notification system
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string, duration = 3000) => {
    const id = `notification-${notificationIdCounter + 1}`
    setNotificationIdCounter(prev => prev + 1)
    setNotifications(prev => [...prev, { id, type, message, duration }])
  }, [notificationIdCounter, setNotificationIdCounter, setNotifications])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [setNotifications])

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  // 🔥 FONCTION DE RECHERCHE PAR CODE-BARRES
  const findProductByBarcode = (barcode: string): Product | undefined => {
    return products.find(product => product.barcode === barcode)
  }

  const handleScanSuccess = (result: Result) => {
    console.log('🔥 CODE-BARRES SCANNÉ:', result.getText())
    const barcode = result.getText()
    const product = findProductByBarcode(barcode)
    
    if (product) {
      console.log('✅ PRODUIT TROUVÉ:', product.name)
      addToCart(product)
      showNotification('success', `${product.name} ajouté au panier`)
    } else {
      console.log('❌ PRODUIT NON TROUVÉ pour le code:', barcode)
      showNotification('error', `Produit non trouvé pour le code: ${barcode}`)
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }

  const getTotalAmount = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }, [cart])

  // Fonctions pour le processus de paiement
  const startPayment = () => {
    setSelectedPaymentMethod('')
    setCustomerAmount('')
    setPaymentStep('method')
    setShowPayment(true)
  }

  const selectPaymentMethod = (method: string) => {
    setSelectedPaymentMethod(method)
    if (method === 'cash') {
      setPaymentStep('amount')
    } else {
      // Pour mobile money, carte, etc., passe directement à la confirmation
      setCustomerAmount(getTotalAmount().toString())
      setPaymentStep('confirm')
    }
  }

  const calculateChange = useCallback(() => {
    const total = getTotalAmount()
    const paid = parseFloat(customerAmount) || 0
    return paid - total
  }, [getTotalAmount, customerAmount])

  const confirmPayment = useCallback(async () => {
    const totalAmount = getTotalAmount()
    const paidAmount = parseFloat(customerAmount) || totalAmount
    
    // Validation
    if (selectedPaymentMethod === 'cash' && paidAmount < totalAmount) {
      showNotification('error', 'Montant insuffisant!')
      return
    }
    
    // Create sale record with unique ID using timestamp
    const timestamp = new Date().getTime()
    const saleId = `sale-${timestamp}`
    const sale: Sale = {
      id: saleId,
      items: [...cart],
      total: totalAmount,
      paymentMethod: selectedPaymentMethod,
      date: new Date()
    }
    
    // Add to sales history
    setSalesHistory(prev => [sale, ...prev])
    setCurrentSale(sale)
    
    // Try to print ticket
    try {
      if (bluetoothPrintService.isConnected()) {
        await bluetoothPrintService.printTicket({
          orderId: sale.id,
          orderNumber: sale.id,
          businessName: tenantData.getBusinessLabel(),
          customerName: 'Client',
          items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity
          })),
          totalAmount: totalAmount,
          paymentMethod: selectedPaymentMethod,
          date: new Date().toLocaleString('fr-GA')
        })
      }
    } catch (error) {
      console.error('Erreur impression ticket:', error)
    }
    
    // Show success notification
    const changeAmount = calculateChange()
    let message = `Paiement de ${totalAmount.toLocaleString('fr-GA')} XAF par ${selectedPaymentMethod === 'cash' ? 'Espèces' : selectedPaymentMethod} confirmé!`
    if (selectedPaymentMethod === 'cash' && changeAmount > 0) {
      message += ` Monnaie: ${changeAmount.toLocaleString('fr-GA')} XAF`
    }
    showNotification('success', message, 1500)
    
    // Clear cart and close payment modal
    setCart([])
    setShowPayment(false)
    setShowTicket(true)
  }, [cart, getTotalAmount, tenantData, showNotification, setSalesHistory, setCurrentSale, setCart, setShowPayment, setShowTicket, selectedPaymentMethod, customerAmount, calculateChange])

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {businessType === 'Restaurant' && 'Point de Vente - Restaurant'}
                {businessType === 'Bar' && 'Point de Vente - Bar'}
                {businessType === 'Pharmacie' && 'Point de Vente - Pharmacie'}
                {businessType === 'Supermarché' && 'Point de Vente - Supermarché'}
                {(businessType === 'Boutique' || !businessType) && 'POS - Boutique'}
              </h1>
              <p className="text-gray-400 text-sm">{tenantData.getBusinessLabel()}</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* 🔥 BOUTON SCANNER - Action rapide permanente */}
              <button
                onClick={() => setShowScanner(true)}
                className="flex items-center space-x-2 px-3 py-2 sm:px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:scale-105"
                title="Scanner un code-barres (accès rapide)"
              >
                <Camera className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Scanner</span>
              </button>
              
              {/* Ticket Button */}
              <button
                onClick={() => currentSale && setShowTicket(true)}
                disabled={!currentSale}
                className="flex items-center space-x-2 px-3 py-2 sm:px-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all backdrop-blur-sm border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Ticket</span>
              </button>
              
              {/* History Button */}
              <button
                onClick={() => setShowHistory(true)}
                className="flex items-center space-x-2 px-3 py-2 sm:px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all backdrop-blur-sm border border-blue-500/30"
              >
                <History className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Historique</span>
              </button>
              
              <div className="text-right">
                <p className="text-gray-400 text-xs">
                  {businessType === 'Restaurant' && 'Plats chauds et boissons'}
                  {businessType === 'Bar' && 'Boissons et cocktails'}
                  {businessType === 'Pharmacie' && 'Médicaments et produits de santé'}
                  {businessType === 'Supermarché' && 'Produits divers et alimentaires'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Cart Section - Now on top */}
        <div className="w-full lg:w-1/3 bg-black/40 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col">
          {/* Cart Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-orange-400" />
                <h2 className="text-lg font-semibold text-white">Panier</h2>
                {cart.length > 0 && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-red-400 hover:text-red-300 text-sm font-medium"
                >
                  Vider
                </button>
              )}
            </div>
          </div>

          {/* Cart Content - Fixed height, no scroll */}
          <div className="flex-1 flex flex-col">
            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <ShoppingCart className="h-20 w-20 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Le panier est vide</p>
                  <p className="text-gray-500 text-sm mt-2">Ajoutez des produits pour commencer</p>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items - Scrollable area */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-white text-sm font-medium">{item.name}</h4>
                            <p className="text-green-400 font-bold">{item.price.toLocaleString('fr-GA')} XAF</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="bg-white/20 hover:bg-white/30 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-orange-400 font-bold">
                              {(item.price * item.quantity).toLocaleString('fr-GA')} XAF
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart Footer - Fixed at bottom */}
                <div className="p-4 bg-black/40 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Total</span>
                    <span className="text-2xl font-bold text-green-400">
                      {getTotalAmount().toLocaleString('fr-GA')} XAF
                    </span>
                  </div>
                  <button
                    onClick={startPayment}
                    className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg font-medium shadow-lg shadow-orange-500/25 transition-all"
                  >
                    Payer
                  </button>
                  {cart.length > 0 && (
                    <button
                      onClick={() => setCart([])}
                      className="w-full mt-2 bg-red-500/20 hover:bg-red-500/30 text-white py-2 rounded-lg transition-all"
                    >
                      Vider
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Products Section - Now below cart */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {/* Search and Filter */}
          <div className="p-4 bg-black/40 border-b border-white/10">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Category Filter and View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="overflow-x-auto flex-1">
                <div className="flex space-x-2 min-w-max">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm border transition-all ${
                      selectedCategory === 'all'
                        ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white border-orange-400/20 shadow-lg shadow-orange-500/25'
                        : 'bg-black/40 text-gray-300 hover:bg-white/20 border-white/20 hover:text-orange-400'
                    }`}
                  >
                    Tous
                  </button>
                  {Array.from(new Set(products.map(p => p.category))).map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap backdrop-blur-sm border transition-all ${
                        selectedCategory === category
                          ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white border-orange-400/20 shadow-lg shadow-orange-500/25'
                          : 'bg-black/40 text-gray-300 hover:bg-white/20 border-white/20 hover:text-orange-400'
                      }`}
                    >
                      <span className={selectedCategory === category ? 'text-white' : 'text-gray-300'}>{category}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* View Mode Toggle */}
              <div className="ml-4">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 transition-colors"
                  title={viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
                >
                  {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid/List - Scrollable */}
          <div className="flex-1 p-4 overflow-y-auto">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Product Icon */}
                      <div className="w-16 h-16 rounded-lg bg-orange-500/20 flex items-center justify-center mb-3 group-hover:bg-orange-500/30 transition-colors">
                        <Package className="h-8 w-8 text-orange-400" />
                      </div>
                      
                      {/* Product Info */}
                      <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">{product.name}</h3>
                      
                      {/* Price */}
                      <div className="mb-2">
                        <p className="text-green-400 font-bold text-xl">{product.price.toLocaleString('fr-GA')} XAF</p>
                      </div>
                      
                      {/* Stock */}
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        product.stock < 10 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : product.stock < 25
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        Stock: {product.stock}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 sm:p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                    onClick={() => addToCart(product)}
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                      <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                        {/* Product Icon - Responsive */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors shrink-0">
                          <Package className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
                        </div>
                        
                        {/* Product Info - Optimized for mobile */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-xs sm:text-sm mb-1 truncate">{product.name}</h3>
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <p className="text-green-400 font-bold text-xs sm:text-sm">{product.price.toLocaleString('fr-GA')} XAF</p>
                            <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded truncate max-w-[100px] sm:max-w-none">{product.category}</span>
                            <div className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0 ${
                              product.stock < 10 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : product.stock < 25
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              Stock: {product.stock}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Add Button - Optimisé pour Mobile */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          addToCart(product)
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-2 sm:p-3 rounded-lg transition-colors flex items-center justify-center shrink-0"
                        title="Ajouter au panier"
                      >
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal - Amélioré avec processus en 3 étapes */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-9999">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {paymentStep === 'method' && 'Méthode de paiement'}
                {paymentStep === 'amount' && 'Saisir le montant'}
                {paymentStep === 'confirm' && 'Confirmer le paiement'}
              </h3>
              <button
                onClick={() => setShowPayment(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Résumé du panier - Visible dans toutes les étapes */}
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <div className="text-center mb-3">
                <p className="text-gray-400 text-sm">Total à payer</p>
                <p className="text-2xl font-bold text-green-400">
                  {getTotalAmount().toLocaleString('fr-GA')} XAF
                </p>
              </div>
              <div className="text-xs text-gray-400 text-center">
                {cart.length} article{cart.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Étape 1: Sélection de la méthode de paiement */}
            {paymentStep === 'method' && (
              <div className="space-y-3">
                <p className="text-gray-300 text-sm mb-4">Choisissez la méthode de paiement:</p>
                {tenantData.getPaymentMethods().map(method => (
                  <button
                    key={method}
                    onClick={() => selectPaymentMethod(method)}
                    className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-lg flex items-center justify-center space-x-3 backdrop-blur-sm border border-white/20 transition-all hover:border-orange-500/50"
                  >
                    {method === 'cash' && <CreditCard className="h-6 w-6 text-green-400" />}
                    {method === 'mobile_money' && <Smartphone className="h-6 w-6 text-orange-400" />}
                    {method === 'card' && <CreditCard className="h-6 w-6 text-blue-400" />}
                    {method === 'check' && <Package className="h-6 w-6 text-purple-400" />}
                    {method === 'insurance' && <Package className="h-6 w-6 text-cyan-400" />}
                    <span className="font-medium">
                      {method === 'cash' && 'Espèces'}
                      {method === 'mobile_money' && 'Mobile Money'}
                      {method === 'card' && 'Carte Bancaire'}
                      {method === 'check' && 'Chèque'}
                      {method === 'insurance' && 'Assurance'}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-white py-3 rounded-lg backdrop-blur-sm border border-red-500/30 transition-all"
                >
                  Annuler
                </button>
              </div>
            )}

            {/* Étape 2: Saisie du montant (pour espèces) */}
            {paymentStep === 'amount' && (
              <div className="space-y-4">
                <p className="text-gray-300 text-sm mb-4">Le client donne combien?</p>
                
                {/* Montants rapides */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1000, 2000, 5000, 10000, 20000, 50000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setCustomerAmount(amount.toString())}
                      className="bg-white/10 hover:bg-orange-500/30 text-white py-2 rounded-lg text-sm font-mono transition-all border border-white/20"
                    >
                      {amount.toLocaleString('fr-GA')}
                    </button>
                  ))}
                </div>

                {/* Champ de saisie personnalisé */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Montant reçu (XAF)
                  </label>
                  <input
                    type="number"
                    value={customerAmount}
                    onChange={(e) => setCustomerAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-center text-2xl font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                </div>

                {/* Calcul de la monnaie */}
                {customerAmount && parseFloat(customerAmount) >= getTotalAmount() && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-green-400 text-sm">Monnaie à rendre</p>
                      <p className="text-2xl font-bold text-green-400 font-mono">
                        {calculateChange().toLocaleString('fr-GA')} XAF
                      </p>
                    </div>
                  </div>
                )}

                {customerAmount && parseFloat(customerAmount) < getTotalAmount() && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-center text-sm">
                      Montant insuffisant! Manque: {(getTotalAmount() - parseFloat(customerAmount)).toLocaleString('fr-GA')} XAF
                    </p>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentStep('method')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-all"
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setPaymentStep('confirm')}
                    disabled={!customerAmount || parseFloat(customerAmount) < getTotalAmount()}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-all"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* Étape 3: Confirmation */}
            {paymentStep === 'confirm' && (
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-3">Récapitulatif:</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-white font-mono">
                        {getTotalAmount().toLocaleString('fr-GA')} XAF
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Méthode:</span>
                      <span className="text-white">
                        {selectedPaymentMethod === 'cash' && 'Espèces'}
                        {selectedPaymentMethod === 'mobile_money' && 'Mobile Money'}
                        {selectedPaymentMethod === 'card' && 'Carte Bancaire'}
                        {selectedPaymentMethod === 'check' && 'Chèque'}
                        {selectedPaymentMethod === 'insurance' && 'Assurance'}
                      </span>
                    </div>
                    
                    {selectedPaymentMethod === 'cash' && customerAmount && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Montant reçu:</span>
                          <span className="text-white font-mono">
                            {parseFloat(customerAmount).toLocaleString('fr-GA')} XAF
                          </span>
                        </div>
                        
                        {calculateChange() > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Monnaie:</span>
                            <span className="text-green-400 font-mono">
                              {calculateChange().toLocaleString('fr-GA')} XAF
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaymentStep(selectedPaymentMethod === 'cash' ? 'amount' : 'method')}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg transition-all"
                  >
                    Retour
                  </button>
                  <button
                    onClick={confirmPayment}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Confirmer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicket && currentSale && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-9999">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            {/* Header du ticket - Style papier thermique */}
            <div className="bg-gray-50 border-b-2 border-dashed border-gray-300 p-4">
              <div className="text-center">
                {/* Logo/Nom du commerce */}
                <div className="mb-2">
                  <h2 className="text-2xl font-bold text-gray-800 tracking-wider">
                    {tenantData.getBusinessLabel()}
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">Point de Vente Professionnel</p>
                </div>
                
                {/* Informations du ticket */}
                <div className="border-t border-b border-gray-300 my-3 py-2">
                  <div className="text-xs text-gray-700 space-y-1">
                    <div className="font-mono">TICKET #{currentSale.id}</div>
                    <div className="font-mono">{currentSale.date.toLocaleDateString('fr-GA')}</div>
                    <div className="font-mono">{currentSale.date.toLocaleTimeString('fr-GA', {hour: '2-digit', minute: '2-digit'})}</div>
                  </div>
                </div>
                
                {/* Caisse et Opérateur */}
                <div className="text-xs text-gray-600 space-y-1">
                  <div>CAISSE: #01</div>
                  <div>OPÉRATEUR: Administrateur</div>
                </div>
              </div>
            </div>

            {/* Corps du ticket - Articles */}
            <div className="p-4 bg-white">
              {/* En-tête des articles */}
              <div className="border-b-2 border-gray-800 pb-2 mb-3">
                <div className="flex justify-between text-xs font-bold text-gray-800">
                  <span className="flex-1">ARTICLE</span>
                  <span className="w-16 text-center">QTE</span>
                  <span className="w-20 text-right">P.U.</span>
                  <span className="w-20 text-right">TOTAL</span>
                </div>
              </div>

              {/* Liste des articles */}
              <div className="space-y-2 mb-4">
                {currentSale.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-xs leading-tight">
                    <span className="flex-1 text-gray-700 font-medium">
                      {item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}
                    </span>
                    <span className="w-16 text-center font-mono text-gray-800">
                      {item.quantity}
                    </span>
                    <span className="w-20 text-right font-mono text-gray-800">
                      {item.price.toLocaleString('fr-GA')}
                    </span>
                    <span className="w-20 text-right font-mono font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString('fr-GA')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Séparateur */}
              <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

              {/* Totaux */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">SOUS-TOTAL:</span>
                  <span className="font-mono font-bold text-gray-800">
                    {currentSale.total.toLocaleString('fr-GA')} XAF
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA (0%):</span>
                  <span className="font-mono text-gray-800">0 XAF</span>
                </div>
                
                <div className="border-t-2 border-gray-800 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-gray-800">TOTAL TTC:</span>
                    <span className="font-mono text-gray-900">
                      {currentSale.total.toLocaleString('fr-GA')} XAF
                    </span>
                  </div>
                </div>
              </div>

              {/* Paiement */}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">PAIEMENT:</span>
                  <span className="font-mono text-gray-800">
                    {currentSale.paymentMethod === 'cash' && 'ESPÈCES'}
                    {currentSale.paymentMethod === 'mobile_money' && 'MOBILE MONEY'}
                    {currentSale.paymentMethod === 'card' && 'CARTE BANCAIRE'}
                    {currentSale.paymentMethod === 'check' && 'CHÈQUE'}
                    {currentSale.paymentMethod === 'insurance' && 'ASSURANCE'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">REÇU:</span>
                  <span className="font-mono font-bold text-gray-800">
                    {currentSale.total.toLocaleString('fr-GA')} XAF
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">MONNAIE:</span>
                  <span className="font-mono text-gray-800">0 XAF</span>
                </div>
              </div>
            </div>

            {/* Pied du ticket */}
            <div className="bg-gray-50 border-t-2 border-dashed border-gray-300 p-4">
              <div className="text-center space-y-2">
                <div className="text-xs text-gray-600">
                  <div className="font-bold">MERCI DE VOTRE VISITE</div>
                  <div className="mt-1">Au plaisir de vous revoir</div>
                </div>
                
                {/* Informations légales */}
                <div className="text-xs text-gray-500 space-y-1 mt-3">
                  <div>SIRET: 123 456 789 00012</div>
                  <div>TVA: FR 12 345 678 901</div>
                  <div>Ticket non fiscal - Garantie 2 ans</div>
                </div>
                
                {/* Contact */}
                <div className="text-xs text-gray-600 mt-2">
                  <div>📍 Libreville, Gabon</div>
                  <div>📞 +241 123 456 789</div>
                  <div>🌐 www.smartmanager.ga</div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="bg-gray-100 border-t border-gray-300 p-4 flex gap-2">
              <button
                onClick={() => {
                  // Impression du ticket
                  if (bluetoothPrintService.isConnected()) {
                    bluetoothPrintService.printTicket({
                      orderId: currentSale.id,
                      orderNumber: currentSale.id,
                      businessName: tenantData.getBusinessLabel(),
                      customerName: 'Client',
                      items: currentSale.items.map(item => ({
                        name: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        total: item.price * item.quantity
                      })),
                      totalAmount: currentSale.total,
                      paymentMethod: currentSale.paymentMethod,
                      date: currentSale.date.toLocaleString('fr-GA')
                    })
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <span>🖨️</span>
                <span>Imprimer</span>
              </button>
              
              <button
                onClick={() => setShowTicket(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-9999">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Historique des ventes</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {salesHistory.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Aucune vente enregistrée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {salesHistory.map((sale) => (
                  <div key={sale.id} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-medium">Vente #{sale.id}</p>
                        <p className="text-gray-400 text-sm">{sale.date.toLocaleString('fr-GA')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-lg">
                          {sale.total.toLocaleString('fr-GA')} XAF
                        </p>
                        <p className="text-orange-400 text-sm">
                          {sale.paymentMethod === 'cash' && 'Espèces'}
                          {sale.paymentMethod === 'mobile_money' && 'Mobile Money'}
                          {sale.paymentMethod === 'card' && 'Carte Bancaire'}
                          {sale.paymentMethod === 'check' && 'Chèque'}
                          {sale.paymentMethod === 'insurance' && 'Assurance'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sale.items.map((item, index) => (
                        <span key={index} className="text-xs bg-black/40 text-gray-300 px-2 py-1 rounded">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-10000 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300 transform translate-x-0 ${
              notification.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : notification.type === 'error' 
                ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                : notification.type === 'warning' 
                ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' 
                : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
            }`}
          >
            <div className="shrink-0">
              {notification.type === 'success' && (
                <CheckCircle className="w-5 h-5" />
              )}
              {notification.type === 'error' && (
                <X className="w-5 h-5" />
              )}
              {notification.type === 'warning' && (
                <Package className="w-5 h-5" />
              )}
              {notification.type === 'info' && (
                <Package className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      
      {/* 🔥 MODAL SCANNER DE CODES-BARRES */}
      {showScanner && (
        <ScannerModal
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </div>
  )
}
