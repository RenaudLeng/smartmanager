'use client'

import { useState } from 'react'
import { 
  User, Store, Bell, Shield, Palette, Smartphone, Save, Eye, EyeOff, Moon, Sun, Mail, ArrowLeft, Users, Key, Lock, Plus, Edit2, Trash2, X 
} from 'lucide-react'

interface AppUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'employee' | 'viewer'
  permissions: {
    dashboard: boolean
    sales: boolean
    inventory: boolean
    financial: boolean
    reports: boolean
    users: boolean
    settings: boolean
  }
  status: 'active' | 'inactive'
  createdAt: string
  lastLogin?: string
}

interface UserSettings {
  name: string
  email: string
  phone: string
  role: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  security: {
    twoFactor: boolean
    sessionTimeout: boolean
  }
  preferences: {
    theme: 'light' | 'dark'
    language: 'fr' | 'en'
    currency: 'XAF' | 'EUR' | 'USD'
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('user')
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
  }>>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  
  // États pour les configurations du tableau de bord
  const [dashboardConfig, setDashboardConfig] = useState({
    dailyObjective: 100000,
    dailyExpenseLimit: 50000,
    minProfitMargin: 15,
    lowStockThreshold: 10
  })
  
  const showNotification = (type: 'success' | 'error' | 'info', message: string, duration = 3000) => {
    const id = Date.now().toString()
    setNotifications(prev => [...prev, { id, type, message, duration }])
  }
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }
  
  const [settings, setSettings] = useState<UserSettings>({
    name: 'Mac LENG',
    email: 'mac.leng@smartmanager.ga',
    phone: '+241 07 23 45 67',
    role: 'admin',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    security: {
      twoFactor: false,
      sessionTimeout: true
    },
    preferences: {
      theme: 'dark',
      language: 'fr',
      currency: 'XAF'
    }
  })
  
  const [users, setUsers] = useState<AppUser[]>([
    {
      id: '1',
      name: 'Utilisateur Test',
      email: 'test@smartmanager.com',
      phone: '+241 07 23 45 67',
      role: 'admin',
      permissions: {
        dashboard: true,
        sales: true,
        inventory: true,
        financial: true,
        reports: true,
        users: true,
        settings: true
      },
      status: 'active',
      createdAt: '2024-01-01',
      lastLogin: '2024-03-13 10:30'
    }
  ])
  
  const [newUser, setNewUser] = useState<Partial<AppUser>>({
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    permissions: {
      dashboard: true,
      sales: false,
      inventory: false,
      financial: false,
      reports: false,
      users: false,
      settings: false
    },
    status: 'active'
  })

  const tabs = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: Bell },
    { id: 'user', label: 'Utilisateur', icon: User },
    { id: 'business', label: 'Commerce', icon: Store },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Préférences', icon: Palette },
  ]

  const handleSave = () => {
    console.log('🔥 BOUTON SAVE FONCTIONNE!')
    showNotification('success', 'Paramètres sauvegardés avec succès!')
    
    // Appliquer le thème immédiatement sur le body
    if (settings.preferences.theme === 'dark') {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
    
    // Appliquer la langue
    document.documentElement.lang = settings.preferences.language
    
    // Simuler une sauvegarde
    setTimeout(() => {
      showNotification('info', 'Toutes les modifications ont été enregistrées')
    }, 1000)
  }

  const handlePasswordChange = () => {
    console.log('🔥 BOUTON PASSWORD CHANGE FONCTIONNE!')
    console.log('Nouveau mot de passe :', newPassword)
    console.log('Confirmation du mot de passe :', confirmPassword)
    if (newPassword !== confirmPassword) {
      console.log('Erreur : les mots de passe ne correspondent pas')
      showNotification('error', 'Les mots de passe ne correspondent pas!')
      return
    }
    console.log('Mot de passe changé avec succès!')
    showNotification('success', 'Mot de passe changé avec succès!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleAddUser = () => {
    console.log('🔥 BOUTON ADD USER FONCTIONNE!')
    console.log('Nouvel utilisateur :', newUser)
    if (!newUser.name || !newUser.email) {
      console.log('Erreur : champs obligatoires manquants')
      showNotification('error', 'Veuillez remplir tous les champs obligatoires')
      return
    }

    const user: AppUser = {
      id: Date.now().toString(),
      name: newUser.name!,
      email: newUser.email!,
      phone: newUser.phone || '',
      role: newUser.role as AppUser['role'],
      permissions: newUser.permissions!,
      status: newUser.status as AppUser['status'],
      createdAt: new Date().toISOString().split('T')[0]
    }

    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...user, id: editingUser.id } : u))
      setEditingUser(null)
      showNotification('success', 'Utilisateur mis à jour avec succès!')
    } else {
      setUsers([...users, user])
      showNotification('success', 'Utilisateur créé avec succès!')
    }

    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      permissions: {
        dashboard: true,
        sales: false,
        inventory: false,
        financial: false,
        reports: false,
        users: false,
        settings: false
      },
      status: 'active'
    })
    setShowUserModal(false)
  }

  const handleEditUser = (user: AppUser) => {
    setEditingUser(user)
    setNewUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions,
      status: user.status
    })
    setShowUserModal(true)
  }

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setShowDeleteModal(true)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete))
      showNotification('success', 'Utilisateur supprimé avec succès!')
      setShowDeleteModal(false)
      setUserToDelete(null)
    }
  }

  const cancelDeleteUser = () => {
    setShowDeleteModal(false)
    setUserToDelete(null)
  }

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' }
        : u
    ))
  }

  const getRoleLabel = (role: AppUser['role']) => {
    const labels = {
      admin: 'Administrateur',
      manager: 'Manager',
      employee: 'Employé',
      viewer: 'Lecteur'
    }
    return labels[role]
  }

  const getRoleColor = (role: AppUser['role']) => {
    const colors = {
      admin: 'bg-red-500/20 text-red-400 border-red-500/30',
      manager: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      employee: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return colors[role]
  }

  return (
      <div className="p-4">
        {/* Header Mobile-First */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Paramètres</h1>
          <p className="text-gray-400 text-sm md:text-base">Configurez vos préférences et paramètres système</p>
        </div>

        {/* Tab Navigation - Mobile First */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-white/20">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-medium transition-all duration-200 backdrop-blur-sm ${
                  activeTab === tab.id
                    ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white border-orange-400/20'
                    : 'text-gray-300 hover:bg-white/20 hover:text-orange-400 border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
          {/* Dashboard Settings Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Paramètres du Tableau de Bord</h3>
                <p className="text-gray-400 text-sm mb-6">Configurez les objectifs et limites pour votre entreprise</p>
                
                {/* Objectifs de Ventes */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-4 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Objectifs de Ventes
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Objectif Quotidien (XAF)</label>
                      <input
                        type="number"
                        value={dashboardConfig.dailyObjective}
                        onChange={(e) => setDashboardConfig(prev => ({ ...prev, dailyObjective: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="100000"
                      />
                      <p className="text-xs text-gray-400 mt-1">Actuel: {dashboardConfig.dailyObjective.toLocaleString()} XAF</p>
                    </div>
                  </div>
                </div>

                {/* Contrôle des Dépenses */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-4 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Contrôle des Dépenses
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Limite Quotidienne (XAF)</label>
                      <input
                        type="number"
                        value={dashboardConfig.dailyExpenseLimit}
                        onChange={(e) => setDashboardConfig(prev => ({ ...prev, dailyExpenseLimit: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="50000"
                      />
                      <p className="text-xs text-gray-400 mt-1">Actuel: {dashboardConfig.dailyExpenseLimit.toLocaleString()} XAF</p>
                    </div>
                  </div>
                </div>

                {/* Rentabilité */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-4 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Rentabilité
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Marge Bénéficiaire Minimale (%)</label>
                      <input
                        type="number"
                        value={dashboardConfig.minProfitMargin}
                        onChange={(e) => setDashboardConfig(prev => ({ ...prev, minProfitMargin: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="15"
                        min="0"
                        max="100"
                      />
                      <p className="text-xs text-gray-400 mt-1">Actuel: {dashboardConfig.minProfitMargin}%</p>
                    </div>
                  </div>
                </div>

                {/* Gestion des Stocks */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-4">
                  <h4 className="text-white font-medium mb-4 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Gestion des Stocks
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Seuil d&apos;Alerte de Stock Bas</label>
                      <input
                        type="number"
                        value={dashboardConfig.lowStockThreshold}
                        onChange={(e) => setDashboardConfig(prev => ({ ...prev, lowStockThreshold: Number(e.target.value) }))}
                        className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="10"
                        min="1"
                      />
                      <p className="text-xs text-gray-400 mt-1">Alertez quand le stock est inferieur a {dashboardConfig.lowStockThreshold} unites</p>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <button
                    onClick={() => setDashboardConfig({
                      dailyObjective: 100000,
                      dailyExpenseLimit: 50000,
                      minProfitMargin: 15,
                      lowStockThreshold: 10
                    })}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Réinitialiser aux Défauts
                  </button>
                  <button
                    onClick={() => {
                      showNotification('success', 'Paramètres du tableau de bord sauvegardés avec succès!')
                    }}
                    className="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Sauvegarder</span>
                  </button>
                </div>

                {/* Impact des paramètres */}
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                  <h4 className="text-blue-400 font-medium mb-2">Impact de ces paramètres</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• <span className="text-orange-400">Objectif Quotidien:</span> Definit l&apos;objectif de ventes pour le calcul de progression dans le tableau de bord.</li>
                    <li>• <span className="text-orange-400">Limite Quotidienne:</span> Alertes lorsque les depenses depassent ce montant.</li>
                    <li>• <span className="text-orange-400">Marge Minimale:</span> Indicateur de performance lorsque la marge est inferieure a ce seuil.</li>
                    <li>• <span className="text-orange-400">Seuil de Stock:</span> Alertes lorsque les produits ont moins de ce nombre d&apos;unites.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* User Settings Tab */}
          {activeTab === 'user' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Informations personnelles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({...settings, name: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
                    <input
                      type="text"
                      value={settings.role}
                      disabled
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Business Settings Tab */}
          {activeTab === 'business' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Informations du commerce</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom du commerce</label>
                    <input
                      type="text"
                      defaultValue="Supermarché Libreville"
                      className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                    <input
                      type="text"
                      defaultValue="Boulevard de la Mer, Libreville"
                      className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      defaultValue="+241 01 23 45 67"
                      className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Management Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Gestion des utilisateurs</h3>
                  <p className="text-gray-400 text-sm">Créez et gérez les comptes utilisateurs avec leurs permissions</p>
                </div>
                <button
                  onClick={() => {
                    setEditingUser(null)
                    setNewUser({
                      name: '',
                      email: '',
                      phone: '',
                      role: 'employee',
                      permissions: {
                        dashboard: true,
                        sales: false,
                        inventory: false,
                        financial: false,
                        reports: false,
                        users: false,
                        settings: false
                      },
                      status: 'active'
                    })
                    setShowUserModal(true)
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter un utilisateur</span>
                </button>
              </div>

              {/* Users List */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-black/60">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Utilisateur</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rôle</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dernière connexion</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                              {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(user.role)}`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full border ${
                              user.status === 'active' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }`}>
                              {user.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-400">
                            {user.lastLogin || 'Jamais'}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                                title="Modifier"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(user.id)}
                                className={`p-1 rounded transition-colors ${
                                  user.status === 'active' 
                                    ? 'text-orange-400 hover:bg-orange-500/20' 
                                    : 'text-green-400 hover:bg-green-500/20'
                                }`}
                                title={user.status === 'active' ? "Désactiver" : "Activer"}
                              >
                                {user.status === 'active' ? <Lock className="h-4 w-4" /> : <Key className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
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
          )}

          {/* Security Settings Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Sécurité du compte</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Authentification à deux facteurs</p>
                      <p className="text-gray-400 text-sm">Ajoutez une couche de sécurité supplémentaire</p>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        security: {...settings.security, twoFactor: !settings.security.twoFactor}
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                        settings.security.twoFactor ? 'bg-linear-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.twoFactor ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Délai d&apos;expiration de session</p>
                      <p className="text-gray-400 text-sm">Déconnexion automatique après inactivité</p>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        security: {...settings.security, sessionTimeout: !settings.security.sessionTimeout}
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                        settings.security.sessionTimeout ? 'bg-linear-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.security.sessionTimeout ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Changer le mot de passe</h3>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handlePasswordChange(); }}>
                  <input
                    type="text"
                    name="username"
                    autoComplete="username"
                    value={settings.email || ''}
                    readOnly
                    className="absolute -left-full opacity-0 pointer-events-none"
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe actuel</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-orange-500/25"
                  >
                    Changer le mot de passe
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Settings Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Préférences de notification</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Notifications par email</p>
                        <p className="text-gray-400 text-sm">Recevez des alertes par email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, email: !settings.notifications.email}
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                        settings.notifications.email ? 'bg-linear-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Notifications push</p>
                        <p className="text-gray-400 text-sm">Alertes sur votre appareil</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, push: !settings.notifications.push}
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                        settings.notifications.push ? 'bg-linear-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="text-white font-medium">Notifications SMS</p>
                        <p className="text-gray-400 text-sm">Alertes par SMS</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        notifications: {...settings.notifications, sms: !settings.notifications.sms}
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 ${
                        settings.notifications.sms ? 'bg-linear-to-r from-green-500 to-green-600 shadow-lg shadow-green-500/25' : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Settings Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Préférences d&apos;affichage</h3>
                <div className="space-y-6">
                  {/* Theme Toggle */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          settings.preferences.theme === 'dark' 
                            ? 'bg-gray-900 border border-gray-700' 
                            : 'bg-gray-100 border border-gray-300'
                        }`}>
                          {settings.preferences.theme === 'dark' ? (
                            <Moon className="h-5 w-5 text-orange-400" />
                          ) : (
                            <Sun className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">Thème de l&apos;interface</p>
                          <p className="text-gray-400 text-sm">
                            {settings.preferences.theme === 'dark' ? "Sombre - Idéal pour faible luminosité" : "Clair - Idéal pour forte luminosité"}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          const newTheme = settings.preferences.theme === 'dark' ? 'light' : 'dark'
                          setSettings({
                            ...settings,
                            preferences: {...settings.preferences, theme: newTheme}
                          })
                          
                          // Appliquer le thème immédiatement sur le body
                          const body = document.body
                          if (newTheme === 'light') {
                            body.classList.remove('dark-theme')
                            body.classList.add('light-theme')
                          } else {
                            body.classList.remove('light-theme')
                            body.classList.add('dark-theme')
                          }
                          
                          showNotification('success', `Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} appliqué`)
                        }}
                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 ${
                          settings.preferences.theme === 'dark' 
                            ? 'bg-linear-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/25' 
                            : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                            settings.preferences.theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Language and Currency */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Langue</label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: {...settings.preferences, language: e.target.value as 'fr' | 'en'}
                        })}
                        className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Devise</label>
                      <select
                        value={settings.preferences.currency}
                        onChange={(e) => setSettings({
                          ...settings,
                          preferences: {...settings.preferences, currency: e.target.value as 'XAF' | 'EUR' | 'USD'}
                        })}
                        className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="XAF">XAF</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 shadow-lg shadow-orange-500/25"
            >
              <Save className="h-4 w-4" />
              <span>Sauvegarder</span>
            </button>
          </div>
        </div>

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {editingUser ? 'Mettez à jour les informations de l\'utilisateur' : 'Créez un nouvel utilisateur avec ses permissions'}
                  </p>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet *</label>
                    <input
                      type="text"
                      value={newUser.name || ''}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Nom de l'utilisateur"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newUser.email || ''}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={newUser.phone || ''}
                      onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="+241 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as AppUser['role'] })}
                      className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="admin">Administrateur</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employé</option>
                      <option value="viewer">Lecteur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                    <select
                      value={newUser.status}
                      onChange={(e) => setNewUser({ ...newUser, status: e.target.value as AppUser['status'] })}
                      className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-white font-semibold mb-4">Permissions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(newUser.permissions || {}).map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={permission}
                          checked={newUser.permissions?.[permission as keyof typeof newUser.permissions] || false}
                          onChange={(e) => setNewUser({
                            ...newUser,
                            permissions: {
                              ...newUser.permissions!,
                              [permission]: e.target.checked
                            }
                          })}
                          className="w-4 h-4 text-orange-600 bg-black/40 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                        />
                        <label htmlFor={permission} className="text-sm text-gray-300 capitalize">
                          {permission === 'dashboard' ? 'Tableau de bord' :
                           permission === 'sales' ? 'Ventes' :
                           permission === 'inventory' ? 'Stock' :
                           permission === 'financial' ? 'Finances' :
                           permission === 'reports' ? 'Rapports' :
                           permission === 'users' ? 'Utilisateurs' :
                           permission === 'settings' ? 'Paramètres' : permission}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingUser ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Confirmer la suppression</h2>
                  <p className="text-gray-400 text-sm">Cette action est irréversible</p>
                </div>
              </div>

              {/* Modal Content */}
              <div className="mb-6">
                <p className="text-gray-300">
                  Êtes-vous sûr de vouloir supprimer cet utilisateur ? 
                  <span className="text-orange-400 font-medium">
                    {userToDelete && users.find(u => u.id === userToDelete)?.name}
                  </span>
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Toutes les données associées à cet utilisateur seront définitivement perdues.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={cancelDeleteUser}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Notifications - Optimisées pour Mobile */}
        <div className="fixed top-16 right-2 left-2 sm:left-auto sm:right-4 sm:top-4 z-50 space-y-2 max-w-sm sm:max-w-md mx-auto sm:mx-0">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start space-x-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg backdrop-blur-sm border transition-all duration-300 transform translate-x-0 ${
                notification.type === 'success' 
                  ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                  : notification.type === 'error' 
                  ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                  : notification.type === 'warning' 
                  ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' 
                  : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {notification.type === 'success' && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'error' && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'warning' && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {notification.type === 'info' && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium wrap-break-word">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors ml-1"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          ))}
        </div>

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
  )
}
