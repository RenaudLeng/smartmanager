'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, DollarSign, TrendingDown, Calendar, Edit, Trash2, Grid, List } from 'lucide-react'
import { useNotifications, useConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  paymentMethod: string
  receipt: string
  notes: string
  createdAt: string
  updatedAt: string
}

export default function DepensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  
  const { showNotification, NotificationComponent } = useNotifications()
  const { confirm, ConfirmDialogComponent } = useConfirmDialog()

  const categories = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'fourniture', label: 'Fournitures et matériel' },
    { value: 'personnel', label: 'Personnel et salaires' },
    { value: 'loyer', label: 'Loyer et charges' },
    { value: 'energie', label: 'Énergie et communications' },
    { value: 'transport', label: 'Transport et logistique' },
    { value: 'marketing', label: 'Marketing et publicité' },
    { value: 'maintenance', label: 'Maintenance et réparations' },
    { value: 'autre', label: 'Autres dépenses' }
  ]

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const token = localStorage.getItem('token')
      const resetFlag = localStorage.getItem('smartmanager-reset')

      // Charger les dépenses
      const expensesResponse = await fetch('/api/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-reset-flag': resetFlag || 'false'
        }
      })

      // Charger les stats pour le budget mensuel
      const statsResponse = await fetch('/api/expenses/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-reset-flag': resetFlag || 'false'
        }
      })

      if (expensesResponse.ok) {
        const expensesResult = await expensesResponse.json()
        setExpenses(expensesResult.data || [])
      } else {
        console.error('Failed to load expenses')
        setExpenses([])
      }

      if (statsResponse.ok) {
        // Le budget mensuel est une valeur fixe pour l'instant, mais pourrait venir de l'API
        setMonthlyBudget(500000) // 500k XAF
      } else {
        setMonthlyBudget(0)
      }
    } catch (error) {
      console.error('Error loading expenses:', error)
      setExpenses([])
      setMonthlyBudget(0)
    } finally {
      setLoading(false)
    }
  }

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category === selectedCategory
  )

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fourniture':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'personnel':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'loyer':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'energie':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'transport':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'marketing':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'maintenance':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setShowModal(true)
  }

  const handleRowClick = (expense: Expense) => {
    setSelectedExpense(expense)
    setShowDetails(true)
  }

  const handleAdd = () => {
    setEditingExpense({
      id: Date.now().toString(),
      description: '',
      amount: 0,
      category: '',
      date: '',
      paymentMethod: '',
      receipt: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (editingExpense) {
      console.log('Sauvegarde de la dépense:', editingExpense)
      setShowModal(false)
      setEditingExpense(null)
    }
  }

  const handleDeleteExpense = useCallback(async (expense: Expense) => {
    const confirmed = await confirm({
      title: 'Confirmer la suppression',
      message: 'Êtes-vous sûr de vouloir supprimer cette dépense ?',
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      itemDetails: {
        title: expense.description,
        subtitle: `${expense.category} • ${expense.date}`,
        amount: `${expense.amount.toLocaleString('fr-GA')} XAF`
      }
    })

    if (confirmed) {
      try {
        // Simuler la suppression de la dépense
        showNotification(
          'success', 
          `Dépense "${expense.description}" supprimée avec succès!`
        )
        console.log('Dépense supprimée:', expense.id)
      } catch (error) {
        showNotification(
          'error', 
          'Erreur lors de la suppression de la dépense. Veuillez réessayer.'
        )
        console.error('Erreur suppression dépense:', error)
      }
    }
  }, [confirm, showNotification])

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2 font-serif">Dépenses</h1>
        <p className="text-gray-200 text-sm md:text-base">Suivez et gérez toutes vos dépenses opérationnelles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-gray-400 text-sm">Total dépenses</p>
                <p className="text-2xl font-bold text-white">{(getTotalExpenses() / 1000).toFixed(1)}k XAF</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-orange-400" />
              <div>
                <p className="text-gray-400 text-sm">Ce mois</p>
                <p className="text-2xl font-bold text-orange-400">{(expenses.filter(e => e.category === 'all').reduce((total, expense) => total + expense.amount, 0) / 1000).toFixed(1)}k XAF</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Budget mensuel</p>
                <p className="text-2xl font-bold text-green-400">
                  {monthlyBudget > 0 ? `${(monthlyBudget / 1000).toFixed(0)}k XAF` : '0k XAF'}
                </p>
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
            placeholder="Rechercher une dépense..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Toutes catégories</option>
            {categories.filter(cat => cat.value !== 'all').map(category => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
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
          <button
            onClick={handleAdd}
            className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white p-2 rounded-lg font-medium shadow-lg shadow-orange-500/25"
            title="Ajouter une dépense"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Expenses Display - Grid or List View */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des dépenses...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Aucune dépense trouvée</h3>
          <p className="text-gray-400">
            {searchTerm || selectedCategory !== 'all' ? 'Essayez de modifier votre recherche' : 'Commencez par ajouter une dépense'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExpenses.map((expense) => (
            <div key={expense.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-10 h-10 rounded-full ${getCategoryColor(expense.category)}`}>
                      <span className="text-white text-xs font-medium">
                        {expense.category === 'fourniture' ? 'F' : expense.category === 'personnel' ? 'P' : expense.category === 'loyer' ? 'L' : expense.category === 'energie' ? 'E' : expense.category === 'transport' ? 'T' : expense.category === 'marketing' ? 'M' : expense.category === 'maintenance' ? 'Ma' : 'A'}
                      </span>
                    </div>
                    <div className="text-white">
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-400">{expense.amount.toLocaleString('fr-GA')} XAF</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">{expense.date}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      {expense.paymentMethod === 'Virement bancaire' ? 'VB' : expense.paymentMethod === 'Espèces' ? 'ES' : expense.paymentMethod === 'Carte de crédit' ? 'CC' : 'LIQ'}
                    </span>
                    <button
                      onClick={() => handleEdit(expense)}
                      className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense)}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dépense</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Méthode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredExpenses.map((expense) => (
                  <tr 
                    key={expense.id} 
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(expense)}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full ${getCategoryColor(expense.category)}`}>
                          <span className="text-white text-xs font-medium">
                            {expense.category === 'fourniture' ? 'F' : expense.category === 'personnel' ? 'P' : expense.category === 'loyer' ? 'L' : expense.category === 'energie' ? 'E' : expense.category === 'transport' ? 'T' : expense.category === 'marketing' ? 'M' : expense.category === 'maintenance' ? 'Ma' : 'A'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{expense.description}</div>
                          {expense.receipt && (
                            <div className="text-xs text-gray-400">Reçu: {expense.receipt}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        {expense.category === 'fourniture' ? 'Fournitures' : expense.category === 'personnel' ? 'Personnel' : expense.category === 'loyer' ? 'Loyer' : expense.category === 'energie' ? 'Énergie' : expense.category === 'transport' ? 'Transport' : expense.category === 'marketing' ? 'Marketing' : expense.category === 'maintenance' ? 'Maintenance' : 'Autre'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-400">{expense.date}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                        {expense.paymentMethod === 'Virement bancaire' ? 'VB' : expense.paymentMethod === 'Espèces' ? 'ES' : expense.paymentMethod === 'Carte de crédit' ? 'CC' : 'LIQ'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-red-400 font-semibold">
                      {expense.amount.toLocaleString('fr-GA')} XAF
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetails && selectedExpense && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">Détails de la dépense</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Plus className="h-6 w-6 rotate-45" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Informations générales</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Description:</span>
                    <span className="text-white font-medium">{selectedExpense.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Montant:</span>
                    <span className="text-red-400 font-bold">{selectedExpense.amount.toLocaleString('fr-GA')} XAF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{selectedExpense.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Catégorie:</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedExpense.category)}`}>
                      {selectedExpense.category === 'fourniture' ? 'Fournitures' : selectedExpense.category === 'personnel' ? 'Personnel' : selectedExpense.category === 'loyer' ? 'Loyer' : selectedExpense.category === 'energie' ? 'Énergie' : selectedExpense.category === 'transport' ? 'Transport' : selectedExpense.category === 'marketing' ? 'Marketing' : selectedExpense.category === 'maintenance' ? 'Maintenance' : 'Autre'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Paiement et documents</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Méthode:</span>
                    <span className="text-white">{selectedExpense.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reçu:</span>
                    <span className="text-white">{selectedExpense.receipt || 'Non spécifié'}</span>
                  </div>
                  {selectedExpense.notes && (
                    <div className="mt-3">
                      <span className="text-gray-400">Notes:</span>
                      <p className="text-white mt-1">{selectedExpense.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDetails(false)
                  handleDeleteExpense(selectedExpense)
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={() => {
                  setShowDetails(false)
                  handleEdit(selectedExpense)
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Modifier
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white">
                {editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={editingExpense?.description || ''}
                    onChange={(e) => setEditingExpense({...editingExpense!, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Montant (XAF)</label>
                  <input
                    type="number"
                    value={editingExpense?.amount || ''}
                    onChange={(e) => setEditingExpense({...editingExpense!, amount: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Catégorie</label>
                  <select
                    value={editingExpense?.category || ''}
                    onChange={(e) => setEditingExpense({...editingExpense!, category: e.target.value})}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Sélectionner...</option>
                    {categories.filter(cat => cat.value !== 'all').map(category => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={editingExpense?.date || ''}
                    onChange={(e) => setEditingExpense({...editingExpense!, date: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Méthode de paiement</label>
                  <select
                    value={editingExpense?.paymentMethod || ''}
                    onChange={(e) => setEditingExpense({...editingExpense!, paymentMethod: e.target.value})}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Virement bancaire">Virement bancaire</option>
                    <option value="Espèces">Espèces</option>
                    <option value="Carte de crédit">Carte de crédit</option>
                    <option value="Espèces">Espèces</option>
                    <option value="Liquide">Liquide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reçu</label>
                  <input
                    type="text"
                    value={editingExpense?.receipt || ''}
                    onChange={(e) => setEditingExpense({...editingExpense!, receipt: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={editingExpense?.notes || ''}
                    onChange={(e) => setEditingExpense({...editingExpense!, notes: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/20">
              <div className="flex justify-end space-x-4">
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
                  {editingExpense ? 'Mettre à jour' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Composants partagés */}
      <>
        <ConfirmDialogComponent />
        <NotificationComponent />
      </>
    </div>
  )
}
