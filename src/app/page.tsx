'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Users, 
  BarChart3, 
  Smartphone,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
      router.push('/dashboard')
    }
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Lien d'accès SuperAdmin */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => router.push('/superadmin')}
          className="bg-slate-800/90 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded-lg text-xs font-medium transition-colors border border-slate-600"
        >
          SuperAdmin
        </button>
      </div>
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Logo principal */}
            <div className="flex justify-center mb-12">
              <img 
                src="/logo.png" 
                alt="SmartManager" 
                className="h-32 w-auto object-contain drop-shadow-2xl"
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              SmartManager
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              La plateforme mobile-first de gestion intelligente pour les petits commerces africains
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/auth/login')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={() => router.push('/setup')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Configurer mon entreprise
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Fonctionnalités complètes
            </h2>
            <p className="text-slate-300 text-lg">
              Tout ce dont vous avez besoin pour gérer votre commerce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* POS / Caisse */}
            <div className="group bg-linear-to-br from-slate-800 to-slate-700 p-8 rounded-xl border border-slate-600 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <div className="bg-linear-to-r from-green-500 to-green-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors">POS / Caisse</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Gérez vos ventes rapidement avec scan de codes barres et paiements multiples
              </p>
              <div className="flex items-center text-green-400 text-sm font-medium">
                <CheckCircle className="w-4 h-4 mr-2" />
                Scan ultra-rapide
              </div>
            </div>

            {/* Gestion de stock */}
            <div className="group bg-linear-to-br from-slate-800 to-slate-700 p-8 rounded-xl border border-slate-600 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="bg-linear-to-r from-blue-500 to-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">Gestion de stock</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Suivez vos inventaires en temps réel et recevez des alertes de stock faible
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                <Zap className="w-4 h-4 mr-2" />
                Alertes intelligentes
              </div>
            </div>

            {/* Dépenses */}
            <div className="group bg-linear-to-br from-slate-800 to-slate-700 p-8 rounded-xl border border-slate-600 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10">
              <div className="bg-linear-to-r from-purple-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Dépenses</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Suivez toutes vos dépenses et analysez votre rentabilité
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyse rentabilité
              </div>
            </div>

            {/* Personnel */}
            <div className="group bg-linear-to-br from-slate-800 to-slate-700 p-8 rounded-xl border border-slate-600 hover:border-yellow-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/10">
              <div className="bg-linear-to-r from-yellow-500 to-yellow-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">Personnel</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Gérez vos employés et suivez les salaires et performances
              </p>
              <div className="flex items-center text-yellow-400 text-sm font-medium">
                <Shield className="w-4 h-4 mr-2" />
                Gestion complète
              </div>
            </div>

            {/* Analytics */}
            <div className="group bg-linear-to-br from-slate-800 to-slate-700 p-8 rounded-xl border border-slate-600 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
              <div className="bg-linear-to-r from-red-500 to-red-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">Analytics</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Analysez vos performances avec des rapports détaillés et graphiques
              </p>
              <div className="flex items-center text-red-400 text-sm font-medium">
                <Globe className="w-4 h-4 mr-2" />
                Rapports avancés
              </div>
            </div>

            {/* Mobile First */}
            <div className="group bg-linear-to-br from-slate-800 to-slate-700 p-8 rounded-xl border border-slate-600 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 md:col-span-2 lg:col-span-1">
              <div className="bg-linear-to-r from-orange-500 to-orange-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">Mobile First</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Application PWA installable, fonctionne offline et optimisée pour mobile
              </p>
              <div className="flex items-center text-orange-400 text-sm font-medium">
                <ArrowRight className="w-4 h-4 mr-2" />
                100% mobile
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à transformer votre gestion ?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Rejoignez des centaines de commerces qui utilisent déjà SmartManager
          </p>
          <button
            onClick={() => router.push('/setup')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
          >
            Configurer mon entreprise
          </button>
        </div>
      </div>
    </div>
  )
}
