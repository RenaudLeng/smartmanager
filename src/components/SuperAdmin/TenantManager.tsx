'use client'

import { useState, useEffect } from 'react'
import { 
  Store, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Users,
  Save,
  X,
  Search
} from 'lucide-react'

interface Tenant {
  id: string
  name: string
  email: string
  phone: string
  address: string
  businessType: 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket' | 'hair_salon' | 'grocery' | 'bar_restaurant'
  currency: string
  status: 'active' | 'inactive' | 'suspended'
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

interface TenantFormData {
  name: string
  email: string
  phone: string
  address: string
  businessType: Tenant['businessType']
  currency: string
  features: Tenant['features']
}

const businessTypeLabels = {
  retail: 'Boutique',
  restaurant: 'Restaurant',
  bar: 'Bar',
  pharmacy: 'Pharmacie',
  supermarket: 'Supermarché',
  hair_salon: 'Salon de coiffure',
  grocery: 'Épicerie',
  bar_restaurant: 'Bar/Restaurant'
}

const businessTypeFeatures = {
  retail: {
    allowsDebt: false,
    allowsDelivery: false,
    allowsTableService: false,
    requiresTableNumber: false,
    allowsFlashCustomers: false,
    allowsTicketPrinting: true
  },
  restaurant: {
    allowsDebt: true,
    allowsDelivery: true,
    allowsTableService: true,
    requiresTableNumber: true,
    allowsFlashCustomers: true,
    allowsTicketPrinting: true
  },
  bar: {
    allowsDebt: true,
    allowsDelivery: false,
    allowsTableService: false,
    requiresTableNumber: false,
    allowsFlashCustomers: true,
    allowsTicketPrinting: true
  },
  pharmacy: {
    allowsDebt: false,
    allowsDelivery: true,
    allowsTableService: false,
    requiresTableNumber: false,
    allowsFlashCustomers: false,
    allowsTicketPrinting: true
  },
  supermarket: {
    allowsDebt: false,
    allowsDelivery: true,
    allowsTableService: false,
    requiresTableNumber: false,
    allowsFlashCustomers: false,
    allowsTicketPrinting: true
  },
  hair_salon: {
    allowsDebt: true,
    allowsDelivery: false,
    allowsTableService: false,
    requiresTableNumber: false,
    allowsFlashCustomers: true,
    allowsTicketPrinting: true
  },
  grocery: {
    allowsDebt: false,
    allowsDelivery: false,
    allowsTableService: false,
    requiresTableNumber: false,
    allowsFlashCustomers: false,
    allowsTicketPrinting: true
  },
  bar_restaurant: {
    allowsDebt: true,
    allowsDelivery: true,
    allowsTableService: true,
    requiresTableNumber: true,
    allowsFlashCustomers: true,
    allowsTicketPrinting: true
  }
}

export default function TenantManager() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all')
  const [filterBusinessType, setFilterBusinessType] = useState<'all' | Tenant['businessType']>('all')

  const [formData, setFormData] = useState<TenantFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessType: 'retail',
    currency: 'XAF',
    features: businessTypeFeatures.retail
  })

  // Charger les vrais tenants depuis l'API
  const loadTenants = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('Token non trouvé, utilisation des données locales')
        setLoading(false)
        return
      }

      const response = await fetch('/api/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          // Transformer les données de l'API pour correspondre à l'interface
          const transformedTenants = data.data.map((tenant: {
            id: string;
            name: string;
            email: string;
            phone?: string;
            address?: string;
            businessType: string;
            currency: string;
            status: string;
            createdAt: string;
            lastLogin?: string;
            _count: { users: number };
            features?: string;
          }) => ({
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone || '',
            address: tenant.address || '',
            businessType: tenant.businessType as Tenant['businessType'],
            currency: tenant.currency,
            status: tenant.status as Tenant['status'],
            createdAt: tenant.createdAt,
            lastLogin: tenant.lastLogin,
            users: tenant._count.users,
            features: tenant.features ? JSON.parse(tenant.features) : undefined
          }))
          setTenants(transformedTenants)
        }
      } else {
        console.warn('Erreur lors du chargement des tenants:', response.statusText)
      }
    } catch (error) {
      console.error('Erreur chargement tenants:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTenants()
  }, [])

  const handleBusinessTypeChange = (businessType: Tenant['businessType']) => {
    setFormData(prev => ({
      ...prev,
      businessType,
      features: businessTypeFeatures[businessType]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token non trouvé')
        return
      }

      const response = await fetch('/api/tenants', {
        method: editingTenant ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          if (editingTenant) {
            setTenants(prev => prev.map(t => t.id === editingTenant.id ? { ...t, ...formData } : t))
            alert('Tenant mis à jour avec succès')
          } else {
            setTenants(prev => [...prev, result.data])
            alert('Tenant créé avec succès')
          }
          setShowModal(false)
          setEditingTenant(null)
          setFormData({
            name: '',
            email: '',
            phone: '',
            address: '',
            businessType: 'retail',
            currency: 'XAF',
            features: businessTypeFeatures.retail
          })
          loadTenants()
        } else {
          alert('Erreur: ' + (result.error || 'Erreur inconnue'))
        }
      } else {
        alert('Erreur lors de la requête')
      }
    } catch (error) {
      console.error('Erreur création tenant:', error)
      alert('Une erreur est survenue')
    }
  }

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant)
    setFormData({
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      address: tenant.address,
      businessType: tenant.businessType,
      currency: tenant.currency,
      features: tenant.features || businessTypeFeatures[tenant.businessType]
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce tenant ?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token non trouvé')
        return
      }

      const response = await fetch(`/api/tenants/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setTenants(prev => prev.filter(t => t.id !== id))
        alert('Tenant supprimé avec succès')
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur suppression tenant:', error)
      alert('Une erreur est survenue')
    }
  }

  const handleStatusChange = async (id: string, status: Tenant['status']) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Token non trouvé')
        return
      }

      const response = await fetch(`/api/tenants/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        setTenants(prev => prev.map(t => t.id === id ? { ...t, status } : t))
        alert(`Tenant ${status === 'active' ? 'activé' : status === 'inactive' ? 'désactivé' : 'suspendu'} avec succès`)
      } else {
        alert('Erreur lors de la modification du statut')
      }
    } catch (error) {
      console.error('Erreur modification statut tenant:', error)
      alert('Une erreur est survenue')
    }
  }

  const resetForm = () => {
    setEditingTenant(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      businessType: 'retail',
      currency: 'XAF',
      features: businessTypeFeatures.retail
    })
    setShowModal(false)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Store className="h-5 w-5 mr-2 text-orange-400" />
            Gestion des Tenants
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {tenants.length} tenant(s) • {tenants.filter(t => t.status === 'active').length} actif(s)
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Ajouter un Tenant</span>
        </button>
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
            <option value="retail">Boutique</option>
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
                      {tenant.features?.allowsTableService && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                          Tables
                        </span>
                      )}
                      {tenant.features?.allowsDelivery && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                          Livraison
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(tenant)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(
                          tenant.id, 
                          tenant.status === 'active' ? 'suspended' : 'active'
                        )}
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        title={tenant.status === 'active' ? 'Suspendre' : 'Activer'}
                      >
                        <Shield className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tenant.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">
                {editingTenant ? 'Modifier le Tenant' : 'Ajouter un Tenant'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom du tenant</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type de commerce</label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => handleBusinessTypeChange(e.target.value as Tenant['businessType'])}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="retail">Boutique</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="bar">Bar</option>
                    <option value="pharmacy">Pharmacie</option>
                    <option value="supermarket">Supermarché</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Fonctionnalités */}
              <div>
                <h4 className="text-lg font-medium text-white mb-4">Fonctionnalités activées</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Gestion des dettes clients</p>
                      <p className="text-gray-400 text-xs">Permet d&apos;enregistrer les dettes des clients fidèles</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.features.allowsDebt}
                      onChange={() => handleFeatureToggle('allowsDebt')}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Service de livraison</p>
                      <p className="text-gray-400 text-xs">Gestion des livraisons à domicile</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.features.allowsDelivery}
                      onChange={() => handleFeatureToggle('allowsDelivery')}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Service de table</p>
                      <p className="text-gray-400 text-xs">Gestion des tables et service restaurant</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.features.allowsTableService}
                      onChange={() => handleFeatureToggle('allowsTableService')}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Numéro de table requis</p>
                      <p className="text-gray-400 text-xs">Oblige le numéro de table pour chaque commande</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.features.requiresTableNumber}
                      onChange={() => handleFeatureToggle('requiresTableNumber')}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Clients flash</p>
                      <p className="text-gray-400 text-xs">Système de crédit pour clients réguliers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.features.allowsFlashCustomers}
                      onChange={() => handleFeatureToggle('allowsFlashCustomers')}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white font-medium">Impression tickets</p>
                      <p className="text-gray-400 text-xs">Impression automatique des tickets de caisse</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.features.allowsTicketPrinting}
                      onChange={() => handleFeatureToggle('allowsTicketPrinting')}
                      className="w-5 h-5 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingTenant ? 'Mettre à jour' : 'Créer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
