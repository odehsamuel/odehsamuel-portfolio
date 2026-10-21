'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Plus, Edit2, Trash2, X, Check, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'

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
  }, [])

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
    setEditingProject({ ...proj })
  }

  const handleSaveProject = async (e) => {
    e.preventDefault()
    if (!editingProject.title || !editingProject.slug) {
      alert('Title and Slug are required')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: passcode || localStorage.getItem('odeh_owner_passcode'),
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
        alert(data.error || 'Failed to save project')
      }
    } catch (err) {
      alert('Error saving project: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug, title) => {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: passcode || localStorage.getItem('odeh_owner_passcode'),
          action: 'delete',
          slug,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({ text: `Project "${title}" deleted.`, type: 'info' })
        fetchProjects()
        router.refresh()
      } else {
        alert(data.error || 'Failed to delete')
      }
    } catch (err) {
      alert('Error deleting: ' + err.message)
    }
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
            <Check size={16} />
            <span>{message.text}</span>
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
                    Owner: Odeh Samuel · Real-time project updates
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
                            setEditingProject((prev) => ({ ...prev, featured: e.target.checked }))
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
                          <span>Screenshot Path / Image URL</span>
                          <input
                            type="text"
                            value={editingProject.cover?.src || ''}
                            onChange={(e) => {
                              const src = e.target.value
                              setEditingProject((prev) => ({
                                ...prev,
                                cover: { src, alt: `Screenshot of ${prev.title}` },
                              }))
                            }}
                            className="owner-input mono text-xs"
                            placeholder="/images/habit-tracker.jpg"
                          />
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
                        disabled={saving}
                        className="button-primary"
                      >
                        {saving ? 'Saving...' : isCreatingNew ? 'Create Project' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => setEditingProject(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  /* Projects List */
                  <div className="studio-project-list">
                    {projects.map((proj) => (
                      <div key={proj.slug} className="studio-project-card">
                        <div className="card-info">
                          <div className="card-top-row">
                            <span className="mono text-muted text-xs">{proj.year}</span>
                            <span className="mono status-badge">{proj.status}</span>
                            {proj.featured && (
                              <span className="mono featured-badge">★ Featured</span>
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

                        <div className="card-actions">
                          <button
                            type="button"
                            className="studio-action-btn edit-btn"
                            onClick={() => startEdit(proj)}
                            title="Edit project"
                          >
                            <Edit2 size={15} /> Edit
                          </button>
                          <button
                            type="button"
                            className="studio-action-btn delete-btn"
                            onClick={() => handleDelete(proj.slug, proj.title)}
                            title="Delete project"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
