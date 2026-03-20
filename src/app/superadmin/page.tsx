'use client'

import { useState } from 'react'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Settings, 
  Shield, 
  Database,
  Activity,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Pause,
  Play
} from 'lucide-react'
import useSuperAdmin from '@/hooks/useSuperAdmin'
import CreateTenantModal from '@/components/SuperAdmin/CreateTenantModal'
import UsersManagement from '@/components/SuperAdmin/UsersManagement'
import GlobalReports from '@/components/SuperAdmin/GlobalReports'
import SystemConfig from '@/components/SuperAdmin/SystemConfig'
import TenantManager from '@/components/SuperAdmin/TenantManager'

interface GlobalStats {
  totalTenants: number
  activeTenants: number
  totalUsers: number
  totalSales: number
  todaySales: number
  monthSales: number
  newTenantsThisMonth: number
  monthlyRevenue?: number
  activityRate?: number
}

const handleUserAction = (action: string, userId: string, data?: unknown) => {
    console.log('User action:', action, userId, data)
  }

export default function SuperAdminPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const {
    currentUser,
    tenants,
    globalStats,
    loading,
    createTenant,
    updateTenant,
    suspendTenant,
    deleteTenant,
    getTenantsByStatus,
    getTenantsByBusinessType
  } = useSuperAdmin()

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tenants' | 'users' | 'reports' | 'settings'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'inactive'>('all')
  const [filterBusinessType, setFilterBusinessType] = useState('all')

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Chargement du panneau SuperAdmin...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
    { id: 'tenants', label: 'Tenants', icon: Building2 },
    { id: 'users', label: 'Gestion des utilisateurs et permissions', icon: Users },
    { id: 'reports', label: 'Rapports', icon: Database },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Shield className="h-8 w-8 mr-3 text-orange-400" />
              Panneau SuperAdmin
            </h1>
            <p className="text-gray-400 mt-2">
              Gestion globale de la plateforme SmartManager
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-white font-medium">{currentUser?.name}</p>
              <p className="text-gray-400 text-sm">SuperAdmin</p>
            </div>
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'dashboard' | 'tenants' | 'users' | 'reports' | 'settings')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Tenants actifs</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {globalStats?.activeTenants || 0}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Utilisateurs totaux</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {globalStats?.totalUsers || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Revenus mensuels</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {(globalStats?.monthlyRevenue || 0).toLocaleString('fr-GA')} XAF
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-400" />
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Taux d'activité</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {globalStats?.activityRate || 0}%
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Activité récente</h3>
              <div className="space-y-3">
                {[
                  { action: 'Nouveau tenant créé', tenant: 'Restaurant Le Gourmet', time: 'Il y a 2 heures' },
                  { action: 'Tenant suspendu', tenant: 'Supermarché EcoPlus', time: 'Il y a 5 heures' },
                  { action: 'Mise à jour système', tenant: 'Version 1.0.1', time: 'Il y a 1 jour' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-sm">{activity.tenant}</p>
                    </div>
                    <span className="text-gray-400 text-sm">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tenants' && (
          <TenantManager />
        )}

        {activeTab === 'users' && (
          <UsersManagement 
            tenants={tenants}
            onUserAction={handleUserAction}
          />
        )}

        {activeTab === 'reports' && (
          <GlobalReports 
            tenants={tenants}
            globalStats={globalStats}
          />
        )}

        {activeTab === 'settings' && (
          <SystemConfig 
            onSave={(config) => {
              console.log('Configuration système sauvegardée:', config)
              // Ici vous pouvez implémenter la sauvegarde des paramètres
            }}
          />
        )}
      </div>
      
      {/* Modal de création de boutique */}
      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createTenant}
      />
    </div>
  )
}
