import { useState, useEffect, useRef, useCallback } from 'react'

interface UseLazyListOptions<T> {
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; hasMore: boolean; total?: number }>
  initialLimit?: number
  threshold?: number
  enabled?: boolean
}

export function useLazyList<T>({
  fetchFn,
  initialLimit = 20,
  threshold = 0.8,
  enabled = true
}: UseLazyListOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState<number | undefined>()

  const observerRef = useRef<IntersectionObserver>()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (!enabled || loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn(page, initialLimit)
      
      setItems(prev => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setTotal(result.total)
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [enabled, loading, hasMore, page, initialLimit, fetchFn])

  // Observer pour le scroll infini
  useEffect(() => {
    if (!enabled || !hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0]
        if (target.isIntersecting && !loading) {
          loadMore()
        }
      },
      { threshold }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observerRef.current.observe(currentRef)
    }

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef)
      }
    }
  }, [enabled, hasMore, loading, loadMore, threshold])

  // Charger les premiers éléments
  useEffect(() => {
    if (enabled && items.length === 0 && !loading) {
      loadMore()
    }
  }, [enabled, items.length, loading, loadMore])

  const reset = useCallback(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
    setError(null)
    setTotal(undefined)
    setLoading(false)
  }, [])

  const refresh = useCallback(() => {
    reset()
    setTimeout(loadMore, 100)
  }, [reset, loadMore])

  return {
    items,
    loading,
    hasMore,
    error,
    total,
    page,
    loadMore,
    reset,
    refresh,
    loadMoreRef
  }
}

// Hook pour le lazy loading d'images dans les listes
export function useLazyImage() {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const observerRef = useRef<IntersectionObserver>()

  const observeImage = useCallback((src: string, element: HTMLImageElement) => {
    if (loadedImages.has(src)) {
      element.src = src
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = img.dataset.src || ''
            setLoadedImages(prev => new Set(prev).add(src))
            observerRef.current?.unobserve(img)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (element) {
      element.dataset.src = src
      observerRef.current.observe(element)
    }
  }, [loadedImages])

  return { observeImage }
}
