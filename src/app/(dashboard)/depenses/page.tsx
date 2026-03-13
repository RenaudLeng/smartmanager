'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Plus, DollarSign, TrendingDown, Calendar, Filter, Edit, Trash2, Grid, List } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
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

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      const mockExpenses: Expense[] = [
        {
          id: '1',
          description: 'Achat de matériel informatique',
          amount: 250000,
          category: 'fourniture',
          date: '2024-03-10',
          paymentMethod: 'Virement bancaire',
          receipt: 'FACT-2024-03-001',
          notes: 'Achat ordinateur portable pour bureau',
          createdAt: '2024-03-10',
          updatedAt: '2024-03-10'
        },
        {
          id: '2',
          description: 'Salaires du mois',
          amount: 850000,
          category: 'personnel',
          date: '2024-03-15',
          paymentMethod: 'Virement bancaire',
          receipt: 'VIREMENT-2024-03',
          notes: 'Salaires employés Mars',
          createdAt: '2024-03-15',
          updatedAt: '2024-03-15'
        },
        {
          id: '3',
          description: 'Loyer bureau',
          amount: 150000,
          category: 'loyer',
          date: '2024-03-20',
          paymentMethod: 'Espèces',
          receipt: 'RECU-2024-03-020',
          notes: 'Loyer bureau quartier Plateau',
          createdAt: '2024-03-20',
          updatedAt: '2024-03-20'
        },
        {
          id: '4',
          description: 'Facture électricité',
          amount: 45000,
          category: 'energie',
          date: '2024-03-25',
          paymentMethod: 'Carte de crédit',
          receipt: 'FACT-2024-03-025',
          notes: 'Consommation SENELEC',
          createdAt: '2024-03-25',
          updatedAt: '2024-03-25'
        },
        {
          id: '5',
          description: 'Transport livraison produits',
          amount: 75000,
          category: 'transport',
          date: '2024-03-05',
          paymentMethod: 'Espèces',
          receipt: 'RECU-2024-03-005',
          notes: 'Livraison fournisseur Port-Gentil',
          createdAt: '2024-03-05',
          updatedAt: '2024-03-05'
        }
      ]
      setExpenses(mockExpenses)
      setLoading(false)
    }, 1000)
  }, [])

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
        setExpenses(prev => prev.filter(e => e.id !== expense.id))
        
        // Afficher la notification de succès
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
                <p className="text-2xl font-bold text-green-400">500k XAF</p>
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
            className="bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-orange-500/25 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            Ajouter une dépense
          </button>
        </div>
      </div>

      {/* Expenses Display - Grid or List View */}
      {viewMode === 'grid' ? (
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-white/5 transition-colors">
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
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-medium transition-colors"
                          title="Modifier"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense)}
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
              {editingExpense ? 'Modifier la dépense' : 'Ajouter une dépense'}
            </h2>
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
                {editingExpense ? 'Mettre à jour' : 'Ajouter'}
              </button>
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
