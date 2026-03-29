'use client'

import React, { useState } from 'react'
import { ArrowLeft, Building2, Users, Beer, Shield, ShoppingCart, Scissors, Package, DollarSign } from 'lucide-react'

interface BusinessFormData {
  companyName: string
  businessType: string
  email: string
  phone: string
  address: string
}

const businessTypes = [
  {
    id: 'retail',
    name: 'Boutique',
    description: 'Vente de produits et services',
    icon: Building2
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Service de restauration',
    icon: Users
  },
  {
    id: 'bar',
    name: 'Bar',
    description: 'Établissement de boissons',
    icon: Beer
  },
  {
    id: 'pharmacy',
    name: 'Pharmacie',
    description: 'Produits pharmaceutiques et de santé',
    icon: Shield
  },
  {
    id: 'supermarket',
    name: 'Supermarché',
    description: 'Grande surface de vente',
    icon: ShoppingCart
  },
  {
    id: 'hair_salon',
    name: 'Salon de coiffure',
    description: 'Services de coiffure et soins',
    icon: Scissors
  },
  {
    id: 'grocery',
    name: 'Épicerie',
    description: 'Magasin de produits alimentaires de base',
    icon: Package
  },
  {
    id: 'bar_restaurant',
    name: 'Bar/Restaurant',
    description: 'Établissement mixte bar et restaurant',
    icon: DollarSign
  }
]

export default function BusinessSetupPage() {
  const [formData, setFormData] = useState<BusinessFormData>({
    companyName: '',
    businessType: 'retail',
    email: '',
    phone: '+241 ',
    address: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission
  }

  const handleBack = () => {
    // Handle back navigation
    console.log('Back clicked')
  }

  return (
    <div className="min-h-screen bg-black safe-area-inset">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Retour</span>
          </button>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-medium">1</div>
            <div className="w-8 h-8 rounded-full bg-black text-gray-400 flex items-center justify-center text-sm font-medium">2</div>
            <div className="w-8 h-8 rounded-full bg-black text-gray-400 flex items-center justify-center text-sm font-medium">3</div>
          </div>
        </div>

        {/* Main content */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Configurer votre entreprise</h1>
          <p className="text-gray-400 text-lg">Créez votre espace de gestion en quelques minutes</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Business Information Section */}
          <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white mb-6">Informations de l'entreprise</h2>
            
            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Nom de votre entreprise"
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type d'activité *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {businessTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <div
                      key={type.id}
                      onClick={() => setFormData({ ...formData, businessType: type.id })}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-orange-500/50 ${
                        formData.businessType === type.id
                          ? 'bg-orange-500/20 border-orange-500'
                          : 'bg-white/5 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-5 w-5 ${
                          formData.businessType === type.id ? 'text-orange-400' : 'text-gray-400'
                        }`} />
                        <div>
                          <div className={`font-medium ${
                            formData.businessType === type.id ? 'text-white' : 'text-gray-300'
                          }`}>
                            {type.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email de l'entreprise *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="email@entreprise.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Téléphone
              </label>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-gray-300">
                  +241
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  placeholder="00 00 00 00"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Format: +241 01 23 45 67</p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                placeholder="Adresse complète"
              />
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors active:scale-95"
            >
              Précédent
            </button>
            
            <button
              type="submit"
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors active:scale-95 font-medium"
            >
              Suivant
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
