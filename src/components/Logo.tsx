'use client'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm'
  }

  return (
    <div className={`flex items-center ${className} -ml-6`}>
      {/* Logo SmartManager existant - fichier logo.png */}
      <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
        <img 
          src="/logo.png" 
          alt="SmartManager Logo" 
          className={`${sizeClasses[size]} object-contain`}
          onError={(e) => {
            // Fallback si l'image ne charge pas
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<span class="text-white font-bold text-lg">SM</span>';
            }
          }}
        />
      </div>
      
      {showText && (
        <div className="ml-[-2px]">
          <div className={`${textSizes[size]} font-bold text-white leading-tight`}>
            SmartManager
          </div>
          {size !== 'sm' && (
            <div className={`${textSizes[size] === 'text-xs' ? 'text-[10px]' : textSizes[size] === 'text-sm' ? 'text-xs' : 'text-sm'} text-emerald-400 font-medium leading-tight`}>
            Pro
          </div>
          )}
        </div>
      )}
    </div>
  )
}
