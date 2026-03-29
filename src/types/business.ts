// Types spécifiques pour chaque type d'activité

export interface BarProduct {
  id: string
  name: string
  category: 'alcool' | 'soft' | 'chaud' | 'snack'
  price: number
  stock: number
  stockUnit: 'bouteille' | 'litre' | 'canette' | 'unité'
  alcoholPercentage?: number
  supplier?: string
  minStock: number
}

export interface BarOrder {
  id: string
  tableNumber?: number
  items: {
    productId: string
    quantity: number
    price: number
    total: number
  }[]
  customerName?: string
  status: 'pending' | 'preparing' | 'served' | 'paid'
  paymentMethod: 'cash' | 'card' | 'mobile'
  totalAmount: number
  createdAt: Date
  servedAt?: Date
  paidAt?: Date
}

export interface BarInventory {
  productId: string
  currentStock: number
  lastRestock: Date
  consumptionRate: number
  daysUntilEmpty: number
  needsRestock: boolean
}

export interface PharmacyProduct {
  id: string
  name: string
  genericName?: string
  category: 'medicament' | 'parapharmacie' | 'accessoire'
  price: number
  stock: number
  stockUnit: 'boîte' | 'flacon' | 'tube' | 'unité'
  requiresPrescription: boolean
  expiryDate: Date
  batchNumber: string
  supplier: string
  storageCondition: 'normal' | 'refrigerated' | 'controlled'
  minStock: number
  insuranceCoverage?: string[]
}

export interface PharmacySale {
  id: string
  items: {
    productId: string
    quantity: number
    price: number
    prescription?: string
    doctorName?: string
  }[]
  customerName: string
  customerInsurance?: string
  totalAmount: number
  insuranceAmount?: number
  paidAmount: number
  paymentMethod: 'cash' | 'card' | 'insurance'
  pharmacistName: string
  createdAt: Date
}

export interface HairSalonService {
  id: string
  name: string
  category: 'coiffure' | 'soin' | 'barbe' | 'extension' | 'coloration'
  duration: number // en minutes
  price: number
  description: string
  requiresAppointment: boolean
  productsNeeded?: string[]
}

export interface HairSalonAppointment {
  id: string
  customerName: string
  customerPhone: string
  serviceId: string
  serviceName: string
  appointmentDate: Date
  duration: number
  price: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  staffName: string
  notes?: string
  reminderSent: boolean
}

export interface RestaurantTable {
  id: string
  number: number
  capacity: number
  status: 'available' | 'occupied' | 'reserved' | 'cleaning'
  location: 'interieur' | 'terrasse' | 'privé'
  currentOrder?: string
}

export interface RestaurantOrder {
  id: string
  tableId: string
  tableNumber: number
  items: {
    productId: string
    quantity: number
    price: number
    specialInstructions?: string
  }[]
  customerCount: number
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid'
  totalAmount: number
  paymentMethod: 'cash' | 'card' | 'mobile'
  staffName: string
  createdAt: Date
  servedAt?: Date
  paidAt?: Date
  deliveryInfo?: {
    type: 'delivery' | 'takeaway'
    address?: string
    deliveryTime?: Date
    deliveryFee?: number
  }
}

export interface SupermarketProduct {
  id: string
  name: string
  barcode?: string
  category: string
  subcategory: string
  price: number
  cost: number
  stock: number
  stockUnit: string
  location: 'rayon' | 'entrepôt' | 'réfrigéré'
  shelfLocation?: string
  supplier: string
  lastRestock: Date
  expiryDate?: Date
  promotionalPrice?: number
  promotionalStart?: Date
  promotionalEnd?: Date
  minStock: number
  maxStock: number
  reorderPoint: number
}

export interface SupermarketSale {
  id: string
  items: {
    productId: string
    quantity: number
    price: number
    discount?: number
  }[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
  paymentMethod: 'cash' | 'card' | 'mobile' | 'ticket'
  customerInfo?: {
    name?: string
    fidelityCard?: string
    points?: number
  }
  cashierId: string
  checkoutNumber: number
  createdAt: Date
}

export interface BusinessSystem {
  type: 'bar' | 'pharmacy' | 'hair_salon' | 'restaurant' | 'supermarket' | 'retail' | 'grocery' | 'bar_restaurant'
  features: string[]
  modules: {
    inventory: boolean
    orders: boolean
    appointments: boolean
    tables: boolean
    prescriptions: boolean
    insurance: boolean
    delivery: boolean
    fidelity: boolean
    multipleCheckout: boolean
    // Modules spécifiques Gabon
    localBeverages?: boolean
    eventManagement?: boolean
    noiseControl?: boolean
    cnamIntegration?: boolean
    localProducts?: boolean
    healthStats?: boolean
    africanHairSpecialist?: boolean
    eventServices?: boolean
    localCuisine?: boolean
    deliveryZones?: boolean
    peakHours?: boolean
    financialServices?: boolean
    localSupply?: boolean
    creditManagement?: boolean
    seasonalManagement?: boolean
    seasonalProducts?: boolean
    mixedService?: boolean
  }
  reports: string[]
  specificFields?: string[]
}
