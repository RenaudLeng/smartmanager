'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Building, DollarSign, CreditCard, Target } from 'lucide-react'
import { useFinancial } from '@/hooks/useFinancial'
import { BudgetLine } from '@/types/financial'

export function BudgetLineManager() {
  const { state, actions } = useFinancial()
  const [showModal, setShowModal] = useState(false)
  const [editingLine, setEditingLine] = useState<BudgetLine | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: 'funds' as BudgetLine['type'],
    initialAmount: '',
    currency: 'XAF',
    description: '',
    lender: '',
    interestRate: '',
    totalAmount: '',
    monthlyPayment: '',
    remainingPayments: '',
    nextPaymentDate: '',
    startDate: ''
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-GA', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const budgetData = {
        name: formData.name,
        type: formData.type,
        initialAmount: parseFloat(formData.initialAmount),
        currentAmount: parseFloat(formData.initialAmount),
        currency: formData.currency,
        description: formData.description || undefined,
        loanDetails: formData.type === 'loan' ? {
          lender: formData.lender,
          interestRate: parseFloat(formData.interestRate),
          totalAmount: parseFloat(formData.totalAmount),
          monthlyPayment: parseFloat(formData.monthlyPayment),
          remainingPayments: parseInt(formData.remainingPayments),
          nextPaymentDate: formData.nextPaymentDate || undefined,
          startDate: formData.startDate
        } : undefined
      }

      if (editingLine) {
        await actions.updateBudgetLine(editingLine.id, budgetData)
      } else {
        await actions.createBudgetLine(budgetData)
      }

      setShowModal(false)
      setEditingLine(null)
      resetForm()
    } catch (error) {
      console.error('Erreur lors de la création de la ligne budgétaire:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'funds',
      initialAmount: '',
      currency: 'XAF',
      description: '',
      lender: '',
      interestRate: '',
      totalAmount: '',
      monthlyPayment: '',
      remainingPayments: '',
      nextPaymentDate: '',
      startDate: ''
    })
  }

  const handleEdit = (line: BudgetLine) => {
    setEditingLine(line)
    setFormData({
      name: line.name,
      type: line.type,
      initialAmount: line.initialAmount.toString(),
      currency: line.currency,
      description: line.description || '',
      lender: line.loanDetails?.lender || '',
      interestRate: line.loanDetails?.interestRate?.toString() || '',
      totalAmount: line.loanDetails?.totalAmount?.toString() || '',
      monthlyPayment: line.loanDetails?.monthlyPayment?.toString() || '',
      remainingPayments: line.loanDetails?.remainingPayments?.toString() || '',
      nextPaymentDate: line.loanDetails?.nextPaymentDate || '',
      startDate: line.loanDetails?.startDate || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ligne budgétaire ?')) {
      await actions.deleteBudgetLine(id)
    }
  }

  const getTypeIcon = (type: BudgetLine['type']) => {
    switch (type) {
      case 'funds':
        return <DollarSign className="h-5 w-5 text-green-400" />
      case 'loan':
        return <CreditCard className="h-5 w-5 text-blue-400" />
      case 'investment':
        return <Target className="h-5 w-5 text-purple-400" />
      default:
        return <Building className="h-5 w-5 text-gray-400" />
    }
  }

  const getTypeLabel = (type: BudgetLine['type']) => {
    switch (type) {
      case 'funds':
        return 'Fonds propres'
      case 'loan':
        return 'Prêt'
      case 'investment':
        return 'Investissement'
      case 'grant':
        return 'Subvention'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Lignes budgétaires</h2>
          <p className="text-gray-400">Gérez vos sources de financement</p>
        </div>
        <button
          onClick={() => {
            setEditingLine(null)
            resetForm()
            setShowModal(true)
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ajouter une ligne</span>
        </button>
      </div>

      {/* Budget Lines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.budgetLines.map((line) => (
          <div key={line.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getTypeIcon(line.type)}
                <div>
                  <h3 className="text-white font-semibold">{line.name}</h3>
                  <p className="text-gray-400 text-sm">{getTypeLabel(line.type)}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(line)}
                  className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(line.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Montant initial:</span>
                <span className="text-white font-medium">{formatCurrency(line.initialAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Montant actuel:</span>
                <span className="text-white font-medium">{formatCurrency(line.currentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Utilisé:</span>
                <span className="text-white font-medium">
                  {formatCurrency(line.initialAmount - line.currentAmount)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((line.initialAmount - line.currentAmount) / line.initialAmount) * 100}%` 
                    }}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {((line.initialAmount - line.currentAmount) / line.initialAmount * 100).toFixed(1)}% utilisé
                </p>
              </div>

              {line.description && (
                <p className="text-gray-300 text-sm mt-3">{line.description}</p>
              )}

              {line.loanDetails && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Prêteur:</span>
                    <span className="text-white text-sm">{line.loanDetails.lender}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Taux d'intérêt:</span>
                    <span className="text-white text-sm">{line.loanDetails.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Mensualité:</span>
                    <span className="text-white text-sm">{formatCurrency(line.loanDetails.monthlyPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Restant à payer:</span>
                    <span className="text-white text-sm">{line.loanDetails.remainingPayments} mois</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingLine ? 'Modifier la ligne budgétaire' : 'Ajouter une ligne budgétaire'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Fonds propres initiaux"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as BudgetLine['type'] })}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="funds">Fonds propres</option>
                    <option value="loan">Prêt</option>
                    <option value="investment">Investissement</option>
                    <option value="grant">Subvention</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Montant initial</label>
                  <input
                    type="number"
                    value={formData.initialAmount}
                    onChange={(e) => setFormData({ ...formData, initialAmount: e.target.value })}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="1000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Devise</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="XAF">XAF</option>
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Description détaillée..."
                  rows={3}
                />
              </div>

              {/* Loan Details */}
              {formData.type === 'loan' && (
                <div className="space-y-4 pt-4 border-t border-white/20">
                  <h4 className="text-white font-semibold">Détails du prêt</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Prêteur</label>
                      <input
                        type="text"
                        value={formData.lender}
                        onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                        className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Nom de la banque ou prêteur"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Taux d'intérêt (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.interestRate}
                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                        className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="8.5"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Montant total du prêt</label>
                      <input
                        type="number"
                        value={formData.totalAmount}
                        onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                        className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="500000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Mensualité</label>
                      <input
                        type="number"
                        value={formData.monthlyPayment}
                        onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                        className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="25000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de mensualités restantes</label>
                      <input
                        type="number"
                        value={formData.remainingPayments}
                        onChange={(e) => setFormData({ ...formData, remainingPayments: e.target.value })}
                        className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="24"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date de début</label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingLine(null)
                    resetForm()
                  }}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingLine ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
