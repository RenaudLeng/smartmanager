'use client'

import React from 'react'
import { X, Mail, Phone, MapPin, Building2, Users, Calendar, Shield, CreditCard } from 'lucide-react'

interface TenantModalProps {
  tenant: any
  isOpen: boolean
  onClose: () => void
  mode: 'view' | 'edit'
}

const businessTypeLabels = {
  retail: 'Vente de produits et services',
  restaurant: 'Restaurant',
  bar: 'Bar',
  pharmacy: 'Pharmacie',
  supermarket: 'Supermarché',
  hair_salon: 'Salon de coiffure',
  grocery: 'Épicerie',
  bar_restaurant: 'Bar/Restaurant'
}

const statusLabels = {
  active: 'Actif',
  inactive: 'Inactif',
  suspended: 'Suspendu'
}

const statusColors = {
  active: 'text-green-400 bg-green-500/20',
  inactive: 'text-yellow-400 bg-yellow-500/20',
  suspended: 'text-red-400 bg-red-500/20'
}

export function TenantModal({ tenant, isOpen, onClose, mode }: TenantModalProps) {
  if (!isOpen || !tenant) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {mode === 'view' ? 'Détails du Tenant' : 'Modifier le Tenant'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations principales */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-orange-400" />
              Informations générales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nom de l'entreprise
                </label>
                {mode === 'view' ? (
                  <p className="text-white">{tenant.name}</p>
                ) : (
                  <input
                    type="text"
                    defaultValue={tenant.name}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Email
                </label>
                {mode === 'view' ? (
                  <p className="text-white flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {tenant.email}
                  </p>
                ) : (
                  <input
                    type="email"
                    defaultValue={tenant.email}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Téléphone
                </label>
                {mode === 'view' ? (
                  <p className="text-white flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {tenant.phone || 'Non renseigné'}
                  </p>
                ) : (
                  <input
                    type="tel"
                    defaultValue={tenant.phone}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Adresse
                </label>
                {mode === 'view' ? (
                  <p className="text-white flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {tenant.address || 'Non renseignée'}
                  </p>
                ) : (
                  <input
                    type="text"
                    defaultValue={tenant.address}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Statut et type */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Shield className="w-5 h-5 mr-2 text-orange-400" />
              Statut et configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Type d'activité
                </label>
                {mode === 'view' ? (
                  <p className="text-white">{businessTypeLabels[tenant.businessType as keyof typeof businessTypeLabels]}</p>
                ) : (
                  <select
                    defaultValue={tenant.businessType}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {Object.entries(businessTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Statut
                </label>
                {mode === 'view' ? (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[tenant.status as keyof typeof statusColors]}`}>
                    {statusLabels[tenant.status as keyof typeof statusLabels]}
                  </span>
                ) : (
                  <select
                    defaultValue={tenant.status}
                    className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-orange-400" />
              Fonctionnalités activées
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {tenant.features?.allowsDebt && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400">
                  Dettes
                </span>
              )}
              {tenant.features?.allowsDelivery && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                  Livraison
                </span>
              )}
              {tenant.features?.allowsTableService && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                  Tables
                </span>
              )}
              {tenant.features?.requiresTableNumber && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                  N° Tables
                </span>
              )}
              {tenant.features?.allowsFlashCustomers && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                  Flash
                </span>
              )}
              {tenant.features?.allowsTicketPrinting && (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400">
                  Tickets
                </span>
              )}
            </div>
          </div>

          {/* Informations système */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-orange-400" />
              Informations système
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Nombre d'utilisateurs
                </label>
                <p className="text-white flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  {tenant.users}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Date de création
                </label>
                <p className="text-white flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(tenant.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            {mode === 'view' ? 'Fermer' : 'Annuler'}
          </button>
          {mode === 'edit' && (
            <button
              onClick={() => {
                // TODO: Implémenter la sauvegarde
                console.log('Sauvegarder les modifications')
                onClose()
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Sauvegarder
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
