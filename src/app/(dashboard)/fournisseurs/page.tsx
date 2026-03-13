'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, Building2, Phone, Mail, MapPin, Edit, Trash2, Grid, List } from 'lucide-react'

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
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    setTimeout(() => {
      const mockSuppliers: Supplier[] = [
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
          name: 'Distribution Plus',
          email: 'info@distplus.ga',
          phone: '+241 06 78 90 12',
          address: 'Port-Gentil, Gabon',
          siret: '98765432109876',
          paymentTerms: '15 jours',
          notes: 'Distribution pour produits de grande consommation',
          isActive: true,
          createdAt: '2023-11-20',
          updatedAt: '2024-02-15'
        },
        {
          id: '3',
          name: 'Boissons du Gabon',
          email: 'boissons@boissons-gabon.ga',
          phone: '+241 02 34 56 78',
          address: 'Libreville, Gabon',
          siret: '87654321098765',
          paymentTerms: '15 jours fin de mois',
          notes: 'Fournisseur boissons et rafraîchissements',
          isActive: true,
          createdAt: '2024-02-10',
          updatedAt: '2024-03-01'
        },
        {
          id: '4',
          name: 'Office National',
          email: 'contact@office-national.ga',
          phone: '+241 01 23 45 67',
          address: 'Libreville, Centre-ville',
          siret: '55555555555555',
          paymentTerms: '30 jours fin de mois',
          notes: 'Fournisseur officiel',
          isActive: false,
          createdAt: '2022-05-10',
          updatedAt: '2024-01-20'
        }
      ]
      setSuppliers(mockSuppliers)
      setLoading(false)
    }, 100)
  }, [])

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone.includes(searchTerm)
  )

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setShowModal(true)
  }

  const handleDelete = (id: string) => {
    console.log('Suppression du fournisseur:', id)
  }

  const handleAdd = () => {
    setEditingSupplier(null)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <p className="text-white mt-4">Chargement des fournisseurs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Gestion des Fournisseurs</h1>
        <p className="text-gray-400 text-sm md:text-base">Suivez et gérez vos relations fournisseurs</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2">
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
          <button
            onClick={handleAdd}
            className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-orange-500/25 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            Ajouter un fournisseur
          </button>
        </div>
      </div>

      {/* Suppliers Display - Grid or List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="font-medium text-white">{supplier.name}</p>
                    <p className="text-sm text-gray-400">{supplier.siret}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 text-xs rounded-full ${supplier.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {supplier.isActive ? 'Actif' : 'Inactif'}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-400">
                  <Mail className="h-4 w-4 mr-2" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="truncate">{supplier.address}</span>
                </div>
                <div className="text-gray-400">
                  <span className="font-medium">Paiement:</span> {supplier.paymentTerms}
                </div>
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => handleEdit(supplier)}
                  className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/60 border-b border-white/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">SIRET</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Paiement</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-orange-400" />
                        <div>
                          <div className="text-sm font-medium text-white">{supplier.name}</div>
                          <div className="text-sm text-gray-400">{supplier.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className="text-white">{supplier.email}</div>
                        <div className="text-gray-400">{supplier.phone}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">{supplier.siret}</td>
                    <td className="px-4 py-4 text-sm text-gray-400">{supplier.paymentTerms}</td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${supplier.isActive ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                        {supplier.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier.id)}
                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-medium transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3" />
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingSupplier ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                <input
                  type="text"
                  defaultValue={editingSupplier?.name || ''}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={editingSupplier?.email || ''}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
                <input
                  type="tel"
                  defaultValue={editingSupplier?.phone || ''}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
                <input
                  type="text"
                  defaultValue={editingSupplier?.address || ''}
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
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium shadow-lg shadow-orange-500/25"
              >
                {editingSupplier ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
