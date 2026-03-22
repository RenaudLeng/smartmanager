import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Pour l'instant, retourner des données de démonstration réalistes
    // Ces données seront remplacées par de vraies données quand la base de données sera configurée
    const demoLogs = [
      {
        id: 'demo-1',
        action: 'create',
        entity: 'tenant',
        entityId: 'demo-tenant-1',
        userId: 'demo-user-1',
        userName: 'Admin Système',
        tenantId: null,
        tenantName: null,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2 heures
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: { businessType: 'restaurant' }
      },
      {
        id: 'demo-2',
        action: 'login',
        entity: 'user',
        entityId: 'demo-user-2',
        userId: 'demo-user-2',
        userName: 'Jean Dupont',
        tenantId: 'demo-tenant-1',
        tenantName: 'Restaurant Le Gourmet',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // Il y a 5 heures
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        details: {}
      },
      {
        id: 'demo-3',
        action: 'update',
        entity: 'product',
        entityId: 'demo-product-1',
        userId: 'demo-user-2',
        userName: 'Jean Dupont',
        tenantId: 'demo-tenant-1',
        tenantName: 'Restaurant Le Gourmet',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Il y a 1 jour
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        details: { fields: ['price', 'quantity'] }
      },
      {
        id: 'demo-4',
        action: 'create',
        entity: 'sale',
        entityId: 'demo-sale-1',
        userId: 'demo-user-3',
        userName: 'Marie Curie',
        tenantId: 'demo-tenant-2',
        tenantName: 'Café Central',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // Il y a 3 heures
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        details: { totalAmount: 15000, paymentMethod: 'cash' }
      },
      {
        id: 'demo-5',
        action: 'suspend',
        entity: 'user',
        entityId: 'demo-user-4',
        userId: 'demo-user-1',
        userName: 'Admin Système',
        tenantId: 'demo-tenant-3',
        tenantName: 'Supermarché EcoPlus',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // Il y a 6 heures
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        details: { reason: 'Violation des politiques' }
      }
    ]

    return NextResponse.json({
      success: true,
      data: demoLogs
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des logs d\'audit' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Pour l'instant, juste logger la création sans sauvegarder en base
    console.log('Audit log créé:', {
      action: body.action,
      entity: body.entity,
      entityId: body.entityId,
      userId: body.userId,
      tenantId: body.tenantId,
      ipAddress: body.ipAddress || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || undefined,
      details: body.details || {}
    })

    // Retourner une réponse de succès
    return NextResponse.json({
      success: true,
      data: {
        id: `demo-${Date.now()}`,
        ...body,
        timestamp: new Date(),
        ipAddress: body.ipAddress || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

  } catch (error) {
    console.error('Erreur lors de la création du log d\'audit:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du log d\'audit' },
      { status: 500 }
    )
  }
}
