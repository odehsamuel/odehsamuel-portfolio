'use client'

import Image from 'next/image'
import { User } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { siteConfig } from '@/content/site-config'

export function HeroPortrait() {
  const reduced = useReducedMotion()
  const heroImage = siteConfig.heroImage

  if (!heroImage) return null

  const hasSrc = Boolean(heroImage.src)

  return (
    <figure className="hero-portrait-wrapper">
      <div className="hero-portrait-frame-container">
        {/* Amber offset outline behind the frame: 12px right, 12px down */}
        <motion.div
          className="hero-portrait-outline"
          initial={reduced ? { x: 12, y: 12 } : { x: 0, y: 0 }}
          animate={{ x: 12, y: 12 }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.5, delay: 0.2, ease: 'easeOut' }
          }
          aria-hidden="true"
        />

        {/* Portrait frame with top-to-bottom clip wipe */}
        <motion.div
          className="hero-portrait-frame"
          initial={
            reduced
              ? { clipPath: 'inset(0% 0% 0% 0%)' }
              : { clipPath: 'inset(0% 0% 100% 0%)' }
          }
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.7, ease: 'easeOut' }
          }
        >
          {hasSrc ? (
            <Image
              src={heroImage.src}
              alt={heroImage.alt || `Portrait of ${siteConfig.name}`}
              fill
              priority
              sizes="(min-width: 768px) 380px, 280px"
              style={{ objectFit: 'cover', objectPosition: 'top' }}
            />
          ) : (
            <div className="hero-portrait-placeholder">
              <User size={22} className="text-muted" aria-hidden="true" />
              <span className="mono placeholder-text">ADD YOUR PHOTO</span>
              <small className="sample-tag mono">SAMPLE</small>
            </div>
          )}
        </motion.div>
      </div>

      {heroImage.caption && (
        <figcaption className="mono text-muted hero-portrait-caption">
          {heroImage.caption}
        </figcaption>
      )}
    </figure>
  )
}
