'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useToastNotification } from '@/components/ui/ToastNotification'

interface CustomPlan {
  id: string
  name: string
  price: number
  features: string[]
  duration: string
  isActive: boolean
}

interface PlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (plan: CustomPlan) => void
  editingPlan?: CustomPlan | null
}

const DEFAULT_FEATURES = [
  'Gestion des ventes',
  'Gestion des stocks',
  'Rapports détaillés',
  'Multi-utilisateurs',
  'Gestion des clients',
  'Facturation',
  'Livraison',
  'Table service',
  'Impression tickets',
  'Gestion des dettes',
  'Analytique avancée',
  'Exportation données',
  'API intégrée',
  'Support prioritaire'
]

export default function PlanModal({ isOpen, onClose, onSave, editingPlan }: PlanModalProps) {
  const { error: showError } = useToastNotification()
  const [formData, setFormData] = useState<CustomPlan>(
    editingPlan || {
      id: '',
      name: '',
      price: 0,
      features: [],
      duration: 'mois',
      isActive: true
    }
  )
  const [customFeature, setCustomFeature] = useState('')

  useEffect(() => {
    if (editingPlan) {
      setFormData(editingPlan)
    } else {
      setFormData({
        id: '',
        name: '',
        price: 0,
        features: [],
        duration: 'mois',
        isActive: true
      })
    }
    setCustomFeature('')
  }, [editingPlan, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || formData.price < 0) {
      showError('Erreur de validation', 'Veuillez remplir tous les champs correctement')
      return
    }

    if (formData.features.length === 0) {
      showError('Erreur de validation', 'Veuillez sélectionner au moins une fonctionnalité')
      return
    }

    onSave({
      ...formData,
      id: editingPlan?.id || Date.now().toString()
    })
  }

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const addCustomFeature = () => {
    if (customFeature.trim() && !formData.features.includes(customFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, customFeature.trim()]
      }))
      setCustomFeature('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] border border-white/20 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-semibold text-white">
            {editingPlan ? 'Modifier le plan' : 'Créer un nouveau plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom du plan
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Basic, Professional..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prix (XAF)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="25000"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Durée
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="mois">Mensuel</option>
                    <option value="trimestre">Trimestriel</option>
                    <option value="semestre">Semestriel</option>
                    <option value="annee">Annuel</option>
                  </select>
                </div>

                <div className="flex items-center justify-center">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-orange-500 bg-black/40 border-white/20 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                      Plan actif
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">
                Fonctionnalités
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEFAULT_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-black/30 rounded-lg border border-white/10 hover:bg-black/50 transition-colors">
                    <input
                      type="checkbox"
                      id={`feature-${index}`}
                      checked={formData.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="w-4 h-4 text-orange-500 bg-black/40 border-white/20 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <label 
                      htmlFor={`feature-${index}`} 
                      className="text-sm text-gray-300 cursor-pointer flex-1 select-none"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>

              {/* Custom Feature Addition */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-400">Ajouter une fonctionnalité personnalisée:</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customFeature}
                    onChange={(e) => setCustomFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFeature())}
                    className="flex-1 px-4 py-2 bg-black/40 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Ex: Gestion des ventes personnalisée"
                  />
                  <button
                    type="button"
                    onClick={addCustomFeature}
                    className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Selected Features Summary */}
              {formData.features.length > 0 && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <h4 className="text-green-300 font-medium mb-2">Fonctionnalités sélectionnées ({formData.features.length}):</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.features.map((feature, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 bg-green-500/30 text-green-300 text-sm rounded-full border border-green-500/40"
                      >
                        {feature}
                        <button
                          type="button"
                          onClick={() => toggleFeature(feature)}
                          className="ml-2 text-green-400 hover:text-green-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary Section */}
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Récapitulatif:</h4>
              <p className="text-blue-300 text-sm">
                <strong>{formData.name || 'Nom du plan'}</strong> - {formData.price.toLocaleString('fr-GA')} XAF/{formData.duration}
              </p>
              {formData.features.filter(f => f.trim()).length > 0 && (
                <div className="mt-2">
                  <p className="text-blue-300 text-sm font-medium">Fonctionnalités:</p>
                  <ul className="text-blue-200 text-sm mt-1 space-y-1">
                    {formData.features.filter(f => f.trim()).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-white/10 shrink-0 bg-gray-900">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            {editingPlan ? 'Mettre à jour' : 'Créer le plan'}
          </button>
        </div>
      </div>
    </div>
  )
}
