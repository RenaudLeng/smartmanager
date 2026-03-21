import React, { useState, useCallback } from 'react'
import { Building2, X, Users, Package, DollarSign } from 'lucide-react'

// Types pour les configurations par type de business
interface BusinessTypeConfig {
  categories: { name: string; description?: string }[]
  defaultProducts: { name: string; price: number; category: string; description?: string }[]
  defaultExpenses: string[]
}

interface CreateTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (tenantData: TenantFormData & { businessConfig: BusinessTypeConfig; createdAt: Date; id: string }) => void
}

interface TenantFormData {
  name: string
  businessType: string
  email: string
  phone: string
  address: string
  adminName: string
  adminEmail: string
  subscriptionPlan: string
  predictedRevenue?: number
  aiSuggestions?: string[]
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  features: string[]
  description: string
}

export default function CreateTenantModal({ isOpen, onClose, onSubmit }: CreateTenantModalProps) {
  const generateId = useCallback(() => Date.now().toString(), [])
  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    businessType: 'retail',
    email: '',
    phone: '',
    address: '',
    adminName: '',
    adminEmail: '',
    subscriptionPlan: 'free',
    aiSuggestions: []
  })
  const [step, setStep] = useState(1)
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Fonctions IA pour suggestions intelligentes
  const generateAiSuggestions = useCallback(async (businessType: string, businessName: string) => {
    console.log(`Generating AI suggestions for ${businessType}: ${businessName}`)
    setIsAiLoading(true)
    try {
      // Simulation d'API IA - remplacer avec vrai appel API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const suggestions = {
        retail: [
          'Produits locaux populaires: Manioc, Poisson fumé, Lait concentré',
          'Heures de pointe: 8h-10h et 17h-19h',
          'Zone de livraison: 5km rayon recommandé'
        ],
        bar: [
          'Promotions: Happy hour 18h-20h, Soirées week-end',
          'Stock prioritaire: Bières locales, Spiritueux importés',
          'Événements: Matchs football, Musique live'
        ],
        restaurant: [
          'Menu du jour: Plats locaux + accompagnement',
          'Livraison: Plateformes partenaires recommandées',
          'Personnel: 1 cuisinier + 2 serveurs minimum'
        ]
      }
      
      setFormData(prev => ({
        ...prev,
        aiSuggestions: suggestions[businessType as keyof typeof suggestions] || []
      }))
    } catch (error) {
      console.error('Error generating AI suggestions:', error)
    } finally {
      setIsAiLoading(false)
    }
  }, [])

  const predictRevenue = useCallback((businessType: string, location: string) => {
    // Algorithme simple de prédiction de revenu mensuel
    const baseRevenue = {
      retail: 500000,
      bar: 800000,
      restaurant: 1200000,
      hair_salon: 400000,
      pharmacy: 2000000,
      supermarket: 3000000
    }
    
    const locationMultiplier = location.toLowerCase().includes('centre') ? 1.5 : 
                              location.toLowerCase().includes('quartier') ? 1.2 : 1.0
    
    const predicted = Math.round(baseRevenue[businessType as keyof typeof baseRevenue] * locationMultiplier)
    setFormData(prev => ({ ...prev, predictedRevenue: predicted }))
  }, [])

  const generateBusinessName = useCallback((businessType: string) => {
    const prefixes = {
      retail: ['Boutique', 'Magasin', 'Comptoir', 'Épicerie'],
      bar: ['Bar', 'Café', 'Lounge', 'Pub'],
      restaurant: ['Restaurant', 'Bistro', 'Cuisine', 'Table'],
      hair_salon: ['Salon', 'Institut', 'Beauty', 'Style']
    }
    
    const suffixes = ['du Centre', 'de la Ville', 'Premium', 'Express', 'Plus']
    const prefix = prefixes[businessType as keyof typeof prefixes]?.[Math.floor(Math.random() * prefixes[businessType as keyof typeof prefixes].length)]
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
    
    return `${prefix} ${suffix}`
  }, [])

  const generateAdminEmail = useCallback((businessName: string, adminName: string) => {
    const domain = businessName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '')
    
    const namePart = adminName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .split(' ')[0]
    
    return `${namePart}@${domain}.com`
  }, [])

  // Types de business disponibles
  const businessTypes: { id: string; name: string; icon: string; description: string; config: BusinessTypeConfig }[] = [
    { 
      id: 'retail', 
      name: 'Boutique', 
      icon: '🏪', 
      description: 'Vente de produits divers',
      config: {
        categories: [
          { name: 'Alimentaire', description: 'Produits alimentaires de base' },
          { name: 'Boissons', description: 'Boissons, jus, sodas' },
          { name: 'Épicerie sucrée', description: 'Sucre, farine, épices' },
          { name: 'Produits frais', description: 'Conserves, produits non périssables' },
          { name: 'Produits laitiers', description: 'Lait, yaourts, fromages' },
          { name: 'Hygiène', description: 'Produits de soin et hygiène' }
        ],
        defaultProducts: [
          { name: 'Riz gabonais 1kg', price: 1500, category: 'Alimentaire' },
          { name: 'Huile de palme 1L', price: 1500, category: 'Boissons' },
          { name: 'Sucre 1kg', price: 1000, category: 'Épicerie sucrée' },
          { name: 'Savon 200g', price: 500, category: 'Produits frais' }
        ],
        defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases']
      }
    },
    { 
      id: 'bar', 
      name: 'Bar', 
      icon: '🍺', 
      description: 'Boissons alcoolisées et snacks',
      config: {
        categories: [
          { name: 'Bières', description: 'Différentes marques de bières' },
          { name: 'Vins', description: 'Vins rouges, blancs, rosés' },
          { name: 'Spirits', description: 'Whisky, vodka, rhum, etc.' },
          { name: 'Softs', description: 'Boissons non alcoolisées' },
          { name: 'Snacks', description: 'Chips, biscuits, fruits secs' }
        ],
        defaultProducts: [
          { name: 'Castel 33cl', price: 500, category: 'Bières' },
          { name: 'Coca-Cola 33cl', price: 300, category: 'Softs' },
          { name: 'Chips', price: 200, category: 'Snacks' }
        ],
        defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases']
      }
    },
    { 
      id: 'restaurant', 
      name: 'Restaurant', 
      icon: '🍽️', 
      description: 'Plats chauds et restauration',
      config: {
        categories: [
          { name: 'Entrées', description: 'Salades, soupes, apéritifs' },
          { name: 'Plats principaux', description: 'Plats chauds traditionnels' },
          { name: 'Desserts', description: 'Gâteaux, pâtisseries' },
          { name: 'Boissons', description: 'Jus, sodas, boissons' },
          { name: 'Apéritifs', description: 'Amuse-gueules, digestifs, boissons' }
        ],
        defaultProducts: [
          { name: 'Riz sauce', price: 1500, category: 'Plats principaux' },
          { name: 'Jus de fruit', price: 500, category: 'Boissons' },
          { name: 'Salade', price: 800, category: 'Entrées' }
        ],
        defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases']
      }
    },
    { 
      id: 'hair_salon', 
      name: 'Salon de coiffure', 
      icon: '💇', 
      description: 'Services de coiffure et beauté',
      config: {
        categories: [
          { name: 'Coiffure femme', description: 'Brushing, coupe, coloration' },
          { name: 'Coiffure homme', description: 'Coupe, rasage, barbe' },
          { name: 'Produits capillaires', description: 'Shampoings, laits, produits de soin' },
          { name: 'Accessoires', description: 'Peignes, pinces, accessoires' }
        ],
        defaultProducts: [
          { name: 'Coupe homme', price: 2000, category: 'Coiffure homme' },
          { name: 'Tissage', price: 5000, category: 'Coiffure femme' },
          { name: 'Shampoing', price: 1500, category: 'Produits capillaires' }
        ],
        defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases']
      }
    },
    { 
      id: 'pharmacy', 
      name: 'Pharmacie', 
      icon: '💊', 
      description: 'Médicaments et produits de santé',
      config: {
        categories: [
          { name: 'Médicaments', description: 'Médicaments sur ordonnance et en vente libre' },
          { name: 'Produits parapharmaceutiques', description: 'Produits de soin et bien-être' },
          { name: 'Produits d\'hygiène', description: 'Produits d\'hygiène personnelle' },
          { name: 'Ordonnances', description: 'Médicaments nécessitant une ordonnance' }
        ],
        defaultProducts: [
          { name: 'Paracétamol 500mg', price: 2500, category: 'Médicaments' },
          { name: 'Vitamine C', price: 500, category: 'Produits parapharmaceutiques' },
          { name: 'Bandages', price: 100, category: 'Produits d\'hygiène' }
        ],
        defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases']
      }
    },
    { 
      id: 'supermarket', 
      name: 'Supermarché', 
      icon: '🏬', 
      description: 'Grande surface de vente avec multiples rayons',
      config: {
        categories: [
          { name: 'Alimentaire', description: 'Produits alimentaires frais et frais' },
          { name: 'Boucherie', description: 'Viande, charcuterie' },
          { name: 'Surgelés', description: 'Produits congelés et frais' },
          { name: 'Épicerie', description: 'Épices, farine, condiments' },
          { name: 'Boissons', description: 'Boissons, alcools, jus' },
          { name: 'Produits laitiers', description: 'Lait, yaourts, fromages' },
          { name: 'Produits frais', description: 'Conserves, produits non périssables' },
          { name: 'Hygiène', description: 'Produits d\'entretien et hygiène' }
        ],
        defaultProducts: [
          { name: 'Riz gabonais 1kg', price: 1500, category: 'Alimentaire' },
          { name: 'Pain de mie', price: 800, category: 'Boulangerie' },
          { name: 'Jus de fruit', price: 500, category: 'Boissons' }
        ],
        defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases']
      }
    }
  ]

  const subscriptionPlans: SubscriptionPlan[] = [
    { 
      id: 'free', 
      name: 'Gratuit', 
      price: 0,
      features: ['3 utilisateurs', '50 produits', '500 MB stockage', 'Rapports basiques'],
      description: 'Idéal pour commencer - toutes les fonctionnalités essentielles'
    },
    { 
      id: 'premium', 
      name: 'Premium', 
      price: 10000,
      features: ['10 utilisateurs', '500 produits', '2 GB stockage', 'Rapports avancés', 'API accès'],
      description: 'Pour les petites et moyennes entreprises en croissance'
    },
    { 
      id: 'enterprise', 
      name: 'Enterprise', 
      price: 25000,
      features: ['50 utilisateurs', '5000 produits', '10 GB stockage', 'Rapports premium', 'API complète', 'Support prioritaire'],
      description: 'Pour les grandes entreprises et groupes de boutiques'
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const tenantData = {
      ...formData,
      businessConfig: businessTypes.find(bt => bt.id === formData.businessType)?.config || businessTypes[0].config,
      createdAt: new Date(),
      id: generateId()
    }
    
    onSubmit(tenantData)
    
    // Reset form
    setFormData({
      name: '',
      businessType: 'retail',
      email: '',
      phone: '',
      address: '',
      adminName: '',
      adminEmail: '',
      subscriptionPlan: 'free'
    })
    setStep(1)
    onClose()
  }

  const selectedBusinessType = businessTypes.find(bt => bt.id === formData.businessType)
  const selectedPlan = subscriptionPlans.find(plan => plan.id === formData.subscriptionPlan)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/20 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Building2 className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Créer une nouvelle boutique</h2>
              <p className="text-sm text-gray-400">
                Configuration automatique basée sur le type de commerce
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2 p-4 border-b border-white/10">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-16 h-1 ${
                  step > stepNumber ? 'bg-orange-500' : 'bg-gray-700'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Informations de la boutique</h3>
              
              {/* Type de business */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">Type de commerce *</label>
                  <button
                    type="button"
                    onClick={() => generateAiSuggestions(formData.businessType, formData.name)}
                    disabled={isAiLoading}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-xs rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <span>🤖</span>
                    <span>{isAiLoading ? 'Analyse...' : 'Suggestions IA'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {businessTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, businessType: type.id })}
                      className={`p-4 rounded-lg border transition-all duration-300 text-left relative ${
                        formData.businessType === type.id
                          ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/30 ring-2 ring-orange-500/50 transform scale-105'
                          : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <h4 className="font-semibold text-white mb-1">{type.name}</h4>
                      <p className="text-xs text-gray-400">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Informations boutique */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">Nom de la boutique *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const suggestedName = generateBusinessName(formData.businessType)
                        setFormData({ ...formData, name: suggestedName })
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      ✨ Suggérer
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Ex: Boutique du Centre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email de la boutique *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="contact@boutique.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+241 00 00 00 00"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">Adresse</label>
                    <button
                      type="button"
                      onClick={() => predictRevenue(formData.businessType, formData.address)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                    >
                      📊 Prédire revenu
                    </button>
                  </div>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Adresse complète de la boutique"
                  />
                </div>
              </div>

              {/* Section IA - Suggestions et Prédictions */}
              {formData.aiSuggestions && formData.aiSuggestions.length > 0 && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-300 mb-3 flex items-center space-x-2">
                    <span>🤖</span>
                    <span>Suggestions IA pour votre business</span>
                  </h4>
                  <div className="space-y-2">
                    {formData.aiSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5"></div>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.predictedRevenue && (
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-300 mb-2 flex items-center space-x-2">
                    <span>📊</span>
                    <span>Prédiction de revenu mensuel</span>
                  </h4>
                  <div className="text-2xl font-bold text-green-400">
                    {formData.predictedRevenue.toLocaleString('fr-GA')} XAF
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Basé sur le type de business et la localisation</p>
                </div>
              )}

              {/* Configuration automatique basée sur le type */}
              {selectedBusinessType && (
                <div className="bg-black/40 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Configuration automatique pour {selectedBusinessType.name}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Catégories pré-configurées</h5>
                      <div className="space-y-1">
                        {selectedBusinessType.config.categories?.slice(0, 3).map((category, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-gray-400">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>{category.name}</span>
                          </div>
                        ))}
                        {selectedBusinessType.config.categories?.length > 3 && (
                          <span className="text-xs text-orange-400">+{selectedBusinessType.config.categories.length - 3} autres...</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Produits par défaut</h5>
                      <div className="space-y-1">
                        {selectedBusinessType.config.defaultProducts?.slice(0, 3).map((product, index) => (
                          <div key={index} className="flex justify-between text-xs">
                            <span className="text-gray-400">{product.name}</span>
                            <span className="text-white font-medium">{product.price} XAF</span>
                          </div>
                        ))}
                        {selectedBusinessType.config.defaultProducts?.length > 3 && (
                          <span className="text-xs text-orange-400">+{selectedBusinessType.config.defaultProducts.length - 3} autres...</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Administrateur de la boutique</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet de l&apos;admin *</label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Jean Dupont"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">Email de l&apos;admin *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const suggestedEmail = generateAdminEmail(formData.name, formData.adminName)
                        setFormData({ ...formData, adminEmail: suggestedEmail })
                      }}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      ✨ Suggérer
                    </button>
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="admin@boutique.com"
                  />
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="bg-black/40 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Récapitulatif de la création</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type de commerce:</span>
                    <span className="text-white font-medium">{selectedBusinessType?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nom boutique:</span>
                    <span className="text-white font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Admin:</span>
                    <span className="text-white font-medium">{formData.adminName} ({formData.adminEmail})</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Plan d&apos;abonnement</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, subscriptionPlan: plan.id })}
                    className={`p-4 rounded-lg border transition-all duration-300 text-left ${
                      formData.subscriptionPlan === plan.id
                        ? 'border-orange-500 bg-orange-500/20 shadow-lg shadow-orange-500/30 ring-2 ring-orange-500/50'
                        : 'border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div className={`text-2xl font-bold mb-1 ${
                        plan.id === 'free' ? 'text-gray-400' : 'text-orange-500'
                      }`}>
                        {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString('fr-GA')} XAF/mois`}
                      </div>
                      {plan.id !== 'free' && (
                        <div className="text-xs text-gray-400">
                          {plan.id === 'premium' ? 'Économisez 15% avec annuel' : 'Contactez-nous pour entreprise'}
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-white">{plan.features[0]}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-white">{plan.features[1]}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-white">{plan.features[2]}</span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        {plan.features.slice(3).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Récapitulatif final */}
              <div className="bg-black/40 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-white mb-3">Récapitulatif final</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Boutique:</span>
                      <span className="text-white font-medium">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white font-medium">{selectedBusinessType?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Admin:</span>
                      <span className="text-white font-medium">{formData.adminName}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Plan:</span>
                      <span className={`font-medium ${
                        selectedPlan?.id === 'free' ? 'text-gray-400' : 'text-orange-500'
                      }`}>{selectedPlan?.name}</span>
                    </div>
                    {selectedPlan && selectedPlan.price > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Coût mensuel:</span>
                        <span className="text-orange-500 font-bold">{selectedPlan.price.toLocaleString('fr-GA')} XAF</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            
            <div className="flex space-x-3">
              {step < 3 && (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Continuer
                </button>
              )}
              
              {step === 3 && (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  Créer la boutique
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
