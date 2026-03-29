'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ShoppingCart, Package, CreditCard, Users, BarChart3, Smartphone, CheckCircle, ArrowRight, Store, LogIn, Settings, X, Eye, EyeOff, Beer, ShoppingBag, Utensils, Stethoscope } from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.role === 'super_admin') {
          router.push('/superadmin')
        } else {
          router.push('/dashboard')
        }
      } catch (error) {
        localStorage.removeItem('user')
      }
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        if (data.user.role === 'super_admin') {
          window.location.href = '/superadmin'
        } else {
          router.push('/dashboard')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Email ou mot de passe incorrect')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "POS / Caisse",
      description: "Gérez vos ventes rapidement avec scan de codes barres et paiements multiples",
      highlight: "Scan ultra-rapide"
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "Gestion de stock",
      description: "Suivez vos inventaires en temps réel et recevez des alertes de stock faible",
      highlight: "Alertes intelligentes"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Dépenses",
      description: "Suivez toutes vos dépenses et analysez votre rentabilité",
      highlight: "Analyse rentabilité"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Personnel",
      description: "Gérez vos employés et suivez les salaires et performances",
      highlight: "Gestion complète"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics",
      description: "Analysez vos performances avec des rapports détaillés et graphiques",
      highlight: "Rapports avancés"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile First",
      description: "Application PWA installable, fonctionne offline et optimisée pour mobile",
      highlight: "100% mobile"
    }
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Image 
                src="/logo.png" 
                alt="SmartManager" 
                width={80}
                height={80}
                className="h-20 w-auto object-contain"
              />
              <span className="text-2xl font-bold text-white">
                <span className="text-orange-500">Smart</span>
                <span className="text-green-500">Manager</span>
              </span>
            </div>
            <button
              onClick={() => setShowLogin(!showLogin)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Se connecter</span>
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">
              <div className="text-center">
              {/* Icônes des types de commerces */}
              <div className="flex justify-center items-center space-x-6 mb-8">
                <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400 animate-bounce delay-100">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl text-green-400 animate-bounce delay-200">
                  <Beer className="w-8 h-8" />
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 animate-bounce delay-300">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400 animate-bounce delay-400">
                  <Utensils className="w-8 h-8" />
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400 animate-bounce delay-500">
                  <Store className="w-8 h-8" />
                </div>
              </div>

              {/* Titre SMART MANAGER */}
              <div className="text-4xl md:text-5xl font-black text-center mb-4">
                <span className="text-orange-500 drop-shadow-2xl animate-pulse">Smart</span>
                <span className="text-green-500 drop-shadow-2xl animate-pulse">Manager</span>
              </div>
            </div>
              <div className="text-justify">
                La plateforme mobile-first de gestion intelligente
                <br />
                pour les petits commerces africains
              </div>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Transformez votre commerce avec une solution complète, moderne et adaptée aux réalités africaines
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={() => router.push('/setup')}
                className="px-8 py-4 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 text-lg shadow-lg shadow-orange-500/25"
              >
                <Settings className="w-6 h-6" />
                <span>Configurer mon entreprise</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 text-lg border border-white/20"
              >
                <LogIn className="w-6 h-6" />
                <span>Se connecter</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Fonctionnalités complètes
            </h2>
            <p className="text-xl text-gray-300">
              Tout ce dont vous avez besoin pour gérer votre commerce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg text-orange-400">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-300 mb-4">{feature.description}</p>
                <div className="flex items-center space-x-2 text-orange-400 font-medium">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{feature.highlight}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à transformer votre gestion ?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Rejoignez des centaines de commerces qui utilisent déjà SmartManager
          </p>
          <button
            onClick={() => router.push('/setup')}
            className="px-8 py-4 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 text-lg shadow-lg shadow-orange-500/25 mx-auto"
          >
            <Store className="w-6 h-6" />
            <span>Configurer mon entreprise</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Image 
                    src="/logo.png" 
                    alt="SmartManager" 
                    width={80}
                    height={80}
                    className="h-20 w-auto object-contain"
                  />
                  <h3 className="text-2xl font-bold text-white">Se connecter</h3>
                </div>
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                      placeholder="•••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-900/50 backdrop-blur-sm border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Connexion...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Se connecter</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Nouveau sur SmartManager?{' '}
                  <button
                    onClick={() => {
                      setShowLogin(false)
                      router.push('/setup')
                    }}
                    className="text-orange-400 hover:text-orange-300 font-medium"
                  >
                    Configurer votre entreprise
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
