'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface SuperAdminGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function SuperAdminGuard({ children, fallback }: SuperAdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si le chargement est terminé et que l'utilisateur n'est pas authentifié
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Si l'utilisateur est authentifié mais n'est pas super_admin
    if (!isLoading && isAuthenticated && user?.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }
  }, [isLoading, isAuthenticated, user, router])

  // Pendant le chargement, afficher un écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-white text-xl font-medium">Vérification des permissions...</div>
        </div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas authentifié ou n'est pas super_admin, afficher le fallback
  if (!isAuthenticated || user?.role !== 'super_admin') {
    return fallback || (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <div className="text-white text-xl font-medium mb-2">Accès non autorisé</div>
          <div className="text-gray-400">Vous devez être super administrateur pour accéder à cette page</div>
        </div>
      </div>
    )
  }

  // Si tout est bon, afficher les enfants
  return <>{children}</>
}
