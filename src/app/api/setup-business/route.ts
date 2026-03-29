import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

interface SetupData {
  businessName: string
  businessType: string
  email: string
  phone?: string
  address?: string
  adminName: string
  adminEmail: string
  adminPassword: string
  features: Record<string, boolean> // Accepter toutes les features dynamiques
}

export async function POST(request: NextRequest) {
  try {
    const data: SetupData = await request.json()

    // Validation des données
    if (!data.businessName || !data.businessType || !data.adminEmail || !data.adminPassword) {
      return NextResponse.json({
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis'
      }, { status: 400 })
    }

    // Vérifier si l'email administrateur existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: data.adminEmail }
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Un compte avec cet email existe déjà'
      }, { status: 400 })
    }

    // Vérifier si une entreprise avec le même nom existe déjà
    const existingTenant = await prisma.tenant.findFirst({
      where: { name: data.businessName }
    })

    if (existingTenant) {
      return NextResponse.json({
        success: false,
        error: 'Une entreprise avec ce nom existe déjà'
      }, { status: 400 })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(data.adminPassword, 12)

    // Créer le tenant avec période d'essai
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14) // 14 jours d'essai

    const tenant = await prisma.tenant.create({
      data: {
        name: data.businessName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        businessType: data.businessType as 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket' | 'hair_salon' | 'grocery' | 'bar_restaurant',
        currency: 'XAF',
        status: 'active',
        features: JSON.stringify(data.features) // Stocker les features dynamiques
      }
    })

    // Créer l'administrateur séparément
    const admin = await prisma.user.create({
      data: {
        name: data.adminName,
        email: data.adminEmail,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        tenantId: tenant.id
      }
    })

    // Créer les catégories par défaut selon le type d'activité
    const defaultCategories = getDefaultCategories(data.businessType)
    
    for (const category of defaultCategories) {
      await prisma.category.create({
        data: {
          name: category.name,
          description: category.description,
          tenantId: tenant.id
        }
      })
    }

    // Créer quelques produits par défaut
    const defaultProducts = getDefaultProducts(data.businessType)
    
    for (const product of defaultProducts) {
      const category = await prisma.category.findFirst({
        where: { 
          name: product.category, 
          tenantId: tenant.id 
        }
      })

      if (category) {
        await prisma.product.create({
          data: {
            name: product.name,
            description: `Produit par défaut: ${product.name}`,
            purchasePrice: 0,
            sellingPrice: product.sellingPrice,
            margin: null,
            profitability: null,
            quantity: 100,
            minStock: 10,
            categoryId: category.id,
            supplierId: null,
            expirationDate: null,
            tenantId: tenant.id,
            isActive: true
          }
        })
      }
    }

    // Créer des dépenses par défaut
    const defaultExpenses = getDefaultExpenses(data.businessType)
    
    for (const expense of defaultExpenses) {
      await prisma.expense.create({
        data: {
          description: expense,
          amount: 0, // Sera rempli par l'utilisateur
          date: new Date(),
          category: 'Opérationnel',
          tenantId: tenant.id,
          userId: admin.id // Utiliser l'ID de l'administrateur créé
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          businessType: tenant.businessType
        },
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      },
      message: 'Entreprise créée avec succès. Période d\'essai de 14 jours activée.'
    })

  } catch (error) {
    console.error('Erreur lors de la création du tenant:', error)
    return NextResponse.json({
      success: false,
      error: 'Une erreur est survenue lors de la création de votre entreprise'
    }, { status: 500 })
  }
}

function getDefaultCategories(businessType: string) {
  const categories: Record<string, Array<{ name: string; description: string }>> = {
    retail: [
      { name: 'Vêtements', description: 'Articles de mode et textiles' },
      { name: 'Accessoires', description: 'Sacs, chaussures, bijoux' },
      { name: 'Électronique', description: 'Appareils électroniques' }
    ],
    restaurant: [
      { name: 'Plats principaux', description: 'Plats chauds principaux' },
      { name: 'Boissons', description: 'Boissons diverses' },
      { name: 'Desserts', description: 'Desserts et pâtisseries' }
    ],
    bar: [
      { name: 'Boissons alcoolisées', description: 'Bières, vins, spiritueux' },
      { name: 'Cocktails', description: 'Cocktails préparés' },
      { name: 'Boissons non-alcoolisées', description: 'Jus, sodas, eau' }
    ],
    pharmacy: [
      { name: 'Médicaments', description: 'Médicaments divers' },
      { name: 'Produits hygiène', description: 'Produits de soin personnel' },
      { name: 'Vitamines', description: 'Compléments alimentaires' }
    ],
    supermarket: [
      { name: 'Boulangerie', description: 'Pains et viennoiseries' },
      { name: 'Produits laitiers', description: 'Lait, yaourts, fromages' },
      { name: 'Épicerie', description: 'Produits secs et conserves' }
    ],
    hair_salon: [
      { name: 'Coupe homme', description: 'Coupe de cheveux pour hommes' },
      { name: 'Coupe femme', description: 'Coupe de cheveux pour femmes' },
      { name: 'Coloration', description: 'Services de coloration' }
    ],
    grocery: [
      { name: 'Céréales', description: 'Riz, maïs, mil' },
      { name: 'Huiles et graisses', description: 'Huiles de cuisson' },
      { name: 'Épices', description: 'Condiments et épices' }
    ],
    bar_restaurant: [
      { name: 'Plats principaux', description: 'Plats chauds principaux' },
      { name: 'Boissons alcoolisées', description: 'Bières, vins, spiritueux' },
      { name: 'Cocktails', description: 'Cocktails préparés' }
    ]
  }

  return categories[businessType] || categories.retail
}

function getDefaultProducts(businessType: string) {
  const products: Record<string, Array<{ name: string; sellingPrice: number; category: string }>> = {
    retail: [
      { name: 'T-shirt', sellingPrice: 5000, category: 'Vêtements' },
      { name: 'Jean', sellingPrice: 15000, category: 'Vêtements' },
      { name: 'Chaussures', sellingPrice: 25000, category: 'Accessoires' }
    ],
    restaurant: [
      { name: 'Plat du jour', sellingPrice: 3500, category: 'Plats principaux' },
      { name: 'Boisson', sellingPrice: 800, category: 'Boissons' },
      { name: 'Dessert', sellingPrice: 1500, category: 'Desserts' }
    ],
    bar: [
      { name: 'Bière', sellingPrice: 1000, category: 'Boissons alcoolisées' },
      { name: 'Cocktail', sellingPrice: 2500, category: 'Cocktails' },
      { name: 'Jus de fruit', sellingPrice: 800, category: 'Boissons non-alcoolisées' }
    ],
    pharmacy: [
      { name: 'Paracétamol', sellingPrice: 500, category: 'Médicaments' },
      { name: 'Savon', sellingPrice: 1500, category: 'Produits hygiène' },
      { name: 'Vitamine C', sellingPrice: 2000, category: 'Vitamines' }
    ],
    supermarket: [
      { name: 'Pain', sellingPrice: 500, category: 'Boulangerie' },
      { name: 'Lait', sellingPrice: 800, category: 'Produits laitiers' },
      { name: 'Riz', sellingPrice: 1500, category: 'Épicerie' }
    ],
    hair_salon: [
      { name: 'Coupe homme', sellingPrice: 3000, category: 'Coupe homme' },
      { name: 'Coupe femme', sellingPrice: 5000, category: 'Coupe femme' },
      { name: 'Coloration', sellingPrice: 8000, category: 'Coloration' }
    ],
    grocery: [
      { name: 'Riz', sellingPrice: 1000, category: 'Céréales' },
      { name: 'Huile', sellingPrice: 2000, category: 'Huiles et graisses' },
      { name: 'Sel', sellingPrice: 500, category: 'Épices' }
    ],
    bar_restaurant: [
      { name: 'Plat du jour', sellingPrice: 3500, category: 'Plats principaux' },
      { name: 'Bière', sellingPrice: 1000, category: 'Boissons alcoolisées' },
      { name: 'Cocktail', sellingPrice: 2500, category: 'Cocktails' }
    ]
  }

  return products[businessType] || products.retail
}

function getDefaultExpenses(businessType: string) {
  const expenses: Record<string, string[]> = {
    retail: ['Loyer', 'Électricité', 'Salaires'],
    restaurant: ['Ingrédients', 'Loyer', 'Salaires'],
    bar: ['Alcool', 'Loyer', 'Salaires'],
    pharmacy: ['Médicaments', 'Loyer', 'Salaires'],
    supermarket: ['Fournisseurs', 'Loyer', 'Salaires'],
    hair_salon: ['Produits', 'Loyer', 'Salaires'],
    grocery: ['Fournisseurs', 'Loyer', 'Salaires'],
    bar_restaurant: ['Ingrédients', 'Alcool', 'Loyer', 'Salaires']
  }

  return expenses[businessType] || expenses.retail
}
