'use client'

import { useState } from 'react'
import { Search, Users, Grid, List, Mail, Phone, ArrowLeft } from 'lucide-react'
import { useTenant } from '@/contexts/TenantContext'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  totalPurchases: number
  totalDebt: number
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastPurchaseDate?: string
}

export default function ClientsPage() {
  const { tenant } = useTenant()
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Client Test',
      email: 'test@example.com',
      phone: '+241 123 456 789',
      address: 'Libreville, Gabon',
      totalPurchases: 50000,
      totalDebt: 10000,
      status: 'active',
      createdAt: '2024-01-15',
      lastPurchaseDate: '2024-03-14'
    }
  ])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'suspended': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'inactive': return 'Inactif'
      case 'suspended': return 'Suspendu'
      default: return 'Inconnu'
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Clients</h1>
              <p className="text-gray-400">Gérez vos clients et leurs informations</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Customers Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-6 hover:border-orange-500 hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-orange-400" />
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(customer.status)}`}>
                    {getStatusText(customer.status)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{customer.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-400">
                    <Mail className="h-4 w-4 mr-2" />
                    {customer.email}
                  </div>
                  <div className="flex items-center text-gray-400">
                    <Phone className="h-4 w-4 mr-2" />
                    {customer.phone}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total achats:</span>
                    <span className="text-green-400 font-semibold">
                      {(customer.totalPurchases / 1000).toFixed(0)}k XAF
                    </span>
                  </div>
                  {customer.totalDebt > 0 && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-400">Dette:</span>
                      <span className="text-yellow-400 font-semibold">
                        {(customer.totalDebt / 1000).toFixed(0)}k XAF
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Statut</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Total achats</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Dette</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center mr-3">
                            <Users className="h-4 w-4 text-orange-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{customer.name}</p>
                            <p className="text-gray-400 text-sm">{customer.address}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-400 text-sm">
                            <Mail className="h-3 w-3 mr-2" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-gray-400 text-sm">
                            <Phone className="h-3 w-3 mr-2" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-sm rounded-full border ${getStatusColor(customer.status)}`}>
                          {getStatusText(customer.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-green-400 font-semibold">
                          {(customer.totalPurchases / 1000).toFixed(0)}k XAF
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${customer.totalDebt > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                          {customer.totalDebt > 0 ? `${(customer.totalDebt / 1000).toFixed(0)}k XAF` : '0 XAF'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
