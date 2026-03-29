'use client'

import { useState, useEffect, useCallback } from 'react'

interface Plan {
  id: string
  name: string
  price: number
  duration: 'monthly' | 'yearly'
  isActive: boolean
  features: string[]
  createdAt: string
  updatedAt: string
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPlans(data.data || [])
      } else {
        setError('Erreur lors du chargement des plans')
      }
    } catch (error) {
      console.error('Erreur fetchPlans:', error)
      setError('Erreur lors du chargement des plans')
    } finally {
      setLoading(false)
    }
  }, [])

  const createPlan = useCallback(async (planData: Partial<Plan>) => {
    try {
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      })

      if (response.ok) {
        const result = await response.json()
        setPlans(prev => [...prev, result.data])
        return result.data
      } else {
        throw new Error('Erreur lors de la création du plan')
      }
    } catch (error) {
      console.error('Erreur createPlan:', error)
      throw error
    }
  }, [])

  const getPlanById = (id: string) => {
    return plans.find(plan => plan.id === id)
  }

  const getActivePlans = () => {
    return plans.filter(plan => plan.isActive)
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
    createPlan,
    getPlanById,
    getActivePlans
  }
}
