import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Schéma de validation pour la mise à jour
const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'manager', 'cashier', 'seller', 'super_admin']).optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
})

// PUT /api/users/[id] - Mettre à jour un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher la modification du rôle SuperAdmin
    if (existingUser.role === 'super_admin' && validatedData.role && validatedData.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Impossible de modifier le rôle d\'un SuperAdmin' },
        { status: 403 }
      )
    }

    // Si le mot de passe est fourni, le hasher
    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: validatedData,
      include: {
        tenant: existingUser.tenantId ? {
          select: {
            id: true,
            name: true,
            businessType: true
          }
        } : false
      }
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Utilisateur mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur PUT /api/users/[id]:', error)
    
    // Gérer les erreurs Zod
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
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
    const { id } = params

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Empêcher la suppression du SuperAdmin
    if (user.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer un SuperAdmin' },
        { status: 403 }
      )
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur DELETE /api/users/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}
