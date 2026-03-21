import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || 'default'

    // Récupérer la configuration du tenant
    let config = await prisma.dashboardConfig.findUnique({
      where: { tenantId }
    })

    // Si pas de configuration, créer la configuration par défaut
    if (!config) {
      config = await prisma.dashboardConfig.create({
        data: {
          tenantId,
          dailyObjective: 100000,
          dailyExpenseLimit: 50000,
          minProfitMargin: 15,
          lowStockThreshold: 10
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error fetching dashboard config:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, dailyObjective, dailyExpenseLimit, minProfitMargin, lowStockThreshold } = body

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID requis' },
        { status: 400 }
      )
    }

    // Mettre à jour ou créer la configuration
    const config = await prisma.dashboardConfig.upsert({
      where: { tenantId },
      update: {
        dailyObjective: dailyObjective ? parseInt(dailyObjective) : undefined,
        dailyExpenseLimit: dailyExpenseLimit ? parseInt(dailyExpenseLimit) : undefined,
        minProfitMargin: minProfitMargin ? parseFloat(minProfitMargin) : undefined,
        lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : undefined
      },
      create: {
        tenantId,
        dailyObjective: dailyObjective || 100000,
        dailyExpenseLimit: dailyExpenseLimit || 50000,
        minProfitMargin: minProfitMargin || 15,
        lowStockThreshold: lowStockThreshold || 10
      }
    })

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Configuration mise à jour avec succès'
    })
  } catch (error) {
    console.error('Error updating dashboard config:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la configuration' },
      { status: 500 }
    )
  }
}
