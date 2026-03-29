'use client'

import React, { useState, useMemo } from 'react'
import { 
  Plus, Edit2, Trash2, Users, Package, HardDrive, 
  DollarSign, Check, X, Star, TrendingUp
} from 'lucide-react'
import { SUBSCRIPTION_PLANS, SubscriptionPlan, formatPrice, getLimitDisplay } from '@/config/subscriptionPlans'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function SubscriptionManager() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<string | null>(null)

  // Optimiser les calculs avec useMemo
  const stats = useMemo(() => ({
    totalPlans: plans.length,
    activePlans: plans.length,
    averagePrice: Math.round(plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length),
    popularPlan: plans.find(p => p.popular)?.name || 'Aucun'
  }), [plans])

  const handleCreatePlan = (newPlan: Omit<SubscriptionPlan, 'id'>) => {
    const id = `plan_${Date.now()}` as SubscriptionPlan['id']
    setPlans([...plans, { ...newPlan, id }])
    setShowCreateForm(false)
  }

  const handleUpdatePlan = (updatedPlan: SubscriptionPlan | Omit<SubscriptionPlan, 'id'>) => {
    if (!editingPlan) return
    
    const planWithId: SubscriptionPlan = {
      ...updatedPlan,
      id: editingPlan.id
    }
    
    setPlans(plans.map(plan => 
      plan.id === editingPlan.id ? planWithId : plan
    ))
    setEditingPlan(null)
  }

  const handleDeletePlan = (planId: string) => {
    setPlanToDelete(planId)
    setIsConfirmModalOpen(true)
  }

  const confirmDeletePlan = () => {
    if (!planToDelete) return
    setPlans(plans.filter(plan => plan.id !== planToDelete))
    setIsConfirmModalOpen(false)
    setPlanToDelete(null)
  }

  const handleFormSubmit = (planData: SubscriptionPlan | Omit<SubscriptionPlan, 'id'>) => {
    if (editingPlan) {
      handleUpdatePlan(planData)
    } else {
      handleCreatePlan(planData)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gestion des abonnements</h2>
          <p className="text-gray-400 mt-1">Configurez les plans d&apos;abonnement disponibles</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau plan</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total des plans</p>
              <p className="text-2xl font-bold text-white">{stats.totalPlans}</p>
            </div>
            <Package className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Plans actifs</p>
              <p className="text-2xl font-bold text-green-400">{stats.activePlans}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Prix moyen</p>
              <p className="text-2xl font-bold text-white">
                {stats.averagePrice.toLocaleString()} XAF
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Plan populaire</p>
              <p className="text-2xl font-bold text-orange-400">
                {stats.popularPlan}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`bg-gray-800 rounded-lg border ${
              plan.popular ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-700'
            } relative overflow-hidden`}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                Populaire
              </div>
            )}
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <p className="text-2xl font-bold text-orange-500 mt-2">{formatPrice(plan)}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-400 mb-4">{plan.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Utilisateurs
                  </span>
                  <span className="text-white font-medium">{getLimitDisplay(plan.limits.users)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Produits
                  </span>
                  <span className="text-white font-medium">{getLimitDisplay(plan.limits.products)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center">
                    <HardDrive className="h-4 w-4 mr-2" />
                    Stockage
                  </span>
                  <span className="text-white font-medium">{plan.limits.storage}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Fonctionnalités principales:</p>
                <div className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-300">
                      <Check className="h-3 w-3 mr-2 text-green-400" />
                      {feature}
                    </div>
                  ))}
                  {plan.features.length > 3 && (
                    <p className="text-xs text-gray-500">+{plan.features.length - 3} autres fonctionnalités...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingPlan) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/20 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white">
                {editingPlan ? 'Modifier le plan' : 'Nouveau plan d\'abonnement'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingPlan(null)
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <SubscriptionForm
              plan={editingPlan}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowCreateForm(false)
                setEditingPlan(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeletePlan}
        title="Supprimer le plan d'abonnement"
        message="Êtes-vous sûr de vouloir supprimer ce plan d'abonnement ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  )
}

interface SubscriptionFormProps {
  plan?: SubscriptionPlan | null
  onSubmit: (plan: SubscriptionPlan | Omit<SubscriptionPlan, 'id'>) => void
  onCancel: () => void
}

function SubscriptionForm({ plan, onSubmit, onCancel }: SubscriptionFormProps) {
  const [formData, setFormData] = useState({
    name: plan?.name || '',
    price: plan?.price || 0,
    currency: plan?.currency || 'XAF',
    period: plan?.period || 'month' as 'month' | 'year',
    description: plan?.description || '',
    popular: plan?.popular || false,
    features: plan?.features.join('\n') || '',
    limits: {
      users: plan?.limits.users || 3,
      products: plan?.limits.products || 500,
      storage: plan?.limits.storage || '1 Go',
      transactions: plan?.limits.transactions || 100
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submissionData = {
      ...formData,
      id: plan?.id || ('free' as SubscriptionPlan['id']),
      features: formData.features.split('\n').filter(f => f.trim()),
      limits: formData.limits
    }
    
    onSubmit(submissionData)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Nom du plan</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Prix (XAF)</label>
          <input
            type="number"
            required
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Période</label>
          <select
            value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value as 'month' | 'year' })}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="month">Mensuel</option>
            <option value="year">Annuel</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-3 pt-6">
          <input
            type="checkbox"
            id="popular"
            checked={formData.popular}
            onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
            className="w-4 h-4 text-orange-500 bg-gray-700 border-gray-600 rounded focus:ring-orange-500"
          />
          <label htmlFor="popular" className="text-sm font-medium text-gray-300">
            Plan populaire
          </label>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Fonctionnalités (une par ligne)</label>
        <textarea
          required
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          rows={6}
          placeholder="Gestion des stocks&#10;Rapports détaillés&#10;Support prioritaire"
          className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Limite utilisateurs</label>
          <input
            type="number"
            required
            min="-1"
            value={formData.limits.users}
            onChange={(e) => setFormData({ 
              ...formData, 
              limits: { ...formData.limits, users: parseInt(e.target.value) }
            })}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">-1 pour illimité</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Limite produits</label>
          <input
            type="number"
            required
            min="-1"
            value={formData.limits.products}
            onChange={(e) => setFormData({ 
              ...formData, 
              limits: { ...formData.limits, products: parseInt(e.target.value) }
            })}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">-1 pour illimité</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Stockage</label>
          <input
            type="text"
            required
            value={formData.limits.storage}
            onChange={(e) => setFormData({ 
              ...formData, 
              limits: { ...formData.limits, storage: e.target.value }
            })}
            className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          {plan ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  )
}
