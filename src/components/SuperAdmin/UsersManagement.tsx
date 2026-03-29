'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Edit, 
  Trash2, 
  UserPlus,
  UserCheck,
  UserX,
  Eye,
  X
} from 'lucide-react'
import apiService from '@/services/api'
import ConfirmModal from '@/components/ui/ConfirmModal'
import { useNotifications, NotificationContainer } from '@/components/ui/Notification'

interface UserManagementProps {
  tenants: { id: string; name: string }[]
  onUserAction: (action: string, user: unknown, data?: unknown) => void
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
  phone?: string
}

export default function UsersManagement({ tenants, onUserAction }: UserManagementProps) {
  const [users, setUsers] = useState<GlobalUser[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<GlobalUser | null>(null)
  const [viewingUser, setViewingUser] = useState<GlobalUser | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    userId: string
    userName: string
  }>({
    isOpen: false,
    userId: '',
    userName: ''
  })
  
  const { addNotification } = useNotifications()

  // Charger les utilisateurs
  useEffect(() => {
    // Charger les utilisateurs automatiquement quand le composant monte
    if (tenants && tenants.length > 0) {
      loadUsers()
    }
  }, [tenants]) // Recharger quand les tenants changent

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Appel API réel uniquement
      const response = await apiService.getUsers()
      if (response.success && response.data) {
        // Transformer les données pour convertir isActive en status et extraire les infos du tenant
        const transformedUsers = response.data.map(user => ({
          ...user,
          status: user.isActive ? 'active' : 'suspended',
          tenantName: user.tenant?.name || 'SuperAdmin',
          businessType: user.tenant?.businessType || 'Administration'
        }))
        setUsers(transformedUsers)
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

  const confirmDelete = async () => {
    try {
      const deleteResponse = await apiService.deleteUser(deleteModal.userId)
      if (deleteResponse.success) {
        setUsers(prev => prev.filter(u => u.id !== deleteModal.userId))
        
        // Créer un log d'audit pour la suppression
        await apiService.createAuditLog({
          action: 'delete',
          entity: 'user',
          entityId: deleteModal.userId,
          details: {
            userName: deleteModal.userName,
            email: users.find(u => u.id === deleteModal.userId)?.email
          }
        })
        
        addNotification({
          title: 'Succès',
          message: `Utilisateur "${deleteModal.userName}" supprimé avec succès`,
          type: 'success'
        })
      } else {
        addNotification({
          title: 'Erreur',
          message: 'Erreur lors de la suppression: ' + (deleteResponse.error || 'Erreur inconnue'),
          type: 'error'
        })
      }
      onUserAction('delete', { id: deleteModal.userId, name: deleteModal.userName })
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error)
      addNotification({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de la suppression',
        type: 'error'
      })
    } finally {
      setDeleteModal({ isOpen: false, userId: '', userName: '' })
    }
  }

  const handleUserAction = async (action: string, user: GlobalUser, data?: unknown) => {
    try {
      // Empêcher toutes les actions sur le SuperAdmin sauf 'view'
      if (user.role === 'super_admin' && action !== 'view') {
        addNotification({
          title: 'Action non autorisée',
          message: 'Le compte SuperAdmin ne peut pas être modifié',
          type: 'warning'
        })
        return
      }

      switch (action) {
        case 'view':
          // Ouvrir le modal de vue
          setViewingUser(user)
          break

        case 'create':
          const createResponse = await apiService.createUser(data)
          if (createResponse.success && createResponse.data) {
            // Transformer les données pour convertir isActive en status
            const transformedUser = {
              ...createResponse.data,
              status: createResponse.data.isActive ? 'active' : 'suspended'
            }
            setUsers(prev => [...prev, transformedUser])
            addNotification({
              title: 'Succès',
              message: 'Utilisateur créé avec succès',
              type: 'success'
            })
          } else {
            addNotification({
              title: 'Erreur',
              message: 'Erreur lors de la création: ' + (createResponse.error || 'Erreur inconnue'),
              type: 'error'
            })
          }
          onUserAction(action, user, data)
          break

        case 'update':
          const updateResponse = await apiService.updateUser(user.id, data)
          if (updateResponse.success && updateResponse.data) {
            // Transformer les données pour convertir isActive en status
            const transformedUser = {
              ...updateResponse.data,
              status: updateResponse.data.isActive ? 'active' : 'suspended'
            }
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...transformedUser } : u))
            addNotification({
              title: 'Succès',
              message: 'Utilisateur mis à jour avec succès',
              type: 'success'
            })
          } else {
            addNotification({
              title: 'Erreur',
              message: 'Erreur lors de la mise à jour: ' + (updateResponse.error || 'Erreur inconnue'),
              type: 'error'
            })
          }
          onUserAction(action, user, data)
          break

        case 'suspend':
          // Type checking for suspend action data
          if (!data || typeof data !== 'object' || !('reason' in data) || typeof data.reason !== 'string') {
            addNotification({
              title: 'Erreur',
              message: 'Données de suspension invalides: raison requise',
              type: 'error'
            })
            return
          }
          const suspendResponse = await apiService.suspendUser(user.id, data.reason)
          if (suspendResponse.success) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'suspended' } : u))
            addNotification({
              title: 'Succès',
              message: 'Utilisateur suspendu avec succès',
              type: 'success'
            })
          } else {
            addNotification({
              title: 'Erreur',
              message: 'Erreur lors de la suspension: ' + (suspendResponse.error || 'Erreur inconnue'),
              type: 'error'
            })
          }
          onUserAction(action, user, data)
          break

        case 'activate':
          // Pour activer, on utilise update avec isActive: true
          const activateResponse = await apiService.updateUser(user.id, { isActive: true })
          if (activateResponse.success) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active' } : u))
            addNotification({
              title: 'Succès',
              message: 'Utilisateur activé avec succès',
              type: 'success'
            })
          } else {
            addNotification({
              title: 'Erreur',
              message: 'Erreur lors de l\'activation: ' + (activateResponse.error || 'Erreur inconnue'),
              type: 'error'
            })
          }
          onUserAction(action, user, data)
          break

        case 'delete':
          setDeleteModal({
            isOpen: true,
            userId: user.id,
            userName: user.name
          })
          return

        default:
          onUserAction(action, user, data)
      }
    } catch (error) {
      console.error('Erreur action utilisateur:', error)
      addNotification({
        title: 'Erreur',
        message: 'Une erreur est survenue lors de l\'action',
        type: 'error'
      })
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ACTIVITE</th>
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
                      {user.status === 'active' && (
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
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
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                role: formData.get('role') as string,
                tenantId: formData.get('tenantId') as string,
                phone: formData.get('phone') as string,
                password: formData.get('password') as string,
                permissions: []
              }
              
              if (editingUser) {
                handleUserAction('update', editingUser, userData)
              } else {
                handleUserAction('create', {} as GlobalUser, userData)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
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
                    <option value="cashier">Caissier</option>
                    <option value="seller">Vendeur</option>
                    <option value="manager">Gérant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ACTIVITE</label>
                  <select
                    name="tenantId"
                    defaultValue={editingUser?.tenantId || ''}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner une activité</option>
                    {tenants.map((tenant: { id: string; name: string }) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={editingUser?.phone || ''}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
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

      {/* Modal de vue des détails utilisateur */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Détails de l&apos;utilisateur</h3>
                  <p className="text-sm text-gray-400">Informations complètes</p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nom complet</label>
                  <div className="bg-black/40 rounded-lg px-4 py-3 text-white">{viewingUser.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <div className="bg-black/40 rounded-lg px-4 py-3 text-white">{viewingUser.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Rôle</label>
                  <div className="bg-black/40 rounded-lg px-4 py-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      viewingUser.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' :
                      viewingUser.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                      viewingUser.role === 'manager' ? 'bg-green-500/20 text-green-400' :
                      viewingUser.role === 'cashier' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {viewingUser.role === 'super_admin' ? 'SuperAdmin' :
                       viewingUser.role === 'admin' ? 'Admin' :
                       viewingUser.role === 'manager' ? 'Manager' :
                       viewingUser.role === 'cashier' ? 'Caissier' :
                       'Vendeur'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Statut</label>
                  <div className="bg-black/40 rounded-lg px-4 py-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      viewingUser.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      viewingUser.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {viewingUser.status === 'active' ? 'Actif' :
                       viewingUser.status === 'suspended' ? 'Suspendu' :
                       'Inactif'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">ACTIVITE</label>
                  <div className="bg-black/40 rounded-lg px-4 py-3 text-white">{viewingUser.tenantName || 'Non assigné'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Type de commerce</label>
                  <div className="bg-black/40 rounded-lg px-4 py-3 text-white">{viewingUser.businessType || 'Non spécifié'}</div>
                </div>
              </div>

              {/* Informations système */}
              <div className="border-t border-white/10 pt-6">
                <h4 className="text-lg font-medium text-white mb-4">Informations système</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">ID Utilisateur</label>
                    <div className="bg-black/40 rounded-lg px-4 py-3 text-white font-mono text-sm">{viewingUser.id}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">ID Tenant</label>
                    <div className="bg-black/40 rounded-lg px-4 py-3 text-white font-mono text-sm">{viewingUser.tenantId}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Date de création</label>
                    <div className="bg-black/40 rounded-lg px-4 py-3 text-white">
                      {new Date(viewingUser.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Dernière connexion</label>
                    <div className="bg-black/40 rounded-lg px-4 py-3 text-white">
                      {viewingUser.lastLogin ? 
                        new Date(viewingUser.lastLogin).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'Jamais'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Permissions */}
              {viewingUser.permissions && viewingUser.permissions.length > 0 && (
                <div className="border-t border-white/10 pt-6">
                  <h4 className="text-lg font-medium text-white mb-4">Permissions</h4>
                  <div className="bg-black/40 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {viewingUser.permissions.map((permission, index) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-6 border-t border-white/10 space-x-3">
              <button
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, userId: '', userName: '' })}
        onConfirm={confirmDelete}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      {/* Notification Container */}
      <NotificationContainer maxNotifications={5} />
    </div>
  )
}
