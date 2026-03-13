'use client'

import { useState } from 'react'
import { 
  Bell, 
  Settings, 
  Clock, 
  Volume2, 
  Monitor, 
  Mail,
  X
} from 'lucide-react'
import { NotificationPreferences, SmartAlertConfig } from '@/types/notifications'

interface NotificationSettingsProps {
  preferences: NotificationPreferences
  config: SmartAlertConfig
  onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void
  onUpdateConfig: (config: Partial<SmartAlertConfig>) => void
  onClose: () => void
}

export function NotificationSettings({
  preferences,
  config,
  onUpdatePreferences,
  onUpdateConfig,
  onClose
}: NotificationSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'alerts' | 'rules'>('general')

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Paramètres de notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-white/10 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeTab === 'general' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Bell className="h-4 w-4" />
                <span>Général</span>
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeTab === 'alerts' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Alertes intelligentes</span>
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                  activeTab === 'rules' 
                    ? 'bg-orange-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>Règles</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <GeneralSettings
                preferences={preferences}
                onUpdatePreferences={onUpdatePreferences}
              />
            )}
            {activeTab === 'alerts' && (
              <AlertSettings
                config={config}
                onUpdateConfig={onUpdateConfig}
              />
            )}
            {activeTab === 'rules' && (
              <RulesSettings
                preferences={preferences}
                onUpdatePreferences={onUpdatePreferences}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function GeneralSettings({ 
  preferences, 
  onUpdatePreferences 
}: { 
  preferences: NotificationPreferences
  onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void 
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Paramètres généraux</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-white font-medium">Activer les notifications</p>
              <p className="text-gray-400 text-sm">Recevoir des alertes et notifications</p>
            </div>
          </div>
          <button
            onClick={() => onUpdatePreferences({ enabled: !preferences.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.enabled ? 'bg-orange-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-white font-medium">Son des notifications</p>
              <p className="text-gray-400 text-sm">Jouer un son pour les alertes</p>
            </div>
          </div>
          <button
            onClick={() => onUpdatePreferences({ soundEnabled: !preferences.soundEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.soundEnabled ? 'bg-orange-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.soundEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Monitor className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-white font-medium">Notifications bureau</p>
              <p className="text-gray-400 text-sm">Afficher les notifications sur le bureau</p>
            </div>
          </div>
          <button
            onClick={() => onUpdatePreferences({ desktopNotifications: !preferences.desktopNotifications })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.desktopNotifications ? 'bg-orange-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.desktopNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-white font-medium">Notifications email</p>
              <p className="text-gray-400 text-sm">Recevoir les alertes par email</p>
            </div>
          </div>
          <button
            onClick={() => onUpdatePreferences({ emailNotifications: !preferences.emailNotifications })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.emailNotifications ? 'bg-orange-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 pt-6">
        <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
          <Clock className="h-4 w-4 text-orange-400" />
          Heures silencieuses
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Activer les heures silencieuses</p>
              <p className="text-gray-400 text-sm">Ne pas déranger pendant certaines heures</p>
            </div>
            <button
              onClick={() => onUpdatePreferences({ 
                quietHours: { 
                  ...preferences.quietHours, 
                  enabled: !preferences.quietHours.enabled 
                } 
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.quietHours.enabled ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Début</label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => onUpdatePreferences({ 
                    quietHours: { 
                      ...preferences.quietHours, 
                      start: e.target.value 
                    } 
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fin</label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => onUpdatePreferences({ 
                    quietHours: { 
                      ...preferences.quietHours, 
                      end: e.target.value 
                    } 
                  })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AlertSettings({ 
  config, 
  onUpdateConfig 
}: { 
  config: SmartAlertConfig
  onUpdateConfig: (config: Partial<SmartAlertConfig>) => void 
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Seuils d'alertes</h3>
      
      <div className="space-y-6">
        <div className="border border-white/10 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Stock</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock faible (%)</label>
              <input
                type="number"
                value={config.stockThresholds.low}
                onChange={(e) => onUpdateConfig({ 
                  stockThresholds: { 
                    ...config.stockThresholds, 
                    low: Number(e.target.value) 
                  } 
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stock critique (%)</label>
              <input
                type="number"
                value={config.stockThresholds.critical}
                onChange={(e) => onUpdateConfig({ 
                  stockThresholds: { 
                    ...config.stockThresholds, 
                    critical: Number(e.target.value) 
                  } 
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="border border-white/10 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Objectifs de ventes (XAF)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quotidien</label>
              <input
                type="number"
                value={config.salesTargets.daily}
                onChange={(e) => onUpdateConfig({ 
                  salesTargets: { 
                    ...config.salesTargets, 
                    daily: Number(e.target.value) 
                  } 
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hebdomadaire</label>
              <input
                type="number"
                value={config.salesTargets.weekly}
                onChange={(e) => onUpdateConfig({ 
                  salesTargets: { 
                    ...config.salesTargets, 
                    weekly: Number(e.target.value) 
                  } 
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mensuel</label>
              <input
                type="number"
                value={config.salesTargets.monthly}
                onChange={(e) => onUpdateConfig({ 
                  salesTargets: { 
                    ...config.salesTargets, 
                    monthly: Number(e.target.value) 
                  } 
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="border border-white/10 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Limites de dépenses (XAF)</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Quotidien</label>
              <input
                type="number"
                value={config.expenseLimits.daily}
                onChange={(e) => onUpdateConfig({ 
                  expenseLimits: { 
                    ...config.expenseLimits, 
                    daily: Number(e.target.value) 
                  } 
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hebdomadaire</label>
              <input
                type="number"
                value={config.expenseLimits.weekly}
                onChange={(e) => onUpdateConfig({ 
                  expenseLimits: { 
                    ...config.expenseLimits, 
                    weekly: Number(e.target.value) 
                  } 
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mensuel</label>
              <input
                type="number"
                value={config.expenseLimits.monthly}
                onChange={(e) => onUpdateConfig({ 
                  expenseLimits: { 
                    ...config.expenseLimits, 
                    monthly: Number(e.target.value) 
                  } 
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className="border border-white/10 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Marges bénéficiaires</h4>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Marge minimale (%)</label>
            <input
              type="number"
              value={config.profitMargins.minimum}
              onChange={(e) => onUpdateConfig({ 
                profitMargins: { 
                  ...config.profitMargins, 
                  minimum: Number(e.target.value) 
                } 
              })}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              min="0"
              max="100"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function RulesSettings({ 
  preferences, 
  onUpdatePreferences 
}: { 
  preferences: NotificationPreferences
  onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void 
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Règles de notification</h3>
      
      <div className="text-gray-400 text-center py-8">
        <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Les règles personnalisées seront bientôt disponibles</p>
        <p className="text-sm mt-2">Vous pourrez configurer des alertes spécifiques selon vos besoins</p>
      </div>
    </div>
  )
}
