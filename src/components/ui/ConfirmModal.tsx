'use client'

import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  icon?: React.ReactNode
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger',
  icon
}: ConfirmModalProps) {
  if (!isOpen) return null

  const getIcon = () => {
    if (icon) return icon
    switch (type) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />
      case 'info':
        return <AlertTriangle className="w-6 h-6 text-orange-400" />
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-400" />
    }
  }

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          title: 'text-red-400',
          message: 'text-gray-300',
          confirm: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-400'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          title: 'text-yellow-400',
          message: 'text-gray-300',
          confirm: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/50 text-yellow-400'
        }
      case 'info':
        return {
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          title: 'text-orange-400',
          message: 'text-gray-300',
          confirm: 'bg-orange-500/20 hover:bg-orange-500/30 border-orange-500/50 text-orange-400'
        }
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          title: 'text-gray-400',
          message: 'text-gray-300',
          confirm: 'bg-gray-500/20 hover:bg-gray-500/30 border-gray-500/50 text-gray-400'
        }
    }
  }

  const colors = getColors()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all backdrop-blur-md">
        {/* Header */}
        <div className={`${colors.bg} px-6 py-4 border-b ${colors.border} rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon()}
              <h3 className={`text-lg font-semibold ${colors.title}`}>
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className={`p-1 rounded-lg hover:bg-white/10 transition-colors`}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className={`text-sm ${colors.message} leading-relaxed`}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-black/20 rounded-b-xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-black/40 border border-white/20 rounded-lg hover:bg-black/60 transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg transition-colors font-medium border ${colors.confirm}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
