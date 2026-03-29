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

    // Simuler des notifications pour l'utilisateur
    const notifications = [
      {
        id: 1,
        title: 'Nouvelle commande',
        message: 'Vous avez reçu une nouvelle commande',
        type: 'info',
        read: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Stock faible',
        message: 'Le produit "Produit A" est en stock faible',
        type: 'warning',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ]

    return NextResponse.json({
      success: true,
      data: notifications
    })

  } catch (error) {
    console.error('Erreur GET /api/notifications:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    )
  }
}
