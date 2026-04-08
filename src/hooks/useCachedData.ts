import { useState, useEffect, useCallback } from 'react'
import { cache, cacheResponse, getUserCacheKey, getTenantCacheKey } from '@/lib/cache'
import { useAuth } from '@/contexts/AuthContext'

interface UseCachedDataOptions<T> {
  fetchFn: () => Promise<T>
  cacheKey?: string
  ttl?: number
  enabled?: boolean
  dependencies?: any[]
}

export function useCachedData<T>({
  fetchFn,
  cacheKey,
  ttl = 300000, // 5 minutes par défaut
  enabled = true,
  dependencies = []
}: UseCachedDataOptions<T>) {
  const { user } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    try {
      setLoading(true)
      setError(null)

      // Générer la clé de cache
      const finalCacheKey = cacheKey || generateCacheKey(user, fetchFn.name)
      
      // Utiliser le cache avec la fonction fetch
      const result = await cacheResponse(finalCacheKey, fetchFn, ttl)
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement'
      setError(errorMessage)
      console.error('Erreur de chargement:', err)
    } finally {
      setLoading(false)
    }
  }, [user, fetchFn, cacheKey, ttl, enabled])

  useEffect(() => {
    fetchData()
  }, dependencies)

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      cache.clearPattern(`^${cacheKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
    }
    fetchData()
  }, [cacheKey, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateCache
  }
}

// Fonction pour générer automatiquement les clés de cache
function generateCacheKey(user: any, functionName: string): string {
  if (!user) return `anonymous:${functionName}`
  
  if (user.role === 'super_admin') {
    return getUserCacheKey(user.id, functionName)
  }
  
  if (user.tenantId) {
    return getTenantCacheKey(user.tenantId, functionName)
  }
  
  return `user:${user.id}:${functionName}`
}

// Hook spécialisé pour les données de tenant
export function useTenantData<T>(
  resource: string,
  fetchFn: () => Promise<T>,
  options: {
    params?: Record<string, any>
    ttl?: number
    enabled?: boolean
  } = {}
) {
  const { user } = useAuth()
  const { params, ttl = 300000, enabled = true } = options
  
  const cacheKey = user?.tenantId 
    ? getTenantCacheKey(user.tenantId, resource, params)
    : `anonymous:${resource}`

  return useCachedData({
    fetchFn,
    cacheKey,
    ttl,
    enabled,
    dependencies: [user?.tenantId, resource, JSON.stringify(params)]
  })
}

// Hook spécialisé pour les données SuperAdmin
export function useAdminData<T>(
  resource: string,
  fetchFn: () => Promise<T>,
  options: {
    params?: Record<string, any>
    ttl?: number
    enabled?: boolean
  } = {}
) {
  const { user } = useAuth()
  const { params, ttl = 300000, enabled = true } = options
  
  const cacheKey = user?.role === 'super_admin' && user.id
    ? getUserCacheKey(user.id, resource, params)
    : `anonymous:${resource}`

  return useCachedData({
    fetchFn,
    cacheKey,
    ttl,
    enabled: enabled && user?.role === 'super_admin',
    dependencies: [user?.id, resource, JSON.stringify(params)]
  })
}
