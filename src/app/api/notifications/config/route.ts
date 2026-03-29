import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

    let decoded: any
    try {
      const jwt = require('jsonwebtoken')
      decoded = jwt.verify(token, JWT_SECRET) as any
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Configuration des notifications par défaut
    const config = {
      types: {
        orders: { enabled: true, email: true, push: true },
        stock: { enabled: true, email: true, push: true },
        payments: { enabled: true, email: true, push: false },
        system: { enabled: true, email: false, push: true }
      },
      frequency: {
        immediate: true,
        daily: false,
        weekly: false
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      }
    }

    return NextResponse.json({
      success: true,
      data: config
    })

  } catch (error) {
    console.error('Erreur GET /api/notifications/config:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    )
  }
}
