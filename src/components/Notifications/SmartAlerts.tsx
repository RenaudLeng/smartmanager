'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface StockAlert {
  id: string
  name: string
  currentStock: number
  minStock: number
  status: 'FAIBLE' | 'CRITIQUE' | 'RUPTURE' | 'NORMAL'
}

interface SalesData {
  daily: number
  weekly: number
  monthly: number
  revenue: number
}

interface ExpenseData {
  daily: number
  weekly: number
  monthly: number
  total: number
}

interface Config {
  dailyObjective: number
  dailyExpenseLimit: number
  minProfitMargin: number
  lowStockThreshold: number
}

export default function SmartAlerts() {
  const { token } = useAuth()
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [salesData, setSalesData] = useState<SalesData>({ daily: 0, weekly: 0, monthly: 0, revenue: 0 })
  const [expenseData, setExpenseData] = useState<ExpenseData>({ daily: 0, weekly: 0, monthly: 0, total: 0 })
  const [profitMargin, setProfitMargin] = useState(0)
  const [config, setConfig] = useState<Config>({
    dailyObjective: 100000,
    dailyExpenseLimit: 50000,
    minProfitMargin: 15,
    lowStockThreshold: 10
  })

  const loadData = useCallback(async () => {
    try {
      if (!token) {
        console.log('Pas de token trouvé, utilisation de données par défaut')
        setStockAlerts([])
        setSalesData({ daily: 0, weekly: 0, monthly: 0, revenue: 0 })
        setExpenseData({ daily: 0, weekly: 0, monthly: 0, total: 0 })
        setProfitMargin(0)
        return
      }
      
      // Charger les produits pour alertes de stock (avec retry)
      let productsResponseData = { products: [] }
      try {
        const productsResponse = await fetch('/api/products', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (productsResponse.ok) {
          productsResponseData = await productsResponse.json()
        } else {
          console.warn('Impossible de charger les produits, statut:', productsResponse.status)
        }
      } catch (error) {
        console.warn('Erreur réseau lors du chargement des produits:', error)
      }
      
      // Charger les ventes pour alertes de performance (avec retry)
      let salesResponseData = { totalSales: 0, todaySales: 0 }
      try {
        const salesResponse = await fetch('/api/sales/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (salesResponse.ok) {
          salesResponseData = await salesResponse.json()
        } else {
          console.warn('Impossible de charger les ventes, statut:', salesResponse.status)
        }
      } catch (error) {
        console.warn('Erreur réseau lors du chargement des ventes:', error)
      }
      
      // Charger les dépenses pour alertes financières (avec retry)
      let expensesResponseData = { totalExpenses: 0, todayExpenses: 0 }
      try {
        const expensesResponse = await fetch('/api/expenses/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (expensesResponse.ok) {
          expensesResponseData = await expensesResponse.json()
        } else {
          console.warn('Impossible de charger les dépenses, statut:', expensesResponse.status)
        }
      } catch (error) {
        console.warn('Erreur réseau lors du chargement des dépenses:', error)
      }
      
      // Charger la configuration du tableau de bord
      let configResponseData = { data: null }
      try {
        const configResponse = await fetch('/api/dashboard/config', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (configResponse.ok) {
          configResponseData = await configResponse.json()
        } else {
          console.warn('Impossible de charger la configuration, statut:', configResponse.status)
        }
      } catch (error) {
        console.warn('Erreur réseau lors du chargement de la configuration:', error)
      }
      
      // Traiter les données
      const products = productsResponseData.products || []
      const lowStockProducts = products.filter((product: {
        id: string
        name: string
        quantity: number
        minStock?: number
      }) => 
        product.quantity <= (product.minStock || 10)
      )
      
      setStockAlerts(lowStockProducts.map((product: {
        id: string
        name: string
        quantity: number
        minStock?: number
      }) => ({
        id: product.id,
        name: product.name,
        currentStock: product.quantity,
        minStock: product.minStock || 10,
        status: product.quantity === 0 ? 'RUPTURE' : 
                product.quantity <= (product.minStock || 10) / 2 ? 'CRITIQUE' : 'FAIBLE'
      })))
      
      setSalesData({
        daily: salesResponseData.todaySales || 0,
        weekly: 0,
        monthly: 0,
        revenue: salesResponseData.totalSales || 0
      })
      
      setExpenseData({
        daily: expensesResponseData.todayExpenses || 0,
        weekly: 0,
        monthly: 0,
        total: expensesResponseData.totalExpenses || 0
      })
      
      if (configResponseData.data) {
        setConfig(configResponseData.data)
      }
      
      // Calculer la marge bénéficiaire
      const margin = salesResponseData.totalSales ? 
        ((salesResponseData.totalSales - expensesResponseData.totalExpenses) / salesResponseData.totalSales * 100) : 0
      setProfitMargin(margin)
      
    } catch (error) {
      console.warn('Erreur lors du chargement des données:', error)
      setStockAlerts([])
      setSalesData({ daily: 0, weekly: 0, monthly: 0, revenue: 0 })
      setExpenseData({ daily: 0, weekly: 0, monthly: 0, total: 0 })
      setProfitMargin(0)
    }
  }, [token])

  useEffect(() => {
    loadData()
  }, [token])

  const criticalStockAlerts = stockAlerts.filter(alert => alert.status === 'RUPTURE')
  const lowStockAlerts = stockAlerts.filter(alert => alert.status === 'CRITIQUE')
  const salesPerformance = salesData.daily >= config.dailyObjective ? 'EXCELLENT' : 
                           salesData.daily >= config.dailyObjective * 0.8 ? 'BON' : 'FAIBLE'
  const expenseStatus = expenseData.daily > config.dailyExpenseLimit ? 'ÉLEVÉ' : 'NORMAL'
  const profitStatus = profitMargin >= config.minProfitMargin ? 'NORMAL' : 'FAIBLE'

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Alertes intelligentes</h3>
      
      {/* Alertes de stock */}
      {(criticalStockAlerts.length > 0 || lowStockAlerts.length > 0) && (
        <div className="space-y-3 mb-6">
          {criticalStockAlerts.length > 0 && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-red-400 font-medium">Stock critique</p>
                  <p className="text-red-300 text-sm">{criticalStockAlerts.length} produit(s) en rupture</p>
                </div>
              </div>
            </div>
          )}
          
          {lowStockAlerts.length > 0 && (
            <div className="bg-orange-500/20 border border-orange-500/50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="text-orange-400 font-medium">Stock faible</p>
                  <p className="text-orange-300 text-sm">{lowStockAlerts.length} produit(s) faible</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Alertes de performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`border rounded-lg p-4 ${
          salesPerformance === 'EXCELLENT' ? 'bg-green-500/20 border-green-500/50' :
          salesPerformance === 'BON' ? 'bg-blue-500/20 border-blue-500/50' :
          'bg-orange-500/20 border-orange-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Ventes du jour</span>
            <span className={`text-sm font-medium ${
              salesPerformance === 'EXCELLENT' ? 'text-green-400' :
              salesPerformance === 'BON' ? 'text-blue-400' :
              'text-orange-400'
            }`}>
              {salesPerformance}
            </span>
          </div>
          <p className="text-white text-lg font-semibold mt-1">
            {salesData.daily.toLocaleString('fr-GA')} XAF
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Objectif: {config.dailyObjective.toLocaleString('fr-GA')} XAF
          </p>
        </div>

        <div className={`border rounded-lg p-4 ${
          expenseStatus === 'ÉLEVÉ' ? 'bg-red-500/20 border-red-500/50' :
          'bg-green-500/20 border-green-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Dépenses du jour</span>
            <span className={`text-sm font-medium ${
              expenseStatus === 'ÉLEVÉ' ? 'text-red-400' : 'text-green-400'
            }`}>
              {expenseStatus}
            </span>
          </div>
          <p className="text-white text-lg font-semibold mt-1">
            {expenseData.daily.toLocaleString('fr-GA')} XAF
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Limite: {config.dailyExpenseLimit.toLocaleString('fr-GA')} XAF
          </p>
        </div>

        <div className={`border rounded-lg p-4 ${
          profitStatus === 'NORMAL' ? 'bg-green-500/20 border-green-500/50' :
          'bg-orange-500/20 border-orange-500/50'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Marge bénéficiaire</span>
            <span className={`text-sm font-medium ${
              profitStatus === 'NORMAL' ? 'text-green-400' : 'text-orange-400'
            }`}>
              {profitStatus}
            </span>
          </div>
          <p className="text-white text-lg font-semibold mt-1">
            {profitMargin.toFixed(1)}%
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Minimum: {config.minProfitMargin}%
          </p>
        </div>
      </div>
    </div>
  )
}
