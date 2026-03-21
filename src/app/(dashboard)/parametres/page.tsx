"use client"

import { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw, TrendingUp, DollarSign, Percent, Package } from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'

interface DashboardConfig {
  id: string
  dailyObjective: number
  dailyExpenseLimit: number
  minProfitMargin: number
  lowStockThreshold: number
  tenantId: string
}

export default function ParametresPage() {
  const [config, setConfig] = useState<DashboardConfig>({
    id: '',
    dailyObjective: 100000,
    dailyExpenseLimit: 50000,
    minProfitMargin: 15,
    lowStockThreshold: 10,
    tenantId: 'default'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard/config?tenantId=default', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Ne pas écraser les valeurs existantes mais les utiliser comme base
          setConfig(prevConfig => ({
            ...prevConfig,
            ...data.data,
            // Garder les valeurs existantes si elles sont différentes des valeurs par défaut
            dailyObjective: data.data.dailyObjective !== 100000 ? data.data.dailyObjective : prevConfig.dailyObjective,
            dailyExpenseLimit: data.data.dailyExpenseLimit !== 50000 ? data.data.dailyExpenseLimit : prevConfig.dailyExpenseLimit,
            minProfitMargin: data.data.minProfitMargin !== 15 ? data.data.minProfitMargin : prevConfig.minProfitMargin,
            lowStockThreshold: data.data.lowStockThreshold !== 10 ? data.data.lowStockThreshold : prevConfig.lowStockThreshold
          }))
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    setMessage('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard/config', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...config,
          tenantId: 'default'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessage('Configuration sauvegardée avec succès!')
          // Recharger les données pour s'assurer qu'elles sont à jour
          await loadConfig()
        } else {
          setMessage(data.error || 'Erreur lors de la sauvegarde')
        }
      } else {
        setMessage('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setMessage('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = () => {
    setConfig({
      id: config.id,
      dailyObjective: 100000,
      dailyExpenseLimit: 50000,
      minProfitMargin: 15,
      lowStockThreshold: 10,
      tenantId: 'default'
    })
    setMessage('Valeurs réinitialisées aux défauts')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des paramètres...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Paramètres du Tableau de Bord</h1>
                <p className="text-gray-600 mt-2">
                  Configurez les objectifs et limites pour votre entreprise
                </p>
              </div>
              <Settings className="h-8 w-8 text-gray-400" />
            </div>
          </div>

          {/* Message de succès/erreur */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('succès') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Objectifs de Ventes */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Objectifs de Ventes</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objectif Quotidien (XAF)
                  </label>
                  <input
                    type="number"
                    value={config.dailyObjective}
                    onChange={(e) => setConfig({...config, dailyObjective: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Actuel: {formatCurrency(config.dailyObjective)} XAF
                  </p>
                </div>
              </div>
            </div>

            {/* Contrôle des Dépenses */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <DollarSign className="h-6 w-6 text-red-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Contrôle des Dépenses</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limite Quotidienne (XAF)
                  </label>
                  <input
                    type="number"
                    value={config.dailyExpenseLimit}
                    onChange={(e) => setConfig({...config, dailyExpenseLimit: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50000"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Actuel: {formatCurrency(config.dailyExpenseLimit)} XAF
                  </p>
                </div>
              </div>
            </div>

            {/* Rentabilité */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Percent className="h-6 w-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Rentabilité</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marge Bénéficiaire Minimale (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={config.minProfitMargin}
                    onChange={(e) => setConfig({...config, minProfitMargin: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Actuel: {config.minProfitMargin}%
                  </p>
                </div>
              </div>
            </div>

            {/* Gestion des Stocks */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 text-orange-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Gestion des Stocks</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seuil d&apos;Alerte de Stock Bas
                  </label>
                  <input
                    type="number"
                    value={config.lowStockThreshold}
                    onChange={(e) => setConfig({...config, lowStockThreshold: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Alertez quand le stock est inferieur a {config.lowStockThreshold} unites
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  onClick={resetToDefaults}
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Réinitialiser aux Défauts
                </button>
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </div>
          </div>

          {/* Informations */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Impact de ces paramètres</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <strong>Objectif Quotidien:</strong> Définit l&apos;objectif de ventes pour le calcul de progression dans le tableau de bord.
              </div>
              <div>
                <strong>Limite Quotidienne:</strong> Alertes lorsque les dépenses dépassent ce montant.
              </div>
              <div>
                <strong>Marge Minimale:</strong> Indicateur de performance lorsque la marge est inferieure a ce seuil.
              </div>
              <div>
                <strong>Seuil de Stock:</strong> Alertes lorsque les produits ont moins de ce nombre d&apos;unités.
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
