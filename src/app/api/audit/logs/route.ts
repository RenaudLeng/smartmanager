import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Récupérer les vrais logs d'audit depuis la base de données
    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 50, // Limiter à 50 logs les plus récents
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        tenant: {
          select: {
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
      userName: log.user?.name || log.user?.email || 'System',
      tenantId: log.tenantId,
      tenantName: log.tenant?.name,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      details: log.details ? JSON.parse(log.details) as Record<string, unknown> : {}
    }))

    return NextResponse.json({
      success: true,
      data: formattedLogs
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des logs d\'audit:', error)
    
    // En cas d'erreur, retourner un tableau vide au lieu des données de démonstration
    return NextResponse.json({
      success: true,
      data: []
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Sauvegarder le log d'audit dans la base de données
    const auditLog = await prisma.auditLog.create({
      data: {
        action: body.action,
        entity: body.entity,
        entityId: body.entityId,
        userId: body.userId,
        tenantId: body.tenantId,
        ipAddress: body.ipAddress || request.headers.get('x-forwarded-for') || '127.0.0.1',
        userAgent: request.headers.get('user-agent') || undefined,
        details: body.details ? JSON.stringify(body.details) : null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        tenant: {
          select: {
            name: true
          }
        }
      }
    })

    // Formater la réponse
    const formattedLog = {
      id: auditLog.id,
      action: auditLog.action,
      entity: auditLog.entity,
      entityId: auditLog.entityId,
      userId: auditLog.userId,
      userName: auditLog.user?.name || auditLog.user?.email || 'System',
      tenantId: auditLog.tenantId,
      tenantName: auditLog.tenant?.name,
      timestamp: auditLog.timestamp,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      details: auditLog.details ? JSON.parse(auditLog.details) as Record<string, unknown> : {}
    }

    return NextResponse.json({
      success: true,
      data: formattedLog
    })

  } catch (error) {
    console.error('Erreur lors de la création du log d\'audit:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du log d\'audit' },
      { status: 500 }
    )
  }
}
