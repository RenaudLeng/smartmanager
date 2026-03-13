export interface User {
  id: string
  email: string
  name: string
  role: Role
  tenantId?: string
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Tenant {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  businessType: 'bar' | 'restaurant' | 'grocery' | 'hair_salon' | 'bar_restaurant'
  currency: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  barcode?: string
  image?: string
  purchasePrice: number
  sellingPrice: number
  margin?: number
  quantity: number
  minStock: number
  categoryId: string
  supplierId?: string
  expirationDate?: Date
  tenantId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  category?: Category
  supplier?: Supplier
}

export interface Category {
  id: string
  name: string
  description?: string
  tenantId: string
  businessType?: string
  createdAt: Date
  updatedAt: Date
}

export interface Supplier {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  tenantId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Sale {
  id: string
  totalAmount: number
  discountAmount: number
  finalAmount: number
  paymentType: 'cash' | 'mobile_money' | 'mixed'
  paymentStatus: 'paid' | 'pending' | 'partial'
  clientId?: string
  userId: string
  tenantId: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  client?: Client
  user?: User
  items?: SaleItem[]
}

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
  product?: Product
}

export interface Client {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  tenantId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Debt {
  id: string
  clientId: string
  amount: number
  paidAmount: number
  remainingAmount: number
  status: 'pending' | 'paid' | 'partial'
  dueDate?: Date
  tenantId: string
  notes?: string
  createdAt: Date
  updatedAt: Date
  client?: Client
}

export interface Expense {
  id: string
  category: 'electricity' | 'water' | 'rent' | 'salaries' | 'taxes' | 'transport' | 'purchases' | 'other'
  amount: number
  description?: string
  receiptNumber?: string
  userId: string
  tenantId: string
  date: Date
  createdAt: Date
  updatedAt: Date
  user?: User
}

export interface Staff {
  id: string
  name: string
  role: string
  phone?: string
  email?: string
  salary?: number
  hireDate?: Date
  isActive: boolean
  tenantId: string
  createdAt: Date
  updatedAt: Date
}

export interface InventoryLog {
  id: string
  productId: string
  type: 'in' | 'out' | 'adjustment'
  quantity: number
  reason?: string
  userId?: string
  tenantId: string
  createdAt: Date
  product?: Product
}

export interface Subscription {
  id: string
  tenantId: string
  plan: 'basic' | 'premium' | 'enterprise'
  price: number
  startDate: Date
  endDate: Date
  status: 'active' | 'expired' | 'cancelled'
  features: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'low_stock' | 'unpaid_invoice' | 'customer_debt' | 'expired_subscription'
  userId?: string
  tenantId: string
  isRead: boolean
  data?: Record<string, unknown>
  createdAt: Date
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  totalPrice: number
  barcode?: string
}

export interface DashboardStats {
  todaySales: number
  todayProfit: number
  todayExpenses: number
  lowStockProducts: number
  customerDebts: number
  cashBalance: number
}

export interface BusinessTypeConfig {
  categories: { name: string; description?: string }[]
  defaultProducts: { name: string; price: number; category: string; description?: string }[]
  defaultExpenses: string[]
}

export const BUSINESS_TYPES_CONFIG: Record<string, BusinessTypeConfig> = {
  bar: {
    categories: [
      { name: 'Bières', description: 'Différentes marques de bières' },
      { name: 'Vins', description: 'Vins rouges, blancs, rosés' },
      { name: 'Spirits', description: 'Whisky, vodka, rhum, etc.' },
      { name: 'Softs', description: 'Boissons non alcoolisées' },
      { name: 'Snacks', description: 'Chips, biscuits, etc.' }
    ],
    defaultProducts: [
      { name: 'Castel 33cl', price: 500, category: 'Bières' },
      { name: 'Coca-Cola 33cl', price: 300, category: 'Softs' },
      { name: 'Chips', price: 200, category: 'Snacks' }
    ],
    defaultExpenses: ['electricity', 'rent', 'salaries', 'purchases']
  },
  restaurant: {
    categories: [
      { name: 'Entrées', description: 'Plats d\'entrée' },
      { name: 'Plats principaux', description: 'Plats chauds' },
      { name: 'Desserts', description: 'Desserts divers' },
      { name: 'Boissons', description: 'Boissons variées' },
      { name: 'Apéritifs', description: 'Amuse-gueules' }
    ],
    defaultProducts: [
      { name: 'Riz sauce', price: 1500, category: 'Plats principaux' },
      { name: 'Jus de fruit', price: 500, category: 'Boissons' },
      { name: 'Salade', price: 800, category: 'Entrées' }
    ],
    defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases']
  },
  grocery: {
    categories: [
      { name: 'Produits laitiers', description: 'Lait, yaourts, fromages' },
      { name: 'Épicerie sucrée', description: 'Sucre, farine, etc.' },
      { name: 'Épicerie salée', description: 'Sel, huile, etc.' },
      { name: 'Boissons', description: 'Jus, sodas, eau' },
      { name: 'Produits frais', description: 'Légumes, fruits' }
    ],
    defaultProducts: [
      { name: 'Lait 1L', price: 800, category: 'Produits laitiers' },
      { name: 'Sucre 1kg', price: 1000, category: 'Épicerie sucrée' },
      { name: 'Huile 1L', price: 1500, category: 'Épicerie salée' }
    ],
    defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases', 'transport']
  },
  hair_salon: {
    categories: [
      { name: 'Coiffure femme', description: 'Services coiffure femme' },
      { name: 'Coiffure homme', description: 'Services coiffure homme' },
      { name: 'Produits capillaires', description: 'Shampoings, laits' },
      { name: 'Accessoires', description: 'Peignes, pinces' }
    ],
    defaultProducts: [
      { name: 'Coupe homme', price: 2000, category: 'Coiffure homme' },
      { name: 'Tissage', price: 5000, category: 'Coiffure femme' },
      { name: 'Shampoing', price: 1500, category: 'Produits capillaires' }
    ],
    defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases']
  },
  bar_restaurant: {
    categories: [
      { name: 'Bières', description: 'Différentes marques de bières' },
      { name: 'Entrées', description: 'Plats d\'entrée' },
      { name: 'Plats principaux', description: 'Plats chauds' },
      { name: 'Boissons', description: 'Boissons variées' },
      { name: 'Desserts', description: 'Desserts divers' }
    ],
    defaultProducts: [
      { name: 'Castel 33cl', price: 500, category: 'Bières' },
      { name: 'Riz sauce', price: 1500, category: 'Plats principaux' },
      { name: 'Jus de fruit', price: 500, category: 'Boissons' }
    ],
    defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases']
  }
}

export const PERMISSIONS = {
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',
  CREATE_SALE: 'create_sale',
  MANAGE_EXPENSES: 'manage_expenses',
  MANAGE_USERS: 'manage_users',
  VIEW_REPORTS: 'view_reports',
  MANAGE_STOCK: 'manage_stock',
  MANAGE_CLIENTS: 'manage_clients',
  MANAGE_SUPPLIERS: 'manage_suppliers',
  MANAGE_STAFF: 'manage_staff'
} as const

export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.CREATE_SALE,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.MANAGE_STAFF
  ],
  cashier: [
    PERMISSIONS.CREATE_SALE,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.VIEW_REPORTS
  ],
  seller: [
    PERMISSIONS.CREATE_SALE,
    PERMISSIONS.MANAGE_CLIENTS
  ]
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
export type Role = keyof typeof ROLE_PERMISSIONS
