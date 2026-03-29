'use client'

import { useState, useEffect } from 'react'
import { 
  Edit2, 
  Trash2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Search,
  CreditCard,
  Truck,
  Table,
  Users2,
  Zap,
  Printer,
  Eye
} from 'lucide-react'
import { ToastNotification, useToastNotification } from '@/components/ui/ToastNotification'
import { TenantModal } from './TenantModal'
import ConfirmModal from '@/components/ui/ConfirmModal'

interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  address: string
  businessType: 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket' | 'hair_salon' | 'grocery' | 'bar_restaurant'
  currency: string
  status: 'active' | 'inactive' | 'suspended'
  subscriptionPlan: 'free' | 'trial' | 'premium' | 'enterprise'
  createdAt: string
  lastLogin?: string
  users: number
  features?: {
    allowsDebt: boolean
    allowsDelivery: boolean
    allowsTableService: boolean
    requiresTableNumber: boolean
    allowsFlashCustomers: boolean
    allowsTicketPrinting: boolean
  }
}

const businessTypeLabels = {
  retail: 'Vente de produits et services',
  restaurant: 'Restaurant',
  bar: 'Bar',
  pharmacy: 'Pharmacie',
  supermarket: 'Supermarché',
  hair_salon: 'Salon de coiffure',
  grocery: 'Épicerie',
  bar_restaurant: 'Bar/Restaurant'
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
    },
    hair_salon: {
      allowsDebt: false,
      allowsDelivery: false,
      allowsTableService: true,
      requiresTableNumber: true,
      allowsFlashCustomers: true,
      allowsTicketPrinting: true,
      subscriptionPlan: 'free'
    },
    grocery: {
      allowsDebt: false,
      allowsDelivery: true,
      allowsTableService: false,
      requiresTableNumber: false,
      allowsFlashCustomers: true,
      allowsTicketPrinting: true,
      subscriptionPlan: 'free'
    },
    bar_restaurant: {
      allowsDebt: true,
      allowsDelivery: true,
      allowsTableService: true,
      requiresTableNumber: true,
      allowsFlashCustomers: true,
      allowsTicketPrinting: true,
      subscriptionPlan: 'free'
    }
  }
  
  return defaultFeatures[businessType as keyof typeof defaultFeatures] || defaultFeatures.retail
}

export default function TenantManager({ tenants: tenantsFromProps }: { tenants?: Tenant[] } = {}) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [filterBusinessType, setFilterBusinessType] = useState<'all' | Tenant['businessType']>('all')
  const { notifications, success, error: showError, warning, info, removeNotification } = useToastNotification()
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null)

  const loadTenants = async () => {
    try {
      // Temporairement sans authentification pour tester
      const response = await fetch('/api/tenants', {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Données reçues:', data)
        if (data.success && data.data) {
          const transformedTenants: Tenant[] = data.data.map((tenant: {
            id: string;
            name: string;
            email: string;
            phone?: string;
            address?: string;
            businessType: string;
            currency: string;
            status: string;
            subscriptionPlan?: string;
            createdAt: string;
            lastLogin?: string;
            features?: string;
            _count: {
              users: number;
            };
          }) => {
            let features = tenant.features ? JSON.parse(tenant.features) : {}
            
            // Si pas de fonctionnalités définies, utiliser les fonctionnalités par défaut selon le type d'activité
            if (!features || Object.keys(features).length === 0) {
              features = getDefaultFeatures(tenant.businessType)
            }
            
            return {
              id: tenant.id,
              name: tenant.name,
              email: tenant.email,
              phone: tenant.phone || '',
              address: tenant.address || '',
              businessType: tenant.businessType as Tenant['businessType'],
              currency: tenant.currency,
              status: tenant.status as Tenant['status'],
              subscriptionPlan: (tenant.subscriptionPlan as Tenant['subscriptionPlan']) || 'trial',
              createdAt: tenant.createdAt,
              lastLogin: tenant.lastLogin,
              users: tenant._count.users,
              features
            }
          })
          setTenants(transformedTenants)
          console.log('Tenants transformés:', transformedTenants)
        }
      } else {
        console.error('Erreur API:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erreur loadTenants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTenants()
  }, [])

  const handleDelete = async (id: string) => {
    setTenantToDelete(id)
    setIsConfirmModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!tenantToDelete) return
    
    try {
      const response = await fetch(`/api/tenants/${tenantToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setTenants(prev => prev.filter(t => t.id !== tenantToDelete))
        success('Suppression réussie', 'Le tenant a été supprimé avec succès')
      } else {
        showError('Erreur de suppression', 'Impossible de supprimer le tenant')
      }
    } catch (error) {
      console.error('❌ Erreur suppression tenant:', error)
      showError('Erreur', 'Une erreur est survenue lors de la suppression')
    } finally {
      setIsConfirmModalOpen(false)
      setTenantToDelete(null)
    }
  }

  const handleAction = async (action: string, tenant: Tenant) => {
    switch (action) {
      case 'view':
        setSelectedTenant(tenant)
        setModalMode('view')
        setIsModalOpen(true)
        break
      case 'edit':
        setSelectedTenant(tenant)
        setModalMode('edit')
        setIsModalOpen(true)
        break
      case 'toggleStatus':
        await handleStatusChange(tenant.id, tenant.status === 'active' ? 'suspended' : 'active')
        break
      case 'delete':
        await handleDelete(tenant.id)
        break
    }
  }

  const handleStatusChange = async (id: string, status: Tenant['status']) => {
    try {
      const response = await fetch(`/api/tenants/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setTenants(prev => prev.map(t => t.id === id ? { ...t, status } : t))
        // Message de succès plus moderne
        const action = status === 'active' ? 'activé' : status === 'inactive' ? 'désactivé' : 'suspendu'
        success('Statut modifié', `Tenant ${action} avec succès`)
      } else {
        showError('Erreur', 'Impossible de modifier le statut du tenant')
      }
    } catch (error) {
      console.error('❌ Erreur modification statut tenant:', error)
      showError('Erreur', 'Une erreur est survenue lors de la modification du statut')
    }
  }

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus
    const matchesBusinessType = filterBusinessType === 'all' || tenant.businessType === filterBusinessType
    return matchesSearch && matchesStatus && matchesBusinessType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-400">Chargement des tenants...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <ToastNotification notifications={notifications} onRemove={removeNotification} />
      
      {/* Tenant Modal */}
      <TenantModal
        tenant={selectedTenant}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Supprimer le tenant"
        message="Êtes-vous sûr de vouloir supprimer ce tenant ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gestion des Tenants</h1>
          <p className="text-gray-400 mt-1">
            {tenants.length} tenant(s) • {tenants.filter(t => t.status === 'active').length} actif(s)
          </p>
        </div>
        <div className="text-sm text-orange-400">
          Validation des abonnements
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive' | 'suspended')}
            className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="suspended">Suspendus</option>
          </select>
          <select
            value={filterBusinessType}
            onChange={(e) => setFilterBusinessType(e.target.value as 'all' | Tenant['businessType'])}
            className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tous les types</option>
            <option value="retail">Vente de produits et services</option>
            <option value="restaurant">Restaurant</option>
            <option value="bar">Bar</option>
            <option value="pharmacy">Pharmacie</option>
            <option value="supermarket">Supermarché</option>
          </select>
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Abonnement</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilisateurs</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fonctionnalités</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredTenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">{tenant.name}</div>
                      <div className="text-sm text-gray-400">{tenant.email}</div>
                      <div className="text-xs text-gray-500">{tenant.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                      {businessTypeLabels[tenant.businessType]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      {tenant.status === 'active' ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : tenant.status === 'suspended' ? (
                        <XCircle className="h-4 w-4 text-red-400" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      )}
                      <span className={`text-sm ${
                        tenant.status === 'active' ? 'text-green-400' :
                        tenant.status === 'suspended' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>
                        {tenant.status === 'active' ? 'Actif' :
                         tenant.status === 'suspended' ? 'Suspendu' : 'Inactif'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tenant.subscriptionPlan === 'trial' ? 'bg-green-500/20 text-green-400' :
                        tenant.subscriptionPlan === 'premium' ? 'bg-purple-500/20 text-purple-400' :
                        tenant.subscriptionPlan === 'enterprise' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {tenant.subscriptionPlan === 'trial' ? 'Essai' :
                         tenant.subscriptionPlan === 'premium' ? 'Premium' :
                         tenant.subscriptionPlan === 'enterprise' ? 'Enterprise' :
                         'Gratuit'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Users className="h-4 w-4 mr-1" />
                      {tenant.users}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {tenant.features?.allowsDebt && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                          Dettes
                        </span>
                      )}
                      {tenant.features?.allowsDelivery && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                          Livraison
                        </span>
                      )}
                      {tenant.features?.allowsTableService && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                          Tables
                        </span>
                      )}
                      {tenant.features?.requiresTableNumber && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                          N° Tables
                        </span>
                      )}
                      {tenant.features?.allowsFlashCustomers && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                          Flash
                        </span>
                      )}
                      {tenant.features?.allowsTicketPrinting && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                          Tickets
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {/* Actions buttons */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAction('view', tenant)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction('edit', tenant)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction('toggleStatus', tenant)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title={tenant.status === 'active' ? 'Suspendre' : 'Activer'}
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleAction('delete', tenant)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
