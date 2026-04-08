'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface SystemMetrics {
  cpu: number
  memory: number
  storage: number
  uptime: string
  activeConnections: number
  responseTime: number
  errorRate: number
}

interface SystemAlert {
  type: 'warning' | 'error' | 'success' | 'info'
  title: string
  message: string
  time: string
  action?: string
}

export default function useSystemMetrics() {
  const { user, token } = useAuth()
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    storage: 0,
    uptime: '0%',
    activeConnections: 0,
    responseTime: 0,
    errorRate: 0
  })
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Récupérer les métriques système réelles depuis l'API
  const fetchSystemMetrics = useCallback(async () => {
    // Vérifier si l'utilisateur est authentifié et est super_admin
    if (!user || user.role !== 'super_admin' || !token) {
      // Utiliser des données par défaut si non authentifié
      setMetrics({
        cpu: 0,
        memory: 0,
        storage: 0,
        uptime: '99.9%',
        activeConnections: 0,
        responseTime: 0,
        errorRate: 0
      })
      
      setAlerts([{
        type: 'info',
        title: 'Authentification requise',
        message: 'Connectez-vous en tant que super administrateur pour voir les métriques',
        time: 'Maintenant'
      }])
      
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Appel API pour les métriques système réelles
      const response = await apiService.getSystemMetrics()
      
      if (response.success && response.data) {
        const realMetrics: SystemMetrics = {
          cpu: response.data.cpu || 0,
          memory: response.data.memory || 0,
          storage: response.data.storage || 0,
          uptime: response.data.uptime || '99.9%',
          activeConnections: response.data.activeConnections || 0,
          responseTime: response.data.responseTime || 0,
          errorRate: response.data.errorRate || 0
        }

        setMetrics(realMetrics)

        // Générer des alertes basées sur les métriques réelles
        const newAlerts: SystemAlert[] = []
        
        if (realMetrics.cpu > 70) {
          newAlerts.push({
            type: 'warning',
            title: 'CPU élevé',
            message: `L'utilisation du CPU est à ${realMetrics.cpu.toFixed(1)}%`,
            time: 'Il y a 5min',
            action: 'Optimiser'
          })
        }

        if (realMetrics.memory > 80) {
          newAlerts.push({
            type: 'warning',
            title: 'Mémoire élevée',
            message: `L'utilisation de la mémoire est à ${realMetrics.memory.toFixed(1)}%`,
            time: 'Il y a 10min',
            action: 'Nettoyer'
          })
        }

        if (realMetrics.storage > 85) {
          newAlerts.push({
            type: 'error',
            title: 'Stockage critique',
            message: `Le stockage est à ${realMetrics.storage.toFixed(1)}%`,
            time: 'Il y a 1h',
            action: 'Libérer'
          })
        }

        if (realMetrics.errorRate > 2) {
          newAlerts.push({
            type: 'error',
            title: 'Taux d\'erreur élevé',
            message: `Le taux d'erreur est de ${realMetrics.errorRate.toFixed(2)}%`,
            time: 'Il y a 30min',
            action: 'Investiguer'
          })
        }

        if (newAlerts.length === 0) {
          newAlerts.push({
            type: 'success',
            title: 'Système stable',
            message: 'Tous les services fonctionnent normalement',
            time: 'Il y a 5min'
          })
        }

        // Ajouter des alertes générales
        newAlerts.push({
          type: 'info',
          title: 'Dernière mise à jour',
          message: `Métriques actualisées à ${new Date().toLocaleTimeString('fr-GA')}`,
          time: 'Maintenant'
        })

        setAlerts(newAlerts)
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des métriques')
      }

    } catch (err) {
      console.error('Erreur lors du chargement des métriques système:', err)
      setError('Erreur lors du chargement des métriques')
      
      // En cas d'erreur, utiliser des valeurs par défaut
      setMetrics({
        cpu: 0,
        memory: 0,
        storage: 0,
        uptime: '99.9%',
        activeConnections: 0,
        responseTime: 0,
        errorRate: 0
      })
      
      setAlerts([{
        type: 'error',
        title: 'Erreur de connexion',
        message: 'Impossible de récupérer les métriques système',
        time: 'Maintenant',
        action: 'Réessayer'
      }])
    } finally {
      setLoading(false)
    }
  }, [user, token])

  // Charger les métriques au montage
  useEffect(() => {
    // Ne charger les métriques que si l'utilisateur est super_admin
    if (user && user.role === 'super_admin' && token) {
      fetchSystemMetrics()

      // Rafraîchir les métriques toutes les 30 secondes seulement si authentifié
      const interval = setInterval(fetchSystemMetrics, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id, token]) // Dépendances stables : user.id et token

  return {
    metrics,
    alerts,
    loading,
    error,
    refreshMetrics: fetchSystemMetrics
  }
}
