'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Users, Shield, Clock, Edit, Trash2, Eye, EyeOff, Grid, List } from 'lucide-react'

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
  permissions: string[]
  createdAt: string
  updatedAt: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
}

export default function EmployesPage() {
  const [employees, setEmployees] = useState<Employee[]>([
        {
          id: '1',
          name: 'Jean-Baptiste Ondo',
          email: 'jb.ondo@smartmanager.ga',
          phone: '+241 07 23 45 67',
          role: 'admin',
          department: 'Direction',
          salary: 500000,
          status: 'active',
          permissions: ['all'],
          hireDate: '2023-01-15',
          createdAt: '2023-01-15',
          updatedAt: '2024-03-01'
        },
        {
          id: '2',
          name: 'Marie-Antoinette Nkoulou',
          email: 'ma.nkoulou@smartmanager.ga',
          phone: '+241 07 34 56 78',
          role: 'manager',
          department: 'Direction',
          salary: 450000,
          status: 'active',
          permissions: ['employees', 'products', 'sales', 'reports'],
          hireDate: '2023-02-01',
          createdAt: '2023-02-01',
          updatedAt: '2024-03-01'
        },
        {
          id: '3',
          name: 'Paulin Mba',
          email: 'p.mba@smartmanager.ga',
          phone: '+241 07 45 67 89',
          role: 'cashier',
          department: 'Ventes',
          salary: 350000,
          status: 'active',
          permissions: ['sales', 'products'],
          hireDate: '2023-03-15',
          createdAt: '2023-03-15',
          updatedAt: '2024-03-01'
        },
        {
          id: '4',
          name: 'Cécile Nzoghe',
          email: 'c.nzoghe@smartmanager.ga',
          phone: '+241 07 56 78 90',
          role: 'seller',
          department: 'Ventes',
          salary: 300000,
          status: 'active',
          permissions: ['sales', 'products'],
          hireDate: '2023-04-10',
          createdAt: '2023-04-10',
          updatedAt: '2024-03-01'
        },
        {
          id: '5',
          name: 'Joseph Ndong',
          email: 'j.ndong@smartmanager.ga',
          phone: '+241 07 67 89 01',
          role: 'stock_manager',
          department: 'Stock',
          salary: 400000,
          status: 'active',
          permissions: ['products', 'inventory'],
          hireDate: '2023-06-01',
          createdAt: '2023-06-01',
          updatedAt: '2024-03-01'
        }
      ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const roles: Role[] = [
    { id: 'admin', name: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités', permissions: ['all'] },
    { id: 'manager', name: 'Gestionnaire', description: 'Gestion des employés et stocks', permissions: ['employees', 'products', 'sales', 'reports'] },
    { id: 'cashier', name: 'Caissier', description: 'Gestion des ventes et paiements', permissions: ['sales', 'products'] },
    { id: 'seller', name: 'Vendeur', description: 'Ventes et service client', permissions: ['sales', 'products'] },
    { id: 'stock_manager', name: 'Gestionnaire de stock', description: 'Gestion des inventaires', permissions: ['products', 'inventory'] }
  ]

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role === selectedRole ||
    employee.status === selectedStatus
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

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setShowModal(true)
  }

  const handleSave = () => {
    if (editingEmployee) {
      console.log('Sauvegarde de l\'employé:', editingEmployee)
      setShowModal(false)
      setEditingEmployee(null)
    }
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
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Tous les rôles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-orange-500/25 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            Ajouter un employé
          </button>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((employee) => (
          <div key={employee.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200">
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
              <div className="text-sm text-gray-400">
                <span className="text-gray-400">{employee.hireDate}</span>
                <div className="text-gray-400 text-sm">{employee.department}</div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(employee)}
                className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  console.log('Suppression de l\'employé:', employee.id)
                }}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingEmployee ? 'Modifier l\'employé' : 'Ajouter un employé'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
                <input
                  type="text"
                  value={editingEmployee?.name || ''}
                  onChange={(e) => setEditingEmployee({...editingEmployee, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editingEmployee?.email || ''}
                  onChange={(e) => setEditingEmployee({...editingEmployee, email: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={editingEmployee?.phone || ''}
                  onChange={(e) => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Département</label>
                <input
                  type="text"
                  value={editingEmployee?.department || ''}
                  onChange={(e) => setEditingEmployee({...editingEmployee, department: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rôle</label>
                <select
                  value={editingEmployee?.role || ''}
                  onChange={(e) => setEditingEmployee({...editingEmployee, role: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  value={editingEmployee?.salary || ''}
                  onChange={(e) => setEditingEmployee({...editingEmployee, salary: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date d'embauche</label>
                <input
                  type="date"
                  value={editingEmployee?.hireDate || ''}
                  onChange={(e) => setEditingEmployee({...editingEmployee, hireDate: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Permissions</label>
                <div className="space-y-2">
                  {roles.find(r => r.id === editingEmployee?.role)?.permissions.map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-purple-400" />
                      <span className="text-gray-300">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Statut</label>
                <select
                  value={editingEmployee?.status || ''}
                  onChange={(e) => setEditingEmployee({...editingEmployee, status: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  onChange={(e) => setEditingEmployee({...editingEmployee, notes: e.target.value})}
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
