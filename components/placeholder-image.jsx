'use client'

import { useState } from 'react'
import { siteConfig } from '@/content/site-config'
import { Image as ImageIcon } from 'lucide-react'

export function PlaceholderImage({ src, alt, className = '' }) {
  const [hasError, setHasError] = useState(false)

  if (src && !hasError) {
    return (
      <div className={`placeholder-image-wrapper ${className}`}>
        <img
          className="placeholder-image"
          src={src}
          alt={alt || 'Project website screenshot'}
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      className={`placeholder-image placeholder-fallback ${className}`}
      role="img"
      aria-label={alt || 'Project screenshot placeholder'}
    >
      <ImageIcon size={28} className="placeholder-icon text-muted" />
      <span className="mono text-xs text-muted">{siteConfig.labels?.sample || 'WEBSITE SCREENSHOT'}</span>
    </div>
  )
}
