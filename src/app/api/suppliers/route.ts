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
        message: 'Données fournisseurs réinitialisées'
      })
    }

    // Retourner des données vides par défaut (pas de données codées en dur)
    return NextResponse.json({
      success: true,
      data: []
    })
  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch suppliers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simuler la création d'un fournisseur (remplacer par une vraie logique de base de données)
    const newSupplier = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newSupplier,
      message: 'Fournisseur ajouté avec succès'
    })
  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create supplier' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simuler la modification d'un fournisseur (remplacer par une vraie logique de base de données)
    const updatedSupplier = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: updatedSupplier,
      message: 'Fournisseur modifié avec succès'
    })
  } catch (error) {
    console.error('Error updating supplier:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update supplier' },
      { status: 500 }
    )
  }
}
