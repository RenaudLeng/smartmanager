export interface SubscriptionPlan {
  id: 'free' | 'premium' | 'enterprise'
  name: string
  price: number
  currency: string
  period: 'month' | 'year'
  features: string[]
  limits: {
    users: number
    products: number
    storage: string
    transactions?: number
  }
  popular?: boolean
  description: string
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    currency: 'XAF',
    period: 'month',
    description: 'Idéal pour les petites entreprises qui débutent',
    features: [
      'Gestion des stocks',
      'Ventes de base',
      'Rapports simples',
      'Support par email',
      '1 mois d\'historique'
    ],
    limits: {
      users: 3,
      products: 500,
      storage: '1 Go'
    }
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 15000,
    currency: 'XAF',
    period: 'month',
    description: 'Parfait pour les entreprises en croissance',
    popular: true,
    features: [
      'Tout le plan Gratuit',
      'Gestion avancée des stocks',
      'Rapports détaillés',
      'Exportation des données',
      'Support prioritaire',
      '12 mois d\'historique',
      'Multi-utilisateurs',
      'Sauvegarde automatique',
      'Applications mobiles'
    ],
    limits: {
      users: 10,
      products: 5000,
      storage: '10 Go',
      transactions: 1000
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 50000,
    currency: 'XAF',
    period: 'month',
    description: 'Solution complète pour les grandes entreprises',
    features: [
      'Tout le plan Premium',
      'Utilisateurs illimités',
      'Produits illimités',
      'Stockage illimité',
      'API personnalisée',
      'Intégrations sur mesure',
      'Support dédié 24/7',
      'Formation personnalisée',
      'SLA garanti',
      'Hébergement dédié'
    ],
    limits: {
      users: -1, // Illimité
      products: -1, // Illimité
      storage: 'Illimité',
      transactions: -1 // Illimité
    }
  }
]

export const getSubscriptionPlan = (id: string): SubscriptionPlan => {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === id) || SUBSCRIPTION_PLANS[0]
}

export const formatPrice = (plan: SubscriptionPlan): string => {
  if (plan.price === 0) {
    return 'Gratuit'
  }
  return `${plan.price.toLocaleString()} ${plan.currency}/${plan.period === 'month' ? 'mois' : 'an'}`
}

export const getLimitDisplay = (value: number | string): string => {
  if (value === -1 || value === 'Illimité') {
    return 'Illimité'
  }
  return value.toString()
}
