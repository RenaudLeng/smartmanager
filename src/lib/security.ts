import { NextRequest, NextResponse } from 'next/server'

// Nettoyage des entrées pour prévenir XSS
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput)
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value)
    }
    return sanitized
  }
  
  return input
}

// Validation des URLs pour prévenir les redirections malveillantes
export function isValidUrl(url: string, allowedDomains?: string[]): boolean {
  try {
    const parsedUrl = new URL(url)
    
    // Autoriser seulement HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    
    // Vérifier les domaines autorisés
    if (allowedDomains && allowedDomains.length > 0) {
      return allowedDomains.includes(parsedUrl.hostname)
    }
    
    // Par défaut, autoriser les URLs relatives ou same-origin
    return true
  } catch {
    return false
  }
}

// Validation des noms de fichiers
export function isValidFileName(filename: string): boolean {
  // Pas de chemins relatifs, pas de caractères spéciaux dangereux
  const dangerousPatterns = [
    /\.\./,  // Path traversal
    /[<>:"|?*]/,  // Caractères interdits dans Windows
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Noms réservés Windows
    /^\./,  // Fichiers cachés Unix
  ]
  
  return !dangerousPatterns.some(pattern => pattern.test(filename))
}

// Validation des tailles de fichiers
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize
}

// Middleware de sécurité
export function securityMiddleware(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    // Headers de sécurité
    const headers = new Headers()
    
    // Protection contre XSS
    headers.set('X-XSS-Protection', '1; mode=block')
    
    // Protection contre le clickjacking
    headers.set('X-Frame-Options', 'DENY')
    
    // Protection contre le MIME-sniffing
    headers.set('X-Content-Type-Options', 'nosniff')
    
    // Politique de sécurité de contenu (basique)
    headers.set('Content-Security-Policy', 
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    )
    
    // Referrer Policy
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Permissions Policy
    headers.set('Permissions-Policy', 
      'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
    )

    // Vérifier Origin pour les requêtes sensibles
    const origin = req.headers.get('origin')
    const host = req.headers.get('host')
    
    if (origin && host) {
      const allowedOrigins = [
        `https://${host}`,
        `http://${host}`,
        'http://localhost:3000',
        'https://localhost:3000'
      ]
      
      if (!allowedOrigins.includes(origin)) {
        return new NextResponse(
          JSON.stringify({ error: 'Origin not allowed' }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              ...Object.fromEntries(headers)
            }
          }
        )
      }
    }

    // Exécuter le handler
    const response = await handler(req)
    
    // Ajouter les headers de sécurité à la réponse
    Object.entries(Object.fromEntries(headers)).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}

// Middleware de validation des entrées
export function inputValidationMiddleware(
  handler: (req: NextRequest) => Promise<Response>,
  options: {
    sanitizeBody?: boolean
    validateUrls?: boolean
    allowedDomains?: string[]
  } = {}
) {
  return async (req: NextRequest) => {
    try {
      // Cloner la requête pour pouvoir modifier le body
      const reqClone = req.clone()
      
      // Nettoyer le body si nécessaire
      if (options.sanitizeBody && req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const body = await reqClone.json()
        const sanitizedBody = sanitizeInput(body)
        
        // Créer une nouvelle requête avec le body nettoyé
        const newReq = new NextRequest(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(sanitizedBody)
        })
        
        return handler(newReq)
      }
      
      return handler(req)
    } catch (error) {
      console.error('Input validation error:', error)
      return new NextResponse(
        JSON.stringify({ error: 'Invalid input format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }
}

// Middleware combiné de sécurité
export function createSecureHandler(
  handler: (req: NextRequest) => Promise<Response>,
  options: {
    sanitizeBody?: boolean
    validateUrls?: boolean
    allowedDomains?: string[]
    enableSecurityHeaders?: boolean
  } = {}
) {
  let secureHandler = handler
  
  if (options.sanitizeBody) {
    secureHandler = inputValidationMiddleware(secureHandler, options)
  }
  
  if (options.enableSecurityHeaders !== false) {
    secureHandler = securityMiddleware(secureHandler)
  }
  
  return secureHandler
}
