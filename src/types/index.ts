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
  businessType: 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket' | 'hair_salon' | 'grocery' | 'bar_restaurant'
  currency: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
  features?: {
    allowsDebt: boolean
    allowsDelivery: boolean
    allowsTableService: boolean
    requiresTableNumber: boolean
    allowsFlashCustomers: boolean
    allowsTicketPrinting: boolean
  }
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
  retail: {
    categories: [
      { name: 'Vêtements', description: 'Vêtements pour hommes, femmes, enfants' },
      { name: 'Accessoires', description: 'Sacs, chaussures, bijoux' },
      { name: 'Électronique', description: 'Appareils électroniques divers' },
      { name: 'Maison', description: 'Articles pour la maison' },
      { name: 'Beauté', description: 'Produits de beauté et soins' }
    ],
    defaultProducts: [
      { name: 'T-shirt', price: 5000, category: 'Vêtements' },
      { name: 'Sac à main', price: 10000, category: 'Accessoires' },
      { name: 'Chargeur USB', price: 2500, category: 'Électronique' }
    ],
    defaultExpenses: ['electricity', 'rent', 'salaries', 'purchases', 'transport']
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
  pharmacy: {
    categories: [
      { name: 'Médicaments', description: 'Médicaments sans ordonnance' },
      { name: 'Produits hygiène', description: 'Produits d\'hygiène personnelle' },
      { name: 'Accessoires médicaux', description: 'Thermomètres, tensiomètres' },
      { name: 'Vitamines', description: 'Compléments alimentaires' },
      { name: 'Soins bébé', description: 'Produits pour bébés' }
    ],
    defaultProducts: [
      { name: 'Paracétamol', price: 500, category: 'Médicaments' },
      { name: 'Gel hydroalcoolique', price: 1500, category: 'Produits hygiène' },
      { name: 'Vitamine C', price: 2000, category: 'Vitamines' }
    ],
    defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases', 'security']
  },
  supermarket: {
    categories: [
      { name: 'Produits frais', description: 'Légumes, fruits, viandes' },
      { name: 'Épicerie', description: 'Pâtes, riz, conserves' },
      { name: 'Boissons', description: 'Jus, sodas, eau' },
      { name: 'Produits laitiers', description: 'Lait, yaourts, fromages' },
      { name: 'Boulangerie', description: 'Pain, viennoiseries' }
    ],
    defaultProducts: [
      { name: 'Pain 500g', price: 500, category: 'Boulangerie' },
      { name: 'Lait 1L', price: 800, category: 'Produits laitiers' },
      { name: 'Riz 1kg', price: 1000, category: 'Épicerie' }
    ],
    defaultExpenses: ['electricity', 'water', 'rent', 'salaries', 'purchases', 'transport', 'security']
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
  // Permissions existantes
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
  MANAGE_STAFF: 'manage_staff',
  
  // Permissions SuperAdmin
  CREATE_TENANT: 'create_tenant',
  UPDATE_TENANT: 'update_tenant',
  DELETE_TENANT: 'delete_tenant',
  SUSPEND_TENANT: 'suspend_tenant',
  VIEW_ALL_TENANTS: 'view_all_tenants',
  MANAGE_SUBSCRIPTIONS: 'manage_subscriptions',
  VIEW_GLOBAL_REPORTS: 'view_global_reports',
  MANAGE_SYSTEM_CONFIG: 'manage_system_config',
  VIEW_AUDIT_LOGS: 'view_audit_logs'
} as const

export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.UPDATE_PRODUCT,
    PERMISSIONS.DELETE_PRODUCT,
    PERMISSIONS.CREATE_SALE,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_STOCK,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.MANAGE_SUPPLIERS,
    PERMISSIONS.MANAGE_STAFF
  ],
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

// Types SuperAdmin
export interface SuperAdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin'
  permissions: Permission[]
  lastLogin?: Date
  createdAt: Date
  status: 'active' | 'inactive'
}

export interface TenantStats {
  id: string
  name: string
  businessType: 'retail' | 'restaurant' | 'bar' | 'pharmacy' | 'supermarket' | 'hair_salon' | 'grocery' | 'bar_restaurant'
  status: 'active' | 'suspended' | 'inactive'
  createdAt: Date
  lastActive?: Date
  userCount: number
  todaySales: number
  monthSales: number
  totalSales: number
  subscriptionPlan: 'free' | 'premium' | 'enterprise'
  storageUsed: number
  storageLimit: number
}

export interface GlobalStats {
  totalTenants: number
  activeTenants: number
  totalUsers: number
  totalSales: number
  todaySales: number
  monthSales: number
  newTenantsThisMonth: number
  topBusinessTypes: { type: string; count: number; percentage: number }[]
  growthRate: number
}

export interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  userId: string
  userName: string
  tenantId?: string
  tenantName?: string
  timestamp: Date
  ipAddress?: string
  userAgent?: string
  details?: Record<string, unknown>
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  billingCycle: 'monthly' | 'yearly'
  features: {
    maxUsers: number
    maxProducts: number
    maxStorage: number // in MB
    advancedReports: boolean
    multiStore: boolean
    apiAccess: boolean
    prioritySupport: boolean
  }
}

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]
export type Role = keyof typeof ROLE_PERMISSIONS
