'use client'

import { useState } from 'react'
import { 
  Building2, 
  Users, 
  DollarSign, 
  Settings, 
  Shield, 
  Database,
  Activity,
  Plus,
  Search,
  Menu,
  X,
  BarChart3,
  UserCheck
} from 'lucide-react'
import useSuperAdmin from '@/hooks/useSuperAdmin'
import { AuditLog } from '@/types'
import CreateTenantModal from '@/components/SuperAdmin/CreateTenantModal'
import UsersManagement from '@/components/SuperAdmin/UsersManagement'
import GlobalReports from '@/components/SuperAdmin/GlobalReports'
import SystemConfig from '@/components/SuperAdmin/SystemConfig'
import TenantManager from '@/components/SuperAdmin/TenantManager'

const handleUserAction = (action: string, userId: string, data?: unknown) => {
  console.log('User action:', action, userId, data)
}

export default function SuperAdminPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  const {
    currentUser,
    tenants,
    globalStats,
    auditLogs,
    loading,
    createTenant
  } = useSuperAdmin()

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tenants' | 'users' | 'reports' | 'settings'>('dashboard')
  const [searchTerm, setSearchTerm] = useState('')

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white">Chargement du panneau SuperAdmin...</p>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'tenants', label: 'Tenants', icon: Building2 },
    { id: 'users', label: 'Utilisateurs', icon: UserCheck },
    { id: 'reports', label: 'Rapports', icon: Database },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 shrink-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
                <Shield className="h-8 w-8 text-orange-400" />
                {sidebarOpen && (
                  <div className="ml-3">
                    <h2 className="text-white font-bold">SuperAdmin</h2>
                    <p className="text-gray-400 text-xs">SmartManager</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as 'dashboard' | 'tenants' | 'users' | 'reports' | 'settings')}
                    className={`w-full flex items-center ${!sidebarOpen ? 'justify-center' : ''} space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-slate-700">
            <div className={`flex items-center ${!sidebarOpen ? 'justify-center' : ''} space-x-3`}>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {currentUser?.name || 'SuperAdmin'}
                  </p>
                  <p className="text-gray-400 text-xs">SuperAdmin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {sidebarItems.find(item => item.id === activeTab)?.label}
              </h1>
              <p className="text-gray-400 mt-1">
                Gestion globale de la plateforme SmartManager
              </p>
            </div>
            
            {/* Actions Bar */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              {activeTab === 'tenants' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nouveau Tenant</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
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

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
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

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Revenus mensuels</p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {(globalStats?.monthSales || 0).toLocaleString('fr-GA')} XAF
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-orange-400" />
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Taux de croissance</p>
                      <p className="text-2xl font-bold text-white mt-2">
                        {(globalStats?.growthRate || 0).toFixed(1)}%
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Activité récente</h3>
                <div className="space-y-3">
                  {auditLogs && auditLogs.length > 0 ? (
                    auditLogs.slice(0, 5).map((log: AuditLog, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            log.action === 'create' ? 'bg-green-500' :
                            log.action === 'suspend' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`} />
                          <div>
                            <p className="text-white font-medium">{log.description || log.action}</p>
                            <p className="text-gray-400 text-sm">{log.targetName || log.targetId}</p>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(log.timestamp).toLocaleDateString('fr-GA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Aucune activité récente</p>
                    </div>
                  )}
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
              }}
            />
          )}
        </main>
      </div>
      
      {/* Modal de création de tenant */}
      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createTenant}
      />
    </div>
  )
}
