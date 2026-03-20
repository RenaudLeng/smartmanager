import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Schémas de validation
const reportQuerySchema = z.object({
  type: z.enum(['sales', 'products', 'tenants', 'users', 'financial']),
  period: z.enum(['day', 'week', 'month', 'quarter', 'year']),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  tenantId: z.string().optional(),
  groupBy: z.string().optional()
})

// GET /api/reports - Générer des rapports
export async function GET(request: NextRequest) {
  try {
    const query = Object.fromEntries(request.nextUrl.searchParams)
    const validatedQuery = reportQuerySchema.parse(query)

    let data: any = {}

    switch (validatedQuery.type) {
      case 'sales':
        data = await generateSalesReport(validatedQuery)
        break
      case 'products':
        data = await generateProductsReport(validatedQuery)
        break
      case 'tenants':
        data = await generateTenantsReport(validatedQuery)
        break
      case 'users':
        data = await generateUsersReport(validatedQuery)
        break
      case 'financial':
        data = await generateFinancialReport(validatedQuery)
        break
      default:
        throw new Error('Type de rapport non supporté')
    }

    return NextResponse.json({
      success: true,
      data
    })
  } catch (error) {
    console.error('Erreur GET /api/reports:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Paramètres invalides', details: error.issues || [] },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    )
  }
}

// Rapport des ventes
async function generateSalesReport(query: any) {
  const where: any = {}

  if (query.tenantId) {
    where.tenantId = query.tenantId
  }

  if (query.startDate && query.endDate) {
    where.createdAt = {
      gte: new Date(query.startDate),
      lte: new Date(query.endDate)
    }
  }

  const sales = await prisma.sale.findMany({
    where,
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      },
      user: {
        select: {
          name: true
        }
      },
      client: {
        select: {
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Calculer les statistiques
  const totalSales = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  const totalDiscount = sales.reduce((sum, sale) => sum + (sale.discountAmount || 0), 0)
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0)

  // Ventes par jour
  const salesByDay = sales.reduce((acc: any, sale) => {
    const day = sale.createdAt.toISOString().split('T')[0]
    if (!acc[day]) {
      acc[day] = { count: 0, amount: 0 }
    }
    acc[day].count += 1
    acc[day].amount += sale.finalAmount || 0
    return acc
  }, {})

  // Ventes par catégorie
  const salesByCategory = sales.reduce((acc: any, sale) => {
    sale.items.forEach(item => {
      const category = item.product.category?.name || 'Non catégorisé'
      if (!acc[category]) {
        acc[category] = { count: 0, amount: 0 }
      }
      acc[category].count += item.quantity
      acc[category].amount += item.totalPrice || 0
    })
    return acc
  }, {})

  // Top produits
  const topProducts = sales.reduce((acc: any, sale) => {
    sale.items.forEach(item => {
      const productName = item.product.name
      if (!acc[productName]) {
        acc[productName] = { quantity: 0, revenue: 0 }
      }
      acc[productName].quantity += item.quantity
      acc[productName].revenue += item.totalPrice || 0
    })
    return acc
  }, {})

  return {
    summary: {
      totalSales: sales.length,
      totalRevenue,
      totalDiscount,
      averageSale: sales.length > 0 ? totalRevenue / sales.length : 0
    },
    salesByDay: Object.entries(salesByDay).map(([day, data]: [string, any]) => ({
      date: day,
      ...data
    })),
    salesByCategory: Object.entries(salesByCategory).map(([category, data]: [string, any]) => ({
      category,
      ...data
    })),
    topProducts: Object.entries(topProducts)
      .sort(([, a]: [string, any], [, b]: [string, any]) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(([product, data]: [string, any]) => ({
        product,
        ...data
      })),
    recentSales: sales.slice(0, 20)
  }
}

// Rapport des produits
async function generateProductsReport(query: any) {
  const where: any = {}

  if (query.tenantId) {
    where.tenantId = query.tenantId
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        select: {
          name: true
        }
      },
      supplier: {
        select: {
          name: true
        }
      },
      saleItems: {
        select: {
          quantity: true,
          totalPrice: true,
          sale: {
            select: {
              createdAt: true
            }
          }
        }
      }
    }
  })

  // Calculer les statistiques
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isActive).length
  const lowStockProducts = products.filter(p => p.quantity <= p.minStock).length

  // Produits par catégorie
  const productsByCategory = products.reduce((acc: any, product) => {
    const category = product.category?.name || 'Non catégorisé'
    if (!acc[category]) {
      acc[category] = { count: 0, totalValue: 0 }
    }
    acc[category].count += 1
    acc[category].totalValue += product.quantity * product.sellingPrice
    return acc
  }, {})

  // Produits les plus vendus
  const productSales = products.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category?.name,
    quantity: product.quantity,
    minStock: product.minStock,
    totalSold: product.saleItems.reduce((sum, item) => sum + item.quantity, 0),
    revenue: product.saleItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0),
    stockValue: product.quantity * product.sellingPrice,
    status: product.quantity <= product.minStock ? 'low_stock' : 'normal'
  })).sort((a, b) => b.revenue - a.revenue)

  return {
    summary: {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      lowStockProducts,
      totalStockValue: products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0)
    },
    productsByCategory: Object.entries(productsByCategory).map(([category, data]: [string, any]) => ({
      category,
      ...data
    })),
    topProducts: productSales.slice(0, 20),
    lowStockProducts: productSales.filter(p => p.status === 'low_stock').slice(0, 10)
  }
}

// Rapport des tenants
async function generateTenantsReport(query: any) {
  const tenants = await prisma.tenant.findMany({
    include: {
      users: true,
      sales: true,
      products: true,
      subscriptions: {
        where: {
          status: 'active'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    }
  })

  // Statistiques par tenant
  const tenantStats = tenants.map(tenant => ({
    id: tenant.id,
    name: tenant.name,
    businessType: tenant.businessType,
    status: tenant.status,
    userCount: tenant.users.filter(u => u.isActive).length,
    productCount: tenant.products.filter(p => p.isActive).length,
    totalSales: tenant.sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0),
    salesCount: tenant.sales.length,
    subscription: tenant.subscriptions[0]?.plan || 'none',
    createdAt: tenant.createdAt
  }))

  // Agrégations globales
  const totalTenants = tenants.length
  const activeTenants = tenants.filter(t => t.status === 'active').length
  const totalUsers = tenants.reduce((sum, t) => sum + t.users.filter(u => u.isActive).length, 0)
  const totalProducts = tenants.reduce((sum, t) => sum + t.products.filter(p => p.isActive).length, 0)

  // Par type de business
  const tenantsByType = tenants.reduce((acc: any, tenant) => {
    if (!acc[tenant.businessType]) {
      acc[tenant.businessType] = { count: 0, users: 0, products: 0, revenue: 0 }
    }
    acc[tenant.businessType].count += 1
    acc[tenant.businessType].users += tenant.users.filter(u => u.isActive).length
    acc[tenant.businessType].products += tenant.products.filter(p => p.isActive).length
    acc[tenant.businessType].revenue += tenant.sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
    return acc
  }, {})

  return {
    summary: {
      totalTenants,
      activeTenants,
      totalUsers,
      totalProducts,
      totalRevenue: tenants.reduce((sum, t) => sum + t.sales.reduce((s, sale) => s + (sale.totalAmount || 0), 0), 0)
    },
    tenantsByType: Object.entries(tenantsByType).map(([type, data]: [string, any]) => ({
      type,
      ...data
    })),
    topTenants: tenantStats.sort((a, b) => b.totalSales - a.totalSales).slice(0, 10),
    recentTenants: tenantStats.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10)
  }
}

// Rapport des utilisateurs
async function generateUsersReport(query: any) {
  const where: any = {}

  if (query.tenantId) {
    where.tenantId = query.tenantId
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      tenant: {
        select: {
          name: true,
          businessType: true
        }
      },
      sales: {
        select: {
          totalAmount: true,
          createdAt: true
        }
      }
    }
  })

  // Statistiques par utilisateur
  const userStats = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    tenant: user.tenant?.name,
    businessType: user.tenant?.businessType,
    salesCount: user.sales.length,
    totalSales: user.sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0),
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  }))

  // Par rôle
  const usersByRole = users.reduce((acc: any, user) => {
    if (!acc[user.role]) {
      acc[user.role] = { total: 0, active: 0, inactive: 0 }
    }
    acc[user.role].total += 1
    if (user.isActive) {
      acc[user.role].active += 1
    } else {
      acc[user.role].inactive += 1
    }
    return acc
  }, {})

  // Par tenant
  const usersByTenant = users.reduce((acc: any, user) => {
    const tenantName = user.tenant?.name || 'Global'
    if (!acc[tenantName]) {
      acc[tenantName] = { total: 0, active: 0, roles: {} }
    }
    acc[tenantName].total += 1
    if (user.isActive) {
      acc[tenantName].active += 1
    }
    if (!acc[tenantName].roles[user.role]) {
      acc[tenantName].roles[user.role] = 0
    }
    acc[tenantName].roles[user.role] += 1
    return acc
  }, {})

  return {
    summary: {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.isActive).length,
      inactiveUsers: users.filter(u => !u.isActive).length
    },
    usersByRole: Object.entries(usersByRole).map(([role, data]: [string, any]) => ({
      role,
      ...data
    })),
    usersByTenant: Object.entries(usersByTenant).map(([tenant, data]: [string, any]) => ({
      tenant,
      ...data
    })),
    topUsers: userStats.sort((a, b) => b.totalSales - a.totalSales).slice(0, 10)
  }
}

// Rapport financier
async function generateFinancialReport(query: any) {
  const where: any = {}

  if (query.tenantId) {
    where.tenantId = query.tenantId
  }

  if (query.startDate && query.endDate) {
    where.createdAt = {
      gte: new Date(query.startDate),
      lte: new Date(query.endDate)
    }
  }

  const sales = await prisma.sale.findMany({
    where,
    select: {
      totalAmount: true,
      discountAmount: true,
      finalAmount: true,
      paymentType: true,
      paymentStatus: true,
      createdAt: true
    }
  })

  const expenses = await prisma.expense.findMany({
    where,
    select: {
      amount: true,
      category: true,
      date: true,
      createdAt: true
    }
  })

  // Calculer les revenus
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0)
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalRevenue - totalExpenses

  // Par type de paiement
  const revenueByPaymentType = sales.reduce((acc: any, sale) => {
    if (!acc[sale.paymentType]) {
      acc[sale.paymentType] = { count: 0, amount: 0 }
    }
    acc[sale.paymentType].count += 1
    acc[sale.paymentType].amount += sale.finalAmount || 0
    return acc
  }, {})

  // Par catégorie de dépenses
  const expensesByCategory = expenses.reduce((acc: any, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = { count: 0, amount: 0 }
    }
    acc[expense.category].count += 1
    acc[expense.category].amount += expense.amount
    return acc
  }, {})

  // Par jour
  const financialByDay = {}
  
  sales.forEach(sale => {
    const day = sale.createdAt.toISOString().split('T')[0]
    if (!financialByDay[day]) {
      financialByDay[day] = { revenue: 0, expenses: 0 }
    }
    financialByDay[day].revenue += sale.finalAmount || 0
  })

  expenses.forEach(expense => {
    const day = expense.date.toISOString().split('T')[0]
    if (!financialByDay[day]) {
      financialByDay[day] = { revenue: 0, expenses: 0 }
    }
    financialByDay[day].expenses += expense.amount
  })

  return {
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      totalSales: sales.length,
      totalExpensesCount: expenses.length
    },
    revenueByPaymentType: Object.entries(revenueByPaymentType).map(([type, data]: [string, any]) => ({
      paymentType: type,
      ...data
    })),
    expensesByCategory: Object.entries(expensesByCategory).map(([category, data]: [string, any]) => ({
      category,
      ...data
    })),
    financialByDay: Object.entries(financialByDay).map(([day, data]: [string, any]) => ({
      date: day,
      ...data,
      net: data.revenue - data.expenses
    })).sort((a, b) => a.date.localeCompare(b.date))
  }
}
