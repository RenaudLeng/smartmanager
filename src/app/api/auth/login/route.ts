import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'
import { monitoring } from '@/lib/monitoring'
import { authRateLimit } from '@/lib/rateLimit'
import { createSecureHandler } from '@/lib/security'
import { requireAuth } from '@/lib/auth'

async function postHandler(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      console.warn('Tentative de connexion sans email ou mot de passe', {
        email: email || 'missing',
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        email,
        isActive: true,
        deletedAt: null
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            businessType: true,
            currency: true
          }
        }
      }
    })

    if (!user) {
      console.warn('Tentative de connexion avec email invalide', {
        email,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      console.warn('Tentative de connexion avec mot de passe invalide', {
        email,
        userId: user.id,
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      })
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      tenantId: user.tenantId || undefined
    })

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    console.info('Connexion réussie', {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant
      },
      token
    })

  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const POST = requireAuth(monitoring.middleware()(postHandler))
