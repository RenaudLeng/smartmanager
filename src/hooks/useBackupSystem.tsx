'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Play, 
  Pause, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Calendar,
  HardDrive,
  Cloud,
  Shield,
  Settings,
  Trash2,
  X,
  Plus,
  Save
} from 'lucide-react'
import { apiService } from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

interface BackupJob {
  id: string
  name: string
  description: string
  type: 'full' | 'incremental' | 'differential'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  startTime: Date
  endTime?: Date
  size: number
  tenantId?: string
  tenantName?: string
  error?: string
}

interface BackupSettings {
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  retentionDays: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
  storageLocation: 'local' | 'cloud' | 'hybrid'
  cloudProvider: 'aws' | 'google' | 'azure' | 'dropbox'
  notificationEmails: string[]
}

interface BackupSystemProps {
  tenants: any[]
  onBackupAction?: (action: string, jobId: string) => void
}

export default function useBackupSystem({ tenants, onBackupAction }: BackupSystemProps) {
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([])
  const [settings, setSettings] = useState<BackupSettings>({
    frequency: 'daily',
    time: '02:00',
    retentionDays: 30,
    compressionEnabled: true,
    encryptionEnabled: true,
    storageLocation: 'hybrid',
    cloudProvider: 'aws',
    notificationEmails: ['admin@smartmanager.com']
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const { user } = useAuth()

  // Charger les jobs de backup depuis l'API
  const loadBackupJobs = useCallback(async () => {
    const currentUser = user // Capturer user à l'appel
    if (!currentUser?.tenantId && currentUser?.role !== 'super_admin') return

    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getBackups()
      
      if (response.success && response.data) {
        const formattedJobs = response.data.map((job: any) => ({
          id: job.id,
          name: job.name,
          description: job.description,
          type: job.type,
          status: job.status,
          progress: job.progress || 0,
          startTime: new Date(job.createdAt),
          endTime: job.completedAt ? new Date(job.completedAt) : undefined,
          size: job.size || 0,
          tenantId: job.tenantId,
          tenantName: job.tenant?.name || 'Système',
          error: job.error
        }))
        
        setBackupJobs(formattedJobs)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des jobs de backup:', err)
      setError('Impossible de charger les jobs de backup')
    } finally {
      setLoading(false)
    }
  }, [])

  // Charger les paramètres de backup
  const loadBackupSettings = useCallback(async () => {
    const currentUser = user // Capturer user à l'appel
    if (!currentUser?.tenantId && currentUser?.role !== 'super_admin') return

    try {
      const response = await apiService.getBackupSettings()
      
      if (response.success && response.data) {
        setSettings(response.data)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des paramètres:', err)
    }
  }, [])

  useEffect(() => {
    // Charger les données au montage et quand l'utilisateur change
    const loadData = async () => {
      const currentUser = user
      if (!currentUser?.tenantId && currentUser?.role !== 'super_admin') return

      try {
        setLoading(true)
        setError(null)

        // Charger en parallèle
        const [jobsResponse, settingsResponse] = await Promise.all([
          apiService.getBackups(),
          apiService.getBackupSettings()
        ])

        // Traiter les jobs
        if (jobsResponse.success && jobsResponse.data) {
          const formattedJobs = jobsResponse.data.map((job: any) => ({
            id: job.id,
            name: job.name,
            description: job.description,
            type: job.type,
            status: job.status,
            progress: job.progress || 0,
            startTime: new Date(job.createdAt),
            endTime: job.completedAt ? new Date(job.completedAt) : undefined,
            size: job.size || 0,
            tenantId: job.tenantId,
            tenantName: job.tenant?.name || 'Système',
            error: job.error
          }))
          setBackupJobs(formattedJobs)
        }

        // Traiter les paramètres
        if (settingsResponse.success && settingsResponse.data) {
          setSettings(settingsResponse.data)
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
        setError('Impossible de charger les données de backup')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.tenantId, user?.role]) // Dépendances stables

  const createBackupJob = async (type: 'full' | 'incremental' | 'differential', tenantId?: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.createBackup(type, tenantId)
      
      if (response.success && response.data) {
        const newJob: BackupJob = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description,
          type,
          status: 'pending',
          progress: 0,
          startTime: new Date(response.data.createdAt),
          size: 0,
          tenantId: response.data.tenantId,
          tenantName: response.data.tenant?.name || 'Système'
        }

        setBackupJobs(prev => [newJob, ...prev])
        
        if (onBackupAction) {
          onBackupAction('create', newJob.id)
        }

        return newJob
      } else {
        throw new Error(response.error || 'Erreur lors de la création du backup')
      }
    } catch (err) {
      console.error('Erreur lors de la création du backup:', err)
      setError('Erreur lors de la création du backup')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const startBackup = async (jobId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.startBackup(jobId)
      
      if (response.success) {
        setBackupJobs(prev => 
          prev.map(job => 
            job.id === jobId 
              ? { ...job, status: 'running', startTime: new Date() }
              : job
          )
        )

        if (onBackupAction) {
          onBackupAction('start', jobId)
        }

        // Démarrer le polling pour suivre la progression
        pollBackupProgress(jobId)
      } else {
        throw new Error(response.error || 'Erreur lors du démarrage du backup')
      }
    } catch (err) {
      console.error('Erreur lors du démarrage du backup:', err)
      setError('Erreur lors du démarrage du backup')
    } finally {
      setLoading(false)
    }
  }

  const pollBackupProgress = async (jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await apiService.getBackupStatus(jobId)
        
        if (response.success && response.data) {
          const updatedJob = response.data
          
          setBackupJobs(prev => 
            prev.map(job => 
              job.id === jobId 
                ? { 
                    ...job, 
                    status: updatedJob.status,
                    progress: updatedJob.progress || 0,
                    endTime: updatedJob.completedAt ? new Date(updatedJob.completedAt) : undefined,
                    size: updatedJob.size || 0,
                    error: updatedJob.error
                  }
                : job
            )
          )

          // Arrêter le polling si le job est terminé
          if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
            clearInterval(pollInterval)
            
            if (onBackupAction) {
              onBackupAction('complete', jobId)
            }
          }
        }
      } catch (err) {
        console.error('Erreur lors du polling:', err)
        clearInterval(pollInterval)
      }
    }, 2000)

    // Arrêter le polling après 5 minutes maximum
    setTimeout(() => {
      clearInterval(pollInterval)
    }, 300000)
  }

  const deleteBackupJob = async (jobId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.deleteBackup(jobId)
      
      if (response.success) {
        setBackupJobs(prev => prev.filter(job => job.id !== jobId))
        
        if (onBackupAction) {
          onBackupAction('delete', jobId)
        }
      } else {
        throw new Error(response.error || 'Erreur lors de la suppression du backup')
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du backup:', err)
      setError('Erreur lors de la suppression du backup')
    } finally {
      setLoading(false)
    }
  }

  const updateBackupSettings = async (newSettings: Partial<BackupSettings>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.updateBackupSettings(newSettings)
      
      if (response.success) {
        setSettings(prev => ({ ...prev, ...newSettings }))
      } else {
        throw new Error(response.error || 'Erreur lors de la mise à jour des paramètres')
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour des paramètres:', err)
      setError('Erreur lors de la mise à jour des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const downloadBackup = async (jobId: string) => {
    try {
      const response = await apiService.downloadBackup(jobId)
      
      if (response.success && response.data?.downloadUrl) {
        // Créer un lien de téléchargement
        const link = document.createElement('a')
        link.href = response.data.downloadUrl
        link.download = `backup-${jobId}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        throw new Error(response.error || 'Erreur lors du téléchargement')
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err)
      setError('Erreur lors du téléchargement du backup')
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-400',
      running: 'text-blue-400',
      completed: 'text-green-400',
      failed: 'text-red-400'
    }
    return colors[status as keyof typeof colors] || 'text-gray-400'
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      running: <RefreshCw className="h-4 w-4 animate-spin" />,
      completed: <CheckCircle className="h-4 w-4" />,
      failed: <AlertTriangle className="h-4 w-4" />
    }
    return icons[status as keyof typeof icons] || <Database className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 MB'
    const mb = bytes / (1024 * 1024)
    if (mb < 1) return `${mb.toFixed(2)} MB`
    const gb = mb / 1024
    return `${gb.toFixed(2)} GB`
  }

  const formatDuration = (startTime: Date, endTime?: Date) => {
    if (!endTime) return 'En cours...'
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    return `${hours}h ${minutes}min`
  }

  return (
    <div className="space-y-6">
      {/* En-tête et actions */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-orange-500" />
            <div>
              <h3 className="text-xl font-bold text-white">Système de Sauvegarde</h3>
              <p className="text-sm text-gray-400">
                {backupJobs.length} sauvegarde{backupJobs.length > 1 ? 's' : ''} planifiée{backupJobs.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </button>
            
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Planifier</span>
            </button>
          </div>
        </div>

        {/* Liste des sauvegardes */}
        <div className="space-y-4">
          {backupJobs.map((job) => (
            <div key={job.id} className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                  </div>
                  <div className="flex-1">
                    <div>
                      <h4 className="text-lg font-semibold text-white">{job.name}</h4>
                      <p className="text-sm text-gray-400">{job.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      {job.tenantName && (
                        <>
                          <span>{job.tenantName}</span>
                          <span> • </span>
                        </>
                      )}
                      <span>{job.type}</span>
                      {job.size > 0 && (
                        <span> • {formatFileSize(job.size)}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm text-gray-400">
                    {job.startTime && (
                      <span>Début: {job.startTime.toLocaleDateString('fr-GA')} {job.startTime.toLocaleTimeString('fr-GA')}</span>
                    )}
                    {job.endTime && (
                      <span>Fin: {job.endTime.toLocaleDateString('fr-GA')} {job.endTime.toLocaleTimeString('fr-GA')}</span>
                    )}
                    {job.startTime && job.endTime && (
                      <span>Durée: {formatDuration(job.startTime, job.endTime)}</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {job.status === 'pending' && (
                      <button
                        onClick={() => startBackup(job.id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        <span>Démarrer</span>
                      </button>
                    )}
                    
                    {job.status === 'running' && (
                      <button
                        onClick={() => deleteBackupJob(job.id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Pause className="h-3 w-3" />
                        <span>Annuler</span>
                      </button>
                    )}
                    
                    {job.status === 'completed' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startBackup(job.id)}
                          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Relancer</span>
                        </button>
                        <button
                          onClick={() => deleteBackupJob(job.id)}
                          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span>Télécharger</span>
                        </button>
                      </div>
                    )}
                    
                    {job.status === 'failed' && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => startBackup(job.id)}
                          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Réessayer</span>
                        </button>
                        <button
                          onClick={() => deleteBackupJob(job.id)}
                          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de configuration */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Configuration des Sauvegardes</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Fréquence */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fréquence de sauvegarde</label>
                <select
                  value={settings.frequency}
                  onChange={(e) => setSettings({ ...settings, frequency: e.target.value as any })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuelle</option>
                </select>
              </div>

              {/* Heure */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Heure de sauvegarde</label>
                <input
                  type="time"
                  value={settings.time}
                  onChange={(e) => setSettings({ ...settings, time: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Rétention */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Période de rétention (jours)</label>
                <input
                  type="number"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({ ...settings, retentionDays: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="7"
                  max="365"
                />
              </div>

              {/* Options avancées */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Compression</span>
                  <input
                    type="checkbox"
                    checked={settings.compressionEnabled}
                    onChange={(e) => setSettings({ ...settings, compressionEnabled: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-white">Chiffrement</span>
                  <input
                    type="checkbox"
                    checked={settings.encryptionEnabled}
                    onChange={(e) => setSettings({ ...settings, encryptionEnabled: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Stockage */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Emplacement de stockage</label>
                  <select
                    value={settings.storageLocation}
                    onChange={(e) => setSettings({ ...settings, storageLocation: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="local">Local</option>
                    <option value="cloud">Cloud</option>
                    <option value="hybrid">Hybride</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fournisseur Cloud</label>
                  <select
                    value={settings.cloudProvider}
                    onChange={(e) => setSettings({ ...settings, cloudProvider: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="aws">Amazon S3</option>
                    <option value="google">Google Drive</option>
                    <option value="azure">Azure Blob Storage</option>
                    <option value="dropbox">Dropbox</option>
                  </select>
                </div>

                {/* Notifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Emails de notification</label>
                  <div className="space-y-2">
                    {settings.notificationEmails.map((email, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            const newEmails = [...settings.notificationEmails]
                            newEmails[index] = e.target.value
                            setSettings({ ...settings, notificationEmails: newEmails })
                          }}
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="admin@smartmanager.com"
                        />
                        <button
                          onClick={() => {
                            const newEmails = settings.notificationEmails.filter((_, i) => i !== index)
                            setSettings({ ...settings, notificationEmails: newEmails })
                          }}
                          className="p-2 rounded hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newEmails = [...settings.notificationEmails, '']
                        setSettings({ ...settings, notificationEmails: newEmails })
                      }}
                      className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors mt-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter un email</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    console.log('Configuration sauvegardée:', settings)
                    setShowSettings(false)
                  }}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Sauvegarder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
