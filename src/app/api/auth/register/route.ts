import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { 
      tenantName, 
      tenantEmail, 
      businessType, 
      userName, 
      userEmail, 
      password
    } = await request.json()

    // Champs obligatoires simplifiés
    if (!tenantName || !tenantEmail || !businessType || !userName || !userEmail || !password) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires' },
        { status: 400 }
      )
    }

    // Mode démo - création sans base de données
    
    // Simulation de tenant et utilisateur
    const tenant = {
      id: 'demo-tenant-' + Date.now(),
      name: tenantName,
      email: tenantEmail,
      business_type: businessType,
      currency: 'XAF'
    }

    const user = {
      id: 'demo-user-' + Date.now(),
      name: userName,
      email: userEmail,
      role: 'admin',
      tenant_id: tenant.id
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'admin',
      tenantId: tenant.id
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: tenant.id,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          business_type: tenant.business_type,
          currency: tenant.currency
        }
      },
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur - Mode démo' },
      { status: 500 }
    )
  }
}
