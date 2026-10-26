'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  Eye,
  Sparkles,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Star,
  Layers,
  Upload,
  Image as ImageIcon,
  Maximize2,
  ExternalLink,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

export function OwnerManager() {
  const router = useRouter()
  const [isOwner, setIsOwner] = useState(false)
  const [passcode, setPasscode] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showStudio, setShowStudio] = useState(false)
  const [authError, setAuthError] = useState('')
  const [projects, setProjects] = useState([])
  const [editingProject, setEditingProject] = useState(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'home'

  // Project Deletion Validation State
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Screenshot upload & preview state
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [showManualUrl, setShowManualUrl] = useState(false)
  const [viewingLightbox, setViewingLightbox] = useState(null)
  const fileInputRef = useRef(null)

  // Check saved authentication on mount & listen for secret hotkey or URL param
  useEffect(() => {
    const savedAuth = localStorage.getItem('odeh_owner_session')
    const savedPass = localStorage.getItem('odeh_owner_passcode')
    if (savedAuth === 'true' && savedPass) {
      setIsOwner(true)
      setPasscode(savedPass)
    }

    // Check URL query param
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('owner') === 'true' || params.get('admin') === 'true') {
        if (savedAuth === 'true') {
          setShowStudio(true)
        } else {
          setShowAuthModal(true)
        }
      }
    }

    // Hotkey: Ctrl + Shift + O
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault()
        if (localStorage.getItem('odeh_owner_session') === 'true') {
          setShowStudio((prev) => !prev)
        } else {
          setShowAuthModal(true)
        }
      }
      if (e.key === 'Escape') {
        if (projectToDelete && !isDeleting) {
          setProjectToDelete(null)
          setDeleteConfirmInput('')
          setDeleteError('')
        } else if (viewingLightbox) {
          setViewingLightbox(null)
        }
      }
    }

    // Custom trigger event (e.g. from footer click)
    const handleOpenAuth = () => {
      if (localStorage.getItem('odeh_owner_session') === 'true') {
        setShowStudio(true)
      } else {
        setShowAuthModal(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-owner-auth', handleOpenAuth)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-owner-auth', handleOpenAuth)
    }
  }, [viewingLightbox, projectToDelete, isDeleting])

  // Fetch projects list when studio opens
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (data.success && data.projects) {
        setProjects(data.projects)
      }
    } catch (err) {
      console.error('Failed to load projects', err)
    }
  }

  useEffect(() => {
    if (showStudio) {
      fetchProjects()
    }
  }, [showStudio])

  const handleLogin = (e) => {
    e.preventDefault()
    setAuthError('')
    // Default passcode is odeh2025
    if (passcode === 'odeh2025') {
      localStorage.setItem('odeh_owner_session', 'true')
      localStorage.setItem('odeh_owner_passcode', passcode)
      setIsOwner(true)
      setShowAuthModal(false)
      setShowStudio(true)
      setMessage({ text: 'Welcome back, Odeh! Owner Mode unlocked.', type: 'success' })
      setTimeout(() => setMessage({ text: '', type: '' }), 4000)
    } else {
      setAuthError('Incorrect passcode. Please try again.')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('odeh_owner_session')
    localStorage.removeItem('odeh_owner_passcode')
    setIsOwner(false)
    setShowStudio(false)
    setPasscode('')
    setMessage({ text: 'Exited Owner Mode.', type: 'info' })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const startCreate = () => {
    setIsCreatingNew(true)
    setUploadError('')
    setShowManualUrl(false)
    setEditingProject({
      title: '',
      slug: '',
      summary: '',
      category: 'Full-stack web app',
      year: new Date().getFullYear().toString(),
      status: 'in-progress',
      published: true,
      featured: false,
      featuredOrder: 3,
      context: 'personal',
      stack: {
        frontend: ['React', 'Next.js', 'Tailwind CSS'],
        backend: ['Node.js', 'Express.js'],
        databases: [{ name: 'PostgreSQL', type: 'relational' }],
        other: [],
      },
      links: { github: '', live: '' },
      cover: { src: '', alt: '' },
      overview: '',
      features: [],
    })
  }

  const startEdit = (proj) => {
    setIsCreatingNew(false)
    setUploadError('')
    setShowManualUrl(Boolean(proj.cover?.src && !proj.cover.src.startsWith('/images/uploads/')))
    setEditingProject({
      ...proj,
      cover: proj.cover || { src: '', alt: '' },
    })
  }

  // Handle image upload from device
  const handleScreenshotUpload = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WEBP, or SVG).')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Screenshot file size exceeds 15MB.')
      return
    }

    setUploading(true)
    setUploadError('')

    // Set immediate client-side preview for seamless UX
    const localBlobUrl = URL.createObjectURL(file)
    setEditingProject((prev) => ({
      ...prev,
      cover: {
        src: localBlobUrl,
        alt: prev.cover?.alt || `Screenshot of ${prev.title || 'project'}`,
      },
    }))

    try {
      const activePasscode = passcode || localStorage.getItem('odeh_owner_passcode') || 'odeh2025'
      const formData = new FormData()
      formData.append('file', file)
      formData.append('passcode', activePasscode)
      formData.append('slug', editingProject?.slug || 'screenshot')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.success && data.url) {
        setEditingProject((prev) => ({
          ...prev,
          cover: {
            src: data.url,
            alt: prev.cover?.alt || `Screenshot of ${prev.title || 'project'}`,
          },
        }))
        setMessage({ text: 'Website screenshot uploaded successfully!', type: 'success' })
        setTimeout(() => setMessage({ text: '', type: '' }), 3500)
      } else {
        setUploadError(data.error || 'Failed to upload screenshot.')
      }
    } catch (err) {
      setUploadError(`Upload failed: ${err.message}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer?.files
    if (files && files.length > 0) {
      handleScreenshotUpload(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleRemoveCover = () => {
    setEditingProject((prev) => ({
      ...prev,
      cover: { src: '', alt: '' },
    }))
    setUploadError('')
  }

  const handleSaveProject = async (e) => {
    e.preventDefault()
    if (!editingProject.title || !editingProject.slug) {
      setMessage({ text: 'Title and Slug are required to save project.', type: 'error' })
      setTimeout(() => setMessage({ text: '', type: '' }), 4000)
      return
    }

    setSaving(true)
    try {
      const activePasscode = passcode || localStorage.getItem('odeh_owner_passcode') || 'odeh2025'
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: activePasscode,
          action: 'save',
          project: editingProject,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ text: `Project "${editingProject.title}" saved successfully!`, type: 'success' })
        setTimeout(() => setMessage({ text: '', type: '' }), 4000)
        setEditingProject(null)
        setIsCreatingNew(false)
        fetchProjects()
        router.refresh()
      } else {
        setMessage({ text: data.error || 'Failed to save project', type: 'error' })
        setTimeout(() => setMessage({ text: '', type: '' }), 4500)
      }
    } catch (err) {
      setMessage({ text: 'Error saving project: ' + err.message, type: 'error' })
      setTimeout(() => setMessage({ text: '', type: '' }), 4500)
    } finally {
      setSaving(false)
    }
  }

  // Project Deletion Validation Handlers
  const openDeleteModal = (proj) => {
    setProjectToDelete(proj)
    setDeleteConfirmInput('')
    setDeleteError('')
  }

  const closeDeleteModal = () => {
    if (isDeleting) return
    setProjectToDelete(null)
    setDeleteConfirmInput('')
    setDeleteError('')
  }

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return

    const normalizedInput = deleteConfirmInput.trim().toLowerCase()
    const targetSlug = (projectToDelete.slug || '').trim().toLowerCase()
    const isValid = normalizedInput === targetSlug || normalizedInput === 'delete'

    if (!isValid) {
      setDeleteError(`Please type "${projectToDelete.slug}" or "delete" to validate deletion.`)
      return
    }

    setIsDeleting(true)
    setDeleteError('')

    try {
      const activePasscode = passcode || localStorage.getItem('odeh_owner_passcode') || 'odeh2025'
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: activePasscode,
          action: 'delete',
          slug: projectToDelete.slug,
        }),
      })

      const data = await res.json()
      if (data.success) {
        const deletedTitle = projectToDelete.title
        setProjectToDelete(null)
        setDeleteConfirmInput('')
        setMessage({ text: `Project "${deletedTitle}" deleted successfully.`, type: 'info' })
        setTimeout(() => setMessage({ text: '', type: '' }), 4500)
        fetchProjects()
        router.refresh()
      } else {
        setDeleteError(data.error || 'Failed to delete project. Please verify owner passcode.')
      }
    } catch (err) {
      setDeleteError('Error deleting: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Home Page Management
  const featuredProjects = [...projects]
    .filter((p) => Boolean(p.featured))
    .sort((a, b) => {
      const aOrder = a.featuredOrder != null ? Number(a.featuredOrder) : 9999
      const bOrder = b.featuredOrder != null ? Number(b.featuredOrder) : 9999
      if (aOrder !== bOrder) return aOrder - bOrder
      return 0
    })

  const nonFeaturedProjects = [...projects].filter((p) => !p.featured)

  const saveHomePageBatch = async (items, toastMsg = 'Home page showcase updated!') => {
    try {
      const activePasscode = passcode || localStorage.getItem('odeh_owner_passcode') || 'odeh2025'
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: activePasscode,
          action: 'updateHomePage',
          items,
        }),
      })

      const data = await res.json()
      if (data.success && data.projects) {
        setProjects(data.projects)
        setMessage({ text: toastMsg, type: 'success' })
        setTimeout(() => setMessage({ text: '', type: '' }), 3500)
        router.refresh()
      } else {
        setMessage({ text: data.error || 'Failed to update home page projects', type: 'error' })
        setTimeout(() => setMessage({ text: '', type: '' }), 4500)
      }
    } catch (err) {
      setMessage({ text: 'Error: ' + err.message, type: 'error' })
      setTimeout(() => setMessage({ text: '', type: '' }), 4500)
    }
  }

  const handleMoveFeatured = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= featuredProjects.length) return

    const newFeatured = [...featuredProjects]
    const temp = newFeatured[index]
    newFeatured[index] = newFeatured[targetIndex]
    newFeatured[targetIndex] = temp

    const items = newFeatured.map((p, idx) => ({
      slug: p.slug,
      featured: true,
      featuredOrder: idx + 1,
    }))

    saveHomePageBatch(items, 'Home page showcase reordered!')
  }

  const handleToggleFeatured = (proj) => {
    const isNowFeatured = !proj.featured
    let items
    if (isNowFeatured) {
      const newOrder = featuredProjects.length + 1
      items = [
        ...featuredProjects.map((p, idx) => ({ slug: p.slug, featured: true, featuredOrder: idx + 1 })),
        { slug: proj.slug, featured: true, featuredOrder: newOrder },
      ]
    } else {
      const remaining = featuredProjects.filter((p) => p.slug !== proj.slug)
      items = [
        ...remaining.map((p, idx) => ({ slug: p.slug, featured: true, featuredOrder: idx + 1 })),
        { slug: proj.slug, featured: false, featuredOrder: 999 },
      ]
    }
    saveHomePageBatch(
      items,
      isNowFeatured ? `"${proj.title}" added to Home Page!` : `"${proj.title}" removed from Home Page!`
    )
  }

  const handleSortHomePage = (strategy) => {
    const list = [...featuredProjects]
    if (strategy === 'completed-year-alpha') {
      list.sort((a, b) => {
        const aComp = (a.status || '').toLowerCase() === 'completed'
        const bComp = (b.status || '').toLowerCase() === 'completed'
        if (aComp && !bComp) return -1
        if (!aComp && bComp) return 1
        const yDiff = (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0)
        if (yDiff !== 0) return yDiff
        return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' })
      })
    } else if (strategy === 'year-desc') {
      list.sort((a, b) => {
        const yDiff = (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0)
        if (yDiff !== 0) return yDiff
        return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' })
      })
    } else if (strategy === 'alpha') {
      list.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' })
      )
    }

    const items = list.map((p, idx) => ({
      slug: p.slug,
      featured: true,
      featuredOrder: idx + 1,
    }))

    const strategyName = strategy === 'completed-year-alpha'
      ? 'Completed First, Year, A-Z'
      : strategy === 'year-desc'
        ? 'Newest Year First'
        : 'Alphabetical (A-Z)'

    saveHomePageBatch(items, `Home page sorted by: ${strategyName}!`)
  }

  return (
    <>
      {/* Discreet owner trigger button in footer area (unobtrusive lock icon) */}
      {!isOwner && (
        <button
          type="button"
          className="owner-discrete-trigger"
          title="Owner login (Ctrl+Shift+O)"
          onClick={() => setShowAuthModal(true)}
          aria-label="Owner sign-in"
        >
          <Lock size={12} aria-hidden="true" />
        </button>
      )}

      {/* Floating Owner Button (visible ONLY to the authenticated owner) */}
      {isOwner && (
        <div className="owner-floating-bar">
          <button
            type="button"
            className="owner-badge-btn"
            onClick={() => setShowStudio((prev) => !prev)}
            title="Open Project Management Studio (Ctrl+Shift+O)"
          >
            <Sparkles size={14} className="sparkle-icon" />
            <span>Owner Mode</span>
            <span className="owner-counter">({projects.length || 3})</span>
          </button>
        </div>
      )}

      {/* Notification Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className={`owner-toast ${message.type}`}
          >
            {message.type === 'error' && <AlertCircle size={16} className="toast-icon-error" />}
            {message.type === 'warning' && <AlertTriangle size={16} className="toast-icon-warning" />}
            {message.type === 'info' && <Sparkles size={16} className="toast-icon-info" />}
            {message.type === 'success' && <Check size={16} className="toast-icon-success" />}
            {!['error', 'warning', 'info', 'success'].includes(message.type) && (
              <Check size={16} className="toast-icon-success" />
            )}
            <span>{message.text}</span>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => setMessage({ text: '', type: '' })}
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Passcode Authentication Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="owner-modal-overlay" onClick={() => setShowAuthModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="owner-auth-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="owner-auth-header">
                <div className="owner-auth-title">
                  <Lock size={18} className="text-accent" />
                  <h3>Owner Access</h3>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={() => setShowAuthModal(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="owner-auth-desc mono">
                Enter your owner passcode to manage, add, or update portfolio projects.
              </p>

              <form onSubmit={handleLogin} className="owner-auth-form">
                <input
                  type="password"
                  placeholder="Enter passcode (default: odeh2025)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  autoFocus
                  className="owner-input"
                />
                {authError && <div className="owner-auth-error mono">{authError}</div>}
                <div className="owner-auth-actions">
                  <button type="submit" className="button-primary">
                    Unlock Studio
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Owner Project Management Studio (Slide-over Drawer) */}
      <AnimatePresence>
        {showStudio && (
          <div className="owner-modal-overlay" onClick={() => setShowStudio(false)}>
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="owner-studio-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Studio Header */}
              <div className="studio-header">
                <div>
                  <h2>Project Management Studio</h2>
                  <span className="mono text-muted text-xs">
                    Owner: Odeh Samuel · Real-time project & screenshot management
                  </span>
                </div>
                <div className="studio-header-actions">
                  {!editingProject && (
                    <button
                      type="button"
                      className="button-primary studio-add-btn"
                      onClick={startCreate}
                    >
                      <Plus size={15} /> Add Project
                    </button>
                  )}
                  <button
                    type="button"
                    className="button-secondary text-xs"
                    onClick={handleLogout}
                    title="Sign out of owner mode"
                  >
                    Lock Studio
                  </button>
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setShowStudio(false)}
                    aria-label="Close studio"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Studio Body */}
              <div className="studio-body">
                {/* Editing / Creating Form */}
                {editingProject ? (
                  <form onSubmit={handleSaveProject} className="project-editor-form">
                    <div className="editor-top-bar">
                      <span className="mono text-accent">
                        {isCreatingNew ? '✦ Add New Project' : `✦ Editing: ${editingProject.title}`}
                      </span>
                      <button
                        type="button"
                        className="text-link text-xs mono"
                        onClick={() => setEditingProject(null)}
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="form-grid-2">
                      <label className="form-label">
                        <span>Project Title *</span>
                        <input
                          type="text"
                          required
                          value={editingProject.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setEditingProject((prev) => ({
                              ...prev,
                              title: val,
                              slug: isCreatingNew
                                ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                                : prev.slug,
                              cover: {
                                ...prev.cover,
                                alt: prev.cover?.alt || `Screenshot of ${val}`,
                              },
                            }))
                          }}
                          className="owner-input"
                          placeholder="e.g. Distributed Task Queue"
                        />
                      </label>

                      <label className="form-label">
                        <span>URL Slug *</span>
                        <input
                          type="text"
                          required
                          value={editingProject.slug}
                          onChange={(e) =>
                            setEditingProject((prev) => ({ ...prev, slug: e.target.value }))
                          }
                          className="owner-input mono text-xs"
                          placeholder="e.g. distributed-task-queue"
                        />
                      </label>
                    </div>

                    <label className="form-label">
                      <span>Short Summary *</span>
                      <textarea
                        required
                        rows={2}
                        value={editingProject.summary}
                        onChange={(e) =>
                          setEditingProject((prev) => ({ ...prev, summary: e.target.value }))
                        }
                        className="owner-input"
                        placeholder="Brief 1-2 sentence description for project cards"
                      />
                    </label>

                    {/* WEBSITE SCREENSHOT UPLOAD & LIVE PREVIEW SECTION */}
                    <div className="form-section screenshot-upload-section">
                      <div className="section-title-row">
                        <span className="mono form-section-title">
                          Website Screenshot (Cover Image)
                        </span>
                        <span className="mono text-muted text-xs">
                          {editingProject.cover?.src ? 'Screenshot ready' : 'Upload from your device'}
                        </span>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                        className="hidden-file-input"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleScreenshotUpload(e.target.files[0])
                          }
                        }}
                      />

                      {/* Live Screenshot Preview or Dropzone */}
                      {editingProject.cover?.src ? (
                        <div className="screenshot-preview-container">
                          {/* Browser Mockup Chrome */}
                          <div className="browser-mockup-frame">
                            <div className="browser-mockup-header">
                              <div className="browser-dots">
                                <span className="dot red" />
                                <span className="dot yellow" />
                                <span className="dot green" />
                              </div>
                              <div className="browser-address-bar mono">
                                <span>https://{editingProject.slug || 'odehsamuel-portfolio'}.vercel.app</span>
                              </div>
                              <div className="browser-actions">
                                <button
                                  type="button"
                                  className="browser-action-icon"
                                  onClick={() =>
                                    setViewingLightbox({
                                      src: editingProject.cover.src,
                                      alt: editingProject.cover.alt,
                                      title: editingProject.title || 'Screenshot Preview',
                                    })
                                  }
                                  title="View full-size screenshot"
                                >
                                  <Maximize2 size={13} />
                                </button>
                              </div>
                            </div>

                            {/* Screenshot Image */}
                            <div className="browser-screenshot-viewport">
                              <img
                                src={editingProject.cover.src}
                                alt={editingProject.cover.alt || 'Screenshot Preview'}
                                className="browser-screenshot-img"
                              />

                              {uploading && (
                                <div className="upload-overlay-spinner">
                                  <Loader2 size={24} className="spin-icon" />
                                  <span className="mono text-xs">Uploading screenshot...</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Screenshot Controls */}
                          <div className="screenshot-controls-row">
                            <div className="screenshot-meta mono text-xs">
                              <span className="screenshot-src-badge" title={editingProject.cover.src}>
                                {editingProject.cover.src.length > 42
                                  ? '...' + editingProject.cover.src.slice(-38)
                                  : editingProject.cover.src}
                              </span>
                            </div>

                            <div className="screenshot-btn-group">
                              <button
                                type="button"
                                className="button-secondary text-xs"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                              >
                                <Upload size={13} /> Change Screenshot
                              </button>
                              <button
                                type="button"
                                className="button-secondary text-xs text-danger"
                                onClick={handleRemoveCover}
                                disabled={uploading}
                              >
                                <Trash2 size={13} /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Drag and Drop Upload Zone */
                        <div
                          className={`screenshot-dropzone ${isDragging ? 'is-dragging' : ''} ${uploading ? 'is-uploading' : ''
                            }`}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {uploading ? (
                            <div className="dropzone-content">
                              <Loader2 size={32} className="spin-icon text-accent" />
                              <p className="dropzone-primary-text">Uploading website screenshot...</p>
                              <span className="mono text-xs text-muted">Saving to public storage...</span>
                            </div>
                          ) : (
                            <div className="dropzone-content">
                              <div className="dropzone-icon-ring">
                                <Upload size={24} className="text-accent" />
                              </div>
                              <p className="dropzone-primary-text">
                                <strong>Click to upload website screenshot</strong> or drag & drop here
                              </p>
                              <span className="mono text-xs text-muted">
                                PNG, JPG, WEBP or SVG · Up to 15MB · Instant preview
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload Error Banner */}
                      {uploadError && (
                        <div className="screenshot-error-banner mono text-xs">
                          <AlertCircle size={15} />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {/* Alt text and custom path toggle */}
                      <div className="screenshot-extra-fields">
                        <label className="form-label">
                          <span>Screenshot Description (Alt Text)</span>
                          <input
                            type="text"
                            value={editingProject.cover?.alt || ''}
                            onChange={(e) => {
                              const alt = e.target.value
                              setEditingProject((prev) => ({
                                ...prev,
                                cover: { ...prev.cover, alt },
                              }))
                            }}
                            className="owner-input text-xs"
                            placeholder={`e.g. Screenshot of ${editingProject.title || 'project'} dashboard`}
                          />
                        </label>

                        <div className="manual-url-toggle">
                          <button
                            type="button"
                            className="text-link text-xs mono"
                            onClick={() => setShowManualUrl((prev) => !prev)}
                          >
                            {showManualUrl ? '− Hide image path URL input' : '+ Or specify image URL/path manually'}
                          </button>

                          {showManualUrl && (
                            <input
                              type="text"
                              value={editingProject.cover?.src || ''}
                              onChange={(e) => {
                                const src = e.target.value
                                setEditingProject((prev) => ({
                                  ...prev,
                                  cover: {
                                    ...prev.cover,
                                    src,
                                    alt: prev.cover?.alt || `Screenshot of ${prev.title}`,
                                  },
                                }))
                              }}
                              className="owner-input mono text-xs mt-2"
                              placeholder="/images/habit-tracker.jpg or https://..."
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="form-grid-3">
                      <label className="form-label">
                        <span>Category</span>
                        <input
                          type="text"
                          value={editingProject.category || ''}
                          onChange={(e) =>
                            setEditingProject((prev) => ({ ...prev, category: e.target.value }))
                          }
                          className="owner-input"
                          placeholder="Full-stack web app, Booking system..."
                        />
                      </label>

                      <label className="form-label">
                        <span>Year</span>
                        <input
                          type="text"
                          value={editingProject.year || ''}
                          onChange={(e) =>
                            setEditingProject((prev) => ({ ...prev, year: e.target.value }))
                          }
                          className="owner-input"
                          placeholder="2025"
                        />
                      </label>

                      <label className="form-label">
                        <span>Status</span>
                        <select
                          value={editingProject.status || 'in-progress'}
                          onChange={(e) =>
                            setEditingProject((prev) => ({ ...prev, status: e.target.value }))
                          }
                          className="owner-input"
                        >
                          <option value="in-progress">In-progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label className="form-checkbox-label">
                        <input
                          type="checkbox"
                          checked={Boolean(editingProject.featured)}
                          onChange={(e) =>
                            setEditingProject((prev) => ({
                              ...prev,
                              featured: e.target.checked,
                              featuredOrder: e.target.checked
                                ? prev.featuredOrder || (featuredProjects.length + 1)
                                : prev.featuredOrder,
                            }))
                          }
                        />
                        <span>Feature on Home Page (Selected Projects)</span>
                      </label>

                      <label className="form-checkbox-label">
                        <input
                          type="checkbox"
                          checked={editingProject.published !== false}
                          onChange={(e) =>
                            setEditingProject((prev) => ({ ...prev, published: e.target.checked }))
                          }
                        />
                        <span>Published (visible on website)</span>
                      </label>
                    </div>

                    {editingProject.featured && (
                      <div className="featured-order-box mono text-xs">
                        <label className="form-label">
                          <span>Home Page Display Position (#1 appears first)</span>
                          <input
                            type="number"
                            min="1"
                            value={editingProject.featuredOrder ?? 1}
                            onChange={(e) =>
                              setEditingProject((prev) => ({
                                ...prev,
                                featuredOrder: parseInt(e.target.value, 10) || 1,
                              }))
                            }
                            className="owner-input"
                          />
                        </label>
                        <span className="text-muted">
                          Choose what number position this project should occupy on the home page.
                        </span>
                      </div>
                    )}

                    {/* Tech Stack */}
                    <div className="form-section">
                      <span className="mono form-section-title">Tech Stack</span>
                      <div className="form-grid-2">
                        <label className="form-label">
                          <span>Frontend Technologies (comma-separated)</span>
                          <input
                            type="text"
                            value={(editingProject.stack?.frontend || []).join(', ')}
                            onChange={(e) => {
                              const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                              setEditingProject((prev) => ({
                                ...prev,
                                stack: { ...prev.stack, frontend: arr },
                              }))
                            }}
                            className="owner-input"
                            placeholder="React, Next.js, Tailwind CSS"
                          />
                        </label>

                        <label className="form-label">
                          <span>Backend Technologies (comma-separated)</span>
                          <input
                            type="text"
                            value={(editingProject.stack?.backend || []).join(', ')}
                            onChange={(e) => {
                              const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                              setEditingProject((prev) => ({
                                ...prev,
                                stack: { ...prev.stack, backend: arr },
                              }))
                            }}
                            className="owner-input"
                            placeholder="Node.js, Express.js"
                          />
                        </label>
                      </div>

                      <div className="form-grid-2">
                        <label className="form-label">
                          <span>Database Name</span>
                          <input
                            type="text"
                            value={editingProject.stack?.databases?.[0]?.name || ''}
                            onChange={(e) => {
                              const name = e.target.value
                              setEditingProject((prev) => ({
                                ...prev,
                                stack: {
                                  ...prev.stack,
                                  databases: [{ name, type: name.toLowerCase().includes('mongo') ? 'document' : 'relational' }],
                                },
                              }))
                            }}
                            className="owner-input"
                            placeholder="PostgreSQL or MongoDB"
                          />
                        </label>

                        <label className="form-label">
                          <span>Context</span>
                          <select
                            value={editingProject.context || 'personal'}
                            onChange={(e) =>
                              setEditingProject((prev) => ({ ...prev, context: e.target.value }))
                            }
                            className="owner-input"
                          >
                            <option value="personal">Personal Project</option>
                            <option value="learning">Learning / Practice</option>
                            <option value="client">Client Project</option>
                          </select>
                        </label>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="form-grid-2">
                      <label className="form-label">
                        <span>GitHub Repository URL</span>
                        <input
                          type="url"
                          value={editingProject.links?.github || ''}
                          onChange={(e) =>
                            setEditingProject((prev) => ({
                              ...prev,
                              links: { ...prev.links, github: e.target.value },
                            }))
                          }
                          className="owner-input mono text-xs"
                          placeholder="https://github.com/odehsamuel/..."
                        />
                      </label>

                      <label className="form-label">
                        <span>Live Demo URL (optional)</span>
                        <input
                          type="url"
                          value={editingProject.links?.live || ''}
                          onChange={(e) =>
                            setEditingProject((prev) => ({
                              ...prev,
                              links: { ...prev.links, live: e.target.value },
                            }))
                          }
                          className="owner-input mono text-xs"
                          placeholder="https://..."
                        />
                      </label>
                    </div>

                    {/* Overview & Features */}
                    <label className="form-label">
                      <span>Project Overview</span>
                      <textarea
                        rows={3}
                        value={editingProject.overview || ''}
                        onChange={(e) =>
                          setEditingProject((prev) => ({ ...prev, overview: e.target.value }))
                        }
                        className="owner-input"
                        placeholder="Detailed background, goals and architecture decisions..."
                      />
                    </label>

                    <label className="form-label">
                      <span>Key Features (one per line)</span>
                      <textarea
                        rows={3}
                        value={(editingProject.features || []).join('\n')}
                        onChange={(e) => {
                          const arr = e.target.value.split('\n').filter((l) => l.trim().length > 0)
                          setEditingProject((prev) => ({ ...prev, features: arr }))
                        }}
                        className="owner-input"
                        placeholder="User authentication&#10;Daily habit streaks&#10;Weekly progress charts"
                      />
                    </label>

                    <div className="editor-submit-bar">
                      <button
                        type="submit"
                        disabled={saving || uploading}
                        className="button-primary"
                      >
                        {saving ? 'Saving Project...' : isCreatingNew ? 'Create Project' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => setEditingProject(null)}
                      >
                        Cancel
                      </button>
                      {!isCreatingNew && (
                        <button
                          type="button"
                          className="studio-action-btn delete-btn"
                          style={{ marginLeft: 'auto' }}
                          onClick={() => openDeleteModal(editingProject)}
                          title="Delete this project"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Studio Sub-Navigation Tabs */}
                    <div className="studio-tabs mono text-xs">
                      <button
                        type="button"
                        className={`studio-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                      >
                        <Layers size={13} />
                        <span>All Projects ({projects.length})</span>
                      </button>
                      <button
                        type="button"
                        className={`studio-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => setActiveTab('home')}
                      >
                        <Star size={13} />
                        <span>Home Page Showcase ({featuredProjects.length})</span>
                      </button>
                    </div>

                    {activeTab === 'home' ? (
                      /* Home Page Showcase Manager */
                      <div className="home-showcase-manager">
                        <div className="home-showcase-header">
                          <div className="home-showcase-info">
                            <h4>Selected Projects on Home Page</h4>
                            <p className="text-muted text-xs">
                              Control which projects appear on your homepage and define their exact display order. Use <strong>Move Up / Down</strong> or choose an automatic sort preset.
                            </p>
                          </div>

                          {/* Quick Sorting Presets Toolbar */}
                          <div className="home-sort-presets mono text-xs">
                            <span className="text-muted">Auto-sort Home Page:</span>
                            <div className="preset-buttons-wrap">
                              <button
                                type="button"
                                className="home-preset-btn"
                                onClick={() => handleSortHomePage('completed-year-alpha')}
                                title="Completed projects first, sorted by newest year and title A-Z"
                              >
                                Completed First (Year & A-Z)
                              </button>
                              <button
                                type="button"
                                className="home-preset-btn"
                                onClick={() => handleSortHomePage('year-desc')}
                                title="Sort by newest year first (2025 -> 2024)"
                              >
                                Newest Year First
                              </button>
                              <button
                                type="button"
                                className="home-preset-btn"
                                onClick={() => handleSortHomePage('alpha')}
                                title="Sort alphabetically A-Z"
                              >
                                Alphabetical (A–Z)
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Active Featured Projects List */}
                        <div className="home-featured-list">
                          <div className="studio-list-summary mono text-xs text-muted">
                            <span>Currently on Home Page: {featuredProjects.length}</span>
                            <span>Order #1 displays first at the top of Selected Projects</span>
                          </div>

                          {featuredProjects.length === 0 ? (
                            <div className="home-empty-box mono text-xs text-muted">
                              No projects currently selected for the home page. Add projects from the available list below!
                            </div>
                          ) : (
                            featuredProjects.map((proj, idx) => (
                              <div key={proj.slug} className="home-featured-row">
                                <div className="home-order-indicator mono">
                                  <span className="home-order-pill">#{idx + 1}</span>
                                  <div className="home-arrow-col">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => handleMoveFeatured(idx, -1)}
                                      className="home-reorder-btn"
                                      title="Move Up on Home Page"
                                    >
                                      <ArrowUp size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === featuredProjects.length - 1}
                                      onClick={() => handleMoveFeatured(idx, 1)}
                                      className="home-reorder-btn"
                                      title="Move Down on Home Page"
                                    >
                                      <ArrowDown size={12} />
                                    </button>
                                  </div>
                                </div>

                                <div
                                  className="studio-project-thumbnail home-card-thumb"
                                  onClick={() => {
                                    if (proj.cover?.src) {
                                      setViewingLightbox({
                                        src: proj.cover.src,
                                        alt: proj.cover.alt,
                                        title: proj.title,
                                        slug: proj.slug,
                                      })
                                    }
                                  }}
                                >
                                  {proj.cover?.src ? (
                                    <img
                                      src={proj.cover.src}
                                      alt={proj.cover.alt || proj.title}
                                      className="studio-thumb-img"
                                    />
                                  ) : (
                                    <div className="thumb-no-screenshot">
                                      <ImageIcon size={18} className="text-muted" />
                                    </div>
                                  )}
                                </div>

                                <div className="card-info">
                                  <div className="card-top-row">
                                    <span className="mono text-muted text-xs">{proj.year}</span>
                                    <span className="mono status-badge">{proj.status}</span>
                                    <span className="mono category-badge text-xs">{proj.category}</span>
                                  </div>
                                  <h4>{proj.title}</h4>
                                  <p className="card-summary text-muted">{proj.summary}</p>
                                </div>

                                <div className="card-actions">
                                  <button
                                    type="button"
                                    className="studio-action-btn edit-btn"
                                    onClick={() => startEdit(proj)}
                                    title="Edit project"
                                  >
                                    <Edit2 size={13} /> Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="studio-action-btn remove-home-btn"
                                    onClick={() => handleToggleFeatured(proj)}
                                    title="Remove from home page"
                                  >
                                    <X size={13} /> Remove
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Available Projects to Add */}
                        {nonFeaturedProjects.length > 0 && (
                          <div className="home-available-section">
                            <div className="studio-list-summary mono text-xs text-muted mb-2">
                              <span>Available to add to Home Page ({nonFeaturedProjects.length})</span>
                            </div>
                            <div className="home-available-grid">
                              {nonFeaturedProjects.map((proj) => (
                                <div key={proj.slug} className="home-available-card">
                                  <div className="available-card-info">
                                    <span className="mono text-muted text-xs">{proj.year} · {proj.status}</span>
                                    <h5>{proj.title}</h5>
                                  </div>
                                  <button
                                    type="button"
                                    className="button-primary text-xs"
                                    onClick={() => handleToggleFeatured(proj)}
                                    title="Add to Home Page"
                                  >
                                    <Plus size={13} /> Add to Home
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* All Projects List */
                      <div className="studio-project-list">
                        <div className="studio-list-summary mono text-xs text-muted">
                          <span>Total: {projects.length} project{projects.length === 1 ? '' : 's'}</span>
                          <span>Click screenshot thumbnail to preview full resolution</span>
                        </div>

                        {projects.map((proj) => (
                          <div key={proj.slug} className="studio-project-card">
                            {/* Screenshot Visual Thumbnail Preview */}
                            <div
                              className="studio-project-thumbnail"
                              onClick={() => {
                                if (proj.cover?.src) {
                                  setViewingLightbox({
                                    src: proj.cover.src,
                                    alt: proj.cover.alt,
                                    title: proj.title,
                                    slug: proj.slug,
                                  })
                                }
                              }}
                              role={proj.cover?.src ? 'button' : undefined}
                              title={proj.cover?.src ? 'Click to preview full screenshot' : 'No screenshot uploaded'}
                            >
                              {proj.cover?.src ? (
                                <>
                                  <img
                                    src={proj.cover.src}
                                    alt={proj.cover.alt || proj.title}
                                    className="studio-thumb-img"
                                  />
                                  <div className="thumb-zoom-overlay">
                                    <Maximize2 size={14} />
                                    <span className="mono text-xs">Preview</span>
                                  </div>
                                </>
                              ) : (
                                <div className="thumb-no-screenshot">
                                  <ImageIcon size={20} className="text-muted" />
                                  <span className="mono text-xs text-muted">No screenshot</span>
                                </div>
                              )}
                            </div>

                            {/* Project Details */}
                            <div className="card-info">
                              <div className="card-top-row">
                                <span className="mono text-muted text-xs">{proj.year}</span>
                                <span className="mono status-badge">{proj.status}</span>
                                {proj.featured && (
                                  <span className="mono featured-badge">
                                    ★ Home #{featuredProjects.findIndex((f) => f.slug === proj.slug) + 1}
                                  </span>
                                )}
                                {!proj.published && (
                                  <span className="mono draft-badge">Draft</span>
                                )}
                              </div>
                              <h4>{proj.title}</h4>
                              <p className="card-summary text-muted">{proj.summary}</p>
                              <div className="card-stack mono text-xs">
                                {[
                                  ...(proj.stack?.frontend || []),
                                  ...(proj.stack?.backend || []),
                                ].slice(0, 4).join(' · ')}
                              </div>
                            </div>

                            {/* Card Actions */}
                            <div className="card-actions">
                              <button
                                type="button"
                                className={`studio-action-btn ${proj.featured ? 'home-active-btn' : 'home-toggle-btn'}`}
                                onClick={() => handleToggleFeatured(proj)}
                                title={proj.featured ? 'Remove from Home Page' : 'Feature on Home Page'}
                              >
                                <Star size={13} fill={proj.featured ? 'currentColor' : 'none'} />
                                <span>{proj.featured ? 'On Home' : '+ Home'}</span>
                              </button>
                              <button
                                type="button"
                                className="studio-action-btn edit-btn"
                                onClick={() => startEdit(proj)}
                                title="Edit project & screenshot"
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                              <button
                                type="button"
                                className="studio-action-btn delete-btn"
                                onClick={() => openDeleteModal(proj)}
                                title="Delete project"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Screenshot Lightbox Preview Modal */}
      <AnimatePresence>
        {viewingLightbox && (
          <div
            className="screenshot-lightbox-overlay"
            onClick={() => setViewingLightbox(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.2 }}
              className="screenshot-lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="lightbox-header">
                <div className="lightbox-title-wrap">
                  <span className="mono text-accent text-xs">✦ Website Screenshot Preview</span>
                  <h3>{viewingLightbox.title}</h3>
                </div>
                <div className="lightbox-header-actions">
                  {viewingLightbox.slug && (
                    <a
                      href={`/projects/${viewingLightbox.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button-secondary text-xs"
                      title="View public project page"
                    >
                      <span>View Project Page</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                  <button
                    type="button"
                    className="modal-close"
                    onClick={() => setViewingLightbox(null)}
                    aria-label="Close screenshot preview"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="lightbox-image-wrapper">
                <img
                  src={viewingLightbox.src}
                  alt={viewingLightbox.alt || viewingLightbox.title}
                  className="lightbox-img"
                />
              </div>

              <div className="lightbox-footer mono text-xs text-muted">
                <span>{viewingLightbox.alt || 'Project website screenshot'}</span>
                <span>Press ESC or click outside to close</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom On-Screen Deletion Validation Modal */}
      <AnimatePresence>
        {projectToDelete && (
          <div
            className="deletion-modal-overlay"
            onClick={closeDeleteModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="deletion-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Danger Badge */}
              <div className="deletion-modal-header">
                <div className="deletion-header-main">
                  <div className="deletion-icon-badge" aria-hidden="true">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <div className="deletion-badge-tag mono">Destructive Action · Irreversible</div>
                    <h3 id="delete-dialog-title" className="deletion-title">
                      Delete Project?
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  className="modal-close"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Warning Copy */}
              <p className="deletion-description">
                You are about to delete <strong style={{ color: 'var(--fg)' }}>"{projectToDelete.title}"</strong>. This will permanently remove its metadata, configuration, and references from the portfolio.
              </p>

              {/* Project Preview Summary Card */}
              <div className="deletion-project-preview">
                {projectToDelete.cover?.src ? (
                  <img
                    src={projectToDelete.cover.src}
                    alt={projectToDelete.title}
                    className="deletion-preview-img"
                  />
                ) : (
                  <div className="deletion-preview-fallback">
                    <Trash2 size={18} />
                  </div>
                )}
                <div className="deletion-preview-details">
                  <div className="deletion-preview-title">{projectToDelete.title}</div>
                  <div className="deletion-preview-slug mono">
                    /projects/{projectToDelete.slug}
                  </div>
                  <div className="deletion-preview-meta">
                    <span className="deletion-meta-pill status mono">
                      {projectToDelete.status || 'Active'}
                    </span>
                    {projectToDelete.year && (
                      <span className="deletion-meta-pill mono">{projectToDelete.year}</span>
                    )}
                    {projectToDelete.featured && (
                      <span className="deletion-meta-pill featured mono">Featured on Home</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Home Page Warning if featured */}
              {projectToDelete.featured && (
                <div className="deletion-home-warning mono">
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    <strong>Home Page Impact:</strong> This project is currently pinned to the home page showcase. Deleting it will automatically remove it from the home page.
                  </span>
                </div>
              )}

              {/* Validation Step */}
              <div className="deletion-validation-box">
                <label htmlFor="deletion-verify-input" className="deletion-input-label">
                  <span className="mono">Safety Validation</span>
                  <p className="deletion-input-hint">
                    To confirm deletion, type <code className="deletion-slug-chip" onClick={() => setDeleteConfirmInput(projectToDelete.slug)} title="Click to autofill slug">{projectToDelete.slug}</code> or <code className="deletion-slug-chip" onClick={() => setDeleteConfirmInput('delete')} title="Click to autofill 'delete'">delete</code> below:
                  </p>
                </label>

                <div className="deletion-input-wrap">
                  <input
                    id="deletion-verify-input"
                    type="text"
                    autoFocus
                    value={deleteConfirmInput}
                    onChange={(e) => {
                      setDeleteConfirmInput(e.target.value)
                      if (deleteError) setDeleteError('')
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const norm = deleteConfirmInput.trim().toLowerCase()
                        const target = (projectToDelete.slug || '').trim().toLowerCase()
                        if (norm === target || norm === 'delete') {
                          handleConfirmDelete()
                        }
                      }
                    }}
                    disabled={isDeleting}
                    placeholder={`Type "${projectToDelete.slug}" to validate`}
                    className="deletion-text-input mono"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {deleteConfirmInput && (
                    <button
                      type="button"
                      className="deletion-clear-input-btn"
                      onClick={() => setDeleteConfirmInput('')}
                      disabled={isDeleting}
                      title="Clear"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Error Alert if API call failed */}
              {deleteError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="deletion-error-banner mono"
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{deleteError}</span>
                </motion.div>
              )}

              {/* Actions */}
              <div className="deletion-modal-actions">
                <button
                  type="button"
                  className="deletion-cancel-btn"
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="deletion-confirm-btn"
                  onClick={handleConfirmDelete}
                  disabled={
                    isDeleting ||
                    (deleteConfirmInput.trim().toLowerCase() !== (projectToDelete.slug || '').trim().toLowerCase() &&
                     deleteConfirmInput.trim().toLowerCase() !== 'delete')
                  }
                  title={
                    deleteConfirmInput.trim().toLowerCase() === (projectToDelete.slug || '').trim().toLowerCase() ||
                    deleteConfirmInput.trim().toLowerCase() === 'delete'
                      ? 'Confirm permanent deletion'
                      : 'Type the project slug or "delete" to enable'
                  }
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={15} className="spin-icon" />
                      <span>Deleting Project...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={15} />
                      <span>Permanently Delete Project</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
