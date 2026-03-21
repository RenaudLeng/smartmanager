import React from 'react'

interface OptimizedLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  showSkeleton?: boolean
  skeletonLines?: number
}

const OptimizedLoading: React.FC<OptimizedLoadingProps> = ({ 
  size = 'md', 
  message = 'Chargement...',
  showSkeleton = false,
  skeletonLines = 3
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  if (showSkeleton) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonLines }).map((_, i) => (
          <div key={i} className="skeleton h-4 w-full rounded"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center space-x-3 py-4">
      <div className={`${sizeClasses[size]} border-2 border-orange-500 border-t-transparent rounded-full animate-spin`}></div>
      {message && (
        <span className="text-gray-400 text-sm animate-pulse">{message}</span>
      )}
    </div>
  )
}

export default OptimizedLoading
