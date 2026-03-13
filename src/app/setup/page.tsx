'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Utensils, Beer, Pill, ShoppingCart, CheckCircle, ArrowRight } from 'lucide-react'

interface BusinessConfig {
  name: string
  businessType: 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket'
  email: string
  phone: string
  address: string
}

const businessTypes = [
  {
    id: 'retail',
    name: 'Boutique',
    description: 'Commerce de détail général',
    icon: Store,
    color: 'blue',
    features: ['Gestion des stocks', 'Vente au comptant', 'Clientèle locale']
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Service de restauration sur place',
    icon: Utensils,
    color: 'orange',
    features: ['Service sur place', 'Gestion des tables', 'Compte client', 'Livraison']
  },
  {
    id: 'bar',
    name: 'Bar',
    description: 'Établissement de boissons',
    icon: Beer,
    color: 'purple',
    features: ['Service sur place', 'Compte client', 'Consommations sur place']
  },
  {
    id: 'pharmacy',
    name: 'Pharmacie',
    description: 'Établissement pharmaceutique',
    icon: Pill,
    color: 'green',
    features: ['Gestion médicaments', 'Assurance maladie', 'Conseils pharmaceutiques']
  },
  {
    id: 'supermarket',
    name: 'Supermarché',
    description: 'Grande surface de vente',
    icon: ShoppingCart,
    color: 'red',
    features: ['Gestion stocks avancée', 'Plusieurs caisses', 'Cartes de fidélité', 'Livraison']
  }
]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState<BusinessConfig>({
    name: '',
    businessType: 'retail',
    email: '',
    phone: '',
    address: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    
    // Simuler la création du compte
    setTimeout(() => {
      const userData = {
        id: 'user-' + Date.now(),
        name: 'Administrateur',
        email: config.email,
        role: 'admin',
        tenant: {
          id: 'tenant-' + Date.now(),
          name: config.name,
          businessType: config.businessType
        }
      }
      
      // Sauvegarder dans localStorage
      localStorage.setItem('token', 'setup-token-' + Date.now())
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Rediriger vers le dashboard
      router.push('/dashboard')
    }, 2000)
  }

  const selectedBusiness = businessTypes.find(b => b.id === config.businessType)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h2 className="text-xl font-medium text-white mb-2">Configuration en cours...</h2>
          <p className="text-gray-400">Création de votre espace SmartManager</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenue dans SmartManager</h1>
          <p className="text-gray-400">Configurons votre espace de gestion</p>
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-2 mt-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stepNumber <= step 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNumber < step ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ${
                    stepNumber < step ? 'bg-orange-500' : 'bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Business Type Selection */}
        {step === 1 && (
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Quel type d'établissement ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessTypes.map((business) => {
                const Icon = business.icon
                return (
                  <button
                    key={business.id}
                    onClick={() => setConfig({ ...config, businessType: business.id as any })}
                    className={`p-4 rounded-lg border transition-all duration-300 text-left relative ${
                      config.businessType === business.id
                        ? 'border-orange-500 bg-linear-to-r from-orange-500/20 to-orange-600/20 shadow-lg shadow-orange-500/30 ring-2 ring-orange-500/50 transform scale-105'
                        : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${business.color}-500/20`}>
                        <Icon className={`w-6 h-6 text-${business.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{business.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">{business.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {business.features.map((feature, index) => (
                            <span key={index} className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Basic Information */}
        {step === 2 && (
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Informations de base</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: Boutique du Centre"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig({ ...config, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="contact@entreprise.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={config.phone}
                    onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+241 XX XX XX XX"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Adresse complète"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Résumé de votre configuration</h2>
            
            <div className="space-y-6">
              {/* Business Type Summary */}
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  {selectedBusiness && (
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${selectedBusiness.color}-500/20`}>
                      <selectedBusiness.icon className={`w-6 h-6 text-${selectedBusiness.color}-400`} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedBusiness?.name}</h3>
                    <p className="text-gray-400">{selectedBusiness?.description}</p>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Informations</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nom:</span>
                    <span className="text-white">{config.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{config.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Téléphone:</span>
                    <span className="text-white">{config.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Adresse:</span>
                    <span className="text-white">{config.address}</span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Fonctionnalités incluses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedBusiness?.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => step === 1 ? router.push('/') : setStep(step - 1)}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
          >
            Précédent
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium shadow-lg shadow-orange-500/25 flex items-center space-x-2 transition-colors"
            disabled={step === 1 ? false : (!config.name || !config.email || !config.phone || !config.address)}
          >
            {step === 3 ? 'Créer mon espace' : 'Suivant'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
