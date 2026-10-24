import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'content', 'projects-data.json')
const OWNER_PASSCODE = process.env.OWNER_PASSCODE || 'odeh2025'

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    const projects = JSON.parse(raw)
    return NextResponse.json({ success: true, projects })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { passcode, action, project, slug } = body

    if (passcode !== OWNER_PASSCODE) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid owner passcode' }, { status: 401 })
    }

    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    let projects = JSON.parse(raw)

    if (action === 'delete') {
      projects = projects.filter((p) => p.slug !== slug)
      await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8')
      try {
        revalidatePath('/')
        revalidatePath('/projects')
        if (slug) revalidatePath(`/projects/${slug}`)
      } catch (e) {
        console.error('Revalidate error:', e)
      }
      return NextResponse.json({ success: true, message: 'Project removed successfully' })
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
      const newOrder = projects.length + 1
      const newProject = {
        ...project,
        order: project.order || newOrder,
        published: project.published !== false,
      }
      projects.push(newProject)
    }

    await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8')
    try {
      revalidatePath('/')
      revalidatePath('/projects')
      revalidatePath(`/projects/${project.slug}`)
    } catch (e) {
      console.error('Revalidate error:', e)
    }
    return NextResponse.json({ success: true, message: 'Project saved successfully', project })
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
