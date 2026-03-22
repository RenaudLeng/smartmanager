'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Key,
  Mail,
  Phone,
  Building2,
  Calendar,
  MoreVertical,
  UserPlus,
  UserCheck,
  UserX,
  Eye
} from 'lucide-react'
import apiService from '@/services/api'

interface UserManagementProps {
  tenants: any[]
  onUserAction: (action: string, user: any, data?: any) => void
}

interface GlobalUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'cashier' | 'seller' | 'super_admin'
  tenantId: string
  tenantName: string
  businessType: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin?: Date | string
  createdAt: Date | string
  permissions: string[]
}

export default function UsersManagement({ tenants, onUserAction }: UserManagementProps) {
  const [users, setUsers] = useState<GlobalUser[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<GlobalUser | null>(null)

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Appel API réel uniquement
      const response = await apiService.getUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      } else {
        console.warn('Erreur lors du chargement des utilisateurs:', response.error)
        setUsers([]) // Afficher une liste vide si erreur
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
      setUsers([]) // Afficher une liste vide si erreur
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (action: string, user: GlobalUser, data?: any) => {
    try {
      // Empêcher toutes les actions sur le SuperAdmin sauf 'view'
      if (user.role === 'super_admin' && action !== 'view') {
        alert('Le compte SuperAdmin ne peut pas être modifié')
        return
      }

      switch (action) {
        case 'view':
          // Just afficher les détails (pourrait ouvrir un modal plus tard)
          console.log('Vue utilisateur:', user)
          break

        case 'create':
          const createResponse = await apiService.createUser(data)
          if (createResponse.success && createResponse.data) {
            setUsers(prev => [...prev, createResponse.data])
            alert('Utilisateur créé avec succès')
          } else {
            alert('Erreur lors de la création: ' + (createResponse.error || 'Erreur inconnue'))
          }
          onUserAction(action, user, data)
          break

        case 'update':
          const updateResponse = await apiService.updateUser(user.id, data)
          if (updateResponse.success && updateResponse.data) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updateResponse.data } : u))
            alert('Utilisateur mis à jour avec succès')
          } else {
            alert('Erreur lors de la mise à jour: ' + (updateResponse.error || 'Erreur inconnue'))
          }
          onUserAction(action, user, data)
          break

        case 'suspend':
          const suspendResponse = await apiService.suspendUser(user.id, data.reason)
          if (suspendResponse.success) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'suspended' } : u))
            alert('Utilisateur suspendu avec succès')
          } else {
            alert('Erreur lors de la suspension: ' + (suspendResponse.error || 'Erreur inconnue'))
          }
          onUserAction(action, user, data)
          break

        case 'activate':
          // Pour activer, on utilise update avec isActive: true
          const activateResponse = await apiService.updateUser(user.id, { isActive: true })
          if (activateResponse.success) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active' } : u))
            alert('Utilisateur activé avec succès')
          } else {
            alert('Erreur lors de l\'activation: ' + (activateResponse.error || 'Erreur inconnue'))
          }
          onUserAction(action, user, data)
          break

        case 'delete':
          if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
            return
          }
          const deleteResponse = await apiService.deleteUser(user.id)
          if (deleteResponse.success) {
            setUsers(prev => prev.filter(u => u.id !== user.id))
            alert('Utilisateur supprimé avec succès')
          } else {
            alert('Erreur lors de la suppression: ' + (deleteResponse.error || 'Erreur inconnue'))
          }
          onUserAction(action, user, data)
          break

        default:
          onUserAction(action, user, data)
      }
    } catch (error) {
      console.error('Erreur action utilisateur:', error)
      alert('Une erreur est survenue lors de l\'action')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête et filtres */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Gestion des Utilisateurs</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Nouvel Utilisateur</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Caissier</option>
            <option value="seller">Vendeur</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
            <option value="suspended">Suspendus</option>
          </select>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/60">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Boutique</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dernière connexion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'manager' ? 'bg-blue-500/20 text-blue-400' :
                      user.role === 'cashier' ? 'bg-green-500/20 text-green-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm text-white">{user.tenantName}</p>
                      <p className="text-xs text-gray-400">{user.businessType}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status === 'active' ? 'Actif' : user.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {user.lastLogin ? 
                      (typeof user.lastLogin === 'string' ? 
                        new Date(user.lastLogin).toLocaleDateString('fr-GA') : 
                        user.lastLogin.toLocaleDateString('fr-GA')
                      ) : 
                      'Jamais'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUserAction('view', user)}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleUserAction('update', user)}
                        className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction('suspend', user, { reason: 'Maintenance administrative' })}
                          className="p-1 rounded hover:bg-white/10 text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction('activate', user)}
                          className="p-1 rounded hover:bg-white/10 text-green-400 hover:text-green-300 transition-colors"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleUserAction('delete', user)}
                        className="p-1 rounded hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
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

      {/* Modal de création/modification */}
      {(showCreateModal || editingUser) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role'),
                tenantId: formData.get('tenantId'),
                permissions: []
              }
              
              if (editingUser) {
                handleUserAction('update', editingUser, userData)
              } else {
                handleUserAction('create', {} as GlobalUser, userData)
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={editingUser?.name || ''}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email || ''}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
                <select
                  name="role"
                  defaultValue={editingUser?.role || 'cashier'}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Caissier</option>
                  <option value="seller">Vendeur</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Boutique</label>
                <select
                  name="tenantId"
                  defaultValue={editingUser?.tenantId || ''}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une boutique</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingUser(null)
                  }}
                  className="px-4 py-2 border border-white/20 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
