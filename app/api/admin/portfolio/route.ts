import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - List all portfolio items
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    let sql = 'SELECT * FROM portfolio_items WHERE 1=1'
    const args: any[] = []

    if (category && category !== 'all') {
      sql += ' AND category = ?'
      args.push(category)
    }

    if (featured !== null) {
      sql += ' AND featured = ?'
      args.push(featured === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await db.execute({
      sql,
      args,
    })

    return NextResponse.json({ items: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new portfolio item
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, image_url, client_name, tags, featured } = body

    // Validation
    if (!title || !image_url || !category) {
      return NextResponse.json(
        { error: 'Title, image URL, and category are required' },
        { status: 400 }
      )
    }

    const itemId = randomUUID()

    await db.execute({
      sql: `INSERT INTO portfolio_items (
        id, title, description, category, image_url, client_name, tags, featured, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        itemId,
        title,
        description || null,
        category,
        image_url,
        client_name || null,
        tags || null,
        featured || 0,
      ],
    })

    // Fetch the created item
    const result = await db.execute({
      sql: 'SELECT * FROM portfolio_items WHERE id = ?',
      args: [itemId],
    })

    return NextResponse.json(
      { message: 'Portfolio item created successfully', item: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating portfolio item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

