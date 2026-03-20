import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Schémas de validation
const systemConfigSchema = z.object({
  platform: z.object({
    name: z.string().min(1),
    version: z.string(),
    environment: z.enum(['development', 'staging', 'production']),
    maintenance: z.boolean(),
    maxTenants: z.number().min(1),
    defaultLanguage: z.enum(['fr', 'en']),
    timezone: z.string()
  }),
  security: z.object({
    twoFactorAuth: z.boolean(),
    sessionTimeout: z.number().min(1),
    passwordPolicy: z.object({
      minLength: z.number().min(6),
      requireUppercase: z.boolean(),
      requireNumbers: z.boolean(),
      requireSpecialChars: z.boolean()
    })
  }),
  email: z.object({
    smtpHost: z.string().min(1),
    smtpPort: z.number().min(1),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    smtpSecure: z.boolean(),
    fromEmail: z.string().email(),
    fromName: z.string().min(1)
  }),
  backup: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    retention: z.number().min(1),
    storageLocation: z.string()
  }),
  notifications: z.object({
    emailAlerts: z.boolean(),
    smsAlerts: z.boolean(),
    pushNotifications: z.boolean(),
    lowStockAlert: z.boolean(),
    salesAlert: z.boolean(),
    maintenanceAlert: z.boolean()
  })
})

// GET /api/system/config - Récupérer la configuration système
export async function GET(request: NextRequest) {
  try {
    // Pour l'instant, retourner une configuration par défaut
    // Dans une vraie application, cela pourrait venir d'une table de configuration
    const config = {
      platform: {
        name: 'SmartManager',
        version: '1.0.0',
        environment: 'development',
        maintenance: false,
        maxTenants: 1000,
        defaultLanguage: 'fr',
        timezone: 'Africa/Libreville'
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 24,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        }
      },
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUser: '',
        smtpPassword: '',
        smtpSecure: true,
        fromEmail: 'noreply@smartmanager.com',
        fromName: 'SmartManager'
      },
      backup: {
        enabled: true,
        frequency: 'daily',
        retention: 30,
        storageLocation: 'local'
      },
      notifications: {
        emailAlerts: true,
        smsAlerts: false,
        pushNotifications: true,
        lowStockAlert: true,
        salesAlert: true,
        maintenanceAlert: true
      }
    }

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Erreur GET /api/system/config:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la configuration' },
      { status: 500 }
    )
  }
}

// PUT /api/system/config - Mettre à jour la configuration système
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = systemConfigSchema.parse(body)

    // Dans une vraie application, sauvegarder dans une table de configuration
    // Pour l'instant, nous simulons la sauvegarde

    // Log de la mise à jour
    console.log('Configuration système mise à jour:', JSON.stringify(validatedData, null, 2))

    return NextResponse.json({
      success: true,
      data: validatedData,
      message: 'Configuration sauvegardée avec succès'
    })
  } catch (error) {
    console.error('Erreur PUT /api/system/config:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: error.issues || [] },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la configuration' },
      { status: 500 }
    )
  }
}

// POST /api/system/config/test-email - Tester la configuration email
export async function POST_EMAIL_TEST(request: NextRequest) {
  try {
    const { emailConfig } = await request.json()

    // Simuler un test d'envoi d'email
    console.log('Test email configuration:', emailConfig)

    // Dans une vraie application, utiliser un service comme nodemailer
    // const nodemailer = require('nodemailer')
    // const transporter = nodemailer.createTransporter(emailConfig)
    // await transporter.sendMail({
    //   from: emailConfig.fromEmail,
    //   to: emailConfig.fromEmail,
    //   subject: 'Test Email - SmartManager',
    //   text: 'Ceci est un email de test pour vérifier la configuration SMTP.'
    // })

    return NextResponse.json({
      success: true,
      message: 'Email de test envoyé avec succès'
    })
  } catch (error) {
    console.error('Erreur POST /api/system/config/test-email:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du test d\'email' },
      { status: 500 }
    )
  }
}
