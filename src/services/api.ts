// Services API pour SmartManager

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: Record<string, unknown>
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  name: string
  email: string
  password: string
  businessType?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  tenantId?: string
  createdAt: string
  updatedAt: string
}

interface AuthResponse {
  user: User
  token: string
}

interface Tenant {
  id: string
  name: string
  businessType: string
  isActive: boolean
  createdAt: string
}

interface Product {
  id: string
  name: string
  sellingPrice: number
  category: string
  quantity: number
  minStock: number
  isActive: boolean
  tenantId: string
  description?: string
}

interface Sale {
  id: string
  totalAmount: number
  paymentMethod: string
  createdAt: string
  tenantId: string
}

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  paymentMethod: string
  receipt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Employee {
  id: string
  name: string
  email: string
  position: string
  salary: number
  isActive: boolean
  tenantId: string
  notes?: string
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Authentification
  async login(email: string, password: string) {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: RegisterRequest) {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // Tenants (SuperAdmin)
  async getTenants() {
    return this.request<any[]>('/tenants')
  }

  async createTenant(tenantData: any) {
    return this.request<any>('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    })
  }

  async updateTenant(id: string, data: any) {
    return this.request<any>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTenant(id: string) {
    return this.request<void>(`/tenants/${id}`, {
      method: 'DELETE',
    })
  }

  async suspendTenant(id: string, reason: string) {
    return this.request<any>(`/tenants/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async getTenantStats() {
    return this.request<any>('/tenants/stats')
  }

  // Utilisateurs
  async getUsers(tenantId?: string) {
    const endpoint = tenantId ? `/users?tenantId=${tenantId}` : '/users'
    return this.request<any[]>(endpoint)
  }

  async createUser(userData: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteUser(id: string) {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    })
  }

  async suspendUser(id: string, reason: string) {
    return this.request<any>(`/users/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  // Produits
  async getProducts(tenantId: string) {
    return this.request<any[]>(`/products?tenantId=${tenantId}`)
  }

  async createProduct(productData: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, data: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/products/${id}`, {
      method: 'DELETE',
    })
  }

  // Ventes
  async getSales(tenantId: string, filters?: any) {
    const params = new URLSearchParams({ tenantId, ...filters })
    return this.request<any[]>(`/sales?${params}`)
  }

  async createSale(saleData: any) {
    return this.request<any>('/sales', {
      method: 'POST',
      body: JSON.stringify(saleData),
    })
  }

  // Rapports
  async getReports(tenantId: string, period: string, type: string) {
    return this.request<any>(`/reports?tenantId=${tenantId}&period=${period}&type=${type}`)
  }

  async getGlobalReports(period: string) {
    return this.request<any>(`/reports/global?period=${period}`)
  }

  // Configuration système
  async getSystemConfig() {
    return this.request<any>('/system/config')
  }

  async updateSystemConfig(config: any) {
    return this.request<any>('/system/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    })
  }

  // Sauvegarde
  async createBackup(type: 'full' | 'incremental' | 'differential', tenantId?: string) {
    const endpoint = tenantId 
      ? `/backup?type=${type}&tenantId=${tenantId}`
      : `/backup?type=${type}`
    
    return this.request<any>(endpoint, {
      method: 'POST',
    })
  }

  async getBackups(tenantId?: string) {
    const endpoint = tenantId ? `/backups?tenantId=${tenantId}` : '/backups'
    return this.request<any[]>(endpoint)
  }

  async restoreBackup(backupId: string) {
    return this.request<any>(`/backup/${backupId}/restore`, {
      method: 'POST',
    })
  }
}

export const apiService = new ApiService()
export default apiService
