'use client'

import { useEffect } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { TrendingUp, AlertTriangle, Package, DollarSign } from 'lucide-react'

export function SmartAlerts() {
  const { checkStockAlerts, checkSalesAlerts, checkExpenseAlerts, checkProfitAlerts } = useNotifications()

  useEffect(() => {
    // Charger les données réelles depuis l'API
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Vérifier si le token existe avant de faire les appels API
        if (!token) {
          console.log('Pas de token trouvé, utilisation de données par défaut')
          // Utiliser des données par défaut si pas authentifié
          checkStockAlerts([])
          checkSalesAlerts({ daily: 0, weekly: 0, monthly: 0 })
          checkExpenseAlerts({ daily: 0, weekly: 0, monthly: 0 })
          checkProfitAlerts(0)
          return
        }
        
        // Charger les produits pour alertes de stock
        const productsResponse = await fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Charger les ventes pour alertes de performance
        const salesResponse = await fetch('/api/sales/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Charger les dépenses pour alertes financières
        const expensesResponse = await fetch('/api/expenses/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        // Gérer les réponses même si elles échouent
        let productsData = { data: [] }
        let salesData = { data: { daily: 0, weekly: 0, monthly: 0, revenue: 0 } }
        let expensesData = { data: { daily: 0, weekly: 0, monthly: 0, total: 0 } }
        
        if (productsResponse.ok) {
          productsData = await productsResponse.json()
        } else {
          console.warn('Erreur chargement produits:', productsResponse.status)
        }
        
        if (salesResponse.ok) {
          salesData = await salesResponse.json()
        } else {
          console.warn('Erreur chargement ventes:', salesResponse.status)
        }
        
        if (expensesResponse.ok) {
          expensesData = await expensesResponse.json()
        } else {
          console.warn('Erreur chargement dépenses:', expensesResponse.status)
        }
        
        // Calculer la marge bénéficiaire
        const profitMargin = salesData.data?.revenue ? 
          ((salesData.data.revenue - expensesData.data.total) / salesData.data.revenue * 100) : 0
        
        checkStockAlerts(productsData.data || [])
        checkSalesAlerts(salesData.data || { daily: 0, weekly: 0, monthly: 0 })
        checkExpenseAlerts(expensesData.data || { daily: 0, weekly: 0, monthly: 0 })
        checkProfitAlerts(profitMargin)
        
      } catch (error) {
        console.error('Erreur lors du chargement des données pour alertes:', error)
        // Utiliser des données par défaut en cas d'erreur
        checkStockAlerts([])
        checkSalesAlerts({ daily: 0, weekly: 0, monthly: 0 })
        checkExpenseAlerts({ daily: 0, weekly: 0, monthly: 0 })
        checkProfitAlerts(0)
      }
    }

    // Charger les données immédiatement
    loadData()
    
    // Vérifier périodiquement (toutes les 30 secondes)
    const interval = setInterval(loadData, 30000)

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
