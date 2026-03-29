import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE /api/test-delete?id=USER_ID - Test endpoint simple
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }

    console.error('Simple DELETE test for ID:', id)

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
    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: { id }
    })

    console.error('User deleted successfully')
    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur DELETE test:', error)
    if (error instanceof Error) {
      console.error('Message:', error.message)
      console.error('Stack:', error.stack)
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
