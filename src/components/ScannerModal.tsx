'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, NotFoundException, Result } from '@zxing/library'
import { X, Camera, AlertCircle } from 'lucide-react'

interface ScannerModalProps {
  onClose: () => void
  onScanSuccess: (result: Result) => void
}

export function ScannerModal({ onClose, onScanSuccess }: ScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader()
    codeReaderRef.current = codeReader
    
    // Ajouter un délai pour s'assurer que le DOM est prêt
    const startScanner = () => {
      // Vérifier la compatibilité avec getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Votre navigateur ne supporte pas l\'accès à la caméra. Veuillez utiliser un navigateur moderne.')
        setIsLoading(false)
        return
      }
      
      // Forcer l'arrêt du loading après 5 secondes maximum (augmenté pour mobile)
      const loadingTimeout = setTimeout(() => {
        setIsLoading(false)
        if (!hasPermission) {
          setError('Timeout lors de l\'initialisation. Veuillez réessayer.')
        }
      }, 5000)
      
      // Contraintes optimisées pour mobile - plus simples et plus compatibles
      const videoConstraints = {
        video: {
          facingMode: 'environment',
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 }
        }
      }
      
      // Demander la permission caméra avec contraintes mobile
      navigator.mediaDevices.getUserMedia(videoConstraints)
        .then((stream) => {
          clearTimeout(loadingTimeout)
          console.log('📱 Stream caméra obtenu:', stream)
          setHasPermission(true)
          setIsLoading(false)
          
          // Attendre un peu que les refs soient disponibles (spécifique mobile)
          const waitForRefsAndStart = () => {
            if (videoRef.current && codeReaderRef.current) {
              // Attacher le stream à la vidéo d'abord
              videoRef.current.srcObject = stream
              
              try {
                // Configuration plus tolérante pour mobile
                codeReaderRef.current.decodeFromVideoDevice(null, videoRef.current, (result: Result | undefined, err: Error | undefined) => {
                  if (result) {
                    console.log('🔥 CODE-BARRES DÉTECTÉ:', result.getText())
                    onScanSuccess(result)
                    onClose()
                  }
                  if (err && !(err instanceof NotFoundException)) {
                    console.error('Erreur de scan:', err)
                    // Ne pas afficher d'erreur immédiatement, laisser le scanner continuer
                  }
                })
                console.log('✅ Scanner démarré avec succès')
              } catch (error) {
                console.error('Erreur lors du démarrage du scan:', error)
                setError('Erreur lors du démarrage du scanner')
                setIsLoading(false)
              }
            } else {
              console.log('⏳ En attente des refs...')
              // Réessayer après 50ms
              setTimeout(waitForRefsAndStart, 50)
            }
          }
          
          waitForRefsAndStart()
        })
        .catch((err) => {
          clearTimeout(loadingTimeout)
          console.error('Erreur caméra:', err)
          setHasPermission(false)
          setIsLoading(false)
          
          // Essayer avec des contraintes plus simples en fallback
          if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
            console.log('🔄 Tentative avec contraintes plus simples...')
            navigator.mediaDevices.getUserMedia({ video: true })
              .then((fallbackStream) => {
                console.log('✅ Fallback stream obtenu')
                setHasPermission(true)
                if (videoRef.current && codeReaderRef.current) {
                  videoRef.current.srcObject = fallbackStream
                  codeReaderRef.current.decodeFromVideoDevice(null, videoRef.current, (result: Result | undefined, err: Error | undefined) => {
                    if (result) {
                      console.log('🔥 CODE-BARRES DÉTECTÉ (fallback):', result.getText())
                      onScanSuccess(result)
                      onClose()
                    }
                  })
                }
              })
              .catch((fallbackErr) => {
                console.error('❌ Fallback échoué:', fallbackErr)
                if (fallbackErr.name === 'NotAllowedError') {
                  setError('Permission caméra refusée. Veuillez autoriser l\'accès à la caméra.')
                } else if (fallbackErr.name === 'NotFoundError') {
                  setError('Aucune caméra trouvée sur cet appareil.')
                } else {
                  setError('Erreur caméra: ' + fallbackErr.message)
                }
              })
          } else if (err.name === 'NotAllowedError') {
            setError('Permission caméra refusée. Veuillez autoriser l\'accès à la caméra.')
          } else if (err.name === 'NotFoundError') {
            setError('Aucune caméra trouvée sur cet appareil.')
          } else if (err.name === 'NotReadableError') {
            setError('Caméra déjà utilisée par une autre application.')
          } else {
            setError('Erreur caméra: ' + err.message)
          }
        })
    }
    
    // Démarrer après un court délai pour éviter les problèmes de timing sur mobile
    const timeoutId = setTimeout(startScanner, 100)

    return () => {
      clearTimeout(timeoutId)
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [onScanSuccess, onClose, hasPermission])

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setHasPermission(null)
    
    // Vérifier la compatibilité avec getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Votre navigateur ne supporte pas l\'accès à la caméra. Veuillez utiliser un navigateur moderne.')
      setIsLoading(false)
      return
    }
    
    // Créer une nouvelle instance pour éviter les problèmes de refs
    const newCodeReader = new BrowserMultiFormatReader()
    
    // Redémarrer le scan après un court délai
    setTimeout(() => {
      // Contraintes optimisées pour mobile - plus simples et plus compatibles
      const videoConstraints = {
        video: {
          facingMode: 'environment',
          width: { min: 640, ideal: 1280 },
          height: { min: 480, ideal: 720 }
        }
      }
      
      navigator.mediaDevices.getUserMedia(videoConstraints)
        .then((stream) => {
          setHasPermission(true)
          setIsLoading(false)
          
          // Attendre un peu que les refs soient disponibles (spécifique mobile)
          const waitForRefsAndStart = () => {
            if (videoRef.current) {
              // Attacher le stream à la vidéo d'abord
              videoRef.current.srcObject = stream
              
              newCodeReader.decodeFromVideoDevice(null, videoRef.current, (result: Result | undefined, err: Error | undefined) => {
                if (result) {
                  console.log('🔥 CODE-BARRES DÉTECTÉ:', result.getText())
                  onScanSuccess(result)
                  onClose()
                }
                if (err && !(err instanceof NotFoundException)) {
                  console.error('Erreur de scan:', err)
                  setError('Erreur de lecture du code-barres')
                }
              })
              console.log('✅ Scanner retry démarré avec succès')
            } else {
              console.log('⏳ Retry: En attente des refs...')
              // Réessayer après 50ms
              setTimeout(waitForRefsAndStart, 50)
            }
          }
          
          waitForRefsAndStart()
        })
        .catch((err) => {
          console.error('Erreur caméra:', err)
          setHasPermission(false)
          setIsLoading(false)
          
          // Message d'erreur spécifique
          if (err.name === 'NotAllowedError') {
            setError('Permission caméra refusée. Veuillez autoriser l\'accès à la caméra.')
          } else if (err.name === 'NotFoundError') {
            setError('Aucune caméra trouvée sur cet appareil.')
          } else {
            setError('Erreur caméra: ' + err.message)
          }
        })
    }, 500)
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Camera className="h-6 w-6 text-orange-400" />
          <h2 className="text-white font-semibold">Scanner de codes-barres</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Zone de scan */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-white">Initialisation de la caméra...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            <div className="text-center max-w-sm mx-4">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {hasPermission && !error && (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
              autoPlay
              onLoadedMetadata={() => {
                console.log('🎥 Vidéo chargée avec succès')
                if (videoRef.current) {
                  console.log('📹 Dimensions vidéo:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight)
                }
              }}
              onError={(e) => {
                console.error('❌ Erreur de chargement vidéo:', e)
                setError('Erreur de chargement de la vidéo')
              }}
            />
            
            {/* Overlay de scan */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Lignes de visée */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-orange-500 opacity-50 transform -translate-y-1/2"></div>
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-orange-500 opacity-50 transform -translate-x-1/2"></div>
              
              {/* Coins du cadre de scan */}
              <div className="absolute top-1/4 left-1/4 w-16 h-16 border-t-4 border-l-4 border-orange-500 rounded-tl-lg"></div>
              <div className="absolute top-1/4 right-1/4 w-16 h-16 border-t-4 border-r-4 border-orange-500 rounded-tr-lg"></div>
              <div className="absolute bottom-1/4 left-1/4 w-16 h-16 border-b-4 border-l-4 border-orange-500 rounded-bl-lg"></div>
              <div className="absolute bottom-1/4 right-1/4 w-16 h-16 border-b-4 border-r-4 border-orange-500 rounded-br-lg"></div>
              
              {/* Instructions */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <p className="text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg inline-block">
                  Positionnez le code-barres dans le cadre
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
