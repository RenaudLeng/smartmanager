'use client'

import { useEffect, useState } from 'react'
import Navigation from './Navigation'
import { NotificationCenter } from './Notifications/NotificationCenter'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/contexts/AuthContext'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { user } = useAuth()

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
    setTimeout(() => {
      setLoading(false)
    }, 500)
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
    <div className="flex h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 relative safe-area-inset">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 lg:w-72
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
        <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-sm border-b border-white/10 safe-area-inset">
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <Image 
                  src="/logo.png" 
                  alt="SmartManager" 
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <h1 className="text-white text-base sm:text-lg font-semibold">{getPageTitle()}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
                <div className="w-8 h-8 bg-linear-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'B'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-medium text-sm">{user?.name || 'Bakala'}</p>
                  <p className="text-gray-400 text-xs">{user?.email || 'devehlengoria@school.fr'}</p>
                </div>
              </div>
              <NotificationCenter
                notifications={[]}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDelete={deleteNotification}
                onClearAll={clearAll}
              />
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
