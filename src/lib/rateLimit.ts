import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
  lastRequest: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  check(key: string): { allowed: boolean; remaining: number; resetTime: number } {
    this.cleanup()
    const now = Date.now()

    let entry = this.store.get(key)
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
        lastRequest: now
      }
      this.store.set(key, entry)
    }

    entry.count++
    entry.lastRequest = now

    const allowed = entry.count <= this.maxRequests
    const remaining = Math.max(0, this.maxRequests - entry.count)

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime
    }
  }

  // Pour les logs de monitoring
  getStats(): { totalKeys: number; totalRequests: number; averageRequestsPerKey: number } {
    const totalKeys = this.store.size
    const totalRequests = Array.from(this.store.values())
      .reduce((sum, entry) => sum + entry.count, 0)
    
    return {
      totalKeys,
      totalRequests,
      averageRequestsPerKey: totalKeys > 0 ? totalRequests / totalKeys : 0
    }
  }
}

// Rate limiters pour différents cas d'usage
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000) // 5 requêtes/15min pour l'auth
export const apiRateLimiter = new RateLimiter(100, 15 * 60 * 1000) // 100 requêtes/15min pour l'API
export const uploadRateLimiter = new RateLimiter(10, 60 * 1000) // 10 uploads/minute

export function createRateLimitMiddleware(limiter: RateLimiter, keyGenerator: (req: NextRequest) => string) {
  return (handler: (req: NextRequest) => Promise<Response>) => {
    return async (req: NextRequest) => {
      const key = keyGenerator(req)
      const result = limiter.check(key)

      // Ajouter les headers de rate limiting
      const headers = new Headers()
      headers.set('X-RateLimit-Limit', limiter['maxRequests'].toString())
      headers.set('X-RateLimit-Remaining', result.remaining.toString())
      headers.set('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000).toString())

      if (!result.allowed) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Too many requests',
            retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
          }),
          {
            status: 429,
            headers: {
              ...Object.fromEntries(headers),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
              'Content-Type': 'application/json'
            }
          }
        )
      }

      // Exécuter le handler avec les headers de rate limiting
      const response = await handler(req)
      
      // Ajouter les headers à la réponse
      Object.entries(Object.fromEntries(headers)).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }
  }
}

// Générateurs de clés pour différents cas
export const byIP = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0] || req.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

export const byUser = (req: NextRequest): string => {
  const user = (req as any).user
  if (user?.id) return `user:${user.id}`
  return byIP(req) // Fallback vers IP si pas d'utilisateur
}

export const byTenant = (req: NextRequest): string => {
  const user = (req as any).user
  if (user?.tenantId) return `tenant:${user.tenantId}`
  return byUser(req) // Fallback vers utilisateur
}

// Middleware spécifique pour l'authentification
export const authRateLimit = createRateLimitMiddleware(authRateLimiter, byIP)

// Middleware général pour l'API
export const apiRateLimit = createRateLimitMiddleware(apiRateLimiter, byUser)

// Middleware pour les uploads
export const uploadRateLimit = createRateLimitMiddleware(uploadRateLimiter, byUser)
