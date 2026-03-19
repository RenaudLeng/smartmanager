'use client'

import { useState, useEffect } from 'react'
import { 
  SuperAdminUser, 
  TenantStats, 
  GlobalStats, 
  AuditLog, 
  SubscriptionPlan,
  Permission 
} from '@/types'
import apiService from '@/services/api'

export default function useSuperAdmin() {
  const [currentUser, setCurrentUser] = useState<SuperAdminUser | null>(null)
  const [tenants, setTenants] = useState<TenantStats[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les données initiales
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Charger l'utilisateur actuel depuis localStorage
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        setCurrentUser(user)
      }

      // Charger les tenants
      const tenantsResponse = await apiService.getTenants()
      if (tenantsResponse.success && tenantsResponse.data) {
        setTenants(tenantsResponse.data)
      }

      // Charger les statistiques globales
      const statsResponse = await apiService.getTenantStats()
      if (statsResponse.success && statsResponse.data) {
        setGlobalStats(statsResponse.data)
      }

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  // Actions CRUD pour les tenants
  const createTenant = async (tenantData: any) => {
    try {
      const response = await apiService.createTenant(tenantData)
      if (response.success && response.data) {
        setTenants(prev => [...prev, response.data])
        return response.data
      } else {
        throw new Error(response.error || 'Erreur lors de la création')
      }
    } catch (err) {
      console.error('Erreur création tenant:', err)
      throw err
    }
  }

  const updateTenant = async (id: string, data: any) => {
    try {
      const response = await apiService.updateTenant(id, data)
      if (response.success && response.data) {
        setTenants(prev => prev.map(tenant => 
          tenant.id === id ? { ...tenant, ...response.data } : tenant
        ))
        return response.data
      } else {
        throw new Error(response.error || 'Erreur lors de la mise à jour')
      }
    } catch (err) {
      console.error('Erreur mise à jour tenant:', err)
      throw err
    }
  }

  const deleteTenant = async (id: string) => {
    try {
      const response = await apiService.deleteTenant(id)
      if (response.success) {
        setTenants(prev => prev.filter(tenant => tenant.id !== id))
        return true
      } else {
        throw new Error(response.error || 'Erreur lors de la suppression')
      }
    } catch (err) {
      console.error('Erreur suppression tenant:', err)
      throw err
    }
  }

  const suspendTenant = async (id: string, reason: string) => {
    try {
      const response = await apiService.suspendTenant(id, reason)
      if (response.success && response.data) {
        setTenants(prev => prev.map(tenant => 
          tenant.id === id ? { ...tenant, ...response.data } : tenant
        ))
        return response.data
      } else {
        throw new Error(response.error || 'Erreur lors de la suspension')
      }
    } catch (err) {
      console.error('Erreur suspension tenant:', err)
      throw err
    }
  }

  // Fonctions de filtrage
  const getTenantsByStatus = (status: string) => {
    return tenants.filter(tenant => tenant.status === status)
  }

  const getTenantsByBusinessType = (businessType: string) => {
    return tenants.filter(tenant => tenant.businessType === businessType)
  }

  // Rafraîchir les données
  const refreshData = async () => {
    await loadInitialData()
  }

  return {
    // État
    currentUser,
    tenants,
    globalStats,
    auditLogs,
    loading,
    error,

    // Actions
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    getTenantsByStatus,
    getTenantsByBusinessType,
    refreshData
  }
}
