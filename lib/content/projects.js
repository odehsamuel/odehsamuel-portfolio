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

export const getAllProjects = () => getRawProjects()

export const getPublishedProjects = () =>
  getRawProjects()
    .filter((p) => p.published)
    .sort((a, b) => (a.order || 0) - (b.order || 0))

export const getFeaturedProjects = () => {
  const published = getPublishedProjects()

  // Sort: completed projects first, before those in progress
  const sorted = [...published].sort((a, b) => {
    const aCompleted = (a.status || '').toLowerCase() === 'completed'
    const bCompleted = (b.status || '').toLowerCase() === 'completed'

    if (aCompleted && !bCompleted) return -1
    if (!aCompleted && bCompleted) return 1

    // Within the same status, prioritize featured projects if specified
    const aFeatured = Boolean(a.featured)
    const bFeatured = Boolean(b.featured)
    if (aFeatured && !bFeatured) return -1
    if (!aFeatured && bFeatured) return 1

    // Secondary sort: featuredOrder, then general order
    const aOrder = a.featuredOrder ?? a.order ?? 999
    const bOrder = b.featuredOrder ?? b.order ?? 999
    return aOrder - bOrder
  })

  // Selected projects on the home page should contain 3 of the total projects
  return sorted.slice(0, 3)
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
