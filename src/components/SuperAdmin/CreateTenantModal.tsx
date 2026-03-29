'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, X, ChevronRight, Users, Beer, Shield, ShoppingCart, Scissors, Package, DollarSign,
  CreditCard, Truck, Table, Users2, Zap, Printer
} from 'lucide-react'
import { BUSINESS_CATEGORIES } from '@/config/businessCategories'
import { SUBSCRIPTION_PLANS, formatPrice, getLimitDisplay } from '@/config/subscriptionPlans'

interface BusinessConfig {
  categories: Array<{
    name: string
    description: string
  }>
  defaultProducts: Array<{
    name: string
    sellingPrice: number
    category: string
  }>
  defaultExpenses: string[]
}

interface TenantCreationData {
  name: string
  businessType: string
  email: string
  phone: string
  address: string
  adminName: string
  adminEmail: string
  adminPassword: string
  subscriptionPlan: string
  businessConfig: BusinessConfig
  features: {
    debtManagement: boolean
    delivery: boolean
    tableService: boolean
    tableNumberRequired: boolean
    flashCustomers: boolean
    ticketPrinting: boolean
  }
}

interface CreateTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TenantCreationData) => Promise<void>
}

interface TenantFormData {
  name: string
  businessType: string
  email: string
  phone: string
  address: string
  adminName: string
  adminEmail: string
  adminPassword: string
  confirmPassword: string
  subscriptionPlan: string
  features: {
    debtManagement: boolean
    delivery: boolean
    tableService: boolean
    tableNumberRequired: boolean
    flashCustomers: boolean
    ticketPrinting: boolean
  }
}

// Types de business disponibles avec fonctionnalités recommandées
const businessTypes = [
  {
    id: 'retail',
    name: 'Vente de produits et services',
    icon: Building2,
    description: 'Vente de produits et services',
    config: {
      categories: BUSINESS_CATEGORIES.retail,
      defaultProducts: [
        { name: 'T-shirt', sellingPrice: 5000, category: 'Vêtements' },
        { name: 'Jean', sellingPrice: 15000, category: 'Vêtements' },
        { name: 'Chaussures', sellingPrice: 25000, category: 'Accessoires' }
      ],
      defaultExpenses: ['Loyer', 'Électricité', 'Salaires']
    },
    recommendedFeatures: {
      debtManagement: true,
      delivery: false,
      tableService: false,
      tableNumberRequired: false,
      flashCustomers: true,
      ticketPrinting: true
    }
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: Users,
    description: 'Service de restauration',
    config: {
      categories: BUSINESS_CATEGORIES.restaurant,
      defaultProducts: [
        { name: 'Plat du jour', sellingPrice: 3500, category: 'Plats principaux' },
        { name: 'Boisson', sellingPrice: 800, category: 'Boissons' },
        { name: 'Dessert', sellingPrice: 1500, category: 'Desserts' }
      ],
      defaultExpenses: ['Ingrédients', 'Loyer', 'Salaires']
    },
    recommendedFeatures: {
      debtManagement: true,
      delivery: true,
      tableService: true,
      tableNumberRequired: true,
      flashCustomers: false,
      ticketPrinting: true
    }
  },
  {
    id: 'bar',
    name: 'Bar',
    icon: Beer,
    description: 'Établissement de boissons',
    config: {
      categories: BUSINESS_CATEGORIES.bar,
      defaultProducts: [
        { name: 'Bière', sellingPrice: 1000, category: 'Boissons alcoolisées' },
        { name: 'Cocktail', sellingPrice: 2500, category: 'Cocktails' },
        { name: 'Jus de fruit', sellingPrice: 800, category: 'Boissons non-alcoolisées' }
      ],
      defaultExpenses: ['Alcool', 'Loyer', 'Salaires']
    },
    recommendedFeatures: {
      debtManagement: true,
      delivery: false,
      tableService: false,
      tableNumberRequired: false,
      flashCustomers: true,
      ticketPrinting: true
    }
  },
  {
    id: 'pharmacy',
    name: 'Pharmacie',
    icon: Shield,
    description: 'Produits pharmaceutiques et de santé',
    config: {
      categories: BUSINESS_CATEGORIES.pharmacy,
      defaultProducts: [
        { name: 'Paracétamol', sellingPrice: 500, category: 'Médicaments' },
        { name: 'Savon', sellingPrice: 1500, category: 'Produits hygiène' },
        { name: 'Vitamine C', sellingPrice: 2000, category: 'Vitamines' }
      ],
      defaultExpenses: ['Médicaments', 'Loyer', 'Salaires']
    },
    recommendedFeatures: {
      debtManagement: false,
      delivery: true,
      tableService: false,
      tableNumberRequired: false,
      flashCustomers: false,
      ticketPrinting: true
    }
  },
  {
    id: 'supermarket',
    name: 'Supermarché',
    icon: ShoppingCart,
    description: 'Grande surface de vente',
    config: {
      categories: BUSINESS_CATEGORIES.supermarket,
      defaultProducts: [
        { name: 'Pain', sellingPrice: 500, category: 'Boulangerie' },
        { name: 'Lait', sellingPrice: 800, category: 'Produits laitiers' },
        { name: 'Riz', sellingPrice: 1500, category: 'Épicerie' }
      ],
      defaultExpenses: ['Fournisseurs', 'Loyer', 'Salaires']
    },
    recommendedFeatures: {
      debtManagement: true,
      delivery: true,
      tableService: false,
      tableNumberRequired: false,
      flashCustomers: true,
      ticketPrinting: true
    }
  },
  {
    id: 'hair_salon',
    name: 'Salon de coiffure',
    icon: Scissors,
    description: 'Services de coiffure et soins',
    config: {
      categories: BUSINESS_CATEGORIES.hair_salon,
      defaultProducts: [
        { name: 'Coupe homme', sellingPrice: 3000, category: 'Coupe homme' },
        { name: 'Coupe femme', sellingPrice: 5000, category: 'Coupe femme' },
        { name: 'Coloration', sellingPrice: 8000, category: 'Coloration' }
      ],
      defaultExpenses: ['Produits', 'Loyer', 'Salaires']
    },
    recommendedFeatures: {
      debtManagement: true,
      delivery: false,
      tableService: false,
      tableNumberRequired: false,
      flashCustomers: true,
      ticketPrinting: true
    }
  },
  {
    id: 'grocery',
    name: 'Épicerie',
    icon: Package,
    description: 'Magasin de produits alimentaires de base',
    config: {
      categories: BUSINESS_CATEGORIES.grocery,
      defaultProducts: [
        { name: 'Riz', sellingPrice: 1000, category: 'Céréales' },
        { name: 'Huile', sellingPrice: 2000, category: 'Huiles et graisses' },
        { name: 'Sel', sellingPrice: 500, category: 'Épices' }
      ],
      defaultExpenses: ['Fournisseurs', 'Loyer', 'Salaires']
    },
    recommendedFeatures: {
      debtManagement: true,
      delivery: false,
      tableService: false,
      tableNumberRequired: false,
      flashCustomers: true,
      ticketPrinting: true
    }
  },
  {
    id: 'bar_restaurant',
    name: 'Bar/Restaurant',
    icon: DollarSign,
    description: 'Établissement mixte bar et restaurant',
    config: {
      categories: BUSINESS_CATEGORIES.bar_restaurant,
      defaultProducts: [
        { name: 'Plat du jour', sellingPrice: 3500, category: 'Plats principaux' },
        { name: 'Bière', sellingPrice: 1000, category: 'Boissons alcoolisées' },
        { name: 'Cocktail', sellingPrice: 2500, category: 'Cocktails' }
      ],
      defaultExpenses: ['Ingrédients', 'Alcool', 'Loyer', 'Salaires']
    },
    recommendedFeatures: {
      debtManagement: true,
      delivery: true,
      tableService: true,
      tableNumberRequired: true,
      flashCustomers: true,
      ticketPrinting: true
    }
  }
]

export default function CreateTenantModal({ isOpen, onClose, onSubmit }: CreateTenantModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    businessType: 'retail',
    email: '',
    phone: '',
    address: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    subscriptionPlan: 'free',
    features: {
      debtManagement: true,
      delivery: false,
      tableService: false,
      tableNumberRequired: false,
      flashCustomers: true,
      ticketPrinting: true
    }
  })

  // Mettre à jour les fonctionnalités recommandées quand le type de business change
  useEffect(() => {
    const selectedBusiness = businessTypes.find(type => type.id === formData.businessType)
    if (selectedBusiness) {
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          features: selectedBusiness.recommendedFeatures
        }))
      }, 0)
    }
  }, [formData.businessType])

  // Protéger contre les redirections pendant la création
  useEffect(() => {
    if (isOpen) {
      window.preventRedirect = true
    } else {
      window.preventRedirect = false
    }
    
    return () => {
      window.preventRedirect = false
    }
  }, [isOpen])

  const validateForm = () => {
    if (!formData.name || formData.name.trim().length < 2) {
      return false
    }
    
    if (!formData.adminName || formData.adminName.trim().length < 2) {
      return false
    }
    
    if (!formData.adminEmail || !formData.adminEmail.includes('@')) {
      return false
    }
    
    if (formData.adminPassword !== formData.confirmPassword) {
      return false
    }
    
    if (formData.adminPassword.length < 6) {
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const tenantData = {
      name: formData.name,
      businessType: formData.businessType,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      adminName: formData.adminName,
      adminEmail: formData.adminEmail,
      adminPassword: formData.adminPassword,
      subscriptionPlan: formData.subscriptionPlan,
      businessConfig: businessTypes.find(bt => bt.id === formData.businessType)?.config || businessTypes[0].config,
      features: formData.features
    }
    
    try {
      await onSubmit(tenantData)
      
      // Reset form seulement après succès
      setFormData({
        name: '',
        businessType: 'retail',
        email: '',
        phone: '',
        address: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        confirmPassword: '',
        subscriptionPlan: 'free',
        features: {
          debtManagement: true,
          delivery: false,
          tableService: false,
          tableNumberRequired: false,
          flashCustomers: true,
          ticketPrinting: true
        }
      })
      setCurrentStep(1)
      onClose()
    } catch (error) {
      // Gérer l'erreur silencieusement ou afficher une notification
      console.error('Erreur lors de la soumission:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/20 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Créer un nouveau tenant</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <ChevronRight className={`h-4 w-4 mx-2 ${
                    currentStep > step ? 'text-orange-500' : 'text-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">Informations du tenant</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom du tenant *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nom de l&apos;entreprise"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type d&apos;entreprise *</label>
                  <select
                    required
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {businessTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="email@entreprise.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+225 00 00 00 00"
                  />
                </div>
                
                {/* Section des fonctionnalités */}
                <div className="md:col-span-2 space-y-4">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Fonctionnalités activées</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gestion des dettes clients */}
                    <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        id="debtManagement"
                        checked={formData.features.debtManagement}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: { ...formData.features, debtManagement: e.target.checked }
                        })}
                        className="mt-1 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <label htmlFor="debtManagement" className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                          <CreditCard className="w-4 h-4 mr-2 text-orange-400" />
                          Gestion des dettes clients
                        </label>
                        <p className="text-xs text-gray-400 mt-1">Permet d&apos;enregistrer les dettes des clients fidèles</p>
                      </div>
                    </div>

                    {/* Service de livraison */}
                    <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        id="delivery"
                        checked={formData.features.delivery}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: { ...formData.features, delivery: e.target.checked }
                        })}
                        className="mt-1 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <label htmlFor="delivery" className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                          <Truck className="w-4 h-4 mr-2 text-orange-400" />
                          Service de livraison
                        </label>
                        <p className="text-xs text-gray-400 mt-1">Gestion des livraisons à domicile</p>
                      </div>
                    </div>

                    {/* Service de table */}
                    <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        id="tableService"
                        checked={formData.features.tableService}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: { ...formData.features, tableService: e.target.checked }
                        })}
                        className="mt-1 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <label htmlFor="tableService" className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                          <Table className="w-4 h-4 mr-2 text-orange-400" />
                          Service de table
                        </label>
                        <p className="text-xs text-gray-400 mt-1">Gestion des tables et service restaurant</p>
                      </div>
                    </div>

                    {/* Numéro de table requis */}
                    <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        id="tableNumberRequired"
                        checked={formData.features.tableNumberRequired}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: { ...formData.features, tableNumberRequired: e.target.checked }
                        })}
                        disabled={!formData.features.tableService}
                        className="mt-1 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="flex-1">
                        <label htmlFor="tableNumberRequired" className={`flex items-center text-sm font-medium cursor-pointer ${!formData.features.tableService ? 'text-gray-500' : 'text-gray-300'}`}>
                          <Users2 className="w-4 h-4 mr-2 text-orange-400" />
                          Numéro de table requis
                        </label>
                        <p className="text-xs text-gray-400 mt-1">Oblige le numéro de table pour chaque commande</p>
                      </div>
                    </div>

                    {/* Clients flash */}
                    <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        id="flashCustomers"
                        checked={formData.features.flashCustomers}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: { ...formData.features, flashCustomers: e.target.checked }
                        })}
                        className="mt-1 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <label htmlFor="flashCustomers" className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                          <Zap className="w-4 h-4 mr-2 text-orange-400" />
                          Clients flash
                        </label>
                        <p className="text-xs text-gray-400 mt-1">Système de crédit pour clients réguliers</p>
                      </div>
                    </div>

                    {/* Impression tickets */}
                    <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                      <input
                        type="checkbox"
                        id="ticketPrinting"
                        checked={formData.features.ticketPrinting}
                        onChange={(e) => setFormData({
                          ...formData,
                          features: { ...formData.features, ticketPrinting: e.target.checked }
                        })}
                        className="mt-1 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <div className="flex-1">
                        <label htmlFor="ticketPrinting" className="flex items-center text-sm font-medium text-gray-300 cursor-pointer">
                          <Printer className="w-4 h-4 mr-2 text-orange-400" />
                          Impression tickets
                        </label>
                        <p className="text-xs text-gray-400 mt-1">Impression automatique des tickets de caisse</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">Informations de l&apos;administrateur</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom de l&apos;admin *</label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Nom complet"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email de l&apos;admin *</label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="admin@entreprise.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="•••••••••"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="•••••••••"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">Plan d&apos;abonnement</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map((plan) => (
                  <div 
                    key={plan.id}
                    className={`border rounded-lg p-6 hover:border-orange-500/50 transition-colors cursor-pointer relative ${
                      plan.popular ? 'border-orange-500/50 ring-2 ring-orange-500/20' : 'border-white/20'
                    } ${formData.subscriptionPlan === plan.id ? 'bg-orange-500/10 border-orange-500' : ''}`}
                    onClick={() => setFormData({ ...formData, subscriptionPlan: plan.id })}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Plus populaire
                        </span>
                      </div>
                    )}
                    
                    <h4 className="text-lg font-semibold text-white mb-2">{plan.name}</h4>
                    <div className="text-2xl font-bold text-orange-500 mb-4">
                      {formatPrice(plan)}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
                    
                    <ul className="space-y-2 text-sm text-gray-300 mb-6">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-400 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="space-y-2 text-xs text-gray-400 border-t border-white/10 pt-4">
                      <div className="flex justify-between">
                        <span>Utilisateurs:</span>
                        <span className="text-white">{getLimitDisplay(plan.limits.users)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Produits:</span>
                        <span className="text-white">{getLimitDisplay(plan.limits.products)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stockage:</span>
                        <span className="text-white">{plan.limits.storage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Précédent
            </button>
            
            <div className="flex space-x-4">
              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Suivant
                </button>
              )}
              
              {currentStep === 3 && (
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Créer le tenant
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
