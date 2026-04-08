'use client'

import { useState, useEffect } from 'react'
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  Server, 
  Users, 
  Database,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { logger } from '@/lib/monitoring'

interface SystemMetrics {
  totalRequests: number
  errorRate: number
  averageResponseTime: number
  activeUsers: number
  cacheHitRate: number
  memoryUsage: number
  cpuUsage: number
}

export default function MonitoringPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalRequests: 0,
    errorRate: 0,
    averageResponseTime: 0,
    activeUsers: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    cpuUsage: 0
  })
  const [logs, setLogs] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user?.role !== 'super_admin') return

    loadMetrics()
    loadRecentLogs()
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(() => {
      loadMetrics()
      loadRecentLogs()
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  const loadMetrics = async () => {
    try {
      // Simuler des métriques système
      const recentLogs = logger.getRecentLogs(1000)
      const errorLogs = recentLogs.filter(log => log.level === 'error')
      const totalRequests = recentLogs.filter(log => log.context?.route).length
      
      const responseTimes = recentLogs
        .filter(log => log.context?.duration)
        .map(log => log.context?.duration || 0)

      setMetrics({
        totalRequests,
        errorRate: totalRequests > 0 ? (errorLogs.length / totalRequests) * 100 : 0,
        averageResponseTime: responseTimes.length > 0 
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
          : 0,
        activeUsers: new Set(recentLogs.map(log => log.context?.userId)).size,
        cacheHitRate: 85.3, // Simulé
        memoryUsage: 68.7, // Simulé
        cpuUsage: 42.1 // Simulé
      })
    } catch (error) {
      console.error('Erreur chargement métriques:', error)
    }
  }

  const loadRecentLogs = async () => {
    try {
      const recentLogs = logger.getRecentLogs(50)
      setLogs(recentLogs)
    } catch (error) {
      console.error('Erreur chargement logs:', error)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([loadMetrics(), loadRecentLogs()])
    setRefreshing(false)
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-100'
      case 'warn': return 'text-yellow-600 bg-yellow-100'
      case 'info': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Accès non autorisé</h1>
          <p className="text-gray-400">Cette page est réservée au SuperAdmin</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-500" />
              Monitoring Système
            </h1>
            <p className="text-gray-400 mt-1">Surveillance des performances et erreurs</p>
          </div>
          
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Requêtes totales</span>
              <Server className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">{metrics.totalRequests.toLocaleString()}</div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Taux d'erreur</span>
              <AlertTriangle className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.errorRate, { warning: 5, critical: 10 })}`}>
              {metrics.errorRate.toFixed(1)}%
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Temps de réponse moyen</span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.averageResponseTime, { warning: 500, critical: 1000 })}`}>
              {metrics.averageResponseTime.toFixed(0)}ms
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Utilisateurs actifs</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">{metrics.activeUsers}</div>
          </div>
        </div>

        {/* Métriques système */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">CPU</h3>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.cpuUsage, { warning: 70, critical: 90 })}`}>
              {metrics.cpuUsage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className={`h-2 rounded-full ${
                  metrics.cpuUsage >= 90 ? 'bg-red-600' :
                  metrics.cpuUsage >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${metrics.cpuUsage}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Mémoire</h3>
              <Database className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${getMetricColor(metrics.memoryUsage, { warning: 80, critical: 95 })}`}>
              {metrics.memoryUsage.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className={`h-2 rounded-full ${
                  metrics.memoryUsage >= 95 ? 'bg-red-600' :
                  metrics.memoryUsage >= 80 ? 'bg-yellow-600' : 'bg-green-600'
                }`}
                style={{ width: `${metrics.memoryUsage}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cache Hit Rate</h3>
              <Activity className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">{metrics.cacheHitRate.toFixed(1)}%</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
              <div 
                className="h-2 rounded-full bg-green-600"
                style={{ width: `${metrics.cacheHitRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Logs récents */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Logs récents</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {logs.slice(0, 20).map((log, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{log.message}</div>
                  {log.context?.route && (
                    <div className="text-xs text-gray-400 mt-1">
                      {log.context.method} {log.context.route} - {log.context.statusCode}
                      {log.context.duration && ` (${log.context.duration}ms)`}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
