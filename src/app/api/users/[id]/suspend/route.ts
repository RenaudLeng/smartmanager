import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/users/[id]/suspend - Suspendre un utilisateur
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { reason } = body

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

    // Empêcher la suspension du SuperAdmin
    if (user.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Impossible de suspendre un SuperAdmin' },
        { status: 403 }
      )
    }

    // Suspendre l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        lastLogin: new Date() // Mettre à jour la date de dernière action
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur suspendu avec succès'
    })

  } catch (error) {
    console.error('Erreur POST /api/users/[id]/suspend:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suspension de l\'utilisateur' },
      { status: 500 }
    )
  }
}
