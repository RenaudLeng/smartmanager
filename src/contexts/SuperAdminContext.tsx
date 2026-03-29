'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { GlobalStats, AuditLog, TenantStats, SuperAdminUser } from '@/types'

interface SuperAdminContextType {
  currentUser: SuperAdminUser | null
  tenants: TenantStats[]
  globalStats: GlobalStats | null
  auditLogs: AuditLog[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

const SuperAdminContext = createContext<SuperAdminContextType | undefined>(undefined)

export function useSuperAdminContext() {
  const context = useContext(SuperAdminContext)
  if (context === undefined) {
    throw new Error('useSuperAdminContext must be used within a SuperAdminProvider')
  }
  return context
}

interface SuperAdminProviderProps {
  children: ReactNode
  value: SuperAdminContextType
}

export function SuperAdminProvider({ children, value }: SuperAdminProviderProps) {
  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  )
}
