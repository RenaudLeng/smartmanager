import { NextResponse } from 'next/server'

// POST /api/reset-data
export async function POST() {
  try {
    // TODO: Implémenter la réinitialisation de la base de données avec Prisma
    // await prisma.product.deleteMany()
    // await prisma.sale.deleteMany()
    // await prisma.expense.deleteMany()
    // await prisma.user.deleteMany()
    // await prisma.tenant.deleteMany()
    
    console.log('🗑️  Données de la base de données réinitialisées');
    
    return NextResponse.json({
      success: true,
      message: 'Données réinitialisées avec succès',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur lors de la réinitialisation des données' 
      },
      { status: 500 }
    );
  }
}
