import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { SignOptions } from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { Role, Permission, ROLE_PERMISSIONS } from '@/types'

export interface AuthenticatedRequest extends NextRequest {
  user: JWTPayload
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: Role
  tenantId?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: JWTPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any }
  return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function hasPermission(userRole: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission as any) || false
}

export function requireAuth(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (req: NextRequest, ...args: any[]) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return new Response('Unauthorized', { status: 401 })
    }

    try {
      const payload = verifyToken(token)
      ;(req as AuthenticatedRequest).user = payload
      return handler(req, ...args)
    } catch (error) {
      return new Response('Invalid token', { status: 401 })
    }
  }
}

export function requirePermission(permission: Permission) {
  return (handler: (req: NextRequest, ...args: any[]) => Promise<Response>) => {
    return async (req: NextRequest, ...args: any[]) => {
      const user = (req as AuthenticatedRequest).user
      if (!user || !hasPermission(user.role as Role, permission)) {
        return new Response('Forbidden', { status: 403 })
      }
      return handler(req, ...args)
    }
  }
}

export function requireTenant(handler: (req: NextRequest, ...args: any[]) => Promise<Response>) {
  return async (req: NextRequest, ...args: any[]) => {
    const user = (req as AuthenticatedRequest).user
    if (!user?.tenantId) {
      return new Response('Tenant required', { status: 403 })
    }
    return handler(req, ...args)
  }
}
