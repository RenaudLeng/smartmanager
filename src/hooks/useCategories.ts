import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTenantData, useAdminData } from '@/hooks/useCachedData'

interface Category {
  id: string
  name: string
  description?: string
  tenantId?: string
  tenant?: {
    id: string
    name: string
  }
}

export function useCategories() {
  const { user } = useAuth()

  // Fonction pour récupérer les catégories
  const fetchCategories = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Token manquant')
    }

    // Utiliser l'endpoint approprié selon le rôle
    const endpoint = user?.role === 'super_admin' ? '/api/admin/categories' : '/api/categories'
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data.categories || data
  }

  // Utiliser le hook de cache approprié selon le rôle
  const cacheResult = user?.role === 'super_admin' 
    ? useAdminData('categories', fetchCategories, { ttl: 300000 }) // 5 minutes
    : useTenantData('categories', fetchCategories, { ttl: 300000 }) // 5 minutes

  const createCategory = useCallback(async (categoryData: {
    name: string
    description?: string
    tenantId?: string
  }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token manquant')
      }

      // Utiliser l'endpoint approprié selon le rôle
      const endpoint = user?.role === 'super_admin' ? '/api/admin/categories' : '/api/categories'
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const newCategory = await response.json()
      
      // Invalider le cache pour forcer le rafraîchissement
      cacheResult.invalidateCache()
      
      return newCategory
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erreur de création')
    }
  }, [user?.role, cacheResult])

  return {
    categories: cacheResult.data || [],
    loading: cacheResult.loading,
    error: cacheResult.error,
    refetch: cacheResult.refetch,
    createCategory,
    invalidateCache: cacheResult.invalidateCache
  }
}
