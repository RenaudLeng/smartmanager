'use client'

import { useState } from 'react'
import { 
  Wallet, 
  TrendingUp, 
  PieChart, 
  Target, 
  Clock,
  DollarSign
} from 'lucide-react'

export default function TresoreriePage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Trésorerie</h1>
        <p className="text-gray-400 text-sm md:text-base">Gestion financière et suivi de trésorerie</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg p-1 overflow-x-auto">
        {['overview', 'budget', 'cashflow', 'analysis', 'reports'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab === 'overview' ? 'Aperçu' : 
             tab === 'budget' ? 'Budget' :
             tab === 'cashflow' ? 'Flux' :
             tab === 'analysis' ? 'Analyse' : 'Rapports'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">850k</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Trésorerie disponible</p>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">2.5M</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Revenus totaux</p>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">70%</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">ROI</p>
              </div>
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-white">14j</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Runway</p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Résumé financier</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Revenus totaux</span>
                    <span className="text-green-400 font-medium">2,500,000 XAF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Dépenses totales</span>
                    <span className="text-red-400 font-medium">1,800,000 XAF</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-white/10">
                    <span className="text-white font-medium">Bénéfice net</span>
                    <span className="text-green-400 font-bold">700,000 XAF</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">KPIs quotidiens</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Revenu moyen/jour</span>
                    <span className="text-blue-400 font-medium">83,333 XAF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Dépense moyenne/jour</span>
                    <span className="text-orange-400 font-medium">60,000 XAF</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Cash burn rate</span>
                    <span className="text-red-400 font-medium">60,000 XAF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-colors">
                <div className="text-orange-400 text-2xl mb-2">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h4 className="text-white font-medium">Ajouter une transaction</h4>
                <p className="text-gray-400 text-sm">Enregistrer revenu ou dépense</p>
              </button>

              <button className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-colors">
                <div className="text-orange-400 text-2xl mb-2">
                  <PieChart className="h-6 w-6" />
                </div>
                <h4 className="text-white font-medium">Créer une ligne budgétaire</h4>
                <p className="text-gray-400 text-sm">Ajouter fonds ou prêt</p>
              </button>

              <button className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg p-4 text-left transition-colors">
                <div className="text-orange-400 text-2xl mb-2">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h4 className="text-white font-medium">Générer un rapport</h4>
                <p className="text-gray-400 text-sm">Analyse périodique</p>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <PieChart className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Gestion budgétaire</h3>
            <p className="text-gray-400">Module de gestion des lignes budgétaires en cours de développement</p>
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <TrendingUp className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Suivi des flux</h3>
            <p className="text-gray-400">Module de suivi des transactions en cours de développement</p>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <Target className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Analyse financière</h3>
            <p className="text-gray-400">Module d&apos;analyse financière en cours de développement</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 flex justify-center">
              <DollarSign className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Rapports financiers</h3>
            <p className="text-gray-400">Module de génération de rapports en cours de développement</p>
          </div>
        )}
      </div>
    </div>
  )
}
