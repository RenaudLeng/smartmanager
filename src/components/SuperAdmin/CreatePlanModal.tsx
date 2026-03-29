'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Check, CreditCard, Calendar, DollarSign, Star, Zap, Crown, Building2 } from 'lucide-react'

interface PlanFeature {
  id: string
  name: string
  included: boolean
}

interface CreatePlanModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (planData: any) => Promise<void>
}

const defaultFeatures = [
  { id: 'unlimited_tenants', name: 'Tenants illimités', icon: Building2 },
  { id: 'advanced_analytics', name: 'Analyses avancées', icon: Zap },
  { id: 'priority_support', name: 'Support prioritaire', icon: Star },
  { id: 'custom_branding', name: 'Branding personnalisé', icon: Crown },
  { id: 'api_access', name: 'Accès API complet', icon: CreditCard },
  { id: 'advanced_reports', name: 'Rapports personnalisés', icon: DollarSign },
]

export default function CreatePlanModal({ isOpen, onClose, onSubmit }: CreatePlanModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [planName, setPlanName] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState<'monthly' | 'yearly'>('monthly')
  const [isActive, setIsActive] = useState(true)
  const [features, setFeatures] = useState<PlanFeature[]>(
    defaultFeatures.map(f => ({ ...f, included: false }))
  )
  const [customFeature, setCustomFeature] = useState('')

  const addCustomFeature = () => {
    if (customFeature.trim()) {
      const newFeature: PlanFeature = {
        id: `custom_${Date.now()}`,
        name: customFeature.trim(),
        included: true
      }
      setFeatures([...features, newFeature])
      setCustomFeature('')
    }
  }

  const removeFeature = (featureId: string) => {
    setFeatures(features.filter(f => f.id !== featureId))
  }

  const toggleFeature = (featureId: string) => {
    setFeatures(features.map(f => 
      f.id === featureId ? { ...f, included: !f.included } : f
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!planName.trim()) {
      alert('Veuillez entrer un nom de plan')
      return
    }

    const planData = {
      name: planName.trim(),
      price: parseFloat(price) || 0,
      duration,
      isActive,
      features: features.filter(f => f.included).map(f => f.name)
    }

    try {
      await onSubmit(planData)
      // Reset form
      setPlanName('')
      setPrice('')
      setDuration('monthly')
      setIsActive(true)
      setFeatures(defaultFeatures.map(f => ({ ...f, included: false })))
      setCustomFeature('')
      setCurrentStep(1)
      onClose()
    } catch (error) {
      console.error('Erreur lors de la création du plan:', error)
    }
  }

  const getPlanIcon = () => {
    if (planName.toLowerCase().includes('basic')) return CreditCard
    if (planName.toLowerCase().includes('pro')) return Star
    if (planName.toLowerCase().includes('premium') || planName.toLowerCase().includes('enterprise')) return Crown
    return CreditCard
  }

  const PlanIcon = getPlanIcon()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <PlanIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Créer un nouveau plan</h2>
                <p className="text-orange-100 text-sm">Configurez votre plan d'abonnement</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-orange-400' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-orange-500 text-white' : 'bg-slate-700'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Informations générales</span>
              </div>
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-orange-400' : 'text-slate-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-orange-500 text-white' : 'bg-slate-700'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Fonctionnalités</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[calc(95vh-200px)] overflow-y-auto">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom du plan */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nom du plan</label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Ex: Basic, Professional..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Prix */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Prix (XAF)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Durée */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Durée</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setDuration('monthly')}
                      className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                        duration === 'monthly'
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Mensuel
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration('yearly')}
                      className={`flex-1 px-4 py-3 rounded-lg border transition-colors ${
                        duration === 'yearly'
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Annuel
                    </button>
                  </div>
                </div>

                {/* Plan actif */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Plan actif</label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 text-orange-500 bg-slate-800 border-slate-600 rounded focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="text-slate-300">Activer ce plan immédiatement</span>
                  </label>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Continuer vers les fonctionnalités
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Fonctionnalités</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature) => {
                    const IconComponent = defaultFeatures.find(f => f.id === feature.id)?.icon || Star
                    return (
                      <div
                        key={feature.id}
                        onClick={() => toggleFeature(feature.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          feature.included
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              feature.included ? 'bg-orange-500' : 'bg-slate-700'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{feature.name}</span>
                          </div>
                          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                            feature.included
                              ? 'bg-orange-500 border-orange-500'
                              : 'bg-slate-700 border-slate-600'
                          }`}>
                            {feature.included && <Check className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add Custom Feature */}
                <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Ajouter une fonctionnalité personnalisée:</h4>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customFeature}
                      onChange={(e) => setCustomFeature(e.target.value)}
                      placeholder="Ex: Gestion des ventes personnalisée"
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={addCustomFeature}
                      className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Récapitulatif:</h4>
                <div className="text-white">
                  <span className="font-semibold">{planName || 'Nouveau plan'}</span>
                  <span className="text-slate-400"> - </span>
                  <span className="font-semibold">{price || '0'} XAF/{duration === 'monthly' ? 'mois' : 'an'}</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Retour
                </button>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Créer le plan
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
