import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Simuler une base de données pour les plans (à remplacer par Prisma plus tard)
let plans: any[] = []

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé - Token manquant' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé - SuperAdmin requis' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: plans
    })

  } catch (error) {
    console.error('Erreur GET /api/plans:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des plans' },
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
        { success: false, error: 'Non autorisé - Token manquant' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

    let decoded: any
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Token invalide' },
        { status: 401 }
      )
    }

    if (!decoded || decoded.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé - SuperAdmin requis' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Validation
    const { name, price, duration, isActive, features } = body
    
    if (!name || typeof price !== 'number' || !['monthly', 'yearly'].includes(duration)) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      )
    }

    // Créer le plan
    const newPlan = {
      id: `plan_${Date.now()}`,
      name,
      price,
      duration,
      isActive,
      features: features || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    plans.push(newPlan)

    return NextResponse.json({
      success: true,
      data: newPlan
    })

  } catch (error) {
    console.error('Erreur POST /api/plans:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du plan' },
      { status: 500 }
    )
  }
}
