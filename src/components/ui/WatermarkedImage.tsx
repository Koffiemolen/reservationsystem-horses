'use client'

import Image from 'next/image'
import { useState } from 'react'

interface WatermarkedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fill?: boolean
  priority?: boolean
  watermarkPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
  watermarkSize?: 'small' | 'medium' | 'large'
  showWatermark?: boolean
}

export function WatermarkedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  watermarkPosition = 'bottom-right',
  watermarkSize = 'small',
  showWatermark = true,
}: WatermarkedImageProps) {
  const [imageError, setImageError] = useState(false)

  const watermarkSizes = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
  }

  return (
    <div className={`relative ${className}`}>
      {fill ? (
        <Image
          src={imageError ? '/images/placeholder.svg' : src}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          onError={() => setImageError(true)}
        />
      ) : (
        <Image
          src={imageError ? '/images/placeholder.svg' : src}
          alt={alt}
          width={width || 800}
          height={height || 600}
          className="object-cover"
          priority={priority}
          onError={() => setImageError(true)}
        />
      )}

      {/* Watermark overlay */}
      {showWatermark && !imageError && (
        <div className={`absolute ${positionClasses[watermarkPosition]} opacity-60 pointer-events-none`}>
          <div className={`${watermarkSizes[watermarkSize]} bg-white/20 backdrop-blur-sm rounded-2xl p-2 flex items-center justify-center`}>
            <Image
              src="/logo.svg"
              alt="De Raam Logo"
              width={watermarkSize === 'small' ? 48 : watermarkSize === 'medium' ? 72 : 96}
              height={watermarkSize === 'small' ? 48 : watermarkSize === 'medium' ? 72 : 96}
              className="opacity-90"
            />
          </div>
        </div>
      )}
    </div>
  )
}
