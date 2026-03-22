import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/reset-db - Réinitialiser la base de données
export async function POST(request: NextRequest) {
  try {
    // Cette fonction est une solution temporaire
    // En production, vous devriez utiliser des migrations ou des scripts SQL
    
    return NextResponse.json({
      success: true,
      message: 'Pour supprimer tous les tenants, utilisez directement la console Prisma:',
      instructions: [
        '1. Ouvrez un terminal dans votre projet',
        '2. Exécutez: npx prisma studio',
        '3. Connectez-vous à votre base de données',
        '4. Supprimez manuellement les enregistrements des tables:',
        '   - tenants (cela supprimera aussi les données associées)',
        '   - users (utilisateurs sans tenant)'
      ],
      alternative: 'Ou utilisez un client SQL directement sur votre fichier database.db'
    })

  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
