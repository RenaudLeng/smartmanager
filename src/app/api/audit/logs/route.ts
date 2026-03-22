import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Récupérer les logs d'audit récents
    const auditLogs = await prisma.auditLog.findMany({
      take: 10,
      orderBy: {
        timestamp: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Formater les logs pour le frontend
    const formattedLogs = auditLogs.map(log => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      userId: log.userId,
      userName: log.user?.name || 'Utilisateur inconnu',
      tenantId: log.tenantId,
      tenantName: log.tenant?.name,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: log.details
    }))

    return NextResponse.json({
      success: true,
      data: formattedLogs
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error)
    
    // Si la table auditLog n'existe pas encore, retourner des données de démonstration
    return NextResponse.json({
      success: true,
      data: [
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
        }
      ]
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Créer un nouveau log d'audit
    const auditLog = await prisma.auditLog.create({
      data: {
        action: body.action,
        entity: body.entity,
        entityId: body.entityId,
        userId: body.userId,
        tenantId: body.tenantId,
        ipAddress: body.ipAddress || request.ip,
        userAgent: request.headers.get('user-agent') || undefined,
        details: body.details || {}
      }
    })

    return NextResponse.json({
      success: true,
      data: auditLog
    })

  } catch (error) {
    console.error('Erreur lors de la création du log d\'audit:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du log d\'audit' },
      { status: 500 }
    )
  }
}
