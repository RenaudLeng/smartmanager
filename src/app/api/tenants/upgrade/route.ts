import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { tenantId, plan } = await request.json()

    if (!tenantId || !plan) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    // Valider le plan
    const validPlans = ['free', 'trial', 'premium', 'enterprise']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { success: false, error: 'Plan invalide' },
        { status: 400 }
      )
    }

    // Mettre à jour le tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        // Note: subscriptionPlan n'existe pas dans la base de données actuelle
        // On pourrait l'ajouter comme un champ JSON dans features ou créer une table séparée
        features: JSON.stringify({
          allowsDebt: plan !== 'free',
          allowsDelivery: plan !== 'free',
          allowsTableService: ['restaurant', 'bar_restaurant'].includes(plan),
          requiresTableNumber: ['restaurant', 'bar_restaurant'].includes(plan),
          allowsFlashCustomers: plan !== 'free',
          allowsTicketPrinting: true,
          subscriptionPlan: plan,
          updatedAt: new Date()
        })
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedTenant
    })

  } catch (error) {
    console.error('Erreur dans /api/tenants/upgrade:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
