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
        message: 'Données employés réinitialisées'
      })
    }

    // Retourner des données vides par défaut (pas de données codées en dur)
    return NextResponse.json({
      success: true,
      data: []
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simuler la création d'un employé (remplacer par une vraie logique de base de données)
    const newEmployee = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: newEmployee,
      message: 'Employé ajouté avec succès'
    })
  } catch (error) {
    console.error('Error creating employee:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Simuler la modification d'un employé (remplacer par une vraie logique de base de données)
    const updatedEmployee = {
      ...body,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: 'Employé modifié avec succès'
    })
  } catch (error) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update employee' },
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
        { success: false, error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Simuler la suppression d'un employé (remplacer par une vraie logique de base de données)
    
    return NextResponse.json({
      success: true,
      message: 'Employé supprimé avec succès'
    })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
