'use client'

import { useEffect, useState } from 'react'
import Navigation from './Navigation'
import { NotificationCenter } from './Notifications/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'
import { Menu, X } from 'lucide-react'
import { TenantProvider } from '@/contexts/TenantContext'
import { useRouter, usePathname } from 'next/navigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Tableau de bord'
    if (pathname === '/tresorerie') return 'Trésorerie'
    if (pathname === '/stock') return 'Stock'
    if (pathname === '/pos') return 'Caisse'
    if (pathname === '/rapports') return 'Rapports unifiés'
    if (pathname === '/clients') return 'Clients'
    if (pathname === '/fournisseurs') return 'Fournisseurs'
    if (pathname === '/depenses') return 'Dépenses'
    if (pathname === '/employes') return 'Employés'
    if (pathname === '/commandes') return 'Commandes'
    if (pathname === '/sauvegarde') return 'Sauvegarde'
    if (pathname === '/settings') return 'Paramètres'
    return 'SmartManager'
  }

  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll 
  } = useNotifications()

  useEffect(() => {
    // Simulation d'utilisateur pour développement
    const testUser = {
      id: 'test-user',
      name: 'Utilisateur Test',
      email: 'test@smartmanager.com',
      role: 'admin',
      tenant: {
        id: 'test-tenant',
        name: 'Boutique Test',
        businessType: 'retail'
      }
    }
    
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify(testUser))
    
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-white text-2xl font-medium">Chargement...</div>
        </div>
      </div>
    )
  }

  return (
    <TenantProvider>
      <div className="flex h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 relative">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Navigation 
          user={{
            id: 'test-user',
            name: 'Utilisateur Test',
            email: 'test@smartmanager.com',
            role: 'admin',
            tenant: {
              id: 'test-tenant',
              name: 'Boutique Test',
              businessType: 'retail'
            }
          }}
          isMobile={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-black/40 backdrop-blur-md overflow-auto">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              {/* Logo */}
              <img 
                src="/logo.png" 
                alt="SmartManager" 
                className="h-8 w-auto object-contain"
              />
              <h1 className="text-white text-lg font-semibold ml-3">{getPageTitle()}</h1>
            </div>
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteNotification}
              onClearAll={clearAll}
            />
          </div>
        </div>
        
        {/* Page Content */}
        <div className="p-4">
          {children}
        </div>
      </main>
    </div>
    </TenantProvider>
  )
}
