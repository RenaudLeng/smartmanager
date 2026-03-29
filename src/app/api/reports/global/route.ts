import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token du header Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé - Token manquant' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

    // Vérifier le token
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

    // Simuler des données de rapport global (pour l'instant)
    const reportData = {
      period: '30days',
      totalSales: 0,
      totalOrders: 0,
      totalUsers: 0,
      totalTenants: 0,
      averageOrderValue: 0,
      revenueGrowth: 0,
      topProducts: [],
      topCategories: [],
      businessTypeBreakdown: [],
      salesByDay: [],
      newUsersByDay: [],
      revenueByMonth: []
    }

    return NextResponse.json({
      success: true,
      data: reportData
    })

  } catch (error) {
    console.error('Erreur API rapports globaux:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la récupération des rapports globaux' 
      },
      { status: 500 }
    )
  }
}
