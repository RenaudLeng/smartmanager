import { z } from 'zod'
import { NextRequest } from 'next/server'

// Schéma de validation pour les produits
export const createProductSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  description: z.string().optional(),
  barcode: z.string().optional(),
  purchasePrice: z.number().min(0, 'Le prix d\'achat doit être positif').optional(),
  sellingPrice: z.number().min(0, 'Le prix de vente doit être positif'),
  quantity: z.number().min(0, 'La quantité doit être positive').default(0),
  minStock: z.number().min(0, 'Le stock minimum doit être positif').default(0),
  categoryId: z.string().min(1, 'La catégorie est requise'),
  supplierId: z.string().optional(),
  expirationDate: z.string().optional()
})

// Schéma de validation pour les catégories
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom ne peut pas dépasser 50 caractères'),
  description: z.string().max(200, 'La description ne peut pas dépasser 200 caractères').optional(),
  tenantId: z.string().optional()
})

// Schéma de validation pour les ventes
export const createSaleSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'L\'ID du produit est requis'),
    quantity: z.number().min(1, 'La quantité doit être positive'),
    price: z.number().min(0, 'Le prix doit être positif')
  })).min(1, 'Au moins un article est requis'),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(['cash', 'mobile_money', 'card', 'debt']),
  discount: z.number().min(0).max(100).default(0)
})

// Middleware de validation
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<{ success: boolean; data?: T; error?: string; details?: any[] }> => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          error: 'Données invalides',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }
      }
      return {
        success: false,
        error: 'Erreur de validation des données'
      }
    }
  }
}

// Fonction utilitaire pour valider les IDs de ressources
export async function validateResourceExists(
  model: any,
  id: string,
  tenantId?: string
): Promise<boolean> {
  try {
    const where: any = { id }
    if (tenantId) {
      where.tenantId = tenantId
    }
    
    const resource = await model.findFirst({ where })
    return !!resource
  } catch {
    return false
  }
}

// Fonction pour valider et convertir les nombres
export function safeParseFloat(value: any, defaultValue = 0): number {
  const parsed = parseFloat(value)
  return isNaN(parsed) ? defaultValue : parsed
}

// Fonction pour valider les dates
export function safeParseDate(value: any): Date | null {
  if (!value) return null
  
  try {
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}
