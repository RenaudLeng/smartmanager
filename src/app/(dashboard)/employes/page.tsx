'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Users, Shield, Clock, Edit, Trash2, Grid, List, X } from 'lucide-react'

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  hireDate: string
  salary: number
  status: 'active' | 'inactive' | 'on_leave'
  permissions: {
    dashboard: boolean
    sales: boolean
    inventory: boolean
    financial: boolean
    reports: boolean
    users: boolean
    settings: boolean
  }
  createdAt: string
  updatedAt: string
  lastLogin?: string
  password?: string
  notes?: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

export default function EmployesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const token = localStorage.getItem('token')
      const resetFlag = localStorage.getItem('smartmanager-reset')

      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-reset-flag': resetFlag || 'false'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setEmployees(result.data || [])
      } else {
        console.error('Failed to load employees')
        setEmployees([])
      }
    } catch (error) {
      console.error('Error loading employees:', error)
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  const [newEmployee, setNewEmployee] = useState<Employee>({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    hireDate: '',
    salary: 0,
    status: 'active',
    permissions: {
      dashboard: true,
      sales: false,
      inventory: false,
      financial: false,
      reports: false,
      users: false,
      settings: false
    },
    createdAt: '',
    updatedAt: '',
    lastLogin: '',
    password: '',
    notes: ''
  })

  const roles: Role[] = [
    { id: 'admin', name: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités', permissions: ['all'] },
    { id: 'manager', name: 'Gestionnaire', description: 'Gestion des employés et stocks', permissions: ['employees', 'products', 'sales', 'reports'] },
    { id: 'cashier', name: 'Caissier', description: 'Gestion des ventes et paiements', permissions: ['sales', 'products'] },
    { id: 'seller', name: 'Vendeur', description: 'Ventes et service client', permissions: ['sales', 'products'] },
    { id: 'stock_manager', name: 'Gestionnaire de stock', description: 'Gestion des inventaires', permissions: ['products', 'inventory'] }
  ]

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'on_leave':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDetailsModal(true)
  }

  const handleEditFromDetails = () => {
    if (selectedEmployee) {
      setEditingEmployee(selectedEmployee)
      setShowDetailsModal(false)
      setShowModal(true)
    }
  }

  const handleDeleteFromDetails = () => {
    if (selectedEmployee && confirm(`Êtes-vous sûr de vouloir supprimer "${selectedEmployee.name}" ?`)) {
      setEmployees(employees.filter(e => e.id !== selectedEmployee.id))
      setShowDetailsModal(false)
      setSelectedEmployee(null)
    }
  }

  const handleSave = () => {
    if (editingEmployee) {
      if (editingEmployee.id) {
        // Update existing employee
        setEmployees(employees.map(e => e.id === editingEmployee.id ? editingEmployee : e))
      } else {
        // Add new employee
        const newEmployeeWithId = {
          ...editingEmployee,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setEmployees([...employees, newEmployeeWithId])
      }
      setShowModal(false)
      setEditingEmployee(null)
    }
  }

  const handleAddNew = () => {
    setEditingEmployee(null)
    setNewEmployee({
      id: '',
      name: '',
      email: '',
      phone: '',
      role: 'employee',
      department: '',
      hireDate: '',
      salary: 0,
      status: 'active',
      permissions: {
        dashboard: true,
        sales: false,
        inventory: false,
        financial: false,
        reports: false,
        users: false,
        settings: false
      },
      createdAt: '',
      updatedAt: '',
      lastLogin: '',
      password: '',
      notes: ''
    })
    setShowModal(true)
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-green-400 mb-2 font-serif">Employés</h1>
        <p className="text-gray-200 text-sm md:text-base">Gérez votre personnel et les permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Total employés</p>
                <p className="text-2xl font-bold text-white">{employees.length}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-gray-400 text-sm">Actifs</p>
                <p className="text-2xl font-bold text-green-400">{employees.filter(e => e.status === 'active').length}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Administrateurs</p>
                <p className="text-2xl font-bold text-purple-400">{employees.filter(e => e.role === 'admin').length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </button>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Ajouter
          </button>
        </div>
      </div>
            {/* Employees Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des employés...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucun employé trouvé</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un employé'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div 
              key={employee.id} 
              className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200 cursor-pointer"
              onClick={() => handleEmployeeClick(employee)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-10 h-10 rounded-full ${getStatusColor(employee.status)}`}>
                      <span className="text-white text-xs font-medium">
                        {employee.status === 'active' ? 'A' : employee.status === 'inactive' ? 'I' : employee.status === 'on_leave' ? 'C' : 'D'}
                      </span>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-400">{employee.role}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {employee.status === 'active' ? 'En service' : employee.status === 'on_leave' ? 'En congé' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                <span className="text-gray-400">{employee.hireDate}</span>
                <div className="text-gray-400 text-sm">{employee.department}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-black/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Département</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rôle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date d&apos;embauche</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredEmployees.map((employee) => (
                <tr 
                  key={employee.id} 
                  className="hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => handleEmployeeClick(employee)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full ${getStatusColor(employee.status)} mr-3`}>
                        <span className="text-white text-xs font-medium">
                          {employee.status === 'active' ? 'A' : employee.status === 'inactive' ? 'I' : employee.status === 'on_leave' ? 'C' : 'D'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{employee.name}</div>
                        <div className="text-sm text-gray-400">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{employee.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{employee.role}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                      {employee.status === 'active' ? 'En service' : employee.status === 'on_leave' ? 'En congé' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{employee.hireDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Employee Details Modal */}
      {showDetailsModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">Détails de l&apos;employé</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-full ${getStatusColor(selectedEmployee.status)}`}>
                  <span className="text-white text-lg font-medium">
                    {selectedEmployee.status === 'active' ? 'A' : selectedEmployee.status === 'inactive' ? 'I' : selectedEmployee.status === 'on_leave' ? 'C' : 'D'}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{selectedEmployee.name}</h3>
                  <p className="text-gray-400">{selectedEmployee.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">{selectedEmployee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Téléphone</p>
                  <p className="text-white">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Département</p>
                  <p className="text-white">{selectedEmployee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Statut</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEmployee.status)}`}>
                    {selectedEmployee.status === 'active' ? 'En service' : selectedEmployee.status === 'on_leave' ? 'En congé' : 'Inactif'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Salaire</p>
                  <p className="text-white">{selectedEmployee.salary.toLocaleString('fr-GA')} XAF</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Date d&apos;embauche</p>
                  <p className="text-white">{selectedEmployee.hireDate}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-2">Permissions</p>
                <div className="space-y-1">
                  {roles.find(r => r.id === selectedEmployee.role)?.permissions.map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-300 text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleEditFromDetails}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Modifier
                </button>
                <button
                  onClick={handleDeleteFromDetails}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet *</label>
                <input
                  type="text"
                  value={editingEmployee?.name || newEmployee.name || ''}
                  onChange={(e) => {
                    if (editingEmployee) {
                      setEditingEmployee({...editingEmployee, name: e.target.value})
                    } else {
                      setNewEmployee({...newEmployee, name: e.target.value})
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nom de l'employé"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={editingEmployee?.email || newEmployee.email || ''}
                  onChange={(e) => {
                    if (editingEmployee) {
                      setEditingEmployee({...editingEmployee, email: e.target.value})
                    } else {
                      setNewEmployee({...newEmployee, email: e.target.value})
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={editingEmployee?.phone || newEmployee.phone || ''}
                  onChange={(e) => {
                    if (editingEmployee) {
                      setEditingEmployee({...editingEmployee, phone: e.target.value})
                    } else {
                      setNewEmployee({...newEmployee, phone: e.target.value})
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="
241 XX XX XX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Département</label>
                <input
                  type="text"
                  value={editingEmployee?.department || newEmployee.department || ''}
                  onChange={(e) => {
                    if (editingEmployee) {
                      setEditingEmployee({...editingEmployee, department: e.target.value})
                    } else {
                      setNewEmployee({...newEmployee, department: e.target.value})
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Direction, Ventes, Stock..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
                <select
                  value={editingEmployee?.role || newEmployee.role || ''}
                  onChange={(e) => {
                    if (editingEmployee) {
                      setEditingEmployee({...editingEmployee, role: e.target.value})
                    } else {
                      setNewEmployee({...newEmployee, role: e.target.value})
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Salaire (XAF)</label>
                <input
                  type="number"
                  value={editingEmployee?.salary || newEmployee.salary || 0}
                  onChange={(e) => {
                    if (editingEmployee) {
                      setEditingEmployee({...editingEmployee, salary: Number(e.target.value)})
                    } else {
                      setNewEmployee({...newEmployee, salary: Number(e.target.value)})
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: 150000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date d&apos;embauche</label>
                <input
                  type="date"
                  value={editingEmployee?.hireDate || newEmployee.hireDate || ''}
                  onChange={(e) => {
                    if (editingEmployee) {
                      setEditingEmployee({...editingEmployee, hireDate: e.target.value})
                    } else {
                      setNewEmployee({...newEmployee, hireDate: e.target.value})
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                <input
                  type="password"
                  value={editingEmployee?.password || newEmployee.password || ''}
                  onChange={(e) => {
                    if (editingEmployee) {
                      setEditingEmployee({...editingEmployee, password: e.target.value})
                    } else {
                      setNewEmployee({...newEmployee, password: e.target.value})
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Mot de passe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
                <div className="space-y-2">
                  {[
                    { key: 'dashboard', label: 'Tableau de bord' },
                    { key: 'sales', label: 'Ventes' },
                    { key: 'inventory', label: 'Stock' },
                    { key: 'financial', label: 'Finances' },
                    { key: 'reports', label: 'Rapports' },
                    { key: 'users', label: 'Utilisateurs' },
                    { key: 'settings', label: 'Paramètres' }
                  ].map(permission => (
                    <div key={permission.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={permission.key}
                        checked={editingEmployee?.permissions?.[permission.key as keyof typeof editingEmployee.permissions] || newEmployee.permissions?.[permission.key as keyof typeof newEmployee.permissions] || false}
                        onChange={(e) => {
                          if (editingEmployee) {
                            setEditingEmployee({
                              ...editingEmployee,
                              permissions: {
                                ...editingEmployee.permissions,
                                [permission.key]: e.target.checked
                              }
                            })
                          } else {
                            setNewEmployee({
                              ...newEmployee,
                              permissions: {
                                ...newEmployee.permissions,
                                [permission.key]: e.target.checked
                              }
                            })
                          }
                        }}
                        className="w-4 h-4 text-orange-600 bg-black/40 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                      />
                      <label htmlFor={permission.key} className="text-gray-300 text-sm">{permission.label}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                <select
                  value={editingEmployee?.status || newEmployee.status || ''}
                  onChange={(e) => {
                    if (editingEmployee) {
                      setEditingEmployee({...editingEmployee, status: e.target.value as 'active' | 'inactive' | 'on_leave'})
                    } else {
                      setNewEmployee({...newEmployee, status: e.target.value as 'active' | 'inactive' | 'on_leave'})
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="on_leave">En congé</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                <textarea
                  value={editingEmployee?.notes || ''}
                  onChange={(e) => setEditingEmployee(editingEmployee ? {...editingEmployee, notes: e.target.value} : null)}
                  rows={4}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium shadow-lg shadow-orange-500/25"
              >
                {editingEmployee ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
