import { useState, useEffect, useCallback, useRef } from 'react'

interface UseOptimizedDataOptions<T> {
  fetchFn: () => Promise<T>
  initialData?: T
  cacheKey?: string
  staleTime?: number
}

export function useOptimizedData<T>({
  fetchFn,
  initialData,
  cacheKey,
  staleTime = 300000 // 5 minutes par défaut
}: UseOptimizedDataOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState<number>(0)
  
  // Utiliser useRef pour éviter les changements de dépendances
  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Vérifier le cache
      if (cacheKey) {
        const cached = localStorage.getItem(cacheKey)
        const cachedTime = localStorage.getItem(`${cacheKey}_time`)
        
        if (cached && cachedTime) {
          const cacheAge = Date.now() - parseInt(cachedTime)
          if (cacheAge < staleTime) {
            setData(JSON.parse(cached))
            setLoading(false)
            return
          }
        }
      }
      
      const result = await fetchFnRef.current()
      setData(result)
      setLastFetch(Date.now())
      
      // Mettre en cache
      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify(result))
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString())
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
      console.error('Erreur de chargement:', err)
    } finally {
      setLoading(false)
    }
  }, [cacheKey, staleTime])

  useEffect(() => {
    fetchData()
  }, [cacheKey, staleTime]) // Supprimé fetchData pour éviter la boucle

  const refetch = useCallback(() => {
    fetchData()
  }, [cacheKey, staleTime]) // Supprimé fetchData pour éviter la boucle

  return { data, loading, error, refetch, lastFetch }
}
