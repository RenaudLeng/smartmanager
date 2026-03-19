import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/tenants/stats - Statistiques globales
export async function GET(request: NextRequest) {
  try {
    const totalTenants = await prisma.tenant.count()
    const activeTenants = await prisma.tenant.count({
      where: { status: 'active' }
    })
    const totalUsers = await prisma.user.count({
      where: { isActive: true }
    })

    // Calculer les statistiques de ventes
    const sales = await prisma.sale.findMany({
      select: {
        totalAmount: true,
        createdAt: true
      }
    })

    const today = new Date()
    const todaySales = sales
      .filter(sale => {
        const saleDate = new Date(sale.createdAt)
        return saleDate.toDateString() === today.toDateString()
      })
      .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)

    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const monthSales = sales
      .filter(sale => new Date(sale.createdAt) >= monthAgo)
      .reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)

    const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)

    // Top types de business
    const businessTypes = await prisma.tenant.groupBy({
      by: ['businessType'],
      _count: {
        id: true
      }
    })

    const topBusinessTypes = businessTypes.map(item => ({
      type: item.businessType as string,
      count: item._count as number,
      percentage: totalTenants > 0 ? Math.round((item._count / totalTenants) * 100 * 10) / 10 : 0
    }))

    const globalStats = {
      totalTenants,
      activeTenants,
      totalUsers,
      totalSales,
      todaySales,
      monthSales,
      newTenantsThisMonth: 0,
      topBusinessTypes,
      growthRate: 0
    }

    return NextResponse.json({
      success: true,
      data: globalStats
    })
  } catch (error) {
    console.error('Erreur GET /api/tenants/stats:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
