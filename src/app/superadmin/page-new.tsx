'use client'

import { useState } from 'react'
import { 
  Building2, 
  Users, 
  DollarSign, 
  Settings, 
  Database,
  Activity,
  Menu,
  X,
  BarChart3,
  Crown
} from 'lucide-react'
import useSuperAdmin from '@/hooks/useSuperAdmin'
import { AuditLog } from '@/types'
import CreateTenantModal from '@/components/SuperAdmin/CreateTenantModal'
import GlobalReports from '@/components/SuperAdmin/GlobalReports'
import SystemConfig from '@/components/SuperAdmin/SystemConfig'
import TenantManager from '@/components/SuperAdmin/TenantManager'
import SubscriptionManagement from '@/app/superadmin/subscriptions/page'
import { NotificationProvider } from '@/components/ui/Notification'
import SuperAdminGuard from '@/components/SuperAdmin/SuperAdminGuard'
import Logo from '@/components/Logo'

interface SidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  component: React.ReactNode
}

export default function SuperAdminPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tenants' | 'reports' | 'settings' | 'subscriptions'>('dashboard')
  
  const {
    currentUser,
    globalStats,
    auditLogs,
    loading,
    createTenant,
    deleteTenant,
    toggleTenantStatus
  } = useSuperAdmin()

  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <BarChart3 className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Tenants actifs</p>
                  <p className="text-3xl font-bold">{globalStats?.activeTenants || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-linear-to-br from-green-600 to-green-700 rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Utilisateurs totaux</p>
                  <p className="text-3xl font-bold">{globalStats?.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-green-200" />
              </div>
            </div>
            <div className="bg-linear-to-br from-orange-600 to-orange-700 rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Revenus mensuels</p>
                  <p className="text-3xl font-bold">{globalStats?.monthSales?.toLocaleString() || 0} XAF</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-200" />
              </div>
            </div>
            <div className="bg-linear-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Taux de croissance</p>
                  <p className="text-3xl font-bold">{globalStats?.growthRate || 0}%</p>
                </div>
                <Activity className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-400" />
              Activité récente
            </h3>
            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-white font-medium">{log.action}</p>
                      <p className="text-gray-400 text-sm">{log.userName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'tenants',
      label: 'Tenants',
      icon: <Building2 className="w-5 h-5" />,
      component: <TenantManager />
    },
    {
      id: 'subscriptions',
      label: 'Abonnements',
      icon: <Crown className="w-5 h-5" />,
      component: <SubscriptionManagement />
    },
    {
      id: 'reports',
      label: 'Rapports',
      icon: <Database className="w-5 h-5" />,
      component: <GlobalReports globalStats={globalStats} />
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-5 h-5" />,
      component: <SystemConfig onSave={(config) => console.log('System config saved:', config)} />
    }
  ]

  const activeComponent = sidebarItems.find(item => item.id === activeTab)?.component

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <SuperAdminGuard>
      <NotificationProvider>
      <div className="min-h-screen bg-slate-900 flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 shrink-0`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Logo size="md" showText={false} />
                  {sidebarOpen && (
                    <div className="ml-3">
                      <h2 className="text-white font-bold">SuperAdmin</h2>
                      <p className="text-gray-400 text-sm">SmartManager Pro</p>
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
            <div className="flex-1 overflow-y-auto py-6">
              <nav className="space-y-2 px-4">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as 'dashboard' | 'tenants' | 'reports' | 'settings' | 'subscriptions')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
                      activeTab === item.id
                        ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 border border-orange-400/20'
                        : 'text-gray-300 hover:bg-white/10 hover:text-orange-400 border border-transparent'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-slate-900 overflow-auto">
          <div className="p-6">
            {activeComponent}
          </div>
        </main>
      </div>

      {/* Create Tenant Modal */}
      {showCreateModal && (
        <CreateTenantModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (data) => {
            // Handle tenant creation
            console.log('Creating tenant:', data)
            setShowCreateModal(false)
          }}
        />
      )}
    </NotificationProvider>
    </SuperAdminGuard>
  )
}
