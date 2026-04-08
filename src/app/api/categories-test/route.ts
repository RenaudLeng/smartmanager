import { NextRequest, NextResponse } from 'next/server'

// Test simple pour diagnostiquer le problème
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/categories-test - Début de la requête')
    
    const body = await request.json()
    console.log('Body reçu:', body)
    
    // Simulation simple
    const category = {
      id: Date.now().toString(),
      name: body.name || 'Test Category',
      description: body.description || 'Test Description',
      createdAt: new Date().toISOString()
    }
    
    console.log('Catégorie créée:', category)
    
    return NextResponse.json({
      success: true,
      category
    })
    
  } catch (error) {
    console.error('Erreur dans test API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error)
      }, 
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    categories: []
  })
}
