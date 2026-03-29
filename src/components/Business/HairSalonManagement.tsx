'use client'

import { useState, useEffect } from 'react'
import { Scissors, Calendar, Clock, Users, TrendingUp, AlertTriangle, Star, Phone, CheckCircle, XCircle } from 'lucide-react'
import { HairSalonService, HairSalonAppointment } from '@/types/business'

interface HairSalonManagementProps {
  tenantId: string
}

export default function HairSalonManagement({ tenantId }: HairSalonManagementProps) {
  const [services, setServices] = useState<HairSalonService[]>([])
  const [appointments, setAppointments] = useState<HairSalonAppointment[]>([])
  const [activeTab, setActiveTab] = useState<'rendezvous' | 'services' | 'planning' | 'clients'>('rendezvous')
  const [newAppointment, setNewAppointment] = useState<Partial<HairSalonAppointment>>({
    status: 'scheduled',
    reminderSent: false
  })

  // Données de démonstration pour un salon de coiffure
  const servicesData: HairSalonService[] = [
    {
      id: '1',
      name: 'Coupe homme classique',
      category: 'coiffure',
      duration: 30,
      price: 2000,
      description: 'Coupe et coiffage pour hommes',
      requiresAppointment: true,
      productsNeeded: ['Shampoing', 'Gel coiffant']
    },
    {
      id: '2',
      name: 'Tissage africain',
      category: 'extension',
      duration: 180,
      price: 8000,
      description: 'Tissage complet avec extensions naturelles',
      requiresAppointment: true,
      productsNeeded: ['Extensions', 'Mèche', 'Produits coiffants']
    },
    {
      id: '3',
      name: 'Brushing et lissage',
      category: 'coiffure',
      duration: 60,
      price: 3500,
      description: 'Brushing professionnel avec lissage',
      requiresAppointment: true,
      productsNeeded: ['Shampoing', 'Sérum', 'Protecteur thermique']
    },
    {
      id: '4',
      name: 'Couleur et mèches',
      category: 'coloration',
      duration: 120,
      price: 6000,
      description: 'Coloration complète avec mèches',
      requiresAppointment: true,
      productsNeeded: ['Colorant', 'Décolorant', 'Produits de soin']
    },
    {
      id: '5',
      name: 'Soin barbe complet',
      category: 'barbe',
      duration: 45,
      price: 2500,
      description: 'Taille et soin de la barbe',
      requiresAppointment: true,
      productsNeeded: ['Huile à barbe', 'Cire', 'Baume']
    },
    {
      id: '6',
      name: 'Masque cheveux profonds',
      category: 'soin',
      duration: 40,
      price: 1500,
      description: 'Soin hydratant profond',
      requiresAppointment: true,
      productsNeeded: ['Masque', 'Huiles essentielles']
    }
  ]

  const appointmentsData: HairSalonAppointment[] = [
    {
      id: '1',
      customerName: 'Marie Nze',
      customerPhone: '+241 77 00 00 00',
      serviceId: '2',
      serviceName: 'Tissage africain',
      appointmentDate: new Date('2024-03-24T10:00:00'),
      duration: 180,
      price: 8000,
      status: 'scheduled',
      staffName: 'Sophie',
      notes: 'Client fidèle, préfère les couleurs naturelles',
      reminderSent: true
    },
    {
      id: '2',
      customerName: 'Jean Mba',
      customerPhone: '+241 66 00 00 00',
      serviceId: '1',
      serviceName: 'Coupe homme classique',
      appointmentDate: new Date('2024-03-24T14:30:00'),
      duration: 30,
      price: 2000,
      status: 'in_progress',
      staffName: 'Paul',
      notes: 'Veut une coupe courte',
      reminderSent: true
    },
    {
      id: '3',
      customerName: 'Amandine Ondo',
      customerPhone: '+241 55 00 00 00',
      serviceId: '3',
      serviceName: 'Brushing et lissage',
      appointmentDate: new Date('2024-03-24T16:00:00'),
      duration: 60,
      price: 3500,
      status: 'completed',
      staffName: 'Sophie',
      notes: 'Cheveux longs, attention à la chaleur',
      reminderSent: true
    }
  ]

  useEffect(() => {
    setServices(servicesData)
    setAppointments(appointmentsData)
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'coiffure': return <Scissors className="w-4 h-4" />
      case 'extension': return <Star className="w-4 h-4" />
      case 'coloration': return <TrendingUp className="w-4 h-4" />
      case 'barbe': return <Users className="w-4 h-4" />
      case 'soin': return <AlertTriangle className="w-4 h-4" />
      default: return <Scissors className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'in_progress': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-GA', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-GA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const addToAppointment = (service: HairSalonService) => {
    setNewAppointment(prev => ({
      ...prev,
      serviceId: service.id,
      serviceName: service.name,
      duration: service.duration,
      price: service.price
    }))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Scissors className="w-8 h-8 text-pink-500" />
            Gestion du Salon de Coiffure
          </h1>
          <p className="text-gray-400">
            Gestion des rendez-vous, services et planning des coiffeurs
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rendez-vous aujourd&apos;hui</p>
                <p className="text-2xl font-bold text-blue-400">12</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">En cours</p>
                <p className="text-2xl font-bold text-orange-400">2</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Chiffre d&apos;affaires</p>
                <p className="text-2xl font-bold text-green-400">85 000 XAF</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Clients fidèles</p>
                <p className="text-2xl font-bold text-purple-400">45</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-700">
          {['rendezvous', 'services', 'planning', 'clients'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'rendezvous' | 'services' | 'planning' | 'clients')}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-pink-500 border-b-2 border-pink-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'rendezvous' ? 'Rendez-vous' : 
               tab === 'services' ? 'Services' : 
               tab === 'planning' ? 'Planning' : 'Clients'}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'rendezvous' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Services */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Services disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(service.category)}
                        <h3 className="font-semibold">{service.name}</h3>
                      </div>
                      <span className="text-lg font-bold text-pink-400">
                        {service.price.toLocaleString('fr-GA')} XAF
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{service.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Scissors className="w-3 h-3" />
                        {service.category}
                      </span>
                    </div>
                    {service.productsNeeded && service.productsNeeded.length > 0 && (
                      <div className="text-xs text-gray-500 mb-3">
                        Produits: {service.productsNeeded.join(', ')}
                      </div>
                    )}
                    <button
                      onClick={() => addToAppointment(service)}
                      className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded transition-colors"
                    >
                      Prendre rendez-vous
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Rendez-vous du jour */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Rendez-vous du jour</h2>
              <div className="space-y-3">
                {appointments
                  .filter(apt => apt.appointmentDate.toDateString() === new Date().toDateString())
                  .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime())
                  .map((appointment) => (
                    <div key={appointment.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(appointment.status)}
                          <span className="font-medium">{appointment.customerName}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(appointment.status)}`}>
                          {appointment.status === 'scheduled' ? 'Programmé' :
                           appointment.status === 'in_progress' ? 'En cours' :
                           appointment.status === 'completed' ? 'Terminé' : 'Annulé'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>{appointment.serviceName}</span>
                          <span className="text-pink-400">
                            {appointment.price.toLocaleString('fr-GA')} XAF
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          <span>{appointment.staffName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <span>{appointment.customerPhone}</span>
                        </div>
                        {appointment.notes && (
                          <div className="text-xs text-gray-500 mt-2">
                            Notes: {appointment.notes}
                          </div>
                        )}
                      </div>
                      {appointment.status === 'scheduled' && (
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm transition-colors">
                            Commencer
                          </button>
                          <button className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors">
                            Annuler
                          </button>
                        </div>
                      )}
                      {appointment.status === 'in_progress' && (
                        <button className="w-full py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors mt-3">
                          Terminer
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Catalogue des services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon(service.category)}
                    <h3 className="font-semibold">{service.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{service.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Durée:</span>
                      <span>{service.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prix:</span>
                      <span className="text-pink-400 font-medium">
                        {service.price.toLocaleString('fr-GA')} XAF
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Catégorie:</span>
                      <span>{service.category}</span>
                    </div>
                  </div>
                  {service.productsNeeded && service.productsNeeded.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Produits nécessaires:</p>
                      <div className="flex flex-wrap gap-1">
                        {service.productsNeeded.map((product, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 rounded text-xs">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'planning' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Planning de la semaine</h2>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="grid grid-cols-7 gap-2 text-center">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="font-medium text-gray-400 pb-2">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() - date.getDay() + i + 1)
                  const hasAppointments = appointments.some(apt => 
                    apt.appointmentDate.toDateString() === date.toDateString()
                  )
                  const isToday = date.toDateString() === new Date().toDateString()
                  
                  return (
                    <div
                      key={i}
                      className={`p-2 rounded border ${
                        isToday 
                          ? 'bg-pink-500/20 border-pink-500' 
                          : hasAppointments 
                          ? 'bg-blue-500/20 border-blue-500/50' 
                          : 'bg-gray-700 border-gray-600'
                      }`}
                    >
                      <div className="text-sm">
                        {date.getDate()}
                      </div>
                      {hasAppointments && (
                        <div className="text-xs text-blue-400 mt-1">
                          {appointments.filter(apt => 
                            apt.appointmentDate.toDateString() === date.toDateString()
                          ).length} RDV
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clients' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestion des clients</h2>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left">Client</th>
                    <th className="px-4 py-3 text-left">Téléphone</th>
                    <th className="px-4 py-3 text-left">Dernier RDV</th>
                    <th className="px-4 py-3 text-left">Services</th>
                    <th className="px-4 py-3 text-left">Total dépensé</th>
                    <th className="px-4 py-3 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="border-t border-gray-700">
                      <td className="px-4 py-3 font-medium">{appointment.customerName}</td>
                      <td className="px-4 py-3">{appointment.customerPhone}</td>
                      <td className="px-4 py-3">{formatDate(appointment.appointmentDate)}</td>
                      <td className="px-4 py-3">{appointment.serviceName}</td>
                      <td className="px-4 py-3 text-pink-400">
                        {appointment.price.toLocaleString('fr-GA')} XAF
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          Fidèle
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
