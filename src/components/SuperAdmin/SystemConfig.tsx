'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Database, 
  Globe, 
  Save, 
  RefreshCw, 
  Download,
  Mail,
  Lock,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react'
import apiService from '@/services/api'

interface SystemConfigProps {
  onSave: (config: SystemSettings) => void
}

interface SystemSettings {
  platform: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
    maintenance: boolean
    maxTenants: number
    defaultLanguage: 'fr' | 'en'
    timezone: string
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  email: {
    smtpHost: string
    smtpPort: number
    smtpUser: string
    smtpPassword: string
    smtpSecure: boolean
    fromEmail: string
    fromName: string
  }
  backup: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    retention: number
    storageLocation: string
  }
  notifications: {
    emailAlerts: boolean
    smsAlerts: boolean
    pushNotifications: boolean
    lowStockAlert: boolean
    salesAlert: boolean
    maintenanceAlert: boolean
  }
}

export default function SystemConfig({ onSave }: SystemConfigProps) {
  const [config, setConfig] = useState<SystemSettings>({
    platform: {
      name: 'SmartManager',
      version: '1.0.0',
      environment: 'development',
      maintenance: false,
      maxTenants: 1000,
      defaultLanguage: 'fr',
      timezone: 'Africa/Libreville'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 24,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpSecure: true,
      fromEmail: 'noreply@smartmanager.com',
      fromName: 'SmartManager'
    },
    backup: {
      enabled: true,
      frequency: 'daily',
      retention: 30,
      storageLocation: 'local'
    },
    notifications: {
      emailAlerts: true,
      smsAlerts: false,
      pushNotifications: true,
      lowStockAlert: true,
      salesAlert: true,
      maintenanceAlert: true
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Charger la configuration actuelle
  useEffect(() => {
    // Désactiver le chargement automatique pour éviter les rechargements
    // La configuration est chargée manuellement quand nécessaire
    // La fonction loadConfig est conservée pour un usage manuel futur
  }, []) // Pas de chargement automatique

  // La fonction loadConfig est conservée pour un usage manuel futur
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadConfig = async () => {
    try {
      // Appel API pour charger la configuration
      const response = await apiService.getSystemConfig()
      if (response.success && response.data) {
        setConfig(response.data)
      }
    } catch (error) {
      console.error('Erreur chargement configuration:', error)
      setMessage('Erreur lors du chargement de la configuration')
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setMessage(null)
      
      // Appel API pour sauvegarder
      const response = await apiService.updateSystemConfig(config)
      if (response.success) {
        setMessage('Configuration sauvegardée avec succès')
        onSave(config)
      } else {
        setMessage(response.error || 'Erreur lors de la sauvegarde')
      }
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Erreur sauvegarde configuration:', error)
      setMessage('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    try {
      setLoading(true)
      setMessage(null)
      
      // Appel API pour tester l'envoi d'email
      console.log('Test email configuration:', config.email)
      setMessage('Email de test envoyé (simulation)')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Erreur test email:', error)
      setMessage('Erreur lors du test d&apos;email')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      setLoading(true)
      // Appel API pour créer une sauvegarde
      const response = await apiService.createBackup('full')
      if (response.success) {
        setMessage('Sauvegarde créée avec succès')
      } else {
        setMessage(response.error || 'Erreur lors de la création de la sauvegarde')
      }
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Erreur création sauvegarde:', error)
      setMessage('Erreur lors de la création de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = (section: keyof SystemSettings, field: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Message de feedback */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.includes('succès') ? 'bg-green-900/50 text-green-400 border border-green-500/30' : 
          'bg-red-900/50 text-red-400 border border-red-500/30'
        }`}>
          {message.includes('succès') ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <span>{message}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto p-1 hover:bg-white/10 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Configuration Platform */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Globe className="h-5 w-5 text-blue-400" />
          <span>Configuration Plateforme</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom de la plateforme</label>
            <input
              type="text"
              value={config.platform.name}
              onChange={(e) => updateConfig('platform', 'name', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
            <input
              type="text"
              value={config.platform.version}
              disabled
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Environnement</label>
            <select
              value={config.platform.environment}
              onChange={(e) => updateConfig('platform', 'environment', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="development">Développement</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fuseau horaire</label>
            <select
              value={config.platform.timezone}
              onChange={(e) => updateConfig('platform', 'timezone', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="Africa/Libreville">Africa/Libreville</option>
              <option value="Africa/Paris">Africa/Paris</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Configuration Sécurité */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-400" />
          <span>Sécurité</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
              <Lock className="h-4 w-4" />
              <span>Authentification à deux facteurs</span>
            </label>
            <button
              onClick={() => updateConfig('security', 'twoFactorAuth', !config.security.twoFactorAuth)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.security.twoFactorAuth ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                config.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Délai d&apos;expiration de session (heures)
            </label>
            <input
              type="number"
              value={config.security.sessionTimeout}
              onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Configuration Email */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Mail className="h-5 w-5 text-purple-400" />
          <span>Configuration Email</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Serveur SMTP</label>
            <input
              type="text"
              value={config.email.smtpHost}
              onChange={(e) => updateConfig('email', 'smtpHost', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Port SMTP</label>
            <input
              type="number"
              value={config.email.smtpPort}
              onChange={(e) => updateConfig('email', 'smtpPort', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email d&apos;envoi</label>
            <input
              type="email"
              value={config.email.fromEmail}
              onChange={(e) => updateConfig('email', 'fromEmail', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom d&apos;envoi</label>
            <input
              type="text"
              value={config.email.fromName}
              onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex justify-end mt-6">
          <button
            onClick={handleTestEmail}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <Mail className="h-4 w-4" />
            <span>{loading ? 'Envoi en cours...' : 'Envoyer email de test'}</span>
          </button>
        </div>
      </div>

      {/* Configuration Sauvegarde */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
          <Database className="h-5 w-5 text-orange-400" />
          <span>Sauvegarde Automatique</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
              <RefreshCw className="h-4 w-4" />
              <span>Sauvegarde automatique</span>
            </label>
            <button
              onClick={() => updateConfig('backup', 'enabled', !config.backup.enabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.backup.enabled ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                config.backup.enabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fréquence</label>
            <select
              value={config.backup.frequency}
              onChange={(e) => updateConfig('backup', 'frequency', e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuelle</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rétention (jours)</label>
            <input
              type="number"
              value={config.backup.retention}
              onChange={(e) => updateConfig('backup', 'retention', parseInt(e.target.value))}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleCreateBackup}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{loading ? 'Création...' : 'Créer sauvegarde complète'}</span>
          </button>
        </div>
      </div>

      {/* Actions globales */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 border border-white/20 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Sauvegarde...' : 'Sauvegarder la configuration'}</span>
        </button>
      </div>
    </div>
  )
}
