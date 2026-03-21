'use client'

import { useEffect, useState } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { TrendingUp, AlertTriangle, Package, DollarSign } from 'lucide-react'

interface StockAlert {
  name: string
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

export function SmartAlerts() {
  const { checkStockAlerts, checkSalesAlerts, checkExpenseAlerts, checkProfitAlerts } = useNotifications()
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [salesData, setSalesData] = useState<SalesData>({ daily: 0, weekly: 0, monthly: 0, revenue: 0 })
  const [expenseData, setExpenseData] = useState<ExpenseData>({ daily: 0, weekly: 0, monthly: 0, total: 0 })
  const [profitMargin, setProfitMargin] = useState(0)

  useEffect(() => {
    // Charger les données réelles depuis l'API
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Vérifier si le token existe avant de faire les appels API
        if (!token) {
          console.log('Pas de token trouvé, utilisation de données par défaut')
          // Utiliser des données par défaut si pas authentifié
          setStockAlerts([])
          setSalesData({ daily: 0, weekly: 0, monthly: 0, revenue: 0 })
          setExpenseData({ daily: 0, weekly: 0, monthly: 0, total: 0 })
          setProfitMargin(0)
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
        
        // Générer les alertes de stock basées sur les produits réels
        const alerts: StockAlert[] = productsData.data?.map((product: any) => {
          if (product.quantity <= 0) return { name: product.name, status: 'RUPTURE' }
          if (product.quantity <= product.minStock * 0.5) return { name: product.name, status: 'CRITIQUE' }
          if (product.quantity <= product.minStock) return { name: product.name, status: 'FAIBLE' }
          return { name: product.name, status: 'NORMAL' }
        }).filter((alert: StockAlert) => alert.status !== 'NORMAL').slice(0, 3) || []
        
        setStockAlerts(alerts)
        setSalesData(salesData.data || { daily: 0, weekly: 0, monthly: 0, revenue: 0 })
        setExpenseData(expensesData.data || { daily: 0, weekly: 0, monthly: 0, total: 0 })
        setProfitMargin(profitMargin)
        
        checkStockAlerts(productsData.data || [])
        checkSalesAlerts(salesData.data || { daily: 0, weekly: 0, monthly: 0 })
        checkExpenseAlerts(expensesData.data || { daily: 0, weekly: 0, monthly: 0 })
        checkProfitAlerts(profitMargin)
        
      } catch (error) {
        console.error('Erreur lors du chargement des données pour alertes:', error)
        // Utiliser des données par défaut en cas d'erreur
        setStockAlerts([])
        setSalesData({ daily: 0, weekly: 0, monthly: 0, revenue: 0 })
        setExpenseData({ daily: 0, weekly: 0, monthly: 0, total: 0 })
        setProfitMargin(0)
      }
    }

    // Charger les données immédiatement
    loadData()
    
    // Vérifier périodiquement (toutes les 30 secondes)
    const interval = setInterval(loadData, 30000)

    return () => clearInterval(interval)
  }, [checkStockAlerts, checkSalesAlerts, checkExpenseAlerts, checkProfitAlert])

  const dailyObjective = 100000
  const dailyExpenseLimit = 50000
  const minProfitMargin = 15
  const salesProgress = dailyObjective > 0 ? (salesData.daily / dailyObjective * 100) : 0
  const expenseStatus = expenseData.daily > dailyExpenseLimit ? 'DÉPASSÉ' : 'NORMAL'
  const profitStatus = profitMargin >= minProfitMargin ? 'NORMAL' : 'SOUS MINIMUM'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Package className="h-8 w-8 text-yellow-400" />
          <h3 className="text-white font-semibold">Alertes Stock</h3>
        </div>
        <div className="space-y-2">
          {stockAlerts.length > 0 ? (
            stockAlerts.map((alert, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">{alert.name}</span>
                <span className={`text-xs font-medium ${
                  alert.status === 'RUPTURE' ? 'text-red-400' :
                  alert.status === 'CRITIQUE' ? 'text-orange-400' :
                  'text-yellow-400'
                }`}>{alert.status}</span>
              </div>
            ))
          ) : (
            <div className="text-green-400 text-sm">Stock critique</div>
          )}
          {stockAlerts.length === 0 && (
            <div className="text-green-400 text-sm">Tous les produits ont un stock suffisant</div>
          )}
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
            <span className="text-gray-400 text-sm">{dailyObjective.toLocaleString()} XAF</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Actuel</span>
            <span className={`${salesProgress >= 85 ? 'text-green-400' : 'text-orange-400'} text-sm font-medium`}>
              {salesData.daily.toLocaleString()} XAF
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Progression</span>
            <span className={`${salesProgress >= 85 ? 'text-green-400' : 'text-orange-400'} text-sm font-medium`}>
              {salesProgress.toFixed(1)}%
            </span>
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
            <span className="text-gray-400 text-sm">{dailyExpenseLimit.toLocaleString()} XAF</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Actuel</span>
            <span className={`${expenseStatus === 'DÉPASSÉ' ? 'text-red-400' : 'text-green-400'} text-sm font-medium`}>
              {expenseData.daily.toLocaleString()} XAF
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Statut</span>
            <span className={`${expenseStatus === 'DÉPASSÉ' ? 'text-red-400' : 'text-green-400'} text-sm font-medium`}>
              {expenseStatus}
            </span>
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
            <span className="text-gray-400 text-sm">{minProfitMargin}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Actuelle</span>
            <span className={`${profitStatus === 'NORMAL' ? 'text-green-400' : 'text-orange-400'} text-sm font-medium`}>
              {profitMargin.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Statut</span>
            <span className={`${profitStatus === 'NORMAL' ? 'text-green-400' : 'text-orange-400'} text-sm font-medium`}>
              {profitStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
