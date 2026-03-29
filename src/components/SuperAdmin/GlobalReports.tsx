'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Database, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  Download,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react'
import { GlobalStats } from '@/types'
import { apiService } from '@/services/api'

interface TopTenant {
  name: string
  sales: number
  growth: number
  businessType?: string
  id: string
}

interface GlobalReportsProps {
  globalStats: GlobalStats | null
}

interface ReportData {
  period: string
  totalSales: number
  totalOrders: number
  totalUsers: number
  activeTenants: number
  growthRate: number
  topProducts: { name: string; sales: number; quantity: number; productId: string }[]
  topTenants: TopTenant[]
  businessTypeBreakdown: { type: string; count: number; percentage: number; sales: number }[]
  revenueByMonth: { month: string; revenue: number }[]
  userGrowthByMonth: { month: string; users: number }[]
}

export default function GlobalReports({ globalStats }: GlobalReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '90days' | '1year'>('30days')
  const [selectedReport, setSelectedReport] = useState<'overview' | 'sales' | 'tenants' | 'products' | 'users'>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Charger les données du rapport depuis l'API
  const loadReportData = useCallback(async (period: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await apiService.getGlobalReports(period)
      
      if (response.success && response.data) {
        setReportData(response.data)
      } else {
        throw new Error(response.error || 'Erreur lors du chargement du rapport')
      }
    } catch (err) {
      console.error('Erreur lors du chargement des données du rapport:', err)
      setError('Impossible de charger les données du rapport')
      
      // En cas d'erreur, utiliser les données globalStats comme fallback
      if (globalStats) {
        const fallbackData: ReportData = {
          period,
          totalSales: globalStats.totalSales,
          totalOrders: Math.floor(globalStats.totalSales / 1500), // Estimation
          totalUsers: globalStats.totalUsers,
          activeTenants: globalStats.activeTenants,
          growthRate: globalStats.growthRate,
          topProducts: [],
          topTenants: [],
          businessTypeBreakdown: (globalStats.topBusinessTypes || []).map(type => ({ ...type, sales: 0 })),
          revenueByMonth: [],
          userGrowthByMonth: []
        }
        setReportData(fallbackData)
      }
    } finally {
      setIsLoading(false)
    }
  }, [globalStats])

  useEffect(() => {
    loadReportData(selectedPeriod)
  }, [selectedPeriod, loadReportData])

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-GA')} XAF`
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const handleExportReport = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.exportGlobalReport(selectedPeriod, selectedReport)
      
      if (response.success && response.data?.downloadUrl) {
        // Créer un lien de téléchargement
        const link = document.createElement('a')
        link.href = response.data.downloadUrl
        link.download = `rapport-${selectedPeriod}-${selectedReport}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        throw new Error(response.error || 'Erreur lors de l\'export')
      }
    } catch (err) {
      console.error('Erreur lors de l\'export:', err)
      setError('Erreur lors de l\'export du rapport')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadReportData(selectedPeriod)
  }

  return (
    <div className="space-y-6">
      {/* En-tête et contrôles */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="text-xl font-bold text-white">Rapports Globaux</h3>
              <p className="text-sm text-gray-400">
                Vue d'ensemble de toutes les boutiques et performances
              </p>
            </div>
          </div>

          {/* Contrôles */}
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7days' | '30days' | '90days' | '1year')}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="7days">7 derniers jours</option>
              <option value="30days">30 derniers jours</option>
              <option value="90days">90 derniers jours</option>
              <option value="1year">Derni&egrave;re ann&eacute;e</option>
            </select>
            
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as 'overview' | 'sales' | 'tenants' | 'products' | 'users')}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="overview">Vue d&apos;ensemble</option>
              <option value="sales">Analyse des ventes</option>
              <option value="tenants">Performance boutiques</option>
              <option value="products">Top produits</option>
              <option value="users">Activit&eacute; utilisateurs</option>
            </select>

            <button
              onClick={handleExportReport}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>Exporter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vue d'ensemble */}
      {selectedReport === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPIs principaux */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-400">Période</h4>
              <span className="text-sm text-white font-medium">{reportData?.period || ''}</span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{formatCurrency(reportData?.totalSales || 0)}</div>
              <p className="text-sm text-gray-400">Chiffre d'affaires</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-green-400">+{formatPercentage(reportData?.growthRate || 0)}</span>
              <span className="text-gray-400">vs p&eacute;riode pr&eacute;c&eacute;dente</span>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{reportData?.totalUsers || 0}</div>
              <p className="text-sm text-gray-400">Utilisateurs totaux</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-blue-400">{reportData?.activeTenants || 0} actifs</span>
              <span className="text-gray-400">sur {reportData?.totalUsers || 0} totaux</span>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{reportData?.totalOrders || 0}</div>
              <p className="text-sm text-gray-400">Commandes totales</p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <span className="text-purple-400">Panier moyen: {formatCurrency(Math.floor((reportData?.totalSales || 0) / (reportData?.totalOrders || 1)))}</span>
            </div>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{reportData?.activeTenants || 0}</div>
              <p className="text-sm text-gray-400">Tenants actifs</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{formatPercentage(reportData?.growthRate || 0)}</div>
              <p className="text-sm text-gray-400">Taux croissance</p>
            </div>
          </div>
        </div>
      )}

      {/* Analyse des ventes */}
      {selectedReport === 'sales' && (
        <div className="space-y-6">
          {/* Graphique des ventes */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Évolution des ventes</h4>
            <div className="h-64 bg-black/60 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Graphique en cours de développement...</p>
              </div>
            </div>
          </div>

          {/* Top produits */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Top 5 produits</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/60">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Produit</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Quantité</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Ventes</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(reportData?.topProducts || []).slice(0, 5).map((product, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-sm text-white">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{product.quantity}</td>
                      <td className="px-4 py-3 text-sm text-white">{formatCurrency(product.sales)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-orange-500">{formatCurrency(product.sales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Performance boutiques */}
      {selectedReport === 'tenants' && (
        <div className="space-y-6">
          {/* Répartition par type */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Répartition par type de business</h4>
            <div className="space-y-3">
              {(reportData?.businessTypeBreakdown || []).map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-white font-medium capitalize">{type.type.replace('_', ' ')}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{type.count} boutiques</p>
                    <p className="text-xs text-gray-400">{type.percentage}% du total</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-500">{formatCurrency(type.sales)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top tenants */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Classement des tenants</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/60">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Tenant</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Ventes</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Croissance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(reportData?.topTenants || []).map((tenant, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-sm text-white">{tenant.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-400 capitalize">{tenant.businessType || 'restaurant'}</td>
                      <td className="px-4 py-3 text-sm text-white">{formatCurrency(tenant.sales)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center space-x-1 ${
                          tenant.growth > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tenant.growth > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span>{formatPercentage(tenant.growth)}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Top produits - vue détaillée */}
      {selectedReport === 'products' && (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Analyse des produits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Produits les plus vendus */}
            <div>
              <h5 className="text-sm font-medium text-white mb-3">Top 10 produits</h5>
              <div className="space-y-2">
                {(reportData?.topProducts || []).slice(0, 10).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-black/60 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-white">#{index + 1}</span>
                      <span className="text-sm text-gray-400">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{formatCurrency(product.sales)}</p>
                      <p className="text-xs text-gray-400">{product.quantity} unités</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catégories populaires */}
            <div>
              <h5 className="text-sm font-medium text-white mb-3">Répartition par catégorie</h5>
              <div className="space-y-2">
                {[
                  { category: 'Alimentaire', percentage: 45, width: 45 },
                  { category: 'Boissons', percentage: 30, width: 30 },
                  { category: 'Épicerie', percentage: 20, width: 20 },
                  { category: 'Produits frais', percentage: 15, width: 15 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{item.category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-700 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${item.width}%` }}></div>
                      </div>
                      <span className="text-sm text-white">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activité utilisateurs */}
      {selectedReport === 'users' && (
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Activité des utilisateurs</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Statistiques de connexion */}
            <div className="bg-black/60 rounded-lg p-4">
              <h5 className="text-sm font-medium text-white mb-3">Connexions aujourd&apos;hui</h5>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">{Math.floor((reportData?.totalUsers || 0) * 0.3)}</div>
                <p className="text-sm text-gray-400">Utilisateurs connectés</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">{Math.floor((reportData?.totalUsers || 0) * 0.7)}</div>
                <p className="text-sm text-gray-400">Utilisateurs inactifs</p>
              </div>
            </div>

            {/* Activité récente */}
            <div className="bg-black/60 rounded-lg p-4">
              <h5 className="text-sm font-medium text-white mb-3">Activité récente</h5>
              <div className="space-y-2">
                {[
                  { icon: Activity, text: 'Nouveaux utilisateurs', count: 12, time: 'Aujourd\'hui' },
                  { icon: Users, text: 'Utilisateurs actifs', count: reportData?.activeTenants || 0, time: '24 dernières heures' },
                  { icon: Calendar, text: 'Connexions cette semaine', count: Math.floor((reportData?.totalUsers || 0) * 2.1), time: '7 derniers jours' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <activity.icon className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-white">{activity.text}</p>
                      <p className="text-xs text-gray-400">{activity.count} - {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
