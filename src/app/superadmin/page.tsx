'use client'

import { useState, useMemo } from 'react'
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
  Crown,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Search,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Server,
  FileText,
  LogOut
} from 'lucide-react'
import useSuperAdmin from '@/hooks/useSuperAdmin'
import useSystemMetrics from '@/hooks/useSystemMetrics'
import { AuditLog } from '@/types'
import CreateTenantModal from '@/components/SuperAdmin/CreateTenantModal'
import GlobalReports from '@/components/SuperAdmin/GlobalReports'
import SystemConfig from '@/components/SuperAdmin/SystemConfig'
import TenantManager from '@/components/SuperAdmin/TenantManager'
import SubscriptionManagement from '@/app/superadmin/subscriptions/page'
import { NotificationProvider } from '@/components/ui/Notification'
import SuperAdminGuard from '@/components/SuperAdmin/SuperAdminGuard'
import Logo from '@/components/Logo'
import CreatePlanModal from '@/components/SuperAdmin/CreatePlanModal'

// Cette page utilise son propre layout personnalisé pour le SuperAdmin

// Composant moderne pour les cartes de statistiques
function SuperAdminStatCard({ 
  title, 
  value, 
  change, 
  icon, 
  color,
  subtitle,
  trend,
  target
}: { 
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: string
  subtitle?: string
  trend?: 'up' | 'down' | 'stable'
  target?: string
}) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
  const changeColor = change !== undefined && change >= 0 ? 'text-green-400' : change !== undefined && change < 0 ? 'text-red-400' : 'text-gray-400'
  
  return (
    <div className={`${color} rounded-xl p-6 text-white shadow-xl backdrop-blur-md border border-white/10 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors duration-300" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm opacity-75 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              {icon}
            </div>
            {change !== undefined && (
              <div className={`flex items-center text-xs font-medium ${changeColor}`}>
                {change >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
        </div>
        {target && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between text-xs">
              <span className="opacity-75">Objectif</span>
              <span className="font-medium">{target}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour les alertes système
function SystemAlerts({ alerts }: { alerts: Array<{type: string, title: string, message: string, time: string}> }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'error': return <AlertTriangle className="h-4 w-4" />
      case 'success': return <CheckCircle className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'success': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Bell className="h-5 w-5 mr-2 text-orange-400" />
          Alertes système
        </h3>
        <span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
          {alerts.length} actives
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
            <div className="flex items-start space-x-3">
              <div className="mt-1">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm opacity-75 mt-1">{alert.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs opacity-60">{alert.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant pour les métriques de performance
function SystemMetrics({ metrics }: { metrics: {cpu: number, memory: number, storage: number, uptime: string} }) {
  const metricItems = [
    { 
      label: 'CPU', 
      value: `${metrics.cpu.toFixed(1)}%`, 
      icon: <Server className="h-4 w-4" />, 
      color: 'text-blue-400',
      status: metrics.cpu > 70 ? 'warning' : metrics.cpu > 50 ? 'normal' : 'good'
    },
    { 
      label: 'Mémoire', 
      value: `${metrics.memory.toFixed(1)}%`, 
      icon: <Database className="h-4 w-4" />, 
      color: 'text-green-400',
      status: metrics.memory > 80 ? 'warning' : metrics.memory > 60 ? 'normal' : 'good'
    },
    { 
      label: 'Stockage', 
      value: `${metrics.storage.toFixed(1)}%`, 
      icon: <FileText className="h-4 w-4" />, 
      color: 'text-orange-400',
      status: metrics.storage > 85 ? 'warning' : metrics.storage > 70 ? 'normal' : 'good'
    },
    { 
      label: 'Uptime', 
      value: metrics.uptime, 
      icon: <Clock className="h-4 w-4" />, 
      color: 'text-purple-400',
      status: 'good'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'warning': return 'bg-red-500/20 border-red-500/30'
      case 'normal': return 'bg-yellow-500/20 border-yellow-500/30'
      case 'good': return 'bg-green-500/20 border-green-500/30'
      default: return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'warning': return 'bg-red-500'
      case 'normal': return 'bg-yellow-500'
      case 'good': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Activity className="h-5 w-5 mr-2 text-orange-400" />
          Métriques système
        </h3>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>En temps réel</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {metricItems.map((item, index) => (
          <div key={index} className={`bg-white/5 backdrop-blur-sm rounded-lg p-4 border ${getStatusColor(item.status)} transition-all duration-300 hover:bg-white/10`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm font-medium">{item.label}</span>
              <div className={`flex items-center space-x-2`}>
                <div className={`w-2 h-2 rounded-full ${getStatusDot(item.status)}`}></div>
                <div className={item.color}>{item.icon}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </span>
            </div>
            {item.status === 'warning' && (
              <div className="mt-2 text-xs text-red-400">
                ⚠️ Attention
              </div>
            )}
            {item.status === 'normal' && (
              <div className="mt-2 text-xs text-yellow-400">
                ⚡ Surveillance
              </div>
            )}
            {item.status === 'good' && (
              <div className="mt-2 text-xs text-green-400">
                ✅ Normal
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SuperAdminPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tenants' | 'subscriptions' | 'reports' | 'settings'>('dashboard')
  
  const {
    currentUser,
    globalStats,
    auditLogs,
    loading,
    createTenant,
    refreshData
  } = useSuperAdmin()

  const { metrics, alerts, loading: metricsLoading, refreshMetrics } = useSystemMetrics()

  const createPlan = async (planData: any) => {
    try {
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(planData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Plan créé avec succès:', result)
        // Rafraîchir la liste des plans si nécessaire
      } else {
        console.error('Erreur lors de la création du plan:', response.statusText)
      }
    } catch (error) {
      console.error('Erreur createPlan:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/auth/login'
  }

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
    { id: 'subscriptions', label: 'Abonnements', icon: Crown },
    { id: 'reports', label: 'Rapports', icon: Database },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ]

  return (
    <SuperAdminGuard>
      <NotificationProvider>
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800/90 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 shrink-0 fixed left-0 top-0 h-full z-10`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
                  <Logo size="md" showText={sidebarOpen} />
                </div>
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
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
                      onClick={() => setActiveTab(item.id as any)}
                      className={`w-full flex items-center ${!sidebarOpen ? 'justify-center' : ''} space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        activeTab === item.id
                          ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                          : 'text-gray-400 hover:bg-slate-700/50 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-slate-700/50">
              <div className={`flex items-center ${!sidebarOpen ? 'justify-center' : ''} space-x-3`}>
                <div className="w-10 h-10 bg-linear-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {currentUser?.name?.charAt(0).toUpperCase() || 'S'}
                  </span>
                </div>
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                      {currentUser?.name || 'SuperAdmin'}
                    </p>
                    <p className="text-gray-400 text-xs">Administrateur</p>
                  </div>
                )}
              </div>
              
              {/* Logout Button */}
              <div className="p-4 border-t border-slate-700/50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-colors"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
          <main className="flex-1 p-6 pt-8 overflow-y-auto">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                {/* Header moderne */}
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-linear-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-white">Tableau de bord SuperAdmin</h1>
                        <p className="text-gray-400 text-xs">Vue d'ensemble du système</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => {
                          refreshData()
                          refreshMetrics()
                        }}
                        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="text-sm">Actualiser</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10">
                        <Download className="h-4 w-4" />
                        <span className="text-sm">Exporter</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Grid moderne */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <SuperAdminStatCard
                    title="Tenants actifs"
                    value={globalStats?.activeTenants || 0}
                    change={globalStats?.newTenantsThisMonth ? (globalStats.newTenantsThisMonth / (globalStats.activeTenants - globalStats.newTenantsThisMonth)) * 100 : 0}
                    icon={<Building2 className="h-6 w-6" />}
                    color="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"
                    subtitle={`+${globalStats?.newTenantsThisMonth || 0} ce mois`}
                    trend="up"
                    target="50 tenants"
                  />
                  
                  <SuperAdminStatCard
                    title="Utilisateurs totaux"
                    value={globalStats?.totalUsers || 0}
                    change={globalStats?.growthRate || 0}
                    icon={<Users className="h-6 w-6" />}
                    color="bg-gradient-to-br from-green-500 via-green-600 to-emerald-700"
                    subtitle="Actifs"
                    trend="up"
                    target="1000 utilisateurs"
                  />
                  
                  <SuperAdminStatCard
                    title="Revenus mensuels"
                    value={`${((globalStats?.monthSales || 0) / 1000).toFixed(1)}k XAF`}
                    change={globalStats?.todaySales && globalStats?.monthSales ? ((globalStats.todaySales / globalStats.monthSales) * 100) : 0}
                    icon={<DollarSign className="h-6 w-6" />}
                    color="bg-gradient-to-br from-orange-500 via-orange-600 to-red-700"
                    subtitle="MRR"
                    trend="up"
                    target="5M XAF"
                  />
                  
                  <SuperAdminStatCard
                    title="Taux de croissance"
                    value={`${(globalStats?.growthRate || 0).toFixed(1)}%`}
                    change={globalStats?.growthRate || 0}
                    icon={<Activity className="h-6 w-6" />}
                    color="bg-gradient-to-br from-purple-500 via-purple-600 to-pink-700"
                    subtitle="Mensuel"
                    trend="up"
                    target="20%"
                  />
                </div>

                {/* Section métriques et alertes */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {metricsLoading ? (
                      <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
                          <span className="text-gray-400">Chargement des métriques système...</span>
                        </div>
                      </div>
                    ) : (
                      <SystemMetrics metrics={{
                        cpu: metrics.cpu,
                        memory: metrics.memory,
                        storage: metrics.storage,
                        uptime: metrics.uptime
                      }} />
                    )}
                  </div>
                  <div>
                    {metricsLoading ? (
                      <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mr-3"></div>
                          <span className="text-gray-400">Chargement des alertes...</span>
                        </div>
                      </div>
                    ) : (
                      <SystemAlerts alerts={alerts} />
                    )}
                  </div>
                </div>

                {/* Activité récente améliorée */}
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-orange-400" />
                      Activité récente
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <Filter className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {auditLogs && auditLogs.length > 0 ? (
                    <div className="space-y-3">
                      {auditLogs.slice(0, 8).map((log: AuditLog, index: number) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full ${
                              log.action === 'create' ? 'bg-green-500' :
                              log.action === 'suspend' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <div>
                              <p className="text-white font-medium">
                                {log.action} - {log.entity}
                              </p>
                              <p className="text-gray-400 text-sm">par {log.userName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-gray-400 text-sm">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(log.timestamp).toLocaleDateString('fr-GA', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-400 font-medium text-lg">Aucune activité récente</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Les activités système apparaîtront ici dès que des utilisateurs commenceront à utiliser la plateforme
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tenants' && (
              <TenantManager />
            )}

            {activeTab === 'subscriptions' && (
              <SubscriptionManagement />
            )}

            {activeTab === 'reports' && (
              <GlobalReports 
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
          
          {/* Modal de création de tenant */}
          <CreateTenantModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={createTenant}
          />
          
          {/* Modal de création de plan */}
          <CreatePlanModal
            isOpen={showCreatePlanModal}
            onClose={() => setShowCreatePlanModal(false)}
            onSubmit={createPlan}
          />
        </div>
      </div>
    </NotificationProvider>
    </SuperAdminGuard>
  )
}
