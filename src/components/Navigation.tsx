'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useTenant } from '@/contexts/TenantContext'
import { 
  LayoutDashboard, 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  Settings, 
  LogOut,
  Building2,
  Shield,
  ShoppingCart,
  Database,
  X,
  Wallet
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  tenant?: {
    id: string
    name: string
    businessType: string
  }
}

interface NavigationProps {
  user: User | null
  isMobile?: boolean
  onCloseMobile?: () => void
}

export default function Navigation({ user, isMobile = false, onCloseMobile }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const tenantData = useTenant()
  const businessFeatures = tenantData.getBusinessFeatures()

  const navigation = [
    {
      name: 'Tableau de bord',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['super_admin', 'admin', 'manager', 'cashier', 'seller']
    },
    {
      name: 'Caisse',
      href: '/pos',
      icon: DollarSign,
      roles: ['super_admin', 'admin', 'manager', 'cashier', 'seller']
    },
    {
      name: 'Trésorerie',
      href: '/tresorerie',
      icon: Wallet,
      roles: ['super_admin', 'admin', 'manager']
    },
    {
      name: 'Stock',
      href: '/stock',
      icon: Package,
      roles: ['super_admin', 'admin', 'manager']
    },
    {
      name: 'Rapports',
      href: '/rapports',
      icon: TrendingUp,
      roles: ['super_admin', 'admin', 'manager']
    },
    {
      name: 'Clients',
      href: '/clients',
      icon: Users,
      roles: ['super_admin', 'admin', 'manager', 'cashier']
    },
    {
      name: 'Fournisseurs',
      href: '/fournisseurs',
      icon: Building2,
      roles: ['super_admin', 'admin', 'manager']
    },
    {
      name: 'Dépenses',
      href: '/depenses',
      icon: DollarSign,
      roles: ['super_admin', 'admin', 'manager']
    },
    {
      name: 'Employés',
      href: '/employes',
      icon: Shield,
      roles: ['super_admin', 'admin', 'manager']
    },
    {
      name: 'Commandes',
      href: '/commandes',
      icon: ShoppingCart,
      roles: ['super_admin', 'admin', 'manager', 'cashier', 'seller']
    },
    {
      name: 'Sauvegarde',
      href: '/sauvegarde',
      icon: Database,
      roles: ['super_admin', 'admin']
    },
    {
      name: 'SuperAdmin',
      href: '/superadmin',
      icon: Shield,
      roles: ['super_admin']
    }
  ]

  // Filtrer la navigation selon les fonctionnalités du business
  const filteredNavigation = navigation.filter(item => {
    // Vérifier les permissions de rôle
    const hasRoleAccess = user?.role && item.roles.includes(user.role)
    
    // Vérifier les fonctionnalités spécifiques au type de commerce
    if (!hasRoleAccess) return false
    
    // Exemples de filtrage selon les fonctionnalités
    switch (item.name) {
      case 'Caisse':
        // La caisse est disponible pour tous les types de commerce
        return true
      case 'Trésorerie':
        // La trésorerie est disponible pour tous les types de commerce
        return true
      case 'Stock':
        // Le stock est disponible pour tous les types de commerce
        return true
      case 'Clients':
        // La gestion des clients avec dettes n'est disponible que pour restaurant/bar
        if (item.name === 'Clients' && !businessFeatures.allowsDebt) {
          return false
        }
        return true
      case 'Commandes':
        // Les commandes (service de table) ne sont que pour restaurant
        if (item.name === 'Commandes' && !businessFeatures.allowsTableService) {
          return false
        }
        return true
      case 'Fournisseurs':
        // Les fournisseurs sont pour tous les types
        return true
      default:
        return true
    }
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    if (isMobile && onCloseMobile) {
      onCloseMobile()
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    // For routes like /rapports, check exact match or proper path matching
    if (href === '/rapports') return pathname === href || pathname.startsWith('/rapports?')
    return pathname.startsWith(href)
  }

  return (
    <div className={`
      ${isMobile ? 'w-80' : 'w-64'} 
      bg-black/90 backdrop-blur-xl border-r border-orange-900/20 
      flex flex-col h-full
    `}>
      {/* Header */}
      <div className="p-6 border-b border-orange-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <img 
              src="/logo.png" 
              alt="SmartManager" 
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-white">SmartManager</h1>
              <p className="text-sm text-white">{user?.tenant?.name || 'Boutique Test'}</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          {isMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {filteredNavigation.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
                    isActive(item.href)
                      ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 border border-orange-400/20'
                      : 'text-gray-300 hover:bg-white/10 hover:text-orange-400 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* User Section */}
      <div className="p-4 border-t border-orange-900/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25">
            <span className="text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || 'Utilisateur Test'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || 'test@smartmanager.com'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-500/30 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
