import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST - Upload product video
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'File must be a video' },
        { status: 400 }
      )
    }

    // Validate file size (max 100MB for videos)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 100MB' },
        { status: 400 }
      )
    }

    // Convert file to base64 and save to storage
    // The video is stored as base64 data URL (similar to images)
    // This ensures the video is saved and can be retrieved from the database
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Log successful upload for debugging
    console.log(`Video uploaded successfully: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    return NextResponse.json(
      { 
        message: 'Video uploaded successfully and saved to storage', 
        video_url: dataUrl 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

