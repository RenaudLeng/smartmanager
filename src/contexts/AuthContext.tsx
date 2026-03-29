'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Déclaration pour TypeScript
declare global {
  interface Window {
    superAdminLogged?: boolean
    preventRedirect?: boolean
  }
}

interface User {
  id: string
  email: string
  name: string
  role: string
  tenantId?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastActivity, setLastActivity] = useState<number>(() => Date.now())
  const router = useRouter()

  // Durée de session en millisecondes (8 heures pour les SuperAdmins)
  const SESSION_DURATION = user?.role === 'super_admin' ? 8 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000

  // Vérifier la validité du token JWT avec plus de tolérance
  const isTokenValid = useCallback((token: string): boolean => {
    try {
      // Vérifier que le token est au format JWT (3 parties séparées par des points)
      if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
        console.error('Token format invalide - pas au format JWT')
        return false
      }
      
      const parts = token.split('.')
      const header = parts[0]
      const payload = parts[1]
      const signature = parts[2]
      
      // Vérifier que les parties ne sont pas vides
      if (!header || !payload || !signature) {
        console.error('Token JWT incomplet - parties manquantes')
        return false
      }
      
      // Décoder le payload
      const decodedPayload = JSON.parse(atob(payload))
      const currentTime = Date.now() / 1000
      
      // Ajouter 30 minutes de tolérance pour les SuperAdmins, 15 minutes pour les autres
      const tolerance = decodedPayload.role === 'super_admin' ? 1800 : 900
      const isValid = decodedPayload.exp > (currentTime - tolerance)
      
      // Logger seulement si invalide (éviter la boucle de logs)
      if (!isValid) {
        // Token invalide - déconnexion requise
      }
      
      // Logger seulement une fois pour les SuperAdmins (éviter les logs répétitifs)
      if (!decodedPayload.tenantId && decodedPayload.role === 'super_admin') {
        if (!window.superAdminLogged) {
          // SuperAdmin connecté - pas de tenant
          window.superAdminLogged = true
        }
      }
      
      return isValid
    } catch (error) {
      console.error('Error validating token:', error)
      console.error('Token value:', token ? token.substring(0, 50) + '...' : 'null')
      return false
    }
  }, [])

  // Déconnexion forcée
  const forceLogout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('lastActivity')
    router.push('/')
  }, [router])

  // Mettre à jour l'activité de l'utilisateur
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
    localStorage.setItem('lastActivity', Date.now().toString())
  }, [])

  useEffect(() => {
    // Vérifier s'il y a un token dans localStorage au démarrage
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const storedLastActivity = localStorage.getItem('lastActivity')

    // Nettoyer les tokens invalides immédiatement
    if (storedToken) {
      if (!isTokenValid(storedToken)) {
        // Éviter la redirection pendant les actions critiques (création tenant) et pour les SuperAdmins
        const isSuperAdmin = () => {
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]))
            return payload.role === 'super_admin'
          } catch {
            return false
          }
        }
        
        if (window.preventRedirect || isSuperAdmin()) {
          console.log('Redirection évitée - SuperAdmin ou action critique en cours')
          return
        }
        
        // Nettoyage du token invalide - redirection vers login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('lastActivity')
        setTimeout(() => {
          setIsLoading(false)
          // Forcer la redirection vers la page de login
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        }, 0)
        return
      }
    }

    if (storedToken && storedUser) {
      // Le token est déjà validé ci-dessus
      // Vérifier si la session n'est pas expirée
      const lastActivityTime = storedLastActivity ? parseInt(storedLastActivity) : Date.now()
      const sessionExpired = Date.now() - lastActivityTime > SESSION_DURATION

      if (sessionExpired) {
        // Pour les SuperAdmins, éviter la déconnexion automatique et juste rafraîchir l'activité
        try {
          const user = JSON.parse(storedUser || '{}')
          if (user.role === 'super_admin') {
            console.log('Session SuperAdmin expirée mais évite la déconnexion - rafraîchissement de l\'activité')
            const newActivity = Date.now()
            localStorage.setItem('lastActivity', newActivity.toString())
            setTimeout(() => {
              setUser(user)
              setToken(storedToken)
              setLastActivity(newActivity)
              setIsLoading(false)
            }, 0)
            return
          }
        } catch (error) {
          console.error('Erreur vérification rôle SuperAdmin:', error)
        }
        
        // Session expirée, déconnexion automatique (pour les non-SuperAdmins)
        setTimeout(() => forceLogout(), 0)
        return
      }

      try {
        const parsedUser = JSON.parse(storedUser)
        setTimeout(() => {
          setUser(parsedUser)
          setToken(storedToken)
          setLastActivity(lastActivityTime)
          setIsLoading(false)
        }, 0)
      } catch (error) {
        console.error('Erreur lors de la lecture des données utilisateur:', error)
        setTimeout(() => forceLogout(), 0)
      }
    } else {
      setTimeout(() => setIsLoading(false), 0)
    }
  }, [SESSION_DURATION, forceLogout, isTokenValid])

  // Vérifier l'activité de l'utilisateur et déconnexion automatique
  useEffect(() => {
    if (!token || !user) return

    const checkActivity = setInterval(() => {
      const currentTime = Date.now()
      const timeSinceLastActivity = currentTime - lastActivity

      if (timeSinceLastActivity > SESSION_DURATION) {
        // Pour les SuperAdmins, éviter la déconnexion automatique et juste rafraîchir l'activité
        if (user.role === 'super_admin') {
          console.log('Inactivité SuperAdmin détectée mais évite la déconnexion - rafraîchissement de l\'activité')
          updateActivity()
          return
        }
        // Inactivité détectée, déconnexion automatique (pour les non-SuperAdmins)
        setTimeout(() => forceLogout(), 0)
      }
    }, 300000) // Vérifier toutes les 5 minutes au lieu de toutes les minutes

    // Écouter les événements d'activité
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    const handleActivity = () => updateActivity()

    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      clearInterval(checkActivity)
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [token, user, lastActivity, SESSION_DURATION, forceLogout, updateActivity])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Vérifier que le token est valide
        if (!isTokenValid(data.token)) {
          console.error('Token invalide reçu du serveur')
          return false
        }

        setTimeout(() => {
          setUser(data.user)
          setToken(data.token)
          setLastActivity(Date.now())
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          localStorage.setItem('lastActivity', Date.now().toString())
          setIsLoading(false)
        }, 0)
        
        return true
      } else {
        const error = await response.json()
        console.error('Erreur de connexion:', error.error)
        return false
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      return false
    }
  }

  const logout = () => {
    // Déconnexion manuelle
    forceLogout()
  }

  const isAuthenticated = !!token && !!user && isTokenValid(token)

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
