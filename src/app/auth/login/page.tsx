'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Vérifier si une configuration existe déjà
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        console.log('👤 Utilisateur trouvé:', userData)
        setCurrentUser(userData)
        // Ne pas rediriger automatiquement - laisser l'utilisateur choisir
        // router.push('/dashboard')
      } catch (error) {
        console.error('Erreur parsing user:', error)
        localStorage.removeItem('user')
      }
    }
  }, [router])

  const handleLogout = () => {
    console.log('🚪 Déconnexion depuis la page de login')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload()
  }

  const handleContinue = () => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.role === 'super_admin') {
          window.location.href = '/superadmin'
        } else {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Erreur parsing user:', error)
        localStorage.removeItem('user')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔐 Tentative de connexion avec:', { email, password: '***' })
    console.log('📝 Formulaire soumis - bouton cliqué')

    try {
      // Authentification via API réelle
      console.log('🌐 Appel API /api/auth/login...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      console.log('📡 Réponse API brute:', response)
      console.log('📡 Status:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Connexion réussie - données reçues:', data)
        
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        console.log('💾 Données stockées dans localStorage')
        
        // FORCE REDIRECTION SUPERADMIN
        if (data.user.role === 'super_admin') {
          console.log('👑 SUPERADMIN DETECTÉ - Redirection forcée vers /superadmin')
          // Forcer la redirection immédiate
          window.location.href = '/superadmin'
          return
        } else {
          console.log('🔄 Redirection vers /dashboard...')
          router.push('/dashboard')
        }
      } else {
        console.log('❌ Réponse API non-OK, lecture du body...')
        const errorData = await response.json()
        console.log('❌ Erreur API:', errorData)
        setError(errorData.error || 'Email ou mot de passe incorrect')
      }
    } catch (error) {
      console.error('💥 Erreur de connexion complète:', error)
      setError('Erreur de connexion au serveur')
    } finally {
      console.log('🏁 Fin du processus de connexion')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-8 shadow-2xl">
          <div className="text-center mb-4">
            {/* Logo */}
            <Image 
              src="/logo.png" 
              alt="SmartManager" 
              width={128}
              height={128}
              className="h-32 w-auto object-contain mx-auto mb-2"
            />
            
            <h1 className="text-4xl font-black text-white mb-2 tracking-wide drop-shadow-lg">
              <span className="text-orange-500">Smart</span><span className="text-green-500">Manager</span>
            </h1>
            <p className="text-gray-400">Gestion intelligente pour votre commerce</p>
          </div>

          {/* Section utilisateur déjà connecté */}
          {currentUser && (
            <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Déjà connecté</p>
                  <p className="text-white font-semibold">{currentUser.name}</p>
                  <p className="text-gray-400 text-sm">{currentUser.email}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  currentUser.role === 'super_admin' 
                    ? 'bg-orange-500/20 text-orange-400' 
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {currentUser.role === 'super_admin' ? 'SuperAdmin' : 'Admin'}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleContinue}
                  className="flex-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Continuer
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                  placeholder="••••••••"
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
              className="w-full bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/25"
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
                onClick={() => router.push('/setup')}
                className="text-orange-400 hover:text-orange-300 font-medium"
              >
                Configurer votre entreprise
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
