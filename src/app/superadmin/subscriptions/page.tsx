'use client'

import { useState, useEffect } from 'react'
import { Crown, TrendingUp, Users, Calendar, CheckCircle, AlertTriangle, Eye, Edit, Trash2, Power, Star, Zap, CreditCard, Building2 } from 'lucide-react'
import CreatePlanModal from '@/components/SuperAdmin/CreatePlanModal'
import { useToastNotification, ToastNotification } from '@/components/ui/ToastNotification'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { TenantModal } from '@/components/SuperAdmin/TenantModal'
import { usePlans } from '@/hooks/usePlans'

interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  businessType: string
  status: 'active' | 'inactive' | 'suspended'
  subscriptionPlan: 'free' | 'trial' | 'premium' | 'enterprise'
  trialEndDate?: string
  users: number
  createdAt: string
  lastLogin?: string
  features?: {
    allowsDebt: boolean
    allowsDelivery: boolean
    allowsTableService: boolean
    requiresTableNumber: boolean
    allowsFlashCustomers: boolean
    allowsTicketPrinting: boolean
  }
}

const PLAN_PRICES = {
  free: 0,
  trial: 0,
  premium: 25000,
  enterprise: 75000
}

const PLAN_COLORS = {
  free: 'bg-gray-500/20 text-gray-400',
  trial: 'bg-green-500/20 text-green-400',
  premium: 'bg-purple-500/20 text-purple-400',
  enterprise: 'bg-blue-500/20 text-blue-400'
}

const PLAN_LABELS = {
  free: 'Gratuit',
  trial: 'Essai',
  premium: 'Premium',
  enterprise: 'Enterprise'
}

interface CustomPlan {
  id: string
  name: string
  price: number
  features: string[]
  duration: string
  isActive: boolean
}

export default function SubscriptionManagement() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([
    {
      id: 'basic',
      name: 'Basic',
      price: 15000,
      features: ['Gestion des ventes', 'Stock de base', 'Rapports simples'],
      duration: 'mois',
      isActive: true
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 35000,
      features: ['Gestion des ventes', 'Stock avancé', 'Rapports détaillés', 'Multi-utilisateurs'],
      duration: 'mois',
      isActive: true
    }
  ])
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<CustomPlan | null>(null)
  
  // Fonction pour créer un plan
  const handleCreatePlan = async (planData: any) => {
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
        success('Succès', 'Plan créé avec succès')
        refetchPlans() // Rafraîchir la liste des plans
      } else {
        console.error('Erreur lors de la création du plan:', response.statusText)
        showError('Erreur', 'Erreur lors de la création du plan')
      }
    } catch (error) {
      console.error('Erreur handleCreatePlan:', error)
      showError('Erreur', 'Erreur lors de la création du plan')
    }
  }
  
  // États pour les modales et notifications
  const toastNotification = useToastNotification()
  const { success, notifications, removeNotification } = toastNotification
  const showError = toastNotification.error
  const { plans, loading: plansLoading, refetch: refetchPlans } = usePlans()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {})
  const [confirmMessage, setConfirmMessage] = useState('')
  const [confirmTitle, setConfirmTitle] = useState('')
  
  // États pour la modal tenant
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false)
  const [tenantModalMode, setTenantModalMode] = useState<'view' | 'edit'>('view')

  useEffect(() => {
    loadTenants()
  }, [])

  const loadTenants = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          const transformedTenants = data.data.map((tenant: any) => {
            let features = tenant.features ? JSON.parse(tenant.features) : {}
            
            // Si pas de fonctionnalités définies, utiliser les fonctionnalités par défaut selon le type d'activité
            if (!features || Object.keys(features).length === 0) {
              features = getDefaultFeatures(tenant.businessType)
            }
            
            return {
              ...tenant,
              features,
              subscriptionPlan: features.subscriptionPlan || tenant.subscriptionPlan || 'free'
            }
          })
          setTenants(transformedTenants)
        }
      }
    } catch (error) {
      console.error('Erreur chargement tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDefaultFeatures = (businessType: string) => {
    const defaultFeatures = {
      retail: {
        allowsDebt: false,
        allowsDelivery: true,
        allowsTableService: false,
        requiresTableNumber: false,
        allowsFlashCustomers: true,
        allowsTicketPrinting: true,
        subscriptionPlan: 'free'
      },
      restaurant: {
        allowsDebt: true,
        allowsDelivery: true,
        allowsTableService: true,
        requiresTableNumber: true,
        allowsFlashCustomers: true,
        allowsTicketPrinting: true,
        subscriptionPlan: 'free'
      },
      bar: {
        allowsDebt: true,
        allowsDelivery: false,
        allowsTableService: true,
        requiresTableNumber: false,
        allowsFlashCustomers: true,
        allowsTicketPrinting: true,
        subscriptionPlan: 'free'
      },
      pharmacy: {
        allowsDebt: false,
        allowsDelivery: true,
        allowsTableService: false,
        requiresTableNumber: false,
        allowsFlashCustomers: false,
        allowsTicketPrinting: true,
        subscriptionPlan: 'free'
      },
      supermarket: {
        allowsDebt: true,
        allowsDelivery: true,
        allowsTableService: false,
        requiresTableNumber: false,
        allowsFlashCustomers: true,
        allowsTicketPrinting: true,
        subscriptionPlan: 'free'
      }
    }
    
    return defaultFeatures[businessType as keyof typeof defaultFeatures] || defaultFeatures.retail
  }

  const handlePlanChange = async (tenantId: string, newPlan: string) => {
    setConfirmTitle('Changer de plan d\'abonnement')
    setConfirmMessage(`Changer le plan du tenant vers ${newPlan} ?`)
    setConfirmAction(async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/tenants/upgrade', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ tenantId, newPlan })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setTenants(prev => prev.map(t => 
              t.id === tenantId 
                ? { ...t, subscriptionPlan: newPlan as Tenant['subscriptionPlan'] }
                : t
            ))
            success('Plan mis à jour', 'Le plan d\'abonnement a été mis à jour avec succès')
          } else {
            showError('Erreur', 'Erreur: ' + (result.error || 'Erreur inconnue'))
          }
        } else {
          showError('Erreur', 'Erreur lors de la mise à jour')
        }
      } catch (error) {
        console.error('Erreur mise à jour plan:', error)
        showError('Erreur', 'Une erreur est survenue')
      }
    })
    setIsConfirmModalOpen(true)
  }

  const getPlanPrice = (plan: string): number => {
    if (PLAN_PRICES[plan as keyof typeof PLAN_PRICES] !== undefined) {
      return PLAN_PRICES[plan as keyof typeof PLAN_PRICES]
    }
    const customPlan = customPlans.find(p => p.id === plan)
    return customPlan?.price || 0
  }

  const getPlanLabel = (plan: string): string => {
    if (PLAN_LABELS[plan as keyof typeof PLAN_LABELS]) {
      return PLAN_LABELS[plan as keyof typeof PLAN_LABELS]
    }
    const customPlan = customPlans.find(p => p.id === plan)
    return customPlan?.name || plan
  }

  const getPlanColor = (plan: string): string => {
    if (PLAN_COLORS[plan as keyof typeof PLAN_COLORS]) {
      return PLAN_COLORS[plan as keyof typeof PLAN_COLORS]
    }
    return 'bg-indigo-500/20 text-indigo-400'
  }

  const handleSaveCustomPlan = (plan: CustomPlan) => {
    if (editingPlan) {
      setCustomPlans(prev => prev.map(p => p.id === plan.id ? plan : p))
    } else {
      setCustomPlans(prev => [...prev, { ...plan, id: Date.now().toString() }])
    }
    setShowPlanModal(false)
    setEditingPlan(null)
  }

  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setTenantModalMode('view')
    setIsTenantModalOpen(true)
  }

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant)
    setTenantModalMode('edit')
    setIsTenantModalOpen(true)
  }

  const handleDeleteTenant = async (tenantId: string) => {
    setConfirmTitle('Supprimer le tenant')
    setConfirmMessage('Êtes-vous sûr de vouloir supprimer ce tenant ?')
    setConfirmAction(async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/tenants/${tenantId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          setTenants(prev => prev.filter(t => t.id !== tenantId))
          success('Suppression réussie', 'Le tenant a été supprimé avec succès')
        } else {
          showError('Erreur', 'Erreur lors de la suppression')
        }
      } catch (error) {
        console.error('Erreur suppression tenant:', error)
        showError('Erreur', 'Une erreur est survenue')
      }
    })
    setIsConfirmModalOpen(true)
  }

  const handleToggleStatus = async (tenantId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    setConfirmTitle(`${newStatus === 'active' ? 'Activer' : 'Suspendre'} le tenant`)
    setConfirmMessage(`${newStatus === 'active' ? 'Activer' : 'Suspendre'} ce tenant ?`)
    setConfirmAction(async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`/api/tenants/${tenantId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: newStatus })
        })

        if (response.ok) {
          setTenants(prev => prev.map(t => 
            t.id === tenantId ? { ...t, status: newStatus as Tenant['status'] } : t
          ))
          success('Statut modifié', `Tenant ${newStatus === 'active' ? 'activé' : 'suspendu'} avec succès`)
        } else {
          showError('Erreur', 'Erreur lors de la modification du statut')
        }
      } catch (error) {
        console.error('Erreur modification statut:', error)
        showError('Erreur', 'Une erreur est survenue')
      }
    })
    setIsConfirmModalOpen(true)
  }

  const getTrialDaysLeft = (trialEndDate?: string) => {
    if (!trialEndDate) return 0
    const now = new Date()
    const trialEnd = new Date(trialEndDate)
    return Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
  }

  const filteredTenants = tenants.filter(tenant => 
    filterPlan === 'all' || tenant.subscriptionPlan === filterPlan
  )

  const getStats = () => {
    const stats = tenants.reduce((acc, tenant) => {
      acc[tenant.subscriptionPlan] = (acc[tenant.subscriptionPlan] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const monthlyRevenue = tenants.reduce((total, tenant) => {
      const price = getPlanPrice(tenant.subscriptionPlan)
      return total + price
    }, 0)

    return {
      total: tenants.length,
      free: stats.free || 0,
      trial: stats.trial || 0,
      premium: stats.premium || 0,
      enterprise: stats.enterprise || 0,
      monthlyRevenue
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-400">Chargement des abonnements...</span>
      </div>
    )
  }

  return (
    <>
    {/* Toast Notifications */}
    <ToastNotification notifications={notifications} onRemove={removeNotification} />
    
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Abonnements</h1>
          <p className="text-gray-400 mt-1">
            {stats.total} tenant(s) • Revenu mensuel: {stats.monthlyRevenue.toLocaleString('fr-GA')} XAF
          </p>
        </div>
        <button
          onClick={() => setShowPlanModal(true)}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Créer un plan</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Essais</p>
              <p className="text-2xl font-bold text-green-400">{stats.trial}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Premium</p>
              <p className="text-2xl font-bold text-purple-400">{stats.premium}</p>
            </div>
            <Crown className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Revenu/Mois</p>
              <p className="text-2xl font-bold text-orange-400">{stats.monthlyRevenue.toLocaleString('fr-GA')}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Plans Created */}
      {plans.length > 0 && (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Crown className="w-5 h-5 text-orange-400" />
            <span>Plans Créés</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-orange-500/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                  <div className={`w-3 h-3 rounded-full ${plan.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                </div>
                <div className="text-2xl font-bold text-orange-400 mb-2">
                  {plan.price.toLocaleString('fr-GA')} XAF
                  <span className="text-sm text-gray-400">/{plan.duration === 'monthly' ? 'mois' : 'an'}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400 mb-2">Fonctionnalités:</p>
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs text-gray-300">
                      <Check className="w-3 h-3 text-green-400" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Tous les plans</option>
          <option value="free">Gratuit</option>
          <option value="trial">Essai</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Enterprise</option>
          {customPlans.map(plan => (
            <option key={plan.id} value={plan.id}>{plan.name}</option>
          ))}
        </select>
      </div>

      {/* Tenants List */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Plan Actuel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Essai</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilisateurs</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fonctionnalités</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Revenu Mensuel</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTenants.map((tenant) => {
                const trialDaysLeft = getTrialDaysLeft(tenant.trialEndDate)
                const monthlyRevenue = getPlanPrice(tenant.subscriptionPlan)
                const planLabel = getPlanLabel(tenant.subscriptionPlan)
                const planColor = getPlanColor(tenant.subscriptionPlan)
                
                return (
                  <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">{tenant.name}</div>
                        <div className="text-sm text-gray-400">{tenant.email}</div>
                        <div className="text-xs text-gray-500">{tenant.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planColor}`}>
                          {planLabel}
                        </span>
                        {monthlyRevenue > 0 && (
                          <span className="text-xs text-gray-400">
                            ({monthlyRevenue.toLocaleString('fr-GA')} XAF/mois)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {tenant.subscriptionPlan === 'trial' && trialDaysLeft > 0 ? (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm">{trialDaysLeft} jours</span>
                        </div>
                      ) : tenant.subscriptionPlan === 'trial' ? (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">Expiré</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">Actif</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        {tenant.users}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tenant.features && Object.entries(tenant.features)
                          .filter(([key, value]) => key !== 'subscriptionPlan' && value === true)
                          .map(([key]) => {
                            const featureLabels = {
                              allowsDebt: 'Dettes',
                              allowsDelivery: 'Livraison',
                              allowsTableService: 'Tables',
                              requiresTableNumber: 'N° Tables',
                              allowsFlashCustomers: 'Flash',
                              allowsTicketPrinting: 'Tickets'
                            }
                            const featureColors = {
                              allowsDebt: 'bg-purple-500/20 text-purple-400',
                              allowsDelivery: 'bg-blue-500/20 text-blue-400',
                              allowsTableService: 'bg-orange-500/20 text-orange-400',
                              requiresTableNumber: 'bg-amber-500/20 text-amber-400',
                              allowsFlashCustomers: 'bg-yellow-500/20 text-yellow-400',
                              allowsTicketPrinting: 'bg-green-500/20 text-green-400'
                            }
                            return (
                              <span 
                                key={key}
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${featureColors[key as keyof typeof featureColors]}`}
                              >
                                {featureLabels[key as keyof typeof featureLabels]}
                              </span>
                            )
                          })}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-medium ${
                        monthlyRevenue === 0 ? 'text-gray-400' :
                        monthlyRevenue < 50000 ? 'text-purple-400' :
                        'text-blue-400'
                      }`}>
                        {monthlyRevenue === 0 ? 'Gratuit' : `${monthlyRevenue.toLocaleString('fr-GA')} XAF`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewTenant(tenant)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditTenant(tenant)}
                          className="p-1 text-green-400 hover:text-green-300 transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                          className={`p-1 transition-colors ${
                            tenant.status === 'active' 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-green-400 hover:text-green-300'
                          }`}
                          title={tenant.status === 'active' ? 'Suspendre' : 'Activer'}
                        >
                          <Power className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    {/* Create Plan Modal */}
    <CreatePlanModal
      isOpen={showPlanModal}
      onClose={() => setShowPlanModal(false)}
      onSubmit={handleCreatePlan}
    />

    {/* Confirmation Modal */}
    <ConfirmModal
      isOpen={isConfirmModalOpen}
      onClose={() => setIsConfirmModalOpen(false)}
      onConfirm={confirmAction}
      title={confirmTitle}
      message={confirmMessage}
      confirmText="Confirmer"
      cancelText="Annuler"
      type="danger"
    />

    {/* Tenant Modal */}
    <TenantModal
      tenant={selectedTenant}
      isOpen={isTenantModalOpen}
      onClose={() => setIsTenantModalOpen(false)}
      mode={tenantModalMode}
    />
    </>
  )
}
