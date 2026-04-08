import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireTenant } from '@/lib/auth'
import { validateRequest } from '@/lib/validation'
import { monitoring } from '@/lib/monitoring'

// Schéma de validation pour les employés
const createEmployeeSchema = {
  safeParse: async (data: any) => {
    if (!data.name || data.name.trim().length === 0) {
      return { success: false, error: 'Le nom est requis' }
    }
    
    if (!data.email || !data.email.includes('@')) {
      return { success: false, error: 'Email invalide' }
    }
    
    if (!data.role) {
      return { success: false, error: 'Le rôle est requis' }
    }
    
    return { success: true, data }
  }
}

async function getHandler(request: NextRequest) {
  try {
    const tenantId = (request as any).user.tenantId
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const role = searchParams.get('role')

    const where: any = { tenantId }
    if (role) {
      where.role = role
    }

    const [employees, total] = await Promise.all([
      prisma.staff.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.staff.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return getHandler(request)
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
