'use client'

import { useState } from 'react'
import { 
  Settings, 
  Shield, 
  Database, 
  Globe, 
  Bell, 
  Save, 
  RefreshCw, 
  Server,
  X,
  Plus
} from 'lucide-react'

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
    apiRateLimit: number
    allowedOrigins: string[]
  }
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    smsNotifications: boolean
    inAppNotifications: boolean
    backupReminder: boolean
    lowStockAlerts: boolean
    paymentReminders: boolean
  }
  integrations: {
    paymentGateways: {
      orange: boolean
      mtn: boolean
      wave: boolean
      paypal: boolean
      stripe: boolean
    }
    emailProviders: {
      sendgrid: boolean
      ses: boolean
      mailgun: boolean
    }
  }
  storage: {
    maxStoragePerTenant: number
    backupFrequency: 'daily' | 'weekly' | 'monthly'
    retentionPeriod: number
  }
  features: {
    advancedReports: boolean
    multiStore: boolean
    apiAccess: boolean
    whiteLabeling: boolean
    customBranding: boolean
    bulkOperations: boolean
  }
}

export default function SystemConfig({ onSave }: SystemConfigProps) {
  const [activeTab, setActiveTab] = useState<'platform' | 'security' | 'notifications' | 'integrations' | 'storage' | 'features'>('platform')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Configuration par défaut
  const [settings, setSettings] = useState<SystemSettings>({
    platform: {
      name: 'SmartManager Platform',
      version: '2.0.0',
      environment: 'development',
      maintenance: false,
      maxTenants: 1000,
      defaultLanguage: 'fr',
      timezone: 'Africa/Libreville'
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 480,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      apiRateLimit: 1000,
      allowedOrigins: ['http://localhost:3000', 'https://*.smartmanager.com']
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      backupReminder: true,
      lowStockAlerts: true,
      paymentReminders: true
    },
    integrations: {
      paymentGateways: {
        orange: true,
        mtn: true,
        wave: false,
        paypal: false,
        stripe: false
      },
      emailProviders: {
        sendgrid: false,
        ses: true,
        mailgun: false
      }
    },
    storage: {
      maxStoragePerTenant: 10000,
      backupFrequency: 'daily',
      retentionPeriod: 90
    },
    features: {
      advancedReports: true,
      multiStore: true,
      apiAccess: true,
      whiteLabeling: false,
      customBranding: false,
      bulkOperations: true
    }
  })

  const handleSave = () => {
    setHasUnsavedChanges(false)
    onSave(settings)
    console.log('Configuration sauvegardée:', settings)
  }

  const handleReset = () => {
    setSettings({
      platform: {
        name: 'SmartManager Platform',
        version: '2.0.0',
        environment: 'development',
        maintenance: false,
        maxTenants: 1000,
        defaultLanguage: 'fr',
        timezone: 'Africa/Libreville'
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 480,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        apiRateLimit: 1000,
        allowedOrigins: ['http://localhost:3000', 'https://*.smartmanager.com']
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        inAppNotifications: true,
        backupReminder: true,
        lowStockAlerts: true,
        paymentReminders: true
      },
      integrations: {
        paymentGateways: {
          orange: true,
          mtn: true,
          wave: false,
          paypal: false,
          stripe: false
        },
        emailProviders: {
          sendgrid: false,
          ses: true,
          mailgun: false
        }
      },
      storage: {
        maxStoragePerTenant: 10000,
        backupFrequency: 'daily',
        retentionPeriod: 90
      },
      features: {
        advancedReports: true,
        multiStore: true,
        apiAccess: true,
        whiteLabeling: false,
        customBranding: false,
        bulkOperations: true
      }
    })
    setHasUnsavedChanges(false)
  }

  const tabs = [
    { id: 'platform', label: 'Plateforme', icon: Globe },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Intégrations', icon: Database },
    { id: 'storage', label: 'Stockage', icon: Server },
    { id: 'features', label: 'Fonctionnalités', icon: Settings }
  ]

  const getTabContent = () => {
    switch (activeTab) {
      case 'platform':
        return (
          <div className="space-y-6">
            {/* Informations plateforme */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Informations de la plateforme</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom de la plateforme</label>
                  <input
                    type="text"
                    value={settings.platform.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, name: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                  <input
                    type="text"
                    value={settings.platform.version}
                    onChange={(e) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, version: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Environnement</label>
                  <select
                    value={settings.platform.environment}
                    onChange={(e) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, environment: e.target.value as 'development' | 'staging' | 'production' }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="development">Développement</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mode maintenance</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.platform.maintenance}
                      onChange={(e) => setSettings({
                        ...settings,
                        platform: { ...settings.platform, maintenance: e.target.checked }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-white">Activer le mode maintenance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paramètres avancés */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Paramètres avancés</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre maximum de boutiques</label>
                  <input
                    type="number"
                    value={settings.platform.maxTenants}
                    onChange={(e) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, maxTenants: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fuseau horaire</label>
                  <select
                    value={settings.platform.timezone}
                    onChange={(e) => setSettings({
                      ...settings,
                      platform: { ...settings.platform, timezone: e.target.value }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="Africa/Libreville">Africa/Libreville</option>
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Asia/Dubai">Asia/Dubai</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            {/* Sécurité */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Sécurité</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Authentification à deux facteurs</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, twoFactorAuth: e.target.checked }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-white">Activer 2FA</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Durée de session (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Limite API par minute</label>
                  <input
                    type="number"
                    value={settings.security.apiRateLimit}
                    onChange={(e) => setSettings({
                      ...settings,
                      security: { ...settings.security, apiRateLimit: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Politique de mots de passe */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h5 className="text-md font-semibold text-white mb-3">Politique de mots de passe</h5>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.security.passwordPolicy.minLength === 8}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: { ...settings.security.passwordPolicy, minLength: e.target.checked ? 8 : 6 }
                        }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-white">Minimum 8 caractères</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.security.passwordPolicy.requireUppercase}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: { ...settings.security.passwordPolicy, requireUppercase: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-white">Require majuscule</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.security.passwordPolicy.requireNumbers}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: { ...settings.security.passwordPolicy, requireNumbers: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-white">Require chiffres</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={settings.security.passwordPolicy.requireSpecialChars}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: {
                          ...settings.security,
                          passwordPolicy: { ...settings.security.passwordPolicy, requireSpecialChars: e.target.checked }
                        }
                      })}
                      className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-white">Require caractères spéciaux</span>
                  </div>
                </div>
              </div>

              {/* Origines autorisées */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
                <h5 className="text-md font-semibold text-white mb-3">Origines autorisées</h5>
                <div className="space-y-2">
                  {settings.security.allowedOrigins.map((origin, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => {
                          const newOrigins = [...settings.security.allowedOrigins]
                          newOrigins[index] = e.target.value
                          setSettings({
                            ...settings,
                            security: { ...settings.security, allowedOrigins: newOrigins }
                          })
                        }}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          const newOrigins = settings.security.allowedOrigins.filter((_, i) => i !== index)
                          setSettings({
                            ...settings,
                            security: { ...settings.security, allowedOrigins: newOrigins }
                          })
                        }}
                        className="p-2 rounded hover:bg-white/10 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        const newOrigins = [...settings.security.allowedOrigins, 'https://*.smartmanager.com']
                        setSettings({
                          ...settings,
                          security: { ...settings.security, allowedOrigins: newOrigins }
                        })
                      }}
                      className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter une origine</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Notifications par email</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, emailNotifications: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Notifications push</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, pushNotifications: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Notifications SMS</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, smsNotifications: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Notifications in-app</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.inAppNotifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, inAppNotifications: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Rappels de sauvegarde</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.backupReminder}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, backupReminder: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Alertes stock faible</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.lowStockAlerts}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, lowStockAlerts: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Rappels de paiement</span>
                  <input
                    type="checkbox"
                    checked={settings.notifications.paymentReminders}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifications: { ...settings.notifications, paymentReminders: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-6">
            {/* Passerelles */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Passerelles de paiement</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.integrations.paymentGateways.orange}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, paymentGateways: { ...settings.integrations.paymentGateways, orange: e.target.checked } }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-white">Orange Money</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.integrations.paymentGateways.mtn}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, paymentGateways: { ...settings.integrations.paymentGateways, mtn: e.target.checked } }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-white">MTN Mobile Money</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.integrations.paymentGateways.wave}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, paymentGateways: { ...settings.integrations.paymentGateways, wave: e.target.checked } }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-white">Wave</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.integrations.paymentGateways.paypal}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, paymentGateways: { ...settings.integrations.paymentGateways, paypal: e.target.checked } }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-white">PayPal</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.integrations.paymentGateways.stripe}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, paymentGateways: { ...settings.integrations.paymentGateways, stripe: e.target.checked } }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-white">Stripe</span>
                </div>
              </div>
            </div>

            {/* Fournisseurs email */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Fournisseurs email</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.integrations.emailProviders.sendgrid}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, emailProviders: { ...settings.integrations.emailProviders, sendgrid: e.target.checked } }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-white">SendGrid</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.integrations.emailProviders.ses}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, emailProviders: { ...settings.integrations.emailProviders, ses: e.target.checked } }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-white">Amazon SES</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.integrations.emailProviders.mailgun}
                    onChange={(e) => setSettings({
                      ...settings,
                      integrations: { ...settings.integrations, emailProviders: { ...settings.integrations.emailProviders, mailgun: e.target.checked } }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-white">Mailgun</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'storage':
        return (
          <div className="space-y-6">
            {/* Stockage */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Stockage</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Espace de stockage par boutique (MB)</label>
                  <input
                    type="number"
                    value={settings.storage.maxStoragePerTenant}
                    onChange={(e) => setSettings({
                      ...settings,
                      storage: { ...settings.storage, maxStoragePerTenant: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fréquence de sauvegarde</label>
                  <select
                    value={settings.storage.backupFrequency}
                    onChange={(e) => setSettings({
                      ...settings,
                      storage: { ...settings.storage, backupFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Période de rétention (jours)</label>
                  <input
                    type="number"
                    value={settings.storage.retentionPeriod}
                    onChange={(e) => setSettings({
                      ...settings,
                      storage: { ...settings.storage, retentionPeriod: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="space-y-6">
            {/* Fonctionnalités */}
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Fonctionnalités avancées</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Rapports avancés</span>
                  <input
                    type="checkbox"
                    checked={settings.features.advancedReports}
                    onChange={(e) => setSettings({
                      ...settings,
                      features: { ...settings.features, advancedReports: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Multi-boutiques</span>
                  <input
                    type="checkbox"
                    checked={settings.features.multiStore}
                    onChange={(e) => setSettings({
                      ...settings,
                      features: { ...settings.features, multiStore: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Accès API</span>
                  <input
                    type="checkbox"
                    checked={settings.features.apiAccess}
                    onChange={(e) => setSettings({
                      ...settings,
                      features: { ...settings.features, apiAccess: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Marque blanche</span>
                  <input
                    type="checkbox"
                    checked={settings.features.whiteLabeling}
                    onChange={(e) => setSettings({
                      ...settings,
                      features: { ...settings.features, whiteLabeling: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Branding personnalisé</span>
                  <input
                    type="checkbox"
                    checked={settings.features.customBranding}
                    onChange={(e) => setSettings({
                      ...settings,
                      features: { ...settings.features, customBranding: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white">Opérations en masse</span>
                  <input
                    type="checkbox"
                    checked={settings.features.bulkOperations}
                    onChange={(e) => setSettings({
                      ...settings,
                      features: { ...settings.features, bulkOperations: e.target.checked }
                    })}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Configuration Système</h3>
            <p className="text-gray-400">Sélectionnez une section pour configurer les paramètres</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Navigation par onglets */}
      <div className="flex space-x-1 mb-6 bg-black/40 backdrop-blur-sm rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'platform' | 'security' | 'notifications' | 'integrations' | 'storage' | 'features')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Contenu principal */}
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
        {getTabContent()}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 mt-6">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Rétablir par défaut</span>
        </button>
        
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={`flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors ${
            hasUnsavedChanges ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Save className="h-4 w-4" />
          <span>Sauvegarder</span>
        </button>
      </div>
    </div>
  )
}
