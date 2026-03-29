'use client'

import { useAuth } from '@/contexts/AuthContext'
import SuperAdminGuard from '@/components/SuperAdmin/SuperAdminGuard'

export default function TestAuthPage() {
  const { user, token, isLoading, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Test d'authentification</h1>
      
      <div className="space-y-4">
        <div className="bg-black/40 p-4 rounded-lg">
          <h2 className="text-xl mb-2">État de l'authentification:</h2>
          <ul className="space-y-1 text-sm">
            <li>Chargement: {isLoading ? 'Oui' : 'Non'}</li>
            <li>Authentifié: {isAuthenticated ? 'Oui' : 'Non'}</li>
            <li>Token: {token ? 'Présent' : 'Absent'}</li>
            <li>Utilisateur: {user ? JSON.stringify(user, null, 2) : 'Aucun'}</li>
          </ul>
        </div>

        <SuperAdminGuard>
          <div className="bg-green-900/40 p-4 rounded-lg">
            <h2 className="text-xl mb-2 text-green-400">✅ Accès SuperAdmin autorisé</h2>
            <p>Vous pouvez voir les métriques système.</p>
          </div>
        </SuperAdminGuard>
      </div>
    </div>
  )
}
