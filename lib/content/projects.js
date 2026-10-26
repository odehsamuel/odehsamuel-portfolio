import staticProjects from '@/content/projects-data.json'

function getRawProjects() {
  if (typeof window === 'undefined') {
    try {
      // Dynamic require on server to read latest data
      const fs = require('fs')
      const path = require('path')
      const filePath = path.join(process.cwd(), 'content', 'projects-data.json')
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(raw)
      }
    } catch (e) {
      // Fallback to static import
    }
  }
  return staticProjects
}

export const extractYear = (val) => {
  if (!val) return 0
  const matches = String(val).match(/\d{4}/g)
  if (matches && matches.length > 0) {
    return Math.max(...matches.map(Number))
  }
  const n = parseInt(val, 10)
  return isNaN(n) ? 0 : n
}

const isCompleted = (p) => {
  const s = (p?.status || '').trim().toLowerCase()
  return s === 'completed' || s === 'complete'
}

const isInProgress = (p) => {
  const s = (p?.status || '').trim().toLowerCase()
  return s === 'in-progress' || s === 'in progress' || s === 'inprogress'
}

/**
 * Sort comparator for the projects page:
 * 1. All completed projects come first:
 *    - Sorted first by the most current year (newest first).
 *    - And then alphabetically (A-Z).
 * 2. Next, projects in progress:
 *    - Sorted first by the most current year (newest first).
 *    - And then alphabetically (A-Z).
 */
export const sortProjects = (a, b) => {
  const aComp = isCompleted(a)
  const bComp = isCompleted(b)

  // 1. All completed projects come first
  if (aComp && !bComp) return -1
  if (!aComp && bComp) return 1

  // 2. Next, projects in progress
  const aProg = isInProgress(a)
  const bProg = isInProgress(b)
  if (aProg && !bProg) return -1
  if (!aProg && bProg) return 1

  // 3. Sorted first by the most current year (descending: newest first)
  const yearDiff = extractYear(b.year) - extractYear(a.year)
  if (yearDiff !== 0) return yearDiff

  // 4. And then alphabetically (A-Z)
  const titleDiff = (a.title || '').trim().localeCompare((b.title || '').trim(), undefined, { sensitivity: 'base' })
  if (titleDiff !== 0) return titleDiff

  return (a.order || 0) - (b.order || 0)
}

export const getAllProjects = () => [...getRawProjects()].sort(sortProjects)

export const getPublishedProjects = () =>
  getRawProjects()
    .filter((p) => p.published)
    .sort(sortProjects)

/**
 * Featured projects displayed on the home page:
 * - Only includes published projects chosen by the owner/admin (featured === true).
 * - Sorted according to the owner's chosen order (featuredOrder: 1, 2, 3...).
 * - Falls back to standard sort (status -> year -> title) if order is equal.
 * - If no projects are marked as featured yet, falls back to published projects.
 */
export const getFeaturedProjects = () => {
  const published = getPublishedProjects()
  const featured = published.filter((p) => Boolean(p.featured))

  const pool = featured.length > 0 ? featured : published

  return [...pool].sort((a, b) => {
    const aOrder = a.featuredOrder != null ? Number(a.featuredOrder) : 9999
    const bOrder = b.featuredOrder != null ? Number(b.featuredOrder) : 9999
    if (aOrder !== bOrder) return aOrder - bOrder

    return sortProjects(a, b)
  })
}

export const getProjectBySlug = (slug) =>
  getPublishedProjects().find((p) => p.slug === slug) || null

export const getAdjacentProjects = (slug) => {
  const all = getPublishedProjects()
  const i = all.findIndex((p) => p.slug === slug)
  return all[(i + 1) % all.length] || null
}

export const getFilterOptions = () => {
  const all = getPublishedProjects()
  const counts = (values) =>
    Object.entries(
      values.flat().reduce((a, v) => ((a[v] = (a[v] || 0) + 1), a), {})
    )
      .filter(([, n]) => n >= 2)
      .map(([value]) => value)

  return {
    categories: counts(all.map((p) => [p.category])),
    technologies: counts(
      all.map((p) => [
        ...(p.stack?.frontend || []),
        ...(p.stack?.backend || []),
        ...(p.stack?.databases || []).map((d) => d.name),
        ...(p.stack?.other || []),
      ])
    ),
  }
}

export const getTechUsage = () =>
  getPublishedProjects().reduce((map, p) => {
    const tech = [
      ...(p.stack?.frontend || []),
      ...(p.stack?.backend || []),
      ...(p.stack?.databases || []).map((d) => d.name),
      ...(p.stack?.other || []),
    ]
    tech.forEach((t) => {
      map[t] = [...(map[t] || []), p.slug]
    })
    return map
  }, {})
