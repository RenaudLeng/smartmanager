'use client'

import { useState, useEffect } from 'react'
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
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    siret: '',
    paymentTerms: '30 jours',
    notes: '',
    isActive: true
  })

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      const token = localStorage.getItem('token')
      const resetFlag = localStorage.getItem('smartmanager-reset')

      const response = await fetch('/api/suppliers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-reset-flag': resetFlag || 'false'
        }
      })

      if (response.ok) {
        const result = await response.json()
        setSuppliers(result.data || [])
      } else {
        console.error('Failed to load suppliers')
        setSuppliers([])
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
      setSuppliers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddSupplier = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      siret: '',
      paymentTerms: '30 jours',
      notes: '',
      isActive: true
    })
    setEditingSupplier(null)
    setShowModal(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      siret: supplier.siret,
      paymentTerms: supplier.paymentTerms,
      notes: supplier.notes,
      isActive: supplier.isActive
    })
    setEditingSupplier(supplier)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : '/api/suppliers'
      const method = editingSupplier ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setShowModal(false)
        loadSuppliers() // Recharger la liste
      } else {
        console.error('Failed to save supplier')
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

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
              onClick={handleAddSupplier}
              className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suppliers List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des fournisseurs...</p>
        </div>
      ) : (
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
                  onClick={() => handleEditSupplier(supplier)}
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
      )}

      {/* Empty State */}
      {!loading && filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucun fournisseur trouvé</h3>
          <p className="text-gray-400">
            {searchTerm ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter un fournisseur'}
          </p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingSupplier ? 'Modifier le fournisseur' : 'Ajouter un fournisseur'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Nom du fournisseur *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nom du fournisseur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="email@fournisseur.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="+241 XX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Ville, Pays"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  SIRET
                </label>
                <input
                  type="text"
                  value={formData.siret}
                  onChange={(e) => setFormData({...formData, siret: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="12345678901234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Conditions de paiement
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="15 jours">15 jours</option>
                  <option value="30 jours">30 jours</option>
                  <option value="45 jours">45 jours</option>
                  <option value="60 jours">60 jours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Notes supplémentaires..."
                  rows={3}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                  Fournisseur actif
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  {editingSupplier ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
