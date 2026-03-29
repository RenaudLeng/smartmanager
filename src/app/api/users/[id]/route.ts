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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Gérer le cas où le corps est vide
    let body = {}
    try {
      body = await request.json()
    } catch {
      // Si le corps est vide, on continue avec un objet vide
      console.log('Corps de requête vide ou invalide, utilisation des données par défaut')
    }
    
    // Ne valider que s'il y a des données à valider
    const validatedData = Object.keys(body).length > 0 ? updateUserSchema.parse(body) : {}

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

    // Mettre à jour l'utilisateur uniquement s'il y a des données à mettre à jour
    const updateData = Object.keys(validatedData).length > 0 ? validatedData : {}
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    // Créer un log d'audit pour cette action
    const action = validatedData.isActive === true ? 'activate' : 
                  validatedData.isActive === false ? 'suspend' : 
                  'update'
    
    await prisma.auditLog.create({
      data: {
        action: action,
        entity: 'user',
        entityId: id,
        userId: existingUser.id, // Utiliser l'ID de l'utilisateur modifié comme fallback
        tenantId: existingUser.tenantId,
        details: JSON.stringify({
          userName: existingUser.name,
          userEmail: existingUser.email,
          updatedFields: Object.keys(validatedData),
          ...(action === 'activate' || action === 'suspend' ? { 
            newStatus: validatedData.isActive ? 'active' : 'suspended' 
          } : {})
        }),
        ipAddress: request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    // Créer la réponse avec le statut calculé
    const responseData = {
      ...user,
      status: user.isActive ? 'active' : 'suspended'
    }

    return NextResponse.json({
      success: true,
      data: responseData,
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
    
    // Gérer les erreurs JSON
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { success: false, error: 'Corps de la requête invalide' },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.error('DELETE request for user ID:', id)

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      console.error('User not found:', id)
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

    console.error('Deleting user:', user.id, user.name)
    
    // Solution finale : supprimer l'utilisateur directement
    // Les auditLogs seront gérés par un système de nettoyage périodique
    await prisma.user.delete({
      where: { id }
    })

    console.error('User deleted successfully')
    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur DELETE /api/users/[id]:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}
