import React from 'react'

interface ModernSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'dots' | 'pulse' | 'wave' | 'orbit' | 'morph'
  color?: 'orange' | 'blue' | 'purple' | 'green' | 'white'
  className?: string
  text?: string
}

const ModernSpinner: React.FC<ModernSpinnerProps> = ({ 
  size = 'md', 
  variant = 'dots',
  color = 'orange',
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const colorClasses = {
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    white: 'bg-white'
  }

  const dotSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
    xl: 'w-3 h-3'
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className={`flex space-x-1 ${className}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )

      case 'pulse':
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            <div className={`absolute inset-0 ${colorClasses[color]} rounded-full animate-ping opacity-75`} />
            <div className={`relative ${sizeClasses[size]} ${colorClasses[color]} rounded-full`} />
          </div>
        )

      case 'wave':
        return (
          <div className={`flex items-end space-x-1 ${sizeClasses[size]} ${className}`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 ${colorClasses[color]} rounded-full animate-pulse`}
                style={{ 
                  height: '100%',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.5s'
                }}
              />
            ))}
          </div>
        )

      case 'orbit':
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            <div className={`absolute inset-0 border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`} />
            <div className={`absolute inset-2 border-2 ${colorClasses[color]} border-b-transparent rounded-full animate-spin`} style={{ animationDirection: 'reverse' }} />
            <div className={`absolute inset-4 ${colorClasses[color]} rounded-full animate-pulse`} />
          </div>
        )

      case 'morph':
        return (
          <div className={`relative ${sizeClasses[size]} ${className}`}>
            <div 
              className={`absolute inset-0 ${colorClasses[color]}`}
              style={{
                animation: 'morph 2s ease-in-out infinite',
                borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
              }}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      {renderSpinner()}
      {text && (
        <span className="text-gray-400 text-sm animate-pulse text-center">
          {text}
        </span>
      )}
    </div>
  )
}

export default ModernSpinner
