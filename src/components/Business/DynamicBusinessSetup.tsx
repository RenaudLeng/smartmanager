'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Building2, Users, Beer, Shield, ShoppingCart, Scissors, Package, DollarSign,
  Clock, Calendar, Truck, CreditCard, FileText, AlertTriangle, PackageOpen,
  ThermometerSun, BarChart3, Users2, ChefHat, Pill, Wine, ShoppingBag
} from 'lucide-react'
import { getBusinessSystem, getAvailableModules, getBusinessReports } from '@/config/businessSystems'
import { BUSINESS_CATEGORIES } from '@/config/businessCategories'

interface DynamicBusinessSetupProps {
  businessType: string
  onFeaturesChange: (features: any) => void
}

const getBusinessIcon = (type: string) => {
  const icons: Record<string, any> = {
    retail: Building2,
    restaurant: Users,
    bar: Beer,
    pharmacy: Shield,
    supermarket: ShoppingCart,
    hair_salon: Scissors,
    grocery: Package,
    bar_restaurant: DollarSign
  }
  return icons[type] || Building2
}

const getBusinessTheme = (type: string) => {
  const themes: Record<string, { primary: string; secondary: string; accent: string }> = {
    retail: { primary: 'blue', secondary: 'cyan', accent: 'indigo' },
    restaurant: { primary: 'orange', secondary: 'red', accent: 'yellow' },
    bar: { primary: 'purple', secondary: 'pink', accent: 'indigo' },
    pharmacy: { primary: 'green', secondary: 'emerald', accent: 'teal' },
    supermarket: { primary: 'yellow', secondary: 'amber', accent: 'orange' },
    hair_salon: { primary: 'pink', secondary: 'rose', accent: 'purple' },
    grocery: { primary: 'brown', secondary: 'orange', accent: 'yellow' },
    bar_restaurant: { primary: 'violet', secondary: 'purple', accent: 'pink' }
  }
  return themes[type] || themes.retail
}

const getModuleIcon = (module: string) => {
  const icons: Record<string, any> = {
    inventory: PackageOpen,
    orders: ShoppingCart,
    appointments: Calendar,
    tables: Users2,
    prescriptions: FileText,
    insurance: Shield,
    delivery: Truck,
    fidelity: CreditCard,
    multipleCheckout: BarChart3,
    // Modules spécifiques Gabon
    localBeverages: Beer,
    eventManagement: Calendar,
    noiseControl: AlertTriangle,
    cnamIntegration: Shield,
    localProducts: Package,
    healthStats: BarChart3,
    africanHairSpecialist: Scissors,
    eventServices: Calendar,
    localCuisine: ChefHat,
    deliveryZones: Truck,
    peakHours: Clock,
    financialServices: CreditCard,
    localSupply: Package,
    creditManagement: CreditCard,
    seasonalManagement: Calendar,
    seasonalProducts: Package,
    mixedService: Users2
  }
  return icons[module] || Package
}

const getModuleLabel = (module: string) => {
  const labels: Record<string, string> = {
    inventory: 'Gestion des stocks',
    orders: 'Prise de commandes',
    appointments: 'Prise de rendez-vous',
    tables: 'Gestion des tables',
    prescriptions: 'Ordonnances',
    insurance: 'Assurances',
    delivery: 'Livraison',
    fidelity: 'Fidélisation',
    multipleCheckout: 'Multi-caisses',
    // Labels spécifiques Gabon
    localBeverages: 'Boissons locales gabonaises',
    eventManagement: 'Gestion événements',
    noiseControl: 'Contrôle du bruit',
    cnamIntegration: 'Intégration CNAM',
    localProducts: 'Produits locaux',
    healthStats: 'Statistiques santé',
    africanHairSpecialist: 'Spécialiste cheveux africains',
    eventServices: 'Services événementiels',
    localCuisine: 'Cuisine locale gabonaise',
    deliveryZones: 'Zones de livraison',
    peakHours: 'Heures de pointe',
    financialServices: 'Services financiers',
    localSupply: 'Approvisionnement local',
    creditManagement: 'Gestion des crédits',
    seasonalManagement: 'Gestion saisonnière',
    seasonalProducts: 'Produits saisonniers',
    mixedService: 'Service mixte'
  }
  return labels[module] || module
}

export default function DynamicBusinessSetup({ businessType, onFeaturesChange }: DynamicBusinessSetupProps) {
  const [businessSystem] = useState(() => getBusinessSystem(businessType))
  const [availableModules] = useState(() => getAvailableModules(businessType))
  const [businessReports] = useState(() => getBusinessReports(businessType))
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, boolean>>({})
  const [businessCategories] = useState(() => BUSINESS_CATEGORIES[businessType as keyof typeof BUSINESS_CATEGORIES] || [])
  const theme = getBusinessTheme(businessType)
  const BusinessIcon = getBusinessIcon(businessType)

  // Use useRef to avoid infinite loop
  const onFeaturesChangeRef = useRef(onFeaturesChange)
  onFeaturesChangeRef.current = onFeaturesChange

  useEffect(() => {
    // Initialize features based on business type defaults - start with all unchecked
    const defaultFeatures: Record<string, boolean> = {}
    availableModules.forEach(module => {
      defaultFeatures[module] = false // Start with all unchecked
    })
    setSelectedFeatures(defaultFeatures)
    onFeaturesChangeRef.current(defaultFeatures)
  }, [businessType, availableModules])

  const handleFeatureToggle = (module: string) => {
    const newFeatures = { ...selectedFeatures, [module]: !selectedFeatures[module] }
    setSelectedFeatures(newFeatures)
    onFeaturesChangeRef.current(newFeatures)
    console.log('Feature toggled:', module, 'New state:', newFeatures[module])
  }

  const getThemeClasses = (color: string, type: 'bg' | 'border' | 'text' = 'bg') => {
    const colorMap: Record<string, Record<string, string>> = {
      bg: {
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        purple: 'bg-purple-500',
        green: 'bg-green-500',
        yellow: 'bg-yellow-500',
        pink: 'bg-pink-500',
        brown: 'bg-amber-600',
        violet: 'bg-violet-500',
        cyan: 'bg-cyan-500',
        red: 'bg-red-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        rose: 'bg-rose-500',
        indigo: 'bg-indigo-500',
        teal: 'bg-teal-500'
      },
      border: {
        blue: 'border-blue-500',
        orange: 'border-orange-500',
        purple: 'border-purple-500',
        green: 'border-green-500',
        yellow: 'border-yellow-500',
        pink: 'border-pink-500',
        brown: 'border-amber-600',
        violet: 'border-violet-500',
        cyan: 'border-cyan-500',
        red: 'border-red-500',
        emerald: 'border-emerald-500',
        amber: 'border-amber-500',
        rose: 'border-rose-500',
        indigo: 'border-indigo-500',
        teal: 'border-teal-500'
      },
      text: {
        blue: 'text-blue-400',
        orange: 'text-orange-400',
        purple: 'text-purple-400',
        green: 'text-green-400',
        yellow: 'text-yellow-400',
        pink: 'text-pink-400',
        brown: 'text-amber-400',
        violet: 'text-violet-400',
        cyan: 'text-cyan-400',
        red: 'text-red-400',
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        rose: 'text-rose-400',
        indigo: 'text-indigo-400',
        teal: 'text-teal-400'
      }
    }
    return colorMap[type][color] || colorMap[type].blue
  }

  return (
    <div className="space-y-8">
      {/* Business Type Header */}
      <div className={`bg-black/60 backdrop-blur-md border ${getThemeClasses(theme.primary, 'border')}/20 rounded-xl p-6`}>
        <div className="flex items-center space-x-4 mb-4">
          <div className={`p-3 ${getThemeClasses(theme.primary, 'bg')}/20 rounded-lg`}>
            <BusinessIcon className={`h-8 w-8 ${getThemeClasses(theme.primary, 'text')}`} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white capitalize">
              {businessType.replace('_', ' ')}
            </h3>
            <p className="text-gray-400 text-sm">
              Configuration spécialisée pour ce type d'activité
            </p>
          </div>
        </div>

        {/* Key Features Preview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {businessSystem.features.slice(0, 4).map((feature, index) => (
            <div key={index} className={`p-2 ${getThemeClasses(theme.primary, 'bg')}/10 rounded-lg border ${getThemeClasses(theme.primary, 'border')}/20`}>
              <p className="text-xs text-gray-300">{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Modules Configuration */}
      <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Modules disponibles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableModules.map((module) => {
            const ModuleIcon = getModuleIcon(module)
            const isChecked = selectedFeatures[module] || false
            
            return (
              <div
                key={module}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isChecked
                    ? `${getThemeClasses(theme.primary, 'border')} ${getThemeClasses(theme.primary, 'bg')}/20`
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      id={`checkbox-${module}`}
                      checked={isChecked}
                      onChange={() => handleFeatureToggle(module)}
                      className={`w-5 h-5 rounded cursor-pointer ${
                        isChecked 
                          ? `${getThemeClasses(theme.primary, 'bg')} border-${getThemeClasses(theme.primary, 'bg')}` 
                          : 'bg-gray-600 border-gray-500'
                      } focus:ring-2 focus:ring-offset-0 focus:ring-offset-transparent`}
                    />
                  </div>
                  <div className="flex-1">
                    <label 
                      htmlFor={`checkbox-${module}`}
                      className="flex items-center space-x-2 mb-1 cursor-pointer"
                    >
                      <ModuleIcon className={`h-4 w-4 ${isChecked ? getThemeClasses(theme.primary, 'text') : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isChecked ? 'text-white' : 'text-gray-300'}`}>
                        {getModuleLabel(module)}
                      </span>
                    </label>
                    <p className="text-xs text-gray-400">
                      {module.includes('inventory') && 'Gestion complète des stocks et produits'}
                      {module.includes('orders') && 'Prise et suivi des commandes clients'}
                      {module.includes('appointments') && 'Planning et réservations'}
                      {module.includes('tables') && 'Gestion des tables et zones'}
                      {module.includes('prescriptions') && 'Ordonnances et suivi médical'}
                      {module.includes('insurance') && 'Gestion des assurances et mutuelles'}
                      {module.includes('delivery') && 'Service de livraison à domicile'}
                      {module.includes('fidelity') && 'Programme de fidélité clients'}
                      {module.includes('multipleCheckout') && 'Plusieurs caisses simultanées'}
                      {/* Descriptions spécifiques Gabon */}
                      {module.includes('localBeverages') && 'Gestion des bières et boissons locales gabonaises'}
                      {module.includes('eventManagement') && 'Organisation événements (matchs, fêtes, animations)'}
                      {module.includes('noiseControl') && 'Contrôle du volume et respect du voisinage'}
                      {module.includes('cnamIntegration') && 'Intégration CNAM et assurances gabonaises'}
                      {module.includes('localProducts') && 'Mise en avant des produits locaux et gabonais'}
                      {module.includes('healthStats') && 'Statistiques de santé publique locale'}
                      {module.includes('africanHair') && 'Spécialisation coiffure cheveux africains et crépus'}
                      {module.includes('eventServices') && 'Services pour mariages et événements spéciaux'}
                      {module.includes('localCuisine') && 'Spécialités culinaires gabonaises et africaines'}
                      {module.includes('deliveryZones') && 'Livraison par quartiers de Libreville'}
                      {module.includes('peakHours') && 'Optimisation heures de pointe et affluence'}
                      {module.includes('financialServices') && 'Transferts d\'argent et paiement factures'}
                      {module.includes('localSupply') && 'Approvisionnement fournisseurs locaux gabonais'}
                      {module.includes('creditManagement') && 'Gestion crédits clients et système de confiance'}
                      {module.includes('seasonal') && 'Adaptation saisons (sèche, des pluies)'}
                      {module.includes('mixedService') && 'Service mixte bar/restaurant polyvalent'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Résumé des sélections */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/20">
          <h5 className="text-sm font-semibold text-white mb-2">
            Modules sélectionnés ({Object.values(selectedFeatures).filter(Boolean).length}/{availableModules.length})
          </h5>
          <div className="flex flex-wrap gap-2">
            {availableModules.filter(module => selectedFeatures[module]).map(module => (
              <span 
                key={module}
                className={`px-2 py-1 text-xs rounded-full ${getThemeClasses(theme.primary, 'bg')}/20 ${getThemeClasses(theme.primary, 'text')} border ${getThemeClasses(theme.primary, 'border')}/30`}
              >
                {getModuleLabel(module)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Business Categories */}
      <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Catégories de produits/services</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {businessCategories.map((category, index) => (
            <div key={index} className={`p-3 ${getThemeClasses(theme.secondary, 'bg')}/10 rounded-lg border ${getThemeClasses(theme.secondary, 'border')}/20`}>
              <h5 className="text-sm font-medium text-white mb-1">{category.name}</h5>
              <p className="text-xs text-gray-400">{category.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Specific Reports Preview */}
      <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">Rapports spécialisés disponibles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {businessReports.slice(0, 6).map((report, index) => (
            <div key={index} className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg">
              <BarChart3 className={`h-4 w-4 ${getThemeClasses(theme.accent, 'text')}`} />
              <span className="text-sm text-gray-300">{report}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Specific Fields Info */}
      {businessSystem.specificFields && businessSystem.specificFields.length > 0 && (
        <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Champs spécifiques à votre activité</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {businessSystem.specificFields?.map((field: string, index: number) => (
              <div key={index} className={`p-2 ${getThemeClasses(theme.accent, 'bg')}/10 rounded border ${getThemeClasses(theme.accent, 'border')}/30`}>
                <p className="text-xs font-medium text-white capitalize">
                  {field.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
