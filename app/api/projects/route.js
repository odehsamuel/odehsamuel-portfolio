import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'content', 'projects-data.json')
const OWNER_PASSCODE = process.env.OWNER_PASSCODE || 'odeh2025'

const extractYear = (val) => {
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

const sortProjects = (a, b) => {
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

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const projects = JSON.parse(raw)
    projects.sort(sortProjects)
    return NextResponse.json({ success: true, projects })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { passcode, action, project, slug, items } = body

    if (passcode !== OWNER_PASSCODE) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid owner passcode' }, { status: 401 })
    }

    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    let projects = JSON.parse(raw)

    if (action === 'delete') {
      projects = projects.filter((p) => p.slug !== slug)
      projects.sort(sortProjects)
      projects.forEach((p, idx) => {
        p.order = idx + 1
      })
      await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8')
      try {
        revalidatePath('/')
        revalidatePath('/projects')
        if (slug) revalidatePath(`/projects/${slug}`)
      } catch (e) {
        console.error('Revalidate error:', e)
      }
      return NextResponse.json({ success: true, message: 'Project removed successfully', projects })
    }

    // Action to batch update home page featured selection and orders
    if (action === 'updateHomePage' || action === 'reorderFeatured') {
      if (Array.isArray(items)) {
        items.forEach((item) => {
          const p = projects.find((proj) => proj.slug === item.slug)
          if (p) {
            p.featured = Boolean(item.featured)
            if (item.featuredOrder !== undefined) {
              p.featuredOrder = Number(item.featuredOrder)
            }
          }
        })

        projects.sort(sortProjects)
        projects.forEach((p, idx) => {
          p.order = idx + 1
        })

        await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8')
        try {
          revalidatePath('/')
          revalidatePath('/projects')
        } catch (e) {
          console.error('Revalidate error:', e)
        }
        return NextResponse.json({ success: true, message: 'Home page projects updated successfully', projects })
      }
    }

    if (!project || !project.title || !project.slug) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 })
    }

    // Check if project exists (update) or is new (insert)
    const existingIndex = projects.findIndex((p) => p.slug === project.slug)

    if (existingIndex >= 0) {
      projects[existingIndex] = {
        ...projects[existingIndex],
        ...project,
      }
    } else {
      const newProject = {
        ...project,
        published: project.published !== false,
      }
      projects.push(newProject)
    }

    // Sort projects: completed first, then year (newest first), then alphabetical
    projects.sort(sortProjects)
    projects.forEach((p, idx) => {
      p.order = idx + 1
    })

    await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8')
    try {
      revalidatePath('/')
      revalidatePath('/projects')
      revalidatePath(`/projects/${project.slug}`)
    } catch (e) {
      console.error('Revalidate error:', e)
    }
    return NextResponse.json({ success: true, message: 'Project saved successfully', project, projects })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
