'use client'

import { useState } from 'react'
import { Search, Plus, Edit2, Trash2, Building2, Mail, Phone, MapPin, Grid, List } from 'lucide-react'

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  siret: string
  paymentTerms: string
  notes: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function FournisseursPage() {
  // RADICAL : données mock chargées directement sans délai artificiel
  const [suppliers] = useState<Supplier[]>([
    {
      id: '1',
      name: 'TechSupply Africa',
      email: 'contact@techsupply.com',
      phone: '+241 07 23 45 67',
      address: 'Libreville, Gabon',
      siret: '12345678901234',
      paymentTerms: '30 jours',
      notes: 'Fournisseur principal pour matériel informatique',
      isActive: true,
      createdAt: '2023-01-15',
      updatedAt: '2024-03-10'
    },
    {
      id: '2',
      name: 'FoodPro Gabon',
      email: 'info@foodpro.ga',
      phone: '+241 66 12 34 56',
      address: 'Port-Gentil, Gabon',
      siret: '23456789012345',
      paymentTerms: '15 jours',
      notes: 'Fournisseur de produits alimentaires',
      isActive: true,
      createdAt: '2023-03-20',
      updatedAt: '2024-03-08'
    },
    {
      id: '3',
      name: 'OfficePlus',
      email: 'contact@officeplus.com',
      phone: '+241 77 23 45 67',
      address: 'Franceville, Gabon',
      siret: '34567890123456',
      paymentTerms: '45 jours',
      notes: 'Fournisseur de matériel de bureau',
      isActive: false,
      createdAt: '2023-06-10',
      updatedAt: '2024-02-28'
    }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm)
  )

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Actif' : 'Inactif'
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Fournisseurs</h1>
        <p className="text-gray-400 text-sm md:text-base">Gestion des fournisseurs et partenaires</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <Building2 className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">{suppliers.length}</span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Total fournisseurs</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 bg-green-500 rounded-full"></div>
            <span className="text-2xl font-bold text-white">
              {suppliers.filter(s => s.isActive).length}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Fournisseurs actifs</p>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 bg-orange-500 rounded-full"></div>
            <span className="text-2xl font-bold text-white">
              {suppliers.filter(s => !s.isActive).length}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-2">Fournisseurs inactifs</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white/10 text-gray-400 hover:bg-white/20'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="space-y-4">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-white">{supplier.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(supplier.isActive)}`}>
                    {getStatusText(supplier.isActive)}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300 flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {supplier.email}
                  </p>
                  <p className="text-gray-300 flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {supplier.phone}
                  </p>
                  <p className="text-gray-300 flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {supplier.address}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingSupplier(supplier)}
                  className="p-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 rounded hover:bg-blue-500/20"
                  title="Modifier"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 rounded hover:bg-red-500/20"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucun fournisseur trouvé</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un fournisseur'}
          </p>
        </div>
      )}
    </div>
  )
}
