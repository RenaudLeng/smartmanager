import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { BUSINESS_TYPES_CONFIG } from '@/types/index'
import { hashPassword } from '@/lib/auth'

// Schémas de validation
const createTenantSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  businessType: z.enum(['retail', 'restaurant', 'bar', 'pharmacy', 'supermarket', 'hair_salon', 'grocery', 'bar_restaurant']),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  adminName: z.string().min(2, 'Le nom de l\'admin doit contenir au moins 2 caractères'),
  adminEmail: z.string().email('Email admin invalide'),
  adminPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  subscriptionPlan: z.enum(['free', 'premium', 'enterprise']),
  features: z.object({
    debtManagement: z.boolean().default(false),
    delivery: z.boolean().default(false),
    tableService: z.boolean().default(false),
    tableNumberRequired: z.boolean().default(false),
    flashCustomers: z.boolean().default(false),
    ticketPrinting: z.boolean().default(false)
  }).optional(),
  businessConfig: z.object({
    categories: z.array(z.object({
      name: z.string(),
      description: z.string().optional()
    })).optional(),
    defaultProducts: z.array(z.object({
      name: z.string(),
      sellingPrice: z.number(),
      category: z.string(),
      description: z.string().optional()
    })).optional(),
    defaultExpenses: z.array(z.string()).optional()
  }).optional()
})

// GET /api/tenants - Lister tous les tenants
export async function GET(request: NextRequest) {
  try {
    const { search, status, businessType } = Object.fromEntries(request.nextUrl.searchParams)

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (businessType) {
      where.businessType = businessType
    }

    const tenants = await prisma.tenant.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: tenants
    })
  } catch (error) {
    console.error('Erreur GET /api/tenants:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des tenants' },
      { status: 500 }
    )
  }
}

// POST /api/tenants - Créer un nouveau tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Données reçues:', JSON.stringify(body, null, 2))
    const validatedData = createTenantSchema.parse(body)
    console.log('Données validées:', JSON.stringify(validatedData, null, 2))

    // Définir les features selon le business type
    // Note: Cette fonction peut être utilisée plus tard pour des configurations avancées

    // Créer le tenant avec les features dynamiques
    const tenant = await prisma.tenant.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        businessType: validatedData.businessType,
        status: 'active',
        features: validatedData.features ? JSON.stringify(validatedData.features) : null
      }
    })

    // Créer l'utilisateur admin
    const adminUser = await prisma.user.create({
      data: {
        email: validatedData.adminEmail,
        name: validatedData.adminName,
        role: 'admin',
        tenantId: tenant.id,
        isActive: true,
        password: await hashPassword(validatedData.adminPassword), // Utiliser le mot de passe fourni
        lastLogin: new Date()
      }
    })

    // Utiliser la configuration du business type si aucune configuration personnalisée n'est fournie
    const businessConfig = validatedData.businessConfig || BUSINESS_TYPES_CONFIG[validatedData.businessType]

    // Créer les catégories par défaut et récupérer leurs IDs
    let categoryMap: Record<string, string> = {}
    if (businessConfig?.categories) {
      await prisma.category.createMany({
        data: businessConfig.categories.map(cat => ({
          ...cat,
          tenantId: tenant.id
        }))
      })

      // Récupérer les catégories créées avec leurs IDs
      const categories = await prisma.category.findMany({
        where: {
          tenantId: tenant.id,
          name: {
            in: businessConfig.categories.map(cat => cat.name)
          }
        }
      })

      // Créer un mapping nom -> ID
      categoryMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.id
        return acc
      }, {} as Record<string, string>)
    }

    // Créer les produits par défaut en utilisant les IDs de catégories réels
    if (businessConfig?.defaultProducts) {
      const validProducts = businessConfig.defaultProducts
        .map(product => {
          const categoryName = 'sellingPrice' in product ? product.category : product.category
          const categoryId = categoryMap[categoryName]
          
          if (!categoryId) {
            console.warn(`Catégorie "${categoryName}" non trouvée pour le produit "${product.name}"`)
            return null
          }

          return {
            name: product.name,
            description: product.description,
            purchasePrice: ('sellingPrice' in product ? product.sellingPrice : product.price) * 0.7,
            sellingPrice: 'sellingPrice' in product ? product.sellingPrice : product.price,
            categoryId: categoryId,
            tenantId: tenant.id,
            quantity: 0,
            minStock: 0,
            isActive: true
          }
        })
        .filter((product): product is NonNullable<typeof product> => product !== null)

      if (validProducts.length > 0) {
        await prisma.product.createMany({
          data: validProducts
        })
      }
    }

    // Définir les fonctionnalités selon le plan
    const getFeatures = (plan: string) => {
      switch (plan) {
        case 'free':
          return ['3 utilisateurs', '50 produits', '500 MB stockage']
        case 'premium':
          return ['10 utilisateurs', '500 produits', '2 GB stockage', 'API accès']
        case 'enterprise':
          return ['50 utilisateurs', '5000 produits', '10 GB stockage', 'API complète', 'Support prioritaire']
        default:
          return []
      }
    }

    // Créer l'abonnement
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        plan: validatedData.subscriptionPlan,
        price: validatedData.subscriptionPlan === 'free' ? 0 : 
               validatedData.subscriptionPlan === 'premium' ? 10000 : 25000,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 an plus tard
        status: 'active',
        features: String(getFeatures(validatedData.subscriptionPlan))
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...tenant,
        users: [adminUser]
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/tenants:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du tenant' },
      { status: 500 }
    )
  }
}
