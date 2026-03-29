import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/test - Tester la connexion Prisma
export async function GET() {
  try {
    // Test simple de connexion
    const userCount = await prisma.user.count()
    const tenantCount = await prisma.tenant.count()
    
    return NextResponse.json({
      success: true,
      data: {
        userCount,
        tenantCount,
        message: 'Connexion Prisma réussie'
      }
    })
  } catch (error) {
    console.error('Erreur test Prisma:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}
