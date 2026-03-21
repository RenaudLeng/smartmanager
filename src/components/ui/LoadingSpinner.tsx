import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white' | 'gradient'
  className?: string
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'primary',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const variantClasses = {
    primary: 'border-orange-500',
    secondary: 'border-blue-500',
    white: 'border-white',
    gradient: 'border-transparent bg-gradient-to-r from-orange-500 to-blue-500'
  }

  const spinnerClass = `animate-spin rounded-full border-2 ${sizeClasses[size]} ${variantClasses[variant]} border-t-transparent ${className}`

  return (
    <div className="flex items-center justify-center space-x-3">
      <div className={spinnerClass}></div>
      {text && (
        <span className="text-gray-400 text-sm animate-pulse">
          {text}
        </span>
      )}
    </div>
  )
}

export default LoadingSpinner
