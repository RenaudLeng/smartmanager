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
        message: 'Données dépenses réinitialisées'
      })
    }

    // Retourner des données vides par défaut (pas de données codées en dur)
    return NextResponse.json({
      success: true,
      data: []
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simuler la création d'une dépense (remplacer par une vraie logique de base de données)
    const newExpense = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newExpense,
      message: 'Dépense ajoutée avec succès'
    })
  } catch (error) {
    console.error('Error creating expense:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create expense' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simuler la modification d'une dépense (remplacer par une vraie logique de base de données)
    const updatedExpense = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: updatedExpense,
      message: 'Dépense modifiée avec succès'
    })
  } catch (error) {
    console.error('Error updating expense:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update expense' },
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
        { success: false, error: 'Expense ID is required' },
        { status: 400 }
      )
    }

    // Simuler la suppression d'une dépense (remplacer par une vraie logique de base de données)
    
    return NextResponse.json({
      success: true,
      message: 'Dépense supprimée avec succès'
    })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete expense' },
      { status: 500 }
    )
  }
}
