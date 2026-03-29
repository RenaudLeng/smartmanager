'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Tenant {
  id: string
  name: string
  businessType: 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket' | 'hair_salon' | 'grocery' | 'bar_restaurant'
  email: string
  phone?: string
  address?: string
  currency: string
  status: 'active' | 'inactive' | 'suspended'
  subscriptionPlan: 'free' | 'trial' | 'premium' | 'enterprise'
  trialEndDate?: Date
  features: {
    allowsDebt: boolean
    allowsDelivery: boolean
    allowsTableService: boolean
    requiresTableNumber: boolean
    allowsFlashCustomers: boolean
    allowsTicketPrinting: boolean
  }
  createdAt: Date
  updatedAt: Date
}

interface User {
  id: string
  name: string
  email: string
  role: string
  tenant: Tenant
}

interface SuperAdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin'
  permissions: string[]
  lastLogin?: Date
  createdAt: Date
  status: 'active' | 'inactive'
}

interface TenantContextType {
  tenant: Tenant | null
  user: User | null
  superAdminUser: SuperAdminUser | null
  isSuperAdmin: boolean
  isLoading: boolean
  getPaymentMethods: () => string[]
  getBusinessLabel: () => string
  getBusinessFeatures: () => {
    allowsDebt: boolean
    allowsDelivery: boolean
    allowsTableService: boolean
    requiresTableNumber: boolean
    allowsFlashCustomers: boolean
    allowsTicketPrinting: boolean
  }
  getSubscriptionStatus: () => {
    plan: string
    isTrial: boolean
    trialDaysLeft?: number
    canUpgrade: boolean
  }
  switchToTenant: (tenantId: string) => void
  switchToSuperAdmin: () => void
  refreshTenant: () => void
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      try {
        const parsedUser = JSON.parse(user)
        // Utiliser setTimeout pour éviter les setState synchrones dans l'effect
        setTimeout(() => {
          setUser(parsedUser)
          setTenant(parsedUser.tenant)
        }, 0)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
    setTimeout(() => setIsLoading(false), 0)
  }, [])

  const getPaymentMethods = (): string[] => {
    if (!tenant) return ['cash']
    
    switch (tenant.businessType) {
      case 'restaurant':
      case 'bar':
        return ['cash', 'mobile_money'] // Pas de carte au Gabon
      case 'pharmacy':
        return ['cash', 'mobile_money', 'insurance'] // Pas de carte au Gabon
      case 'supermarket':
        return ['cash', 'mobile_money', 'check'] // Pas de carte au Gabon
      case 'retail':
      default:
        return ['cash']
    }
  }

  const getBusinessLabel = (): string => {
    if (!tenant) return 'Commerce'
    
    switch (tenant.businessType) {
      case 'restaurant':
        return 'Restaurant'
      case 'bar':
        return 'Bar'
      case 'pharmacy':
        return 'Pharmacie'
      case 'supermarket':
        return 'Supermarché'
      case 'hair_salon':
        return 'Salon de coiffure'
      case 'grocery':
        return 'Épicerie'
      case 'bar_restaurant':
        return 'Bar/Restaurant'
      case 'retail':
      default:
        return 'Boutique'
    }
  }

  const getBusinessFeatures = () => {
    if (!tenant) {
      return {
        allowsDebt: false,
        allowsDelivery: false,
        allowsTableService: false,
        requiresTableNumber: false,
        allowsFlashCustomers: false,
        allowsTicketPrinting: false
      }
    }
    
    return tenant.features || {
      allowsDebt: false,
      allowsDelivery: false,
      allowsTableService: false,
      requiresTableNumber: false,
      allowsFlashCustomers: false,
      allowsTicketPrinting: false
    }
  }

  const getSubscriptionStatus = () => {
    if (!tenant) {
      return {
        plan: 'free',
        isTrial: false,
        canUpgrade: false
      }
    }

    const isTrial = tenant.subscriptionPlan === 'trial'
    let trialDaysLeft: number | undefined
    
    if (isTrial && tenant.trialEndDate) {
      const now = new Date()
      const trialEnd = new Date(tenant.trialEndDate)
      trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    }

    return {
      plan: tenant.subscriptionPlan,
      isTrial,
      trialDaysLeft,
      canUpgrade: tenant.subscriptionPlan !== 'enterprise'
    }
  }

  const refreshTenant = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token || !user) return

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.user) {
          setUser(data.user)
          setTenant(data.user.tenant)
        }
      }
    } catch (error) {
      console.error('Error refreshing tenant:', error)
    }
  }

  const value: TenantContextType = {
    tenant,
    user,
    isLoading,
    getPaymentMethods,
    getBusinessLabel,
    getBusinessFeatures,
    getSubscriptionStatus,
    superAdminUser: null,
    isSuperAdmin: false,
    switchToTenant: () => {},
    switchToSuperAdmin: () => {},
    refreshTenant
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}
