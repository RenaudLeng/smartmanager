'use client'

import { useState } from 'react'
import { Search, Download, Upload, Database, Shield, Clock, AlertTriangle, CheckCircle, XCircle, Play, Pause, RotateCw, Trash2 } from 'lucide-react'

interface Backup {
  id: string
  name: string
  type: 'manual' | 'automatic'
  size: string
  createdAt: string
  status: 'in_progress' | 'completed' | 'failed'
  location: string
  description: string
  fileSize: number
  compressedSize: number
}

interface RestorePoint {
  id: string
  name: string
  date: string
  type: 'manual' | 'automatic'
  description: string
}

export default function SauvegardePage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [restorePoints, setRestorePoints] = useState<RestorePoint[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showBackupModal, setShowBackupModal] = useState(false)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackupRunning, setIsBackupRunning] = useState(false)

  // Mock data for demonstration
  useState(() => {
    setTimeout(() => {
      const mockBackups: Backup[] = [
        {
          id: '1',
          name: 'Sauvegarde automatique - 10 Mars 2024',
          type: 'automatic',
          size: '245.5 MB',
          createdAt: '2024-03-10T02:00:00Z',
          status: 'completed',
          location: 'cloud',
          description: 'Sauvegarde quotidienne automatique',
          fileSize: 245500000,
          compressedSize: 123000000
        },
        {
          id: '2',
          name: 'Sauvegarde manuelle - Avant mise à jour',
          type: 'manual',
          size: '189.2 MB',
          createdAt: '2024-03-15T14:30:00Z',
          status: 'completed',
          location: 'cloud',
          description: 'Sauvegarde avant mise à jour du système',
          fileSize: 189200000,
          compressedSize: 95000000
        },
        {
          id: '3',
          name: 'Sauvegarde hebdomadaire - 8 Mars 2024',
          type: 'automatic',
          size: '512.8 MB',
          createdAt: '2024-03-08T00:00:00Z',
          status: 'completed',
          location: 'cloud',
          description: 'Sauvegarde hebdomadaire complète',
          fileSize: 512800000,
          compressedSize: 256000000
        }
      ]

      const mockRestorePoints: RestorePoint[] = [
        {
          id: '1',
          name: 'Point de restauration - 5 Mars 2024',
          date: '2024-03-05T12:00:00Z',
          type: 'manual',
          description: 'Point de restauration avant mise à jour des produits'
        },
        {
          id: '2',
          name: 'Point de restauration - 1 Mars 2024',
          date: '2024-03-01T00:00:00Z',
          type: 'automatic',
          description: 'Point de restauration automatique quotidien'
        },
        {
          id: '3',
          name: 'Point de restauration - 15 Février 2024',
          date: '2024-02-15T00:00:00Z',
          type: 'manual',
          description: 'Point de restauration après migration des données'
        }
      ]

      setBackups(mockBackups)
      setRestorePoints(mockRestorePoints)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredBackups = backups.filter(backup =>
    backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    backup.type === searchTerm.toLowerCase()
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Complétée'
      case 'in_progress': return 'En cours'
      case 'failed': return 'Échouée'
      default: return status
    }
  }

  const handleBackup = () => {
    setIsBackupRunning(true)
    setBackupProgress(0)

    // Simulation de progression
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsBackupRunning(false)
          setShowBackupModal(false)
          // Ici vous ajouteriez la logique de sauvegarde
          console.log('Sauvegarde complétée')
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleRestore = (restorePoint: RestorePoint) => {
    console.log('Restauration depuis:', restorePoint.name)
    // Ici vous ajouteriez la logique de restauration
    setShowRestoreModal(false)
  }

  const handleDownload = (backup: Backup) => {
    console.log('Téléchargement de la sauvegarde:', backup.name)
    // Ici vous ajouteriez la logique de téléchargement
  }

  const handleDelete = (backupId: string) => {
    console.log('Suppression de la sauvegarde:', backupId)
    // Ici vous ajouteriez la logique de suppression
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const m = k * 1024
    const g = m * 1024
    if (bytes < k) return bytes + ' Bytes'
    if (bytes < m) return (bytes / k).toFixed(1) + ' KB'
    if (bytes < g) return (bytes / m).toFixed(1) + ' MB'
    return (bytes / g).toFixed(1) + ' GB'
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2 font-serif">Sauvegarde et Restauration</h1>
        <p className="text-gray-200 text-sm md:text-base">Protégez et gérez vos données commerciales</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setShowBackupModal(true)}
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200"
        >
          <Upload className="h-8 w-8 text-orange-400 mx-auto mb-2" />
          <p className="text-white font-medium">Sauvegarde manuelle</p>
          <p className="text-gray-400 text-sm">Créer une sauvegarde immédiate</p>
        </button>
        <button
          className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-green-500 hover:bg-white/10 transition-all duration-200"
        >
          <RotateCw className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-white font-medium">Restaurer</p>
          <p className="text-gray-400 text-sm">Restaurer depuis un point</p>
        </button>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Rechercher une sauvegarde..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-white/10">
        <button
          className="px-4 py-2 text-orange-400 border-b-2 border-orange-400 font-medium"
        >
          Sauvegardes
        </button>
        <button
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Points de restauration
        </button>
      </div>

      {/* Backups List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBackups.map((backup) => (
          <div key={backup.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 hover:border-orange-500 hover:bg-white/10 transition-all duration-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="font-medium text-white">{backup.name}</p>
                    <p className="text-sm text-gray-400">{backup.description}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                  {getStatusText(backup.status)}
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-400 space-y-1">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-orange-400" />
                <span>Type: {backup.type === 'automatic' ? 'Automatique' : 'Manuelle'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-400" />
                <span>{backup.createdAt}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Taille: {formatFileSize(backup.fileSize)}</span>
                <span className="text-green-400">({formatFileSize(backup.compressedSize)} compressé)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Localisation: {backup.location === 'cloud' ? 'Cloud' : 'Local'}</span>
              </div>
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => handleDownload(backup)}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(backup.id)}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Backup Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Sauvegarde des données</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nom de la sauvegarde</label>
                <input
                  type="text"
                  value={`Sauvegarde - ${new Date().toLocaleDateString('fr-GA')}`}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Type de sauvegarde</label>
                <select
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="complete">Sauvegarde complète</option>
                  <option value="partial">Sauvegarde partielle</option>
                  <option value="incremental">Sauvegarde incrémentale</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Options</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-white/20" />
                    <span className="text-gray-300 text-sm">Inclure les médias</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-white/20" />
                    <span className="text-gray-300 text-sm">Compresser les données</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowBackupModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleBackup}
                disabled={isBackupRunning}
                className="px-4 py-2 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-medium shadow-lg shadow-orange-500/25 flex items-center space-x-2"
              >
                {isBackupRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sauvegarde en cours...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    <span>Lancer la sauvegarde</span>
                  </>
                )}
              </button>
            </div>
            {backupProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-linear-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${backupProgress}%` }}
                  ></div>
                </div>
                <p className="text-center text-gray-300 text-sm mt-2">{backupProgress}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Restaurer les données</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Point de restauration</label>
                <select
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Sélectionner un point...</option>
                  {restorePoints.map(point => (
                    <option key={point.id} value={point.id} className="bg-black/40">{point.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Date de restauration</label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Attention</span>
                </div>
                <p className="text-yellow-400 text-sm mt-2">
                  La restauration remplacera toutes les données actuelles. Cette action est irréversible.
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const selectedPoint = restorePoints.find(p => p.id.toString() === document.querySelector('select')?.value)
                  if (selectedPoint) {
                    handleRestore(selectedPoint)
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
              >
                <RotateCw className="h-5 w-5" />
                Restaurer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
