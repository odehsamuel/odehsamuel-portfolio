'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

export function ThemeToggle({ className = '', showLabel = false }) {
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialTheme = saved || (prefersDark ? 'dark' : 'dark')

    setTheme(initialTheme)
    if (initialTheme === 'light') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    const handleThemeEvent = (e) => {
      const next = e.detail?.theme
      if (next) {
        setTheme(next)
      }
    }

    window.addEventListener('theme-change', handleThemeEvent)
    return () => window.removeEventListener('theme-change', handleThemeEvent)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)

    if (nextTheme === 'light') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
      document.documentElement.setAttribute('data-theme', 'light')
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    window.dispatchEvent(
      new CustomEvent('theme-change', { detail: { theme: nextTheme } })
    )
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className={`theme-toggle-btn ${className}`}
        aria-label="Toggle theme"
        disabled
      >
        <span className="theme-toggle-icon-wrap">
          <Sun size={17} aria-hidden="true" />
        </span>
        {showLabel && <span className="theme-toggle-label mono">Theme</span>}
      </button>
    )
  }

  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.span
        key={theme}
        className="theme-toggle-icon-wrap"
        initial={
          reduced
            ? false
            : { rotate: isDark ? -40 : 40, opacity: 0, scale: 0.8 }
        }
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: isDark ? 40 : -40, opacity: 0, scale: 0.8 }}
        transition={
          reduced ? { duration: 0 } : { duration: 0.22, ease: 'easeOut' }
        }
      >
        {isDark ? (
          <Sun size={17} className="theme-icon sun-icon" aria-hidden="true" />
        ) : (
          <Moon size={17} className="theme-icon moon-icon" aria-hidden="true" />
        )}
      </motion.span>
      {showLabel && (
        <span className="theme-toggle-label mono">
          {isDark ? 'Light mode' : 'Dark mode'}
        </span>
      )}
    </button>
  )
}
