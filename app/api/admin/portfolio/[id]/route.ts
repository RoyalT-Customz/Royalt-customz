import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Get single portfolio item
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await db.execute({
      sql: 'SELECT * FROM portfolio_items WHERE id = ?',
      args: [params.id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    return NextResponse.json({ item: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Error fetching portfolio item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update portfolio item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, image_url, client_name, tags, featured } = body

    // Check if item exists
    const existing = await db.execute({
      sql: 'SELECT id FROM portfolio_items WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    // Validation
    if (!title || !image_url || !category) {
      return NextResponse.json(
        { error: 'Title, image URL, and category are required' },
        { status: 400 }
      )
    }

    await db.execute({
      sql: `UPDATE portfolio_items SET
        title = ?,
        description = ?,
        category = ?,
        image_url = ?,
        client_name = ?,
        tags = ?,
        featured = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      args: [
        title,
        description || null,
        category,
        image_url,
        client_name || null,
        tags || null,
        featured || 0,
        params.id,
      ],
    })

    // Fetch the updated item
    const result = await db.execute({
      sql: 'SELECT * FROM portfolio_items WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json(
      { message: 'Portfolio item updated successfully', item: result.rows[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating portfolio item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete portfolio item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if item exists
    const existing = await db.execute({
      sql: 'SELECT id FROM portfolio_items WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Portfolio item not found' }, { status: 404 })
    }

    await db.execute({
      sql: 'DELETE FROM portfolio_items WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json({ message: 'Portfolio item deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting portfolio item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

