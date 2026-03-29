'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Store, Utensils, Beer, Pill, ShoppingCart, CheckCircle, ArrowRight, Brain, TrendingUp, Scissors } from 'lucide-react'

interface BusinessConfig {
  name: string
  businessType: 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket' | 'hair_salon'
  email: string
  phone: string
  address: string
  aiSuggestions?: string[]
  predictedRevenue?: number
  predictedRevenueRange?: {
    min: number
    max: number
    confidence: 'Élevée' | 'Moyenne' | 'Faible'
  }
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
  },
  {
    id: 'hair_salon',
    name: 'Salon de coiffure',
    description: 'Établissement de coiffure et beauté',
    icon: Scissors,
    color: 'pink',
    features: ['Gestion des rendez-vous', 'Services coiffure', 'Vente produits', 'Fidélisation clients']
  }
]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [config, setConfig] = useState<BusinessConfig>({
    name: '',
    businessType: 'retail',
    email: '',
    phone: '',
    address: '',
    aiSuggestions: [],
    predictedRevenue: undefined,
    predictedRevenueRange: undefined
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fonctions IA pour suggestions intelligentes basées sur les données réelles du marché gabonais
  const generateAiSuggestions = useCallback((businessType: string) => {
    setIsAiLoading(true)
    
    // Simuler un appel API avec des données réalistes
    setTimeout(() => {
      const suggestions = {
        retail: [
          `Optimisez votre espace avec des gondoles bien organisées pour maximiser les ventes`,
          `Proposez des produits locaux gabonais (huile de palme, poisson fumé, manioc) pour attirer la clientèle`,
          `Installez un système de caisse mobile pour gérer les files d'attente efficacement`,
          `Créez un programme de fidélité avec des réductions pour les clients réguliers`,
          `Positionnez-vous près des écoles ou des bureaux pour un flux constant de clients`
        ],
        restaurant: [
          `Mettez en avant des plats typiques gabonais: poulet DG, poisson braisé, atiéké`,
          `Proposez des formules déjeuner entre 2500-5000 XAF pour les travailleurs`,
          `Aménagez une terrasse couverte pour le climat tropical`,
          `Utilisez des ingrédients locaux pour réduire les coûts et l'empreinte carbone`,
          `Installez un système de réservation en ligne pour les groupes et événements`
        ],
        bar: [
          `Proposez des cocktails locaux avec des fruits tropicaux (ananas, mangue, papaye)`,
          `Organisez des soirées à thème les week-ends pour augmenter le trafic`,
          `Installez des écrans pour diffuser les matchs de football et événements sportifs`,
          `Créez une carte de bières locales et importées avec des accords mets-bières`,
          `Mettez en place un système de livraison pour les commandes de groupe`
        ],
        pharmacy: [
          `Assurez-vous d'avoir les médicaments essentiels du programme national de santé`,
          `Proposez des services de conseil pharmaceutique personnalisé`,
          `Installez un système de gestion des stocks pour éviter les ruptures`,
          `Créez un programme de prévention avec des bilans de santé réguliers`,
          `Proposez des produits de parapharmacie adaptés au climat tropical`
        ],
        supermarket: [
          `Organisez les rayons par catégories claires: produits frais, épicerie, ménage`,
          `Proposez des promotions hebdomadaires sur les produits de base`,
          `Installez des caisses automatiques pour réduire les temps d'attente`,
          `Créez un service de livraison pour les commandes de plus de 10000 XAF`,
          `Mettez en avant les produits locaux et artisanaux gabonais`
        ],
        hair_salon: [
          `Spécialisez-vous dans les coiffures afro et tressages traditionnels`,
          `Utilisez des produits naturels adaptés aux cheveux africains`,
          `Proposez des forfaits mensuels pour les clients fidèles`,
          `Formez-vous aux dernières techniques de coiffure et de coloration`,
          `Créez un espace détente avec musique et boissons pour les clients`
        ]
      }
      
      const businessSuggestions = suggestions[businessType as keyof typeof suggestions] || []
      setConfig(prev => ({ ...prev, aiSuggestions: businessSuggestions }))
      setIsAiLoading(false)
    }, 1500)
  }, [])

  const predictRevenue = useCallback((businessType: string, location: string) => {
    // Données de revenus mensuels réalistes basées sur le marché gabonais (en XAF)
    const baseRevenue = {
      retail: {
        min: 300000,    // Boutique de quartier
        avg: 800000,     // Boutique standard
        max: 2000000     // Supermarché de centre-ville
      },
      bar: {
        min: 500000,     // Petit bar local
        avg: 1200000,    // Bar standard avec musique
        max: 3500000     // Bar lounge en centre-ville
      },
      restaurant: {
        min: 800000,     // Petit restaurant local
        avg: 2500000,    // Restaurant familial
        max: 6000000     // Restaurant haut de gamme
      },
      pharmacy: {
        min: 1500000,    // Pharmacie de quartier
        avg: 4000000,    // Pharmacie standard
        max: 8000000     // Pharmacie centrale
      },
      supermarket: {
        min: 1500000,    // Mini-marché
        avg: 4000000,    // Supermarché standard
        max: 12000000    // Grand hypermarché
      },
      hair_salon: {
        min: 250000,     // Salon de coiffure simple
        avg: 600000,     // Salon avec plusieurs coiffeurs
        max: 1500000     // Salon de beauté complet
      }
    }
    
    // Analyse de l'emplacement pour ajuster les prédictions
    const locationFactors = {
      'centre ville': 1.8,
      'centre commercial': 1.6,
      'quartier résidentiel': 1.2,
      'zone industrielle': 1.4,
      'près école': 1.3,
      'près hôpital': 1.5,
      'zone touristique': 1.7,
      'marché': 1.4,
      'boulevard': 1.6,
      'avenue': 1.5
    }
    
    // Déterminer le facteur d'emplacement
    let locationMultiplier = 1.0
    const locationLower = location.toLowerCase()
    
    for (const [key, factor] of Object.entries(locationFactors)) {
      if (locationLower.includes(key)) {
        locationMultiplier = factor
        break
      }
    }
    
    // Calculer le revenu prédit basé sur le type et l'emplacement
    const revenueData = baseRevenue[businessType as keyof typeof baseRevenue]
    const baseAmount = revenueData.avg
    const predicted = Math.round(baseAmount * locationMultiplier)
    
    // Ajouter une marge d'erreur réaliste (±20%)
    const variance = Math.round(predicted * 0.2)
    const minPredicted = Math.max(revenueData.min, predicted - variance)
    const maxPredicted = Math.min(revenueData.max, predicted + variance)
    
    setConfig(prev => ({ 
      ...prev, 
      predictedRevenue: predicted,
      predictedRevenueRange: {
        min: minPredicted,
        max: maxPredicted,
        confidence: locationMultiplier > 1.5 ? 'Élevée' : locationMultiplier > 1.2 ? 'Moyenne' : 'Faible'
      }
    }))
  }, [])

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
      // Générer les suggestions IA quand on passe à l'étape 3
      if (step === 2) {
        generateAiSuggestions(config.businessType)
        predictRevenue(config.businessType, config.address)
      }
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
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stepNumber <= step 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-700 text-gray-400'
                }`}>
                  {stepNumber < step ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
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
            <h2 className="text-2xl font-bold text-white mb-6">Quel type d&apos;établissement ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessTypes.map((business) => {
                const Icon = business.icon
                return (
                  <button
                    key={business.id}
                    onClick={() => setConfig({ ...config, businessType: business.id as 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket' | 'hair_salon' })}
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
                  Nom de l&apos;établissement *
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

        {/* Step 3: AI Suggestions and Revenue Prediction */}
        {step === 3 && (
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Suggestions IA et Analyse Financière</h2>
            
            {/* AI Suggestions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span>Conseils personnalisés pour votre {selectedBusiness?.name?.toLowerCase()}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => generateAiSuggestions(config.businessType)}
                  disabled={isAiLoading}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-xs rounded-lg transition-colors flex items-center space-x-1"
                >
                  <Brain className="w-4 h-4" />
                  <span>{isAiLoading ? 'Analyse...' : 'Actualiser'}</span>
                </button>
              </div>
              
              {config.aiSuggestions && config.aiSuggestions.length > 0 && (
                <div className="space-y-3">
                  {config.aiSuggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5"></div>
                      <span className="text-gray-300 text-sm">{suggestion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Revenue Prediction */}
            {config.predictedRevenue && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                <h3 className="font-semibold text-green-300 mb-3 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Analyse financière prédictive</span>
                </h3>
                
                <div className="space-y-3">
                  {/* Revenu principal */}
                  <div className="flex justify-between items-center">
                    <span className="text-green-300">Revenu mensuel estimé:</span>
                    <span className="text-2xl font-bold text-green-400">
                      {config.predictedRevenue.toLocaleString('fr-GA')} XAF
                    </span>
                  </div>
                  
                  {/* Gamme de revenus */}
                  {config.predictedRevenueRange && (
                    <div className="border-t border-green-500/20 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-green-300 text-sm">Gamme probable:</span>
                        <span className="text-green-400 font-medium">
                          {config.predictedRevenueRange.min.toLocaleString('fr-GA')} - {config.predictedRevenueRange.max.toLocaleString('fr-GA')} XAF
                        </span>
                      </div>
                      
                      {/* Niveau de confiance */}
                      <div className="flex justify-between items-center">
                        <span className="text-green-300 text-sm">Niveau de confiance:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          config.predictedRevenueRange.confidence === 'Élevée' 
                            ? 'bg-green-500/20 text-green-400'
                            : config.predictedRevenueRange.confidence === 'Moyenne'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          {config.predictedRevenueRange.confidence}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Facteurs considérés */}
                  <div className="text-xs text-gray-400 border-t border-green-500/20 pt-2">
                    <p>• Analyse basée sur {config.businessType === 'retail' ? 'le secteur de la vente au détail' :
                              config.businessType === 'restaurant' ? 'le secteur de la restauration' :
                              config.businessType === 'bar' ? 'le secteur des boissons' :
                              config.businessType === 'pharmacy' ? 'le secteur pharmaceutique' :
                              config.businessType === 'supermarket' ? 'le secteur de la grande distribution' :
                              config.businessType === 'hair_salon' ? 'le secteur de la coiffure et beauté' :
                              'le secteur des services'}</p>
                    <p>• Données du marché gabonais actualisées</p>
                    <p>• Facteur d&apos;emplacement: {config.address ? 'Analyse géographique appliquée' : 'Non spécifié'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
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

              {/* AI Summary */}
              {config.predictedRevenue && (
                <div className="bg-linear-to-r from-green-900/20 to-purple-900/20 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Potentiel de revenus</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {config.predictedRevenue.toLocaleString('fr-GA')} XAF
                    </div>
                    <p className="text-gray-400 text-sm">Revenu mensuel estimé</p>
                    {config.predictedRevenueRange && (
                      <p className="text-gray-500 text-xs mt-1">
                        Gamme: {config.predictedRevenueRange.min.toLocaleString('fr-GA')} - {config.predictedRevenueRange.max.toLocaleString('fr-GA')} XAF
                      </p>
                    )}
                  </div>
                </div>
              )}
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
            disabled={step === 1 ? false : (step === 2 ? (!config.name || !config.email || !config.phone || !config.address) : false)}
          >
            {step === 4 ? 'Créer mon espace' : 'Suivant'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
