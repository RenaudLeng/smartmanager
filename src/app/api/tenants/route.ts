import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { BUSINESS_TYPES_CONFIG } from '@/types/index'

const prisma = new PrismaClient()

// Schémas de validation
const createTenantSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  businessType: z.enum(['retail', 'restaurant', 'bar', 'pharmacy', 'supermarket', 'hair_salon', 'grocery', 'bar_restaurant']),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  address: z.string().optional(),
  adminName: z.string().min(2, 'Le nom de l\'admin doit contenir au moins 2 caractères'),
  adminEmail: z.string().email('Email admin invalide'),
  subscriptionPlan: z.enum(['free', 'premium', 'enterprise']),
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
    const validatedData = createTenantSchema.parse(body)

    // Définir les features selon le business type
    const getBusinessFeatures = (businessType: string) => {
      const featuresMap = {
        retail: {
          allowsDebt: false,
          allowsDelivery: false,
          allowsTableService: false,
          requiresTableNumber: false,
          allowsFlashCustomers: false,
          allowsTicketPrinting: true
        },
        restaurant: {
          allowsDebt: true,
          allowsDelivery: true,
          allowsTableService: true,
          requiresTableNumber: true,
          allowsFlashCustomers: true,
          allowsTicketPrinting: true
        },
        bar: {
          allowsDebt: true,
          allowsDelivery: false,
          allowsTableService: false,
          requiresTableNumber: false,
          allowsFlashCustomers: true,
          allowsTicketPrinting: true
        },
        pharmacy: {
          allowsDebt: false,
          allowsDelivery: true,
          allowsTableService: false,
          requiresTableNumber: false,
          allowsFlashCustomers: false,
          allowsTicketPrinting: true
        },
        supermarket: {
          allowsDebt: false,
          allowsDelivery: true,
          allowsTableService: false,
          requiresTableNumber: false,
          allowsFlashCustomers: false,
          allowsTicketPrinting: true
        },
        hair_salon: {
          allowsDebt: true,
          allowsDelivery: false,
          allowsTableService: false,
          requiresTableNumber: false,
          allowsFlashCustomers: true,
          allowsTicketPrinting: true
        },
        grocery: {
          allowsDebt: false,
          allowsDelivery: false,
          allowsTableService: false,
          requiresTableNumber: false,
          allowsFlashCustomers: false,
          allowsTicketPrinting: true
        },
        bar_restaurant: {
          allowsDebt: true,
          allowsDelivery: true,
          allowsTableService: true,
          requiresTableNumber: true,
          allowsFlashCustomers: true,
          allowsTicketPrinting: true
        }
      }
      return featuresMap[businessType as keyof typeof featuresMap] || featuresMap.retail
    }

    // Créer le tenant avec les features dynamiques
    const tenant = await prisma.tenant.create({
      data: {
        ...validatedData,
        status: 'active',
        features: JSON.stringify(getBusinessFeatures(validatedData.businessType))
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
        password: 'tempPassword123', // À générer aléatoirement
        lastLogin: new Date()
      }
    })

    // Utiliser la configuration du business type si aucune configuration personnalisée n'est fournie
    const businessConfig = validatedData.businessConfig || BUSINESS_TYPES_CONFIG[validatedData.businessType]

    // Créer les catégories par défaut
    if (businessConfig?.categories) {
      await prisma.category.createMany({
        data: businessConfig.categories.map(cat => ({
          ...cat,
          tenantId: tenant.id
        }))
      })
    }

    // Créer les produits par défaut
    if (businessConfig?.defaultProducts) {
      await prisma.product.createMany({
        data: businessConfig.defaultProducts.map(product => ({
          name: product.name,
          description: product.description,
          purchasePrice: ('sellingPrice' in product ? product.sellingPrice : product.price) * 0.7, // 70% du prix de vente
          sellingPrice: 'sellingPrice' in product ? product.sellingPrice : product.price,
          categoryId: ('sellingPrice' in product ? product.category : product.category), // Note: devrait être categoryId
          tenantId: tenant.id,
          quantity: 0,
          minStock: 0,
          isActive: true
        }))
      })
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
