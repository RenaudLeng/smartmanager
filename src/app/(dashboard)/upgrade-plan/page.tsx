'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  CheckCircle, 
  AlertTriangle, 
  Crown, 
  Sparkles, 
  Star
} from 'lucide-react'
import { useTenant } from '../../../contexts/TenantContext'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotifications } from '../../../components/ui/Notification'

interface Plan {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  icon: React.ReactNode
  color: string
  popular?: boolean
  badge?: string
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    duration: 'Illimité',
    features: ['Gestion de base', '1 utilisateur', '100 produits', 'Support communautaire'],
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-gray-500'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 25000,
    duration: '/mois',
    features: ['Gestion avancée', '5 utilisateurs', '1000 produits', 'Support prioritaire', 'Export données', 'API accès'],
    icon: <Crown className="w-5 h-5" />,
    color: 'bg-purple-500',
    popular: true,
    badge: 'POPULAIRE'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 75000,
    duration: '/mois',
    features: ['Gestion illimitée', 'Utilisateurs illimités', 'Produits illimités', 'Support dédié', 'API complète', 'Personnalisation', 'Formation'],
    icon: <Star className="w-5 h-5" />,
    color: 'bg-blue-600'
  }
]

export default function UpgradePlanPage() {
  const router = useRouter()
  const { user } = useAuth()
  const tenantData = useTenant()
  const subscriptionStatus = tenantData.getSubscriptionStatus()
  const { addNotification: showNotification } = useNotifications()
  
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Protection SuperAdmin
  useEffect(() => {
    if (user?.role === 'super_admin') {
      router.push('/superadmin')
      return
    }
  }, [user, router])

  const handleUpgrade = async (planId: string) => {
    if (!tenantData.tenant) return

    setIsProcessing(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tenants/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId: tenantData.tenant.id,
          plan: planId
        })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          showNotification({
            type: 'success',
            title: 'Succès',
            message: 'Abonnement mis à jour avec succès !'
          })
          // Rafraîchir les données du tenant
          await tenantData.refreshTenant()
          router.push('/dashboard')
        } else {
          showNotification({
            type: 'error',
            title: 'Erreur',
            message: result.error || 'Erreur lors de la mise à niveau'
          })
        }
      } else {
        showNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la mise à niveau'
        })
      }
    } catch (error) {
      console.error('Erreur upgrade:', error)
      showNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Une erreur est survenue'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (!tenantData.tenant) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Aucun tenant associé</h1>
          <p className="text-gray-400 mb-4">Veuillez vous connecter avec un compte tenant pour accéder à cette page.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Mettre à niveau votre abonnement
          </h1>
          <p className="text-gray-300">
            Choisissez le plan qui correspond le mieux à vos besoins
          </p>
        </div>

        {/* Current Plan */}
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Plan actuel</h2>
              <p className="text-gray-400">
                {subscriptionStatus.plan === 'trial' && subscriptionStatus.trialDaysLeft !== undefined 
                  ? `Essai de 14 jours (${subscriptionStatus.trialDaysLeft} jours restants)`
                  : subscriptionStatus.plan.toUpperCase()
                }
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
              subscriptionStatus.isTrial ? 'bg-green-500/20 text-green-400' :
              subscriptionStatus.plan === 'premium' ? 'bg-purple-500/20 text-purple-400' :
              subscriptionStatus.plan === 'enterprise' ? 'bg-blue-600/20 text-blue-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {subscriptionStatus.isTrial ? '🎁 PÉRIODE D&apos;ESSAI' :
               subscriptionStatus.plan === 'premium' ? '💎 PREMIUM' :
               subscriptionStatus.plan === 'enterprise' ? '🏢 ENTERPRISE' :
               '⚪ GRATUIT'
              }
            </div>
          </div>
          
          {subscriptionStatus.isTrial && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-yellow-400 text-sm">
                    Votre période d'essai se termine dans {subscriptionStatus.trialDaysLeft} jours.
                  </p>
                  <p className="text-yellow-300 text-xs mt-1">
                    Passez à un plan payant pour continuer à utiliser SmartManager sans interruption.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-black/40 backdrop-blur-md rounded-xl border-2 p-6 transition-all duration-200 hover:scale-105 ${
                selectedPlan === plan.id 
                  ? 'border-orange-500 shadow-lg shadow-orange-500/20' 
                  : 'border-white/10 hover:border-white/20'
              } ${
                plan.popular ? 'ring-2 ring-purple-500/20' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${plan.color}`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {plan.price === 0 ? 'Gratuit' : `${(plan.price / 1000).toFixed(0)}k`}
                  </p>
                  <p className="text-xs text-gray-400">{plan.duration}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (subscriptionStatus.plan === plan.id) {
                    showNotification({
                      type: 'info',
                      title: 'Information',
                      message: 'Vous êtes déjà sur ce plan'
                    })
                  } else {
                    setSelectedPlan(plan.id)
                  }
                }}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  subscriptionStatus.plan === plan.id
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : plan.id === 'premium' 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : plan.id === 'enterprise'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                }`}
                disabled={subscriptionStatus.plan === plan.id || isProcessing}
              >
                {subscriptionStatus.plan === plan.id ? 'Plan actuel' : 'Choisir ce plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Selected Plan Modal */}
        {selectedPlan && selectedPlan !== subscriptionStatus.plan && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-white/20 shrink-0">
              <h3 className="text-xl font-semibold text-white mb-4">
                Confirmer la mise à niveau
              </h3>
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Plan actuel:</span>
                  <span className="text-white font-medium">{subscriptionStatus.plan.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Nouveau plan:</span>
                  <span className="text-white font-medium">{selectedPlan.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">Coût mensuel:</span>
                  <span className="text-white font-medium">
                    {(() => {
                      const selectedPlanData = PLANS.find(p => p.id === selectedPlan)
                      return selectedPlanData?.price === 0 
                        ? 'Gratuit' 
                        : `${(selectedPlanData?.price || 0 / 1000).toFixed(0)}k XOF/mois`
                    })()}
                  </span>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-blue-300 text-sm">
                  La mise à niveau prendra effet immédiatement. Vous serez facturé selon la fréquence du plan choisi.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleUpgrade(selectedPlan)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Traitement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
