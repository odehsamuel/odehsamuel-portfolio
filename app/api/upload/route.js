import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const OWNER_PASSCODE = process.env.OWNER_PASSCODE || 'odeh2025'
const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB

const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
])

const EXTENSION_MAP = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/gif': '.gif',
}

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const passcode = formData.get('passcode') || request.headers.get('x-owner-passcode')
    const slug = formData.get('slug') || 'screenshot'

    // Authenticate owner
    if (passcode !== OWNER_PASSCODE) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid owner passcode' },
        { status: 401 }
      )
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'No screenshot file was provided' },
        { status: 400 }
      )
    }

    // Validate MIME type
    const mimeType = file.type?.toLowerCase()
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported file type (${file.type || 'unknown'}). Please upload a PNG, JPG, WEBP, or SVG screenshot.`,
        },
        { status: 400 }
      )
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Screenshot file size exceeds 15MB limit' },
        { status: 400 }
      )
    }

    // Prepare upload directory
    const uploadsDir = path.join(process.cwd(), 'public', 'images', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })

    // Build safe filename
    const originalExt = path.extname(file.name || '').toLowerCase()
    const safeExt = EXTENSION_MAP[mimeType] || originalExt || '.png'
    const safeSlug = String(slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'project'

    const fileName = `${safeSlug}-${Date.now()}${safeExt}`
    const filePath = path.join(uploadsDir, fileName)

    // Save file buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await fs.writeFile(filePath, buffer)

    const publicUrl = `/images/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      message: 'Screenshot uploaded successfully',
      url: publicUrl,
      fileName,
      size: file.size,
    })
  } catch (err) {
    console.error('Failed to upload screenshot:', err)
    return NextResponse.json(
      { success: false, error: `Upload failed: ${err.message}` },
      { status: 500 }
    )
  }
}
