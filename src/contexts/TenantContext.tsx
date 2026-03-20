import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Tenant {
  id: string
  name: string
  businessType: 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket'
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
  switchToTenant: (tenantId: string) => void
  switchToSuperAdmin: () => void
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
    // Charger les infos utilisateur depuis localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setTenant(parsedUser.tenant)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Charger les infos utilisateur depuis localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setTenant(parsedUser.tenant)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    setIsLoading(false)
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

    switch (tenant.businessType) {
      case 'restaurant':
        return {
          allowsDebt: true,
          allowsDelivery: true,
          allowsTableService: true,
          requiresTableNumber: true,
          allowsFlashCustomers: true,
          allowsTicketPrinting: true
        }
      case 'bar':
        return {
          allowsDebt: true,
          allowsDelivery: false,
          allowsTableService: true,
          requiresTableNumber: false,
          allowsFlashCustomers: true,
          allowsTicketPrinting: true
        }
      case 'pharmacy':
        return {
          allowsDebt: false,
          allowsDelivery: true,
          allowsTableService: false,
          requiresTableNumber: false,
          allowsFlashCustomers: false,
          allowsTicketPrinting: true
        }
      case 'supermarket':
        return {
          allowsDebt: false,
          allowsDelivery: true,
          allowsTableService: false,
          requiresTableNumber: false,
          allowsFlashCustomers: false,
          allowsTicketPrinting: true
        }
      case 'retail':
      default:
        return {
          allowsDebt: false,
          allowsDelivery: false,
          allowsTableService: false,
          requiresTableNumber: false,
          allowsFlashCustomers: false,
          allowsTicketPrinting: false
        }
    }
  }

  const value: TenantContextType = {
    tenant,
    user,
    isLoading,
    getPaymentMethods,
    getBusinessLabel,
    getBusinessFeatures,
    superAdminUser: null,
    isSuperAdmin: false,
    switchToTenant: () => {},
    switchToSuperAdmin: () => {}
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}
