'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  Users, 
  Beer, 
  Shield, 
  ShoppingCart, 
  Scissors, 
  Package, 
  DollarSign,
  CreditCard, 
  Truck, 
  Table, 
  Users2, 
  Zap, 
  Printer,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import DynamicBusinessSetup from '@/components/Business/DynamicBusinessSetup'

interface BusinessSetupData {
  // Informations de l'entreprise
  businessName: string
  businessType: string
  email: string
  phone: string
  address: string
  
  // Informations de l'administrateur
  adminName: string
  adminEmail: string
  adminPassword: string
  confirmPassword: string
  
  // Fonctionnalités
  features: {
    debtManagement: boolean
    delivery: boolean
    tableService: boolean
    tableNumberRequired: boolean
    flashCustomers: boolean
    ticketPrinting: boolean
  }
}

const businessTypes = [
  {
    id: 'retail',
    name: 'Boutique',
    icon: Building2,
    description: 'Vente de produits et services',
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

export default function SetupBusinessPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [formData, setFormData] = useState<BusinessSetupData>({
    businessName: '',
    businessType: 'retail',
    email: '',
    phone: '',
    address: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    features: {
      debtManagement: true,
      delivery: false,
      tableService: false,
      tableNumberRequired: false,
      flashCustomers: true,
      ticketPrinting: true
    }
  })

  const updateFeatures = (businessType: string) => {
    const selectedBusiness = businessTypes.find(type => type.id === businessType)
    if (selectedBusiness) {
      setFormData(prev => ({
        ...prev,
        businessType,
        features: selectedBusiness.recommendedFeatures
      }))
    }
  }

  const handleDynamicFeaturesChange = (features: Record<string, boolean>) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        ...features
      }
    }))
  }

  const validateStep = () => {
    if (currentStep === 1) {
      return formData.businessName && formData.businessType && formData.email
    }
    if (currentStep === 2) {
      // Étape 2: Modules - toujours valide car les modules sont optionnels
      return true
    }
    if (currentStep === 3) {
      return formData.adminName && formData.adminEmail && formData.adminPassword && 
             formData.adminPassword === formData.confirmPassword && formData.adminPassword.length >= 6
    }
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateStep()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/setup-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()
      
      if (result.success) {
        setIsSuccess(true)
      } else {
        alert(result.error || 'Une erreur est survenue lors de la création')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 safe-area-inset">
        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center border border-gray-800">
          <div className="bg-green-500/20 rounded-full p-4 w-fit mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Entreprise créée avec succès !
          </h1>
          
          <p className="text-gray-300 mb-6">
            Votre entreprise <span className="font-semibold text-orange-400">{formData.businessName}</span> a été créée avec une période d&apos;essai de 14 jours.
          </p>
          
          <p className="text-sm text-gray-400 mb-8">
            Un email de confirmation a été envoyé à <span className="font-semibold">{formData.adminEmail}</span>
          </p>
          
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full"
          >
            Se connecter à mon espace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step <= currentStep 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-black text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Configurer votre entreprise
          </h1>
          <p className="text-gray-300">
            Créez votre espace de gestion en quelques minutes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Étape 1: Informations de l'entreprise */}
          {currentStep === 1 && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">
                Informations de l&apos;entreprise
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de l&apos;entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Nom de votre entreprise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type d&apos;activité *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {businessTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => updateFeatures(type.id)}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            formData.businessType === type.id
                              ? 'border-orange-500 bg-orange-500/20'
                              : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                          }`}
                        >
                          <Icon className="w-6 h-6 mx-auto mb-2 text-orange-400" />
                          <div className="text-sm font-medium text-white">{type.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email de l&apos;entreprise *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="email@entreprise.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Téléphone
                    </label>
                    <div className="flex">
                      <select
                        value={formData.phone?.includes('+241') ? '+241' : formData.phone?.includes('+225') ? '+225' : '+241'}
                        onChange={(e) => {
                          const prefix = e.target.value
                          const currentNumber = formData.phone?.replace(/^\+\d+\s*/, '') || ''
                          setFormData({ ...formData, phone: `${prefix} ${currentNumber}` })
                        }}
                        className="px-3 py-3 bg-white/10 border border-white/20 rounded-l-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="+241">+241</option>
                        <option value="+225">+225</option>
                        <option value="+237">+237</option>
                        <option value="+221">+221</option>
                      </select>
                      <input
                        type="tel"
                        value={formData.phone?.replace(/^\+\d+\s*/, '') || ''}
                        onChange={(e) => {
                          const prefix = formData.phone?.match(/^\+\d+/)?.[0] || '+241'
                          setFormData({ ...formData, phone: `${prefix} ${e.target.value}` })
                        }}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="00 00 00 00"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Format: +241 01 23 45 67</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Adresse complète"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Fonctionnalités */}
          {currentStep === 2 && (
            <div>
              <DynamicBusinessSetup 
                businessType={formData.businessType}
                onFeaturesChange={handleDynamicFeaturesChange}
              />
            </div>
          )}

          {/* Étape 3: Informations administrateur */}
          {currentStep === 3 && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-6">
                Compte administrateur
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email administrateur *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="admin@entreprise.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Min 6 caractères"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmer le mot de passe *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Confirmer le mot de passe"
                    />
                  </div>
                </div>

                {formData.adminPassword && formData.confirmPassword && formData.adminPassword !== formData.confirmPassword && (
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                    <p className="text-red-400 text-sm">Les mots de passe ne correspondent pas</p>
                  </div>
                )}

                <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4">
                  <h3 className="text-blue-400 font-medium mb-2">🎁 Période d&apos;essai de 14 jours</h3>
                  <p className="text-gray-300 text-sm">
                    Votre entreprise bénéficiera automatiquement d&apos;une période d&apos;essai gratuite de 14 jours avec toutes les fonctionnalités activées. 
                    Après cette période, vous pourrez choisir un plan d&apos;abonnement adapté à vos besoins.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-black hover:bg-gray-900 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={!validateStep()}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            ) : (
              <button
                type="submit"
                disabled={!validateStep() || isLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Création en cours...' : 'Créer mon entreprise'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
