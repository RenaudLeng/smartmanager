import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Vérifier si une réinitialisation est demandée
    const resetFlag = request.headers.get('x-reset-flag') || 
                     request.cookies.get('smartmanager-reset')?.value

    if (resetFlag === 'true') {
      // Retourner des données vides après réinitialisation
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Données sauvegardes réinitialisées'
      })
    }

    // Retourner des données vides par défaut (pas de données codées en dur)
    return NextResponse.json({
      success: true,
      data: []
    })
  } catch (error) {
    console.error('Error fetching backups:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch backups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simuler la création d'une sauvegarde (remplacer par une vraie logique de base de données)
    const newBackup = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      status: 'completed',
      location: 'cloud'
    }

    return NextResponse.json({
      success: true,
      data: newBackup,
      message: 'Sauvegarde créée avec succès'
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Backup ID is required' },
        { status: 400 }
      )
    }

    // Simuler la suppression d'une sauvegarde (remplacer par une vraie logique de base de données)
    
    return NextResponse.json({
      success: true,
      message: 'Sauvegarde supprimée avec succès'
    })
  } catch (error) {
    console.error('Error deleting backup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete backup' },
      { status: 500 }
    )
  }
}
