interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>()

  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes par défaut
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  clear(): void {
    this.cache.clear()
  }

  clearPattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Nettoyer les entrées expirées
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Instance globale du cache
export const cache = new SimpleCache()

// Nettoyer le cache toutes les 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 600000)
}

// Fonctions utilitaires pour le cache
export function getCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|')
  return `${prefix}:${sortedParams}`
}

export function cacheResponse<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Vérifier le cache d'abord
      const cached = cache.get<T>(key)
      if (cached !== null) {
        resolve(cached)
        return
      }

      // Si pas en cache, faire la requête
      const data = await fetchFn()
      
      // Mettre en cache
      cache.set(key, data, ttl)
      
      resolve(data)
    } catch (error) {
      reject(error)
    }
  })
}

// Cache spécifique pour les données utilisateur
export function getUserCacheKey(userId: string, resource: string, params?: Record<string, any>): string {
  const baseKey = `user:${userId}:${resource}`
  if (!params) return baseKey
  
  return getCacheKey(baseKey, params)
}

// Cache pour les données tenant
export function getTenantCacheKey(tenantId: string, resource: string, params?: Record<string, any>): string {
  const baseKey = `tenant:${tenantId}:${resource}`
  if (!params) return baseKey
  
  return getCacheKey(baseKey, params)
}
