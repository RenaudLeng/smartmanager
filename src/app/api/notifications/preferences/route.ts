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

    // Préférences de notifications par défaut
    const preferences = {
      emailNotifications: true,
      pushNotifications: true,
      orderNotifications: true,
      stockNotifications: true,
      marketingEmails: false
    }

    return NextResponse.json({
      success: true,
      data: preferences
    })

  } catch (error) {
    console.error('Erreur GET /api/notifications/preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des préférences' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const preferences = await request.json()

    return NextResponse.json({
      success: true,
      data: preferences
    })

  } catch (error) {
    console.error('Erreur POST /api/notifications/preferences:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des préférences' },
      { status: 500 }
    )
  }
}
