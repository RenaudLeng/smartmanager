'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'
import { GlobalStats, AuditLog, TenantStats, SuperAdminUser } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

// Import BusinessConfig type from CreateTenantModal
interface BusinessConfig {
  categories: Array<{
    name: string
    description: string
  }>
  defaultProducts: Array<{
    name: string
    sellingPrice: number
    category: string
  }>
  defaultExpenses: string[]
}

export default function useSuperAdmin() {
  const { token, user } = useAuth()
  const [currentUser, setCurrentUser] = useState<SuperAdminUser | null>(null)
  const [tenants, setTenants] = useState<TenantStats[]>([])
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Forcer le loading à false après 2 secondes pour éviter le blocage
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  // Charger les données initiales
  const loadInitialData = useCallback(async () => {
    if (!user || user.role !== 'super_admin') {
      return
    }

    try {
      // Pas de setLoading(true) pour éviter les rechargements
      setError(null)

      // Utiliser l'utilisateur et le token de useAuth
      setCurrentUser(user as SuperAdminUser)

      // Charger les tenants
      const tenantsResponse = await apiService.getTenants()
      if (tenantsResponse.success && tenantsResponse.data) {
        // Transformer les Tenant en TenantStats pour le TenantManager
        const tenantsStats: TenantStats[] = tenantsResponse.data.map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          businessType: tenant.businessType as 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket' | 'hair_salon' | 'grocery' | 'bar_restaurant',
          status: tenant.status,
          createdAt: tenant.createdAt,
          userCount: tenant._count?.users || 0,
          totalSales: 0, // À calculer depuis les commandes
          monthSales: 0, // À calculer depuis les commandes
          todaySales: 0, // Ajout pour correspondre à TenantStats
          subscriptionPlan: (tenant.subscriptionPlan as 'free' | 'premium' | 'enterprise') || 'free',
          storageUsed: 0,
          storageLimit: 1000,
          lastActive: tenant.lastLogin ? new Date(tenant.lastLogin) : undefined
        }))
        setTenants(tenantsStats)
      }

      // Charger les statistiques globales
      const statsResponse = await apiService.getTenantStats()
      if (statsResponse.success && statsResponse.data) {
        setGlobalStats(statsResponse.data)
      }

      // Charger les logs d'audit
      try {
        const logsResponse = await apiService.getAuditLogs()
        if (logsResponse.success && logsResponse.data) {
          setAuditLogs(logsResponse.data)
        }
      } catch (logError) {
        console.warn('Erreur lors du chargement des logs d\'audit (normal pour nouvelle plateforme):', logError)
        // Ne pas bloquer le chargement si les logs ne sont pas disponibles
        setAuditLogs([])
      }

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      setError('Erreur lors du chargement des données')
      setLoading(false)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false) // Forcer le loading à false
    }
  }, [user])

  // Charger les données initiales quand l'utilisateur super admin est disponible
  useEffect(() => {
    if (user && user.role === 'super_admin') {
      loadInitialData()
    }
  }, [user?.id]) // Dépendance stable : user.id

  // Créer un log d'audit
  const createAuditLog = useCallback(async (data: {
    action: string
    entity: string
    entityId: string
    details?: Record<string, unknown>
  }) => {
    try {
      // Ajouter les informations utilisateur automatiquement
      const logData = {
        ...data,
        userId: user?.id || 'unknown',
        userName: user?.name || user?.email || 'System',
        tenantId: user?.tenantId
      }
      
      await apiService.createAuditLog(logData)
      // Rafraîchir les logs après création
      const logsResponse = await apiService.getAuditLogs()
      if (logsResponse.success && logsResponse.data) {
        setAuditLogs(logsResponse.data)
      }
    } catch (error) {
      console.warn('Erreur lors de la création du log d\'audit:', error)
    }
  }, [user])

  // Actions CRUD pour les tenants
  const createTenant = async (tenantData: {
    name: string
    businessType: string
    email: string
    phone?: string
    address?: string
    adminName: string
    adminEmail: string
    subscriptionPlan: string
    businessConfig?: BusinessConfig
    features?: {
      debtManagement: boolean
      delivery: boolean
      tableService: boolean
      tableNumberRequired: boolean
      flashCustomers: boolean
      ticketPrinting: boolean
    }
  }) => {
    try {
      const response = await apiService.createTenant(tenantData)
      if (response.success && response.data) {
        setTenants(prev => [...prev, response.data])
        
        // Rafraîchir les statistiques globales après création
        const statsResponse = await apiService.getTenantStats()
        if (statsResponse.success && statsResponse.data) {
          setGlobalStats(statsResponse.data)
        }
        
        // Créer un log d'audit pour la création
        await createAuditLog({
          action: 'create',
          entity: 'tenant',
          entityId: response.data.id,
          details: {
            tenantName: response.data.name,
            businessType: response.data.businessType,
            adminEmail: tenantData.adminEmail
          }
        })
        
        return response.data
      } else {
        throw new Error(response.error || 'Erreur lors de la création')
      }
    } catch (err) {
      console.error('Erreur création tenant:', err)
      throw err
    }
  }

  const updateTenant = async (id: string, data: {
    name?: string
    email?: string
    phone?: string
    address?: string
    status?: string
  }) => {
    try {
      const response = await apiService.updateTenant(id, data)
      if (response.success && response.data) {
        setTenants(prev => prev.map(tenant => 
          tenant.id === id ? { ...tenant, ...response.data } : tenant
        ))
        
        // Rafraîchir les statistiques globales après mise à jour
        const statsResponse = await apiService.getTenantStats()
        if (statsResponse.success && statsResponse.data) {
          setGlobalStats(statsResponse.data)
        }
        
        // Créer un log d'audit pour la mise à jour
        await createAuditLog({
          action: 'update',
          entity: 'tenant',
          entityId: id,
          details: {
            tenantName: response.data.name,
            updatedFields: Object.keys(data)
          }
        })
        
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
      // Récupérer les infos du tenant avant suppression pour le log
      const tenantToDelete = tenants.find(t => t.id === id)
      
      const response = await apiService.deleteTenant(id)
      if (response.success) {
        setTenants(prev => prev.filter(tenant => tenant.id !== id))
        
        // Rafraîchir les statistiques globales après suppression
        const statsResponse = await apiService.getTenantStats()
        if (statsResponse.success && statsResponse.data) {
          setGlobalStats(statsResponse.data)
        }
        
        // Créer un log d'audit pour la suppression
        if (tenantToDelete) {
          await createAuditLog({
            action: 'delete',
            entity: 'tenant',
            entityId: id,
            details: {
              tenantName: tenantToDelete.name,
              businessType: tenantToDelete.businessType
            }
          })
        }
        
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
        
        // Rafraîchir les statistiques globales après suspension
        const statsResponse = await apiService.getTenantStats()
        if (statsResponse.success && statsResponse.data) {
          setGlobalStats(statsResponse.data)
        }
        
        // Créer un log d'audit pour la suspension
        await createAuditLog({
          action: 'suspend',
          entity: 'tenant',
          entityId: id,
          details: {
            tenantName: response.data.name,
            reason: reason
          }
        })
        
        return response.data
      } else {
        throw new Error(response.error || 'Erreur lors de la suspension')
      }
    } catch (err) {
      console.error('Erreur suspension tenant:', err)
      throw err
    }
  }

  const toggleTenantStatus = async (id: string) => {
    try {
      const tenant = tenants.find(t => t.id === id)
      if (!tenant) {
        throw new Error('Tenant non trouvé')
      }

      const newStatus = tenant.status === 'active' ? 'suspended' : 'active'
      
      if (newStatus === 'suspended') {
        await suspendTenant(id, 'Suspension via toggle')
      } else {
        await updateTenant(id, { status: 'active' })
      }
      
      return true
    } catch (err) {
      console.error('Erreur changement statut tenant:', err)
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

  // Créer un log d'audit public pour être utilisé par d'autres composants
  const logActivity = useCallback(async (data: {
    action: string
    entity: string
    entityId: string
    details?: Record<string, unknown>
  }) => {
    await createAuditLog(data)
  }, [createAuditLog])

  return {
    // État
    currentUser,
    tenants,
    globalStats,
    auditLogs,
    loading,
    error,
    token,
    user,

    // Actions
    createTenant,
    updateTenant,
    deleteTenant,
    suspendTenant,
    toggleTenantStatus,
    getTenantsByStatus,
    getTenantsByBusinessType,
    refreshData,
    logActivity
  }
}
