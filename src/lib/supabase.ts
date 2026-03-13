import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          email: string
          business_type: string
          phone: string | null
          address: string | null
          currency: string
          status: string
          created_at: string
        }
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          role: string
          tenant_id: string
          status: string
          created_at: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          tenant_id: string
          business_type: string
          created_at: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          selling_price: number
          purchase_price: number
          quantity: number
          min_stock: number
          category_id: string
          tenant_id: string
          created_at: string
        }
      }
      sales: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          total_amount: number
          payment_method: string
          status: string
          created_at: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
      }
    }
  }
}
