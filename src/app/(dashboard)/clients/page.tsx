'use client'

import { useState, useCallback } from 'react'
import { Search, Users, Grid, List, Mail, Phone, Edit, Trash2, TrendingUp, ArrowLeft, MapPin, X } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'
import { useNotifications, useConfirmDialog } from '@/components/ui/ConfirmDialog'

// Le layout sera automatiquement appliqué par le layout.tsx du dossier (dashboard)

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalPurchases: number
  totalDebt: number
  lastPurchase: string
  status: 'active' | 'inactive' | 'vip'
  createdAt: string
}

export default function ClientsPage() {
  const tenantData = useTenant()
  const businessFeatures = tenantData.getBusinessFeatures()
  const businessType = tenantData.getBusinessLabel()
  
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Jean-Pierre Mba',
      email: 'jp.mba@email.com',
      phone: '+241 66 12 34 56',
      address: 'Libreville, Gabon',
      totalPurchases: 1500000,
      totalDebt: 250000,
      lastPurchase: '2024-03-15',
      status: 'vip',
      createdAt: '2023-01-15'
    },
    {
      id: '2',
      name: 'Marie Nguema',
      email: 'marie.ng@email.com',
      phone: '+241 77 23 45 67',
      address: 'Port-Gentil, Gabon',
      totalPurchases: 750000,
      totalDebt: 0,
      lastPurchase: '2024-03-14',
      status: 'active',
      createdAt: '2023-03-20'
    },
    {
      id: '3',
      name: 'Paul Ondo',
      email: 'paul.ondo@email.com',
      phone: '+241 62 98 76 54',
      address: 'Franceville, Gabon',
      totalPurchases: 320000,
      totalDebt: 50000,
      lastPurchase: '2024-03-10',
      status: 'active',
      createdAt: '2023-06-10'
    },
    {
      id: '4',
      name: 'Sophie Biyogho',
      email: 'sophie.b@email.com',
      phone: '+241 74 56 78 90',
      address: 'Oyem, Gabon',
      totalPurchases: 2100000,
      totalDebt: 150000,
      lastPurchase: '2024-03-16',
      status: 'vip',
      createdAt: '2022-11-05'
    },
    {
      id: '5',
      name: 'Antoine Mounda',
      email: 'a.mounda@email.com',
      phone: '+241 66 33 44 55',
      address: 'Lambaréné, Gabon',
      totalPurchases: 450000,
      totalDebt: 100000,
      lastPurchase: '2024-02-28',
      status: 'inactive',
      createdAt: '2023-08-12'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  const { showNotification, NotificationComponent } = useNotifications()
  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  // Fonction de suppression avec confirmation
  const handleDeleteCustomer = useCallback(async (customer: Customer) => {
    const confirmed = await confirm({
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer le client "${customer.name}" ?`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    })

    if (confirmed) {
      try {
        // Simuler la suppression du client
        showNotification(
          `Client "${customer.name}" supprimé avec succès!`,
          'success'
        )
        console.log('Client supprimé:', customer.id)
      } catch (error) {
        showNotification(
          'Erreur lors de la suppression du client. Veuillez réessayer.',
          'error'
        )
        console.error('Erreur suppression client:', error)
      }
    }
  }, [confirm, showNotification])

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm)
    const matchesStatus = selectedStatus === 'all' || customer.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'vip':
        return 'VIP'
      case 'active':
        return 'Actif'
      case 'inactive':
        return 'Inactif'
      default:
        return status
    }
  }

  const totalCustomers = customers.length
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const vipCustomers = customers.filter(c => c.status === 'vip').length
  const totalDebt = customers.reduce((sum, c) => sum + c.totalDebt, 0)

  return (
    <div className="p-4">
      {/* Header Mobile-First */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Gestion des Clients</h1>
            <div className="bg-orange-500/20 backdrop-blur-sm px-3 py-1 rounded-lg">
              <span className="text-orange-400 text-sm font-medium">{businessType}</span>
            </div>
          </div>
          <p className="text-gray-400 text-sm md:text-base">Gestion de la clientèle et suivi des relations</p>
          {businessFeatures.allowsDebt && (
            <p className="text-green-400 text-xs mt-2">✓ Gestion des dettes activée</p>
          )}
        </div>

        {/* Stats Cards - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-orange-400" />
              <span className="text-2xl font-bold text-white">{totalCustomers}</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Total Clients</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <span className="text-2xl font-bold text-white">{activeCustomers}</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Clients Actifs</p>
          </div>
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <Users className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">{vipCustomers}</span>
            </div>
            <p className="text-gray-400 text-sm mt-2">Clients VIP</p>
          </div>
          {businessFeatures.allowsDebt && (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="h-8 w-8 text-yellow-400" />
                <span className="text-2xl font-bold text-white">{(totalDebt / 1000).toFixed(0)}k</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Total Dettes (XAF)</p>
            </div>
          )}
        </div>

        {/* Search and Filter - Mobile First */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actifs</option>
                <option value="vip">VIP</option>
                <option value="inactive">Inactifs</option>
              </select>
              <div className="flex bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-l-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Vue grille"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-r-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-orange-500 text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="Vue liste"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Customers Display - Grid or List View */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((customer) => (
              <div 
                key={customer.id} 
                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                onClick={() => {
                  setSelectedCustomer(customer)
                  setShowDetails(true)
                }}
              >
                {/* Customer Header - Optimized */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1 truncate">{customer.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(customer.status)}`}>
                        {getStatusText(customer.status)}
                      </span>
                      {customer.totalDebt > 0 && businessFeatures.allowsDebt && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          Dette
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1 shrink-0">
                    <button 
                      className="p-1.5 text-orange-400 hover:text-orange-300 bg-orange-500/10 rounded hover:bg-orange-500/20"
                      title="Modifier"
                      onClick={(e) => {
                        e.stopPropagation()
                        // handleEdit(customer)
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded hover:bg-red-500/20"
                      title="Supprimer"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCustomer(customer)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Essential Info Only */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center text-gray-400">
                    <Phone className="h-3.5 w-3.5 mr-2 shrink-0" />
                    <span className="truncate">{customer.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Mail className="h-3.5 w-3.5 mr-2 shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                </div>

                {/* Key Metrics - Compact */}
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="text-gray-500">Achats</p>
                      <p className="text-green-400 font-semibold">{(customer.totalPurchases / 1000).toFixed(0)}k</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Dernier</p>
                      <p className="text-gray-400">{customer.lastPurchase}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-black/60 border-b border-white/20">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Dernier achat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Total achats</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dette</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setShowDetails(true)
                      }}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-white truncate max-w-[150px] sm:max-w-none">{customer.name}</div>
                          <div className="text-sm text-gray-400 truncate max-w-[120px] sm:hidden">{customer.phone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <div className="text-sm">
                          <div className="flex items-center text-gray-400 mb-1">
                            <Mail className="h-3 w-3 mr-1 shrink-0" />
                            <span className="truncate max-w-[120px]">{customer.email}</span>
                          </div>
                          <div className="flex items-center text-gray-400">
                            <Phone className="h-3 w-3 mr-1 shrink-0" />
                            <span className="truncate">{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(customer.status)}`}>
                          {getStatusText(customer.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400 hidden lg:table-cell">{customer.lastPurchase}</td>
                      <td className="px-4 py-4 text-sm text-green-400 font-semibold hidden md:table-cell">
                        {(customer.totalPurchases / 1000).toFixed(0)}k XAF
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`font-semibold ${customer.totalDebt > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {customer.totalDebt > 0 ? `${(customer.totalDebt / 1000).toFixed(0)}k` : '0'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-1">
                          <button 
                            className="p-1.5 text-orange-400 hover:text-orange-300 bg-orange-500/10 rounded hover:bg-orange-500/20"
                            title="Modifier"
                            onClick={(e) => {
                              e.stopPropagation()
                              // handleEdit(customer)
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button 
                            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded hover:bg-red-500/20"
                            title="Supprimer"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteCustomer(customer)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Details Modal */}
        {showDetails && selectedCustomer && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedCustomer.name}</h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(selectedCustomer.status)}`}>
                      {getStatusText(selectedCustomer.status)}
                    </span>
                    {selectedCustomer.totalDebt > 0 && (
                      <span className="px-3 py-1 text-sm rounded-full bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Dette: {(selectedCustomer.totalDebt / 1000).toFixed(0)}k XAF
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Informations de contact</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Mail className="h-4 w-4 mr-3 text-orange-400" />
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Phone className="h-4 w-4 mr-3 text-orange-400" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-3 text-orange-400" />
                      <span>{selectedCustomer.address}</span>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Informations financières</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Total des achats:</span>
                      <span className="text-green-400 font-semibold">{(selectedCustomer.totalPurchases / 1000).toFixed(0)}k XAF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Dette actuelle:</span>
                      <span className={`font-semibold ${selectedCustomer.totalDebt > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {selectedCustomer.totalDebt > 0 ? `${(selectedCustomer.totalDebt / 1000).toFixed(0)}k XAF` : '0 XAF'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Dernier achat:</span>
                      <span className="text-gray-300">{selectedCustomer.lastPurchase}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-white/20">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Fermer
                </button>
                <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors">
                  Modifier
                </button>
                <button className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Back Button */}
        <div className="lg:hidden mt-6">
          <button
            onClick={() => window.history.back()}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg flex items-center justify-center space-x-2 backdrop-blur-sm border border-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
        </div>
      </div>

      {/* Composants partagés */}
      {ConfirmDialogComponent}
      {NotificationComponent}
    </div>
  )
}
