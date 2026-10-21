'use client'

import Link from 'next/link'
import { Download, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { siteConfig } from '@/content/site-config'
import { OwnerManager } from './owner-manager'

export function OnThisPage({ items = [] }) {
  const [active, setActive] = useState(items[0]?.id || '')

  useEffect(() => {
    if (!items.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-20% 0px -65%' }
    )
    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [items])

  if (!items.length) return null

  return (
    <nav aria-label="On this page" className="on-page-desktop">
      <span className="mono text-muted on-page-heading">On this page</span>
      <div className="on-page-links">
        {items.map((i) => (
          <a
            key={i.id}
            href={'#' + i.id}
            className={`on-page-link mono ${active === i.id ? 'active' : ''}`}
          >
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  )
}

export function TopBar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const triggerRef = useRef(null)
  const panelRef = useRef(null)
  const reduced = useReducedMotion()

  // Close on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close on resize to 768px or wider
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Focus trap & Escape key handler
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        triggerRef.current?.focus()
        return
      }

      if (e.key === 'Tab') {
        if (!panelRef.current) return
        const focusable = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    // Move focus into panel upon opening
    const timer = setTimeout(() => {
      if (panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length) {
          focusable[0].focus()
        }
      }
    }, 30)

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
  }, [isOpen])

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-inner">
          {/* Left: Wordmark linking to "/" */}
          <Link className="wordmark" href="/">
            {siteConfig.name}
          </Link>

          {/* Right: Desktop & Tablet Inline Links (>= 640px) */}
          <nav aria-label="Primary" className="header-nav">
            {siteConfig.nav.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`header-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span>{item.label}</span>
                  {item.label === 'Résumé' && (
                    <Download className="nav-icon" aria-hidden="true" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right: Mobile Hamburger Button (< 640px) */}
          <button
            ref={triggerRef}
            type="button"
            className="hamburger-btn"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? (
              <X size={20} aria-hidden="true" />
            ) : (
              <Menu size={20} aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Simple black scrim at ~60% opacity (no blur) */}
            <motion.div
              className="mobile-scrim"
              onClick={() => setIsOpen(false)}
              initial={reduced ? { opacity: 0.6 } : { opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.2 }}
              aria-hidden="true"
            />

            {/* Slide-in panel from the left, width min(320px, 85vw) */}
            <motion.div
              id="mobile-menu"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              className="mobile-panel"
              initial={reduced ? false : { x: '-100%' }}
              animate={{ x: 0 }}
              exit={reduced ? { opacity: 0 } : { x: '-100%' }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { duration: 0.2, ease: 'easeOut' }
              }
            >
              <div className="mobile-panel-header">
                <Link
                  className="wordmark"
                  href="/"
                  onClick={() => setIsOpen(false)}
                >
                  {siteConfig.name}
                </Link>
                <button
                  type="button"
                  className="mobile-close-btn"
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              {/* Vertical nav links with large tap targets */}
              <nav aria-label="Mobile Navigation" className="mobile-nav-links">
                {siteConfig.nav.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                    >
                      <span>{item.label}</span>
                      {item.label === 'Résumé' && (
                        <Download className="nav-icon" aria-hidden="true" />
                      )}
                    </Link>
                  )
                })}
              </nav>

              {/* Rail bottom content in mobile drawer: availability status and links */}
              <div className="mobile-panel-bottom">
                <div className="availability">
                  <span className="status-dot" />
                  <span>{siteConfig.availability}</span>
                </div>
                <div className="rail-links">
                  {siteConfig.github && <a href={siteConfig.github}>GitHub</a>}
                  {siteConfig.linkedin && (
                    <a href={siteConfig.linkedin}>LinkedIn</a>
                  )}
                  {siteConfig.email && (
                    <a href={'mailto:' + siteConfig.email}>Email</a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export function SiteRail() {
  // Maintained for backward compatibility; replaced by top-navigation layout
  return null
}

export function AppShell({ children }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="shell">
        <TopBar />
        <main id="main-content" className="content-pane">
          {children}
        </main>
        <OwnerManager />
      </div>
    </>
  )
}

export function PageFooter() {
  const handleFooterMetaClick = (e) => {
    if (e.detail >= 2) {
      window.dispatchEvent(new CustomEvent('open-owner-auth'))
    }
  }

  return (
    <footer className="page-footer">
      <div className="page-footer-inner">
        {/* GitHub, LinkedIn, and Email links from siteConfig */}
        <div className="footer-links mono">
          {siteConfig.github && (
            <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {siteConfig.linkedin && (
            <a
              href={siteConfig.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          )}
          {siteConfig.email && (
            <a href={`mailto:${siteConfig.email}`}>Email</a>
          )}
          {siteConfig.resumePath && (
            <a href={siteConfig.resumePath} download>
              Résumé (PDF)
            </a>
          )}
        </div>

        <div
          className="footer-meta mono"
          onClick={handleFooterMetaClick}
          title="Odeh Samuel Portfolio"
          style={{ cursor: 'default' }}
        >
          <span>{siteConfig.labels.builtWith}</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}

export function ExternalLinks() {
  return (
    <div className="external-links">
      {siteConfig.github && (
        <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
      )}
      {siteConfig.linkedin && (
        <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
      )}
      <a href={`mailto:${siteConfig.email}`}>Email</a>
      <a href={siteConfig.resumePath}>Résumé (PDF)</a>
    </div>
  )
}
