'use client'

import { useState, useEffect } from 'react'
import { Beer, Pill, Scissors, Utensils, ShoppingCart, Store, Settings } from 'lucide-react'
import { getBusinessSystem } from '@/config/businessSystems'
import BarManagement from './BarManagement'
import PharmacyManagement from './PharmacyManagement'
import HairSalonManagement from './HairSalonManagement'
import RestaurantManagement from './RestaurantManagement'
import SupermarketManagement from './SupermarketManagement'

interface BusinessDashboardProps {
  tenantId: string
  businessType: string
  tenantName: string
}

export default function BusinessDashboard({ tenantId, businessType, tenantName }: BusinessDashboardProps) {
  const [activeModule, setActiveModule] = useState<string>('overview')
  const [businessSystem, setBusinessSystem] = useState(getBusinessSystem(businessType))

  useEffect(() => {
    setBusinessSystem(getBusinessSystem(businessType))
  }, [businessType])

  const getBusinessIcon = (type: string) => {
    switch (type) {
      case 'bar': return <Beer className="w-6 h-6" />
      case 'pharmacy': return <Pill className="w-6 h-6" />
      case 'hair_salon': return <Scissors className="w-6 h-6" />
      case 'restaurant': return <Utensils className="w-6 h-6" />
      case 'supermarket': return <ShoppingCart className="w-6 h-6" />
      default: return <Store className="w-6 h-6" />
    }
  }

  const getBusinessColor = (type: string) => {
    switch (type) {
      case 'bar': return 'text-orange-500'
      case 'pharmacy': return 'text-green-500'
      case 'hair_salon': return 'text-pink-500'
      case 'restaurant': return 'text-orange-500'
      case 'supermarket': return 'text-red-500'
      default: return 'text-blue-500'
    }
  }

  const renderManagementComponent = () => {
    switch (businessType) {
      case 'bar':
        return <BarManagement tenantId={tenantId} />
      case 'pharmacy':
        return <PharmacyManagement tenantId={tenantId} />
      case 'hair_salon':
        return <HairSalonManagement tenantId={tenantId} />
      case 'restaurant':
        return <RestaurantManagement tenantId={tenantId} />
      case 'supermarket':
        return <SupermarketManagement tenantId={tenantId} />
      default:
        return (
          <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">
                <Store className="w-16 h-16 mx-auto mb-4 text-blue-500" />
                <h2 className="text-2xl font-bold mb-2">Générique</h2>
                <p className="text-gray-400">Système de gestion standard</p>
              </div>
            </div>
          </div>
        )
    }
  }

  const availableModules = Object.entries(businessSystem.modules)
    .filter(([, enabled]) => enabled)
    .map(([module]) => module)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-gray-700 ${getBusinessColor(businessType)}`}>
                {getBusinessIcon(businessType)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{tenantName}</h1>
                <p className="text-gray-400 capitalize">
                  {businessType === 'hair_salon' ? 'Salon de coiffure' : 
                   businessType === 'supermarket' ? 'Supermarché' : 
                   businessType}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des modules */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto py-2">
            <button
              onClick={() => setActiveModule('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeModule === 'overview'
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Aperçu
            </button>
            {availableModules.map((module) => (
              <button
                key={module}
                onClick={() => setActiveModule(module)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeModule === module
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {module === 'inventory' ? 'Stocks' :
                 module === 'orders' ? 'Commandes' :
                 module === 'appointments' ? 'Rendez-vous' :
                 module === 'tables' ? 'Tables' :
                 module === 'prescriptions' ? 'Ordonnances' :
                 module === 'insurance' ? 'Assurances' :
                 module === 'delivery' ? 'Livraison' :
                 module === 'fidelity' ? 'Fidélité' :
                 module === 'multipleCheckout' ? 'Caisses' : module}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeModule === 'overview' ? (
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Aperçu rapide */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Aperçu de l&apos;activité</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-gray-400 text-sm mb-2">Type d&apos;activité</h3>
                  <div className="flex items-center gap-2">
                    {getBusinessIcon(businessType)}
                    <span className="font-semibold capitalize">
                      {businessType === 'hair_salon' ? 'Salon de coiffure' : 
                       businessType === 'supermarket' ? 'Supermarché' : 
                       businessType}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-gray-400 text-sm mb-2">Modules activés</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {availableModules.length}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-gray-400 text-sm mb-2">Fonctionnalités</h3>
                  <p className="text-2xl font-bold text-blue-400">
                    {businessSystem.features.length}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-gray-400 text-sm mb-2">Rapports</h3>
                  <p className="text-2xl font-bold text-purple-400">
                    {businessSystem.reports.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Fonctionnalités disponibles */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Fonctionnalités disponibles</h2>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businessSystem.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rapports disponibles */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Rapports disponibles</h2>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {businessSystem.reports.map((report, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-300">{report}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        renderManagementComponent()
      )}
    </div>
  )
}
