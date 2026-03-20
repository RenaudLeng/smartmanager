import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Schémas de validation
const createUserSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  role: z.enum(['admin', 'manager', 'cashier', 'seller']),
  tenantId: z.string().min(1, 'Tenant ID requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  phone: z.string().optional(),
  permissions: z.array(z.string()).optional()
})

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'cashier', 'seller']).optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

// GET /api/users - Lister les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const { tenantId, role, status, search } = Object.fromEntries(request.nextUrl.searchParams)

    const where: any = {}

    if (tenantId) {
      where.tenantId = tenantId
    }

    if (role && role !== 'all') {
      where.role = role
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active'
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            businessType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: users
    })
  } catch (error) {
    console.error('Erreur GET /api/users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    )
  }
}

// POST /api/users - Créer un utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    // Vérifier si l'email existe déjà pour ce tenant
    const existingUser = await prisma.user.findFirst({
      where: {
        email: validatedData.email,
        tenantId: validatedData.tenantId
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé pour ce tenant' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const bcrypt = require('bcryptjs')
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        isActive: true,
        lastLogin: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: user
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur POST /api/users:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues || [] },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Mettre à jour un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Si mot de passe fourni, le hasher
    let updateData: any = { ...validatedData }
    if (validatedData.password) {
      const bcrypt = require('bcryptjs')
      updateData.password = await bcrypt.hash(validatedData.password, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Erreur PUT /api/users:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues || [] },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })
  } catch (error) {
    console.error('Erreur DELETE /api/users:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// POST /api/users/[id]/suspend - Suspendre un utilisateur
export async function POST_SUSPEND(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const { reason } = await request.json()

    const user = await prisma.user.update({
      where: { id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Erreur POST /api/users/suspend:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suspension de l\'utilisateur' },
      { status: 500 }
    )
  }
}

// POST /api/users/[id]/activate - Activer un utilisateur
export async function POST_ACTIVATE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const user = await prisma.user.update({
      where: { id },
      data: { 
        isActive: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Erreur POST /api/users/activate:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'activation de l\'utilisateur' },
      { status: 500 }
    )
  }
}
