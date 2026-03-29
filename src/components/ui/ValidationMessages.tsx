'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react'

export type MessageType = 'success' | 'error' | 'warning' | 'info'

interface Message {
  id: string
  type: MessageType
  title: string
  message: string
  duration?: number
}

interface ValidationMessagesProps {
  messages: Message[]
  onRemove: (id: string) => void
}

export function ValidationMessages({ messages, onRemove }: ValidationMessagesProps) {
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.duration && msg.duration > 0) {
        const timer = setTimeout(() => onRemove(msg.id), msg.duration)
        return () => clearTimeout(timer)
      }
    })
  }, [messages]) // Supprimé onRemove des dépendances

  const getIcon = (type: MessageType) => {
    switch (type) {
      case 'success': return CheckCircle
      case 'error': return AlertCircle
      case 'warning': return AlertTriangle
      case 'info': return Info
      default: return Info
    }
  }

  const getStyles = (type: MessageType) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-400'
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-400'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400'
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-400'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {messages.map(msg => {
        const Icon = getIcon(msg.type)
        return (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-md transition-all ${getStyles(msg.type)}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{msg.title}</h4>
              <p className="text-sm mt-1 opacity-90">{msg.message}</p>
            </div>
            <button
              onClick={() => onRemove(msg.id)}
              className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

// Hook pour gérer les messages
export function useValidationMessages() {
  const [messages, setMessages] = useState<Message[]>([])

  const addMessage = (type: MessageType, title: string, message: string, duration: number = 5000) => {
    const id = Date.now().toString()
    const newMessage: Message = { id, type, title, message, duration }
    setMessages(prev => [...prev, newMessage])
    return id
  }

  const removeMessage = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id))
  }

  const clearMessages = () => {
    setMessages([])
  }

  // Méthodes rapides
  const success = (title: string, message: string) => addMessage('success', title, message)
  const error = (title: string, message: string) => addMessage('error', title, message)
  const warning = (title: string, message: string) => addMessage('warning', title, message)
  const info = (title: string, message: string) => addMessage('info', title, message)

  return {
    messages,
    addMessage,
    removeMessage,
    clearMessages,
    success,
    error,
    warning,
    info
  }
}

// Validation des formulaires
export const validateForm = (formData: any, rules: Record<string, any>) => {
  const errors: string[] = []
  const warnings: string[] = []

  Object.entries(rules).forEach(([field, rule]) => {
    const value = formData[field]
    const label = rule.label || field

    // Champ requis
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(`${label} est obligatoire`)
      return
    }

    // Si valeur vide mais pas requis, on passe au suivant
    if (!value) return

    // Type de données
    if (rule.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        errors.push(`${label} doit être un email valide`)
      }
    }

    if (rule.type === 'phone' && value) {
      const phoneRegex = /^(\+241|0)?[1-9]\d{7}$/
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        errors.push(`${label} doit être un numéro gabonais valide`)
      }
    }

    if (rule.type === 'number' && value) {
      const num = Number(value)
      if (isNaN(num)) {
        errors.push(`${label} doit être un nombre`)
      } else {
        if (rule.min !== undefined && num < rule.min) {
          errors.push(`${label} doit être au moins ${rule.min}`)
        }
        if (rule.max !== undefined && num > rule.max) {
          errors.push(`${label} doit être au maximum ${rule.max}`)
        }
      }
    }

    // Longueur
    if (rule.minLength && value.toString().length < rule.minLength) {
      errors.push(`${label} doit contenir au moins ${rule.minLength} caractères`)
    }

    if (rule.maxLength && value.toString().length > rule.maxLength) {
      errors.push(`${label} ne doit pas dépasser ${rule.maxLength} caractères`)
    }

    // Personnalisé
    if (rule.custom && typeof rule.custom === 'function') {
      const customError = rule.custom(value, formData)
      if (customError) {
        if (typeof customError === 'string') {
          errors.push(customError)
        } else if (customError.type === 'warning') {
          warnings.push(customError.message)
        }
      }
    }
  })

  return { errors, warnings }
}

// Composant d'affichage des erreurs de champ
interface FieldErrorProps {
  field: string
  errors: string[]
  warnings?: string[]
}

export function FieldError({ field, errors, warnings = [] }: FieldErrorProps) {
  const fieldErrors = errors.filter(err => err.toLowerCase().includes(field.toLowerCase()))
  const fieldWarnings = warnings.filter(warn => warn.toLowerCase().includes(field.toLowerCase()))

  if (fieldErrors.length === 0 && fieldWarnings.length === 0) return null

  return (
    <div className="mt-1 space-y-1">
      {fieldErrors.map((error, index) => (
        <div key={index} className="flex items-center space-x-1 text-red-400 text-xs">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </div>
      ))}
      {fieldWarnings.map((warning, index) => (
        <div key={index} className="flex items-center space-x-1 text-yellow-400 text-xs">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>{warning}</span>
        </div>
      ))}
    </div>
  )
}
