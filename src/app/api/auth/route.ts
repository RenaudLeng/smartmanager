import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Schémas de validation
const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères')
})

const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  tenantName: z.string().min(2, 'Le nom de la boutique doit contenir au moins 2 caractères'),
  businessType: z.enum(['retail', 'bar', 'restaurant', 'hair_salon', 'pharmacy', 'supermarket']),
  phone: z.string().optional(),
  address: z.string().optional()
})

// POST /api/auth/login - Connexion utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { 
        email,
        isActive: true 
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            businessType: true,
            status: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe incorrect' },
        { status: 401 }
      )
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Récupérer les permissions
    const permissions = await prisma.user.findMany({
      where: { 
        tenantId: user.tenantId,
        isActive: true 
      }
    })

    const userPermissions = permissions.map(p => p.role)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: userPermissions
        },
        tenant: user.tenant,
        token
      }
    })
  } catch (error) {
    console.error('Erreur POST /api/auth/login:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la connexion' },
      { status: 500 }
    )
  }
}

// POST /api/auth/register - Inscription
export async function REGISTER(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Créer le tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: validatedData.tenantName,
        businessType: validatedData.businessType,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        status: 'active'
      }
    })

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'admin',
        tenantId: tenant.id,
        isActive: true,
        lastLogin: new Date()
      }
    })

    // Créer les catégories par défaut selon le type de business
    const defaultCategories: Record<string, { name: string; description: string }[]> = {
      retail: [
        { name: 'Alimentation', description: 'Produits alimentaires et boissons' },
        { name: 'Électronique', description: 'Appareils électroniques et accessoires' },
        { name: 'Vêtements', description: 'Vêtements et textiles' },
        { name: 'Hygiène', description: 'Produits de beauté et hygiène' }
      ],
      bar: [
        { name: 'Boissons', description: 'Boissons alcoolisées et non alcoolisées' },
        { name: 'Snacks', description: 'Snacks et nourriture à emporter' },
        { name: 'Tabac', description: 'Cigarettes et produits du tabac' }
      ],
      restaurant: [
        { name: 'Plats', description: 'Plats préparés et cuisinés' },
        { name: 'Ingrédients', description: 'Ingrédients et matières premières' },
        { name: 'Boissons', description: 'Boissons et desserts' }
      ],
      pharmacy: [
        { name: 'Médicaments', description: 'Médicaments et produits pharmaceutiques' },
        { name: 'Produits de soin', description: 'Produits de beauté et de soin personnel' },
        { name: 'Équipement médical', description: 'Équipement médical et accessoires' }
      ],
      supermarket: [
        { name: 'Épicerie', description: 'Produits d\'épicerie et de base' },
        { name: 'Surgelés', description: 'Produits surgelés et conservés' },
        { name: 'Boulangerie', description: 'Pain et produits de boulangerie' },
        { name: 'Produits laitiers', description: 'Produits laitiers et dérivés' },
        { name: 'Entrées', description: 'Salades, soupes, apéritifs' },
        { name: 'Plats principaux', description: 'Plats chauds traditionnels' },
        { name: 'Desserts', description: 'Gâteaux, pâtisseries' },
        { name: 'Boissons', description: 'Jus, sodas, boissons' },
        { name: 'Apéritifs', description: 'Amuse-gueules, digestifs, boissons' }
      ]
    }

    if (defaultCategories[validatedData.businessType]) {
      await prisma.category.createMany({
        data: defaultCategories[validatedData.businessType as keyof typeof defaultCategories].map(cat => ({
          name: cat.name,
          description: cat.description,
          tenantId: tenant.id
        }))
      })
    }

    // Générer le token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: tenant.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: ['read', 'write', 'delete', 'manage_users']
        },
        tenant,
        token
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/auth/register:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}

// POST /api/auth/logout - Déconnexion
export async function LOGOUT(request: NextRequest) {
  try {
    // Pour une vraie application, vous pourriez vouloir
    // - Ajouter le token à une liste noire
    // - Implémenter une logique de révocation
    // - Nettoyer les cookies
    
    return NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    })
  } catch (error) {
    console.error('Erreur POST /api/auth/logout:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    )
  }
}
