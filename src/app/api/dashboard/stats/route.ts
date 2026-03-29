import { NextResponse, NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token du header Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Non autorisé - Token manquant' },
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
        { error: 'Token invalide' },
        { status: 401 }
      )
    }

    if (!decoded?.tenantId) {
      return NextResponse.json(
        { error: 'Non autorisé - Tenant ID manquant' },
        { status: 401 }
      )
    }

    const tenantId = decoded.tenantId

    // Obtenir la date du début et de fin de la journée
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Statistiques des ventes du jour
    const todaySales = await prisma.sale.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    // Calculer les ventes et profits du jour
    const todaySalesAmount = todaySales.reduce((sum, sale) => sum + sale.finalAmount, 0)
    const todayProfit = todaySales.reduce((sum, sale) => {
      const cost = sale.items.reduce((itemSum, item) => {
        return itemSum + (item.product?.purchasePrice || 0) * item.quantity
      }, 0)
      return sum + (sale.finalAmount - cost)
    }, 0)

    // Dépenses du jour
    const todayExpenses = await prisma.expense.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })
    const todayExpensesAmount = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Produits en stock faible
    const lowStockProducts = await prisma.product.count({
      where: {
        tenantId,
        isActive: true,
        quantity: {
          lte: prisma.product.fields.minStock
        }
      }
    })

    // Dettes clients (simplifié - enlever isPaid qui n'existe pas)
    const customerDebts = await prisma.debt.aggregate({
      where: {
        tenantId
      },
      _sum: {
        amount: true
      }
    })

    // Solde caisse (utiliser une table différente ou calculer depuis les ventes)
    const cashBalance = todaySalesAmount // Simplifié pour l'instant

    // Total des produits
    const totalProducts = await prisma.product.count({
      where: {
        tenantId,
        isActive: true
      }
    })

    // Total des ventes
    const totalSalesResult = await prisma.sale.aggregate({
      where: {
        tenantId
      },
      _sum: {
        finalAmount: true
      },
      _count: true
    })

    // Total des clients (simplifié - utiliser une table différente si nécessaire)
    const totalCustomers = 0 // Pour l'instant, car la table customer n'existe pas dans le schéma

    // Transactions récentes (sans customer pour l'instant)
    const recentTransactions = await prisma.sale.findMany({
      where: {
        tenantId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Produits vedettes (top ventes)
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: {
          tenantId
        }
      },
      _sum: {
        quantity: true
      },
      _count: true,
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    })

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        })
        return {
          name: product?.name || 'Produit inconnu',
          quantity: item._sum.quantity || 0,
          sales: item._count
        }
      })
    )

    // Formater les transactions récentes
    const formattedTransactions = recentTransactions.map(sale => ({
      id: sale.id,
      type: 'sale',
      amount: sale.finalAmount,
      customer: 'Client anonyme', // Simplifié pour l'instant
      description: 'Vente POS',
      time: sale.createdAt.toLocaleTimeString('fr-GA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'completed',
      paymentMethod: sale.paymentType,
      paymentStatus: sale.paymentStatus
    }))

    // Ajouter les dépenses récentes
    const recentExpenses = await prisma.expense.findMany({
      where: {
        tenantId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    })

    const formattedExpenses = recentExpenses.map(expense => ({
      id: expense.id,
      type: 'expense',
      amount: expense.amount,
      description: expense.description,
      time: expense.createdAt.toLocaleTimeString('fr-GA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      status: 'completed',
      paymentMethod: 'cash' // Simplifié
    }))

    // Combiner et trier toutes les transactions
    const allTransactions = [...formattedTransactions, ...formattedExpenses]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 10)

    const stats = {
      todaySales: todaySalesAmount,
      todayProfit,
      todayExpenses: todayExpensesAmount,
      lowStockProducts,
      customerDebts: customerDebts._sum?.amount || 0,
      cashBalance,
      totalProducts,
      totalSales: totalSalesResult._sum.finalAmount || 0,
      totalCustomers,
      recentTransactions: allTransactions,
      topProducts: topProductsWithDetails
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du chargement des statistiques' },
      { status: 500 }
    )
  }
}
