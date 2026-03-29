'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  Camera, QrCode, Search, Plus, Minus, ShoppingCart, 
  CreditCard, Smartphone, Package, DollarSign, X,
  Barcode, Box, Clock, User, Phone
} from 'lucide-react'
import { useValidationMessages, ValidationMessages } from '@/components/ui/ValidationMessages'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  barcode?: string
  image?: string
  quickCode?: string // Code rapide pour recherche
}

interface CartItem {
  product: Product
  quantity: number
  total: number
}

export default function SimplePOS() {
  const { success, error, warning, info, messages, removeMessage } = useValidationMessages()
  
  const [products, setProducts] = useState<Product[]>([
    // Produits typiques gabonais
    { id: '1', name: 'Régab 33cl', price: 500, stock: 100, category: 'Boissons', quickCode: 'REG33' },
    { id: '2', name: 'Poulet Moambe', price: 3500, stock: 20, category: 'Plats', quickCode: 'MOAM' },
    { id: '3', name: 'Pain Baguette', price: 250, stock: 50, category: 'Boulangerie', quickCode: 'PAIN' },
    { id: '4', name: 'Riz 1kg', price: 1500, stock: 30, category: 'Épicerie', quickCode: 'RIZ1' },
    { id: '5', name: 'Huile Palme 1L', price: 2000, stock: 25, category: 'Épicerie', quickCode: 'HUIL' },
    { id: '6', name: 'Sucre 1kg', price: 1000, stock: 40, category: 'Épicerie', quickCode: 'SUCR' },
    { id: '7', name: 'Café Moulu', price: 2500, stock: 15, category: 'Épicerie', quickCode: 'CAFE' },
    { id: '8', name: 'Lait Condensé', price: 800, stock: 35, category: 'Épicerie', quickCode: 'LAIT' }
  ])
  
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' })
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mobile' | 'card'>('cash')
  const [flashAmount, setFlashAmount] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Calcul du total
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0)
  const finalTotal = cartTotal - flashAmount

  // Recherche rapide de produit
  const searchProduct = (term: string) => {
    if (!term) return []
    
    return products.filter(product => 
      product.name.toLowerCase().includes(term.toLowerCase()) ||
      product.quickCode?.toLowerCase() === term.toLowerCase() ||
      product.barcode === term
    )
  }

  // Ajout au panier
  const addToCart = (product: Product, quantity: number = 1) => {
    if (product.stock < quantity) {
      error('Stock insuffisant', `Il ne reste que ${product.stock} ${product.name} en stock`)
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id)
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity
        if (newQuantity > product.stock) {
          error('Stock dépassé', `Impossible d\'ajouter ${quantity} ${product.name}. Stock disponible: ${product.stock}`)
          return prevCart
        }
        
        success('Produit ajouté', `${quantity}x ${product.name} ajouté au panier`)
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: newQuantity, total: newQuantity * product.price }
            : item
        )
      } else {
        success('Produit ajouté', `${quantity}x ${product.name} ajouté au panier`)
        return [...prevCart, { product, quantity, total: quantity * product.price }]
      }
    })
  }

  // Modification quantité
  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(prevCart => 
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.product.price }
          : item
      )
    )
  }

  // Suppression du panier
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId))
  }

  // Scan QR Code (simulation)
  const scanQRCode = (code: string) => {
    const product = products.find(p => p.barcode === code || p.quickCode === code)
    if (product) {
      addToCart(product)
      setShowQRScanner(false)
      success('Scan réussi', `${product.name} ajouté au panier`)
    } else {
      error('Produit non trouvé', `Aucun produit trouvé pour le code: ${code}`)
    }
  }

  // Flash téléphone (paiement mobile)
  const handleFlashPayment = () => {
    if (flashAmount > 0 && flashAmount <= finalTotal) {
      success('Paiement flash', `Flash de ${flashAmount} FCFA reçu avec succès!`)
      completeSale()
    } else if (flashAmount <= 0) {
      error('Montant invalide', 'Veuillez entrer un montant valide')
    } else {
      error('Montant trop élevé', `Le flash ne peut pas dépasser le total de ${finalTotal} FCFA`)
    }
  }

  // Finaliser la vente
  const completeSale = () => {
    if (!customerInfo.name && !customerInfo.phone) {
      warning('Information client', 'Veuillez ajouter les informations du client')
      return
    }

    const sale = {
      items: cart,
      total: cartTotal,
      discount: flashAmount,
      finalTotal,
      customer: customerInfo,
      paymentMethod,
      date: new Date().toISOString()
    }
    
    console.log('Vente complétée:', sale)
    success('Vente terminée', `Paiement de ${finalTotal} FCFA enregistré avec succès`)
    
    // Reset
    setCart([])
    setCustomerInfo({ name: '', phone: '' })
    setFlashAmount(0)
    setSearchTerm('')
  }

  // Camera access
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Erreur caméra:', error)
      alert('Caméra non disponible')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
  }

  useEffect(() => {
    if (showCamera) {
      startCamera()
    } else {
      stopCamera()
    }
    
    return () => stopCamera()
  }, [showCamera])

  const searchedProducts = searchProduct(searchTerm)

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <ValidationMessages messages={messages} onRemove={removeMessage} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-orange-500">SmartManager POS</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                <Clock className="inline w-4 h-4 mr-1" />
                {new Date().toLocaleTimeString('fr-GA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colonne gauche - Recherche et produits */}
          <div className="lg:col-span-2 space-y-4">
            {/* Barre de recherche ultra-simple */}
            <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher produit (nom ou code rapide)..."
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                </div>
                
                <button
                  onClick={() => setShowQRScanner(!showQRScanner)}
                  className="px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowCamera(!showCamera)}
                  className="px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Scanner QR Code */}
              {showQRScanner && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <QrCode className="w-5 h-5 text-orange-400" />
                    <span className="text-sm">Scanner QR Code</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Code QR / Barcode..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        scanQRCode(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              )}

              {/* Scanner Caméra */}
              {showCamera && (
                <div className="mt-4 p-4 bg-white/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Camera className="w-5 h-5 text-blue-400" />
                      <span className="text-sm">Scanner avec caméra</span>
                    </div>
                    <button
                      onClick={() => setShowCamera(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-48 bg-black rounded-lg"
                  />
                  <div className="mt-2 text-center text-xs text-gray-400">
                    Positionnez le code QR/barcode dans le cadre
                  </div>
                </div>
              )}
            </div>

            {/* Résultats de recherche */}
            {searchedProducts.length > 0 && (
              <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-3">Produits trouvés</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchedProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-all border border-white/20"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{product.name}</h4>
                          <p className="text-xs text-gray-400">{product.category}</p>
                          {product.quickCode && (
                            <p className="text-xs text-orange-400">Code: {product.quickCode}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-orange-500">{product.price} FCFA</p>
                          <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Produits populaires (toujours visibles) */}
            <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <h3 className="text-lg font-semibold mb-3">Produits populaires</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {products.slice(0, 8).map(product => (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-all border border-white/20 text-center"
                  >
                    <Package className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                    <h4 className="text-sm font-medium text-white truncate">{product.name}</h4>
                    <p className="text-sm font-bold text-orange-500">{product.price} FCFA</p>
                    {product.quickCode && (
                      <p className="text-xs text-gray-400">{product.quickCode}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Colonne droite - Panier et paiement */}
          <div className="space-y-4">
            {/* Panier */}
            <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Panier</h3>
                <ShoppingCart className="w-5 h-5 text-orange-500" />
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Panier vide</p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between p-2 bg-white/10 rounded-lg">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">{item.product.name}</h4>
                        <p className="text-xs text-gray-400">{item.product.price} FCFA x {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 bg-green-500 hover:bg-green-600 rounded flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-bold text-orange-500 w-20 text-right">
                          {item.total} FCFA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total */}
            {cart.length > 0 && (
              <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total:</span>
                    <span>{cartTotal} FCFA</span>
                  </div>
                  {flashAmount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Flash reçu:</span>
                      <span>-{flashAmount} FCFA</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-orange-500 pt-2 border-t border-white/20">
                    <span>Total:</span>
                    <span>{finalTotal} FCFA</span>
                  </div>
                </div>
              </div>
            )}

            {/* Paiement */}
            {cart.length > 0 && (
              <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4">Paiement</h3>
                
                {/* Info client */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nom du client"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 text-sm"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Téléphone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 text-sm"
                    />
                  </div>
                </div>

                {/* Méthode paiement */}
                <div className="space-y-2 mb-4">
                  <label className="flex items-center space-x-2 p-2 bg-white/10 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="text-orange-500"
                    />
                    <DollarSign className="w-4 h-4" />
                    <span>Espèces</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white/10 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="mobile"
                      checked={paymentMethod === 'mobile'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="text-orange-500"
                    />
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile Money</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white/10 rounded cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="text-orange-500"
                    />
                    <CreditCard className="w-4 h-4" />
                    <span>Carte bancaire</span>
                  </label>
                </div>

                {/* Flash Mobile Money */}
                {paymentMethod === 'mobile' && (
                  <div className="mb-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Flash Mobile Money:</span>
                      <span className="text-sm font-bold text-orange-400">{flashAmount} FCFA</span>
                    </div>
                    <input
                      type="number"
                      placeholder="Montant du flash"
                      value={flashAmount || ''}
                      onChange={(e) => setFlashAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-400 text-sm mb-2"
                    />
                    <button
                      onClick={handleFlashPayment}
                      disabled={flashAmount <= 0 || flashAmount > finalTotal}
                      className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm font-medium transition-colors"
                    >
                      <Smartphone className="inline w-4 h-4 mr-2" />
                      Recevoir Flash
                    </button>
                  </div>
                )}

                {/* Bouton finaliser */}
                <button
                  onClick={completeSale}
                  className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                >
                  Finaliser la vente ({finalTotal} FCFA)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
