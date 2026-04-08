import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-token',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
]

// Routes SuperAdmin qui nécessitent des permissions spécifiques
// Gérées par les middlewares API individuellement

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Autoriser les routes publiques
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Vérifier l'authentification pour les routes protégées
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    // Rediriger vers login pour les routes frontend
    if (pathname.startsWith('/')) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Retourner 401 pour les API
    return NextResponse.json(
      { success: false, error: 'Authentification requise' },
      { status: 401 }
    )
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Les permissions spécifiques sont gérées par les middlewares API

    // Ajouter les informations utilisateur à la requête
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.id)
    response.headers.set('x-user-role', decoded.role)
    response.headers.set('x-tenant-id', decoded.tenantId || '')

    return response

  } catch (error) {
    console.error('Erreur middleware auth:', error)
    
    // Token invalide
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }
    
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
