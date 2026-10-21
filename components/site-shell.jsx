'use client'

import Link from 'next/link'
import { Download, Menu, X, ArrowUpRight, ArrowUp } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { siteConfig } from '@/content/site-config'

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
    <nav aria-label="On this page" className="subnav-sections">
      <div className="subnav-inner">
        <span className="mono subnav-label">Jump to</span>
        <div className="subnav-pills">
          {items.map((i) => (
            <a
              key={i.id}
              href={'#' + i.id}
              className={`subnav-pill ${active === i.id ? 'active' : ''}`}
            >
              {i.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

function NavLinks({ onNavigate, isMobile = false }) {
  const pathname = usePathname()

  return (
    <>
      {siteConfig.nav.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={`nav-link ${isActive ? 'active' : ''} ${isMobile ? 'mobile-link' : ''}`}
          >
            <span>{item.label}</span>
            {item.label === 'Résumé' && <Download className="nav-icon" aria-hidden="true" />}
          </Link>
        )
      })}
    </>
  )
}

export function TopBar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <div className="brand-group">
          <Link className="wordmark" href="/">
            {siteConfig.name}
          </Link>
          <span className="brand-role mono">{siteConfig.role}</span>
          <span className="brand-status mono" title={siteConfig.availability}>
            <span className="status-dot" />
            <span className="status-text">Available</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <nav aria-label="Primary" className="nav-desktop">
          <div className="nav-group">
            <NavLinks />
          </div>
          <span className="nav-divider" aria-hidden="true" />
          <div className="nav-socials">
            {siteConfig.github && (
              <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">
                GitHub <ArrowUpRight className="nav-icon-sm" aria-hidden="true" />
              </a>
            )}
            {siteConfig.linkedin && (
              <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn <ArrowUpRight className="nav-icon-sm" aria-hidden="true" />
              </a>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="mobile-toggle"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-drawer">
          <nav aria-label="Mobile primary" className="mobile-nav">
            <NavLinks onNavigate={() => setIsOpen(false)} isMobile />
          </nav>

          <div className="mobile-availability">
            <span className="status-dot" />
            <span>{siteConfig.availability}</span>
          </div>

          <div className="mobile-links mono">
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
          </div>
        </div>
      )}
    </header>
  )
}

export function SiteRail() {
  // Maintained for backward compatibility; layout now uses TopBar
  return null
}

export function AppShell({ children, pageSections = [] }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="shell">
        <TopBar />
        {pageSections.length > 0 && <OnThisPage items={pageSections} />}
        <main id="main-content" className="content-pane">
          {children}
        </main>
      </div>
    </>
  )
}

export function PageFooter() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="page-footer">
      <div className="page-footer-inner">
        <div className="footer-top">
          <div className="footer-brand-block">
            <Link className="footer-wordmark" href="/">
              {siteConfig.name}
            </Link>
            <div className="footer-role mono">{siteConfig.role}</div>
            <div className="footer-availability">
              <span className="status-dot" />
              <span>{siteConfig.availability}</span>
            </div>
          </div>

          <div className="footer-links mono">
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
        </div>

        <div className="footer-bottom mono">
          <span>{siteConfig.labels.builtWith}</span>
          <span>© {new Date().getFullYear()} {siteConfig.name}</span>
          <button type="button" onClick={scrollToTop} className="back-to-top">
            Back to top <ArrowUp size={14} aria-hidden="true" />
          </button>
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

