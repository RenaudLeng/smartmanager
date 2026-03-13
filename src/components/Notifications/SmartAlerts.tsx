'use client'

import { useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { TrendingUp, AlertTriangle, Package, DollarSign } from 'lucide-react'

export function SmartAlerts() {
  const { checkStockAlerts, checkSalesAlerts, checkExpenseAlerts, checkProfitAlerts } = useNotifications()

  useEffect(() => {
    // Simuler des vérifications périodiques
    const interval = setInterval(() => {
      // Simuler des données pour les alertes
      const mockProducts = [
        { name: 'Riz gabonais 1kg', stock: 8, minStock: 50 },
        { name: 'Huile de palme 1L', stock: 15, minStock: 30 },
        { name: 'Farine de manioc 1kg', stock: 3, minStock: 25 }
      ]

      const mockSales = {
        daily: 85000,
        weekly: 450000,
        monthly: 1850000
      }

      const mockExpenses = {
        daily: 65000,
        weekly: 320000,
        monthly: 1200000
      }

      const mockProfitMargin = 12.5

      checkStockAlerts(mockProducts)
      checkSalesAlerts(mockSales)
      checkExpenseAlerts(mockExpenses)
      checkProfitAlerts(mockProfitMargin)
    }, 30000) // Vérifier toutes les 30 secondes pour la démo

    return () => clearInterval(interval)
  }, [checkStockAlerts, checkSalesAlerts, checkExpenseAlerts, checkProfitAlerts])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Package className="h-8 w-8 text-yellow-400" />
          <h3 className="text-white font-semibold">Alertes Stock</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Riz gabonais</span>
            <span className="text-yellow-400 text-xs font-medium">FAIBLE</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Huile de palme</span>
            <span className="text-orange-400 text-xs font-medium">CRITIQUE</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Farine de manioc</span>
            <span className="text-red-400 text-xs font-medium">RUPTURE</span>
          </div>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <TrendingUp className="h-8 w-8 text-blue-400" />
          <h3 className="text-white font-semibold">Performance Ventes</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Objectif quotidien</span>
            <span className="text-gray-400 text-sm">100,000 XAF</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Actuel</span>
            <span className="text-orange-400 text-sm font-medium">85,000 XAF</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Progression</span>
            <span className="text-orange-400 text-sm font-medium">85%</span>
          </div>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <DollarSign className="h-8 w-8 text-red-400" />
          <h3 className="text-white font-semibold">Contrôle Dépenses</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Limite quotidienne</span>
            <span className="text-gray-400 text-sm">50,000 XAF</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Actuel</span>
            <span className="text-red-400 text-sm font-medium">65,000 XAF</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Statut</span>
            <span className="text-red-400 text-sm font-medium">DÉPASSÉ</span>
          </div>
        </div>
      </div>

      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <AlertTriangle className="h-8 w-8 text-orange-400" />
          <h3 className="text-white font-semibold">Marge Bénéficiaire</h3>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Marge minimale</span>
            <span className="text-gray-400 text-sm">15%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Actuelle</span>
            <span className="text-orange-400 text-sm font-medium">12.5%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Statut</span>
            <span className="text-orange-400 text-sm font-medium">SOUS MINIMUM</span>
          </div>
        </div>
      </div>
    </div>
  )
}
