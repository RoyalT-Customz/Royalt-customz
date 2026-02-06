import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Get single product
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
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [params.id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update product
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
    const { name, description, price, category, image_url, video_url, is_escrow, tebex_link, key_features, framework_support, technical_details } = body

    // Check if product exists
    const existing = await db.execute({
      sql: 'SELECT id FROM products WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Validation
    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 })
    }

    if (parseFloat(price) <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 })
    }

    if (is_escrow === 1 && !tebex_link) {
      return NextResponse.json({ error: 'Tebex link is required for escrow items' }, { status: 400 })
    }

    await db.execute({
      sql: `UPDATE products SET
        name = ?,
        description = ?,
        price = ?,
        category = ?,
        image_url = ?,
        video_url = ?,
        is_escrow = ?,
        tebex_link = ?,
        key_features = ?,
        framework_support = ?,
        technical_details = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      args: [
        name,
        description || null,
        parseFloat(price),
        category,
        image_url || null,
        video_url || null,
        is_escrow || 0,
        tebex_link || null,
        key_features || null,
        framework_support || null,
        technical_details || null,
        params.id,
      ],
    })

    // Fetch the updated product
    const result = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json(
      { message: 'Product updated successfully', product: result.rows[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if product exists
    const existing = await db.execute({
      sql: 'SELECT id FROM products WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product is in any orders
    const orderItems = await db.execute({
      sql: 'SELECT id FROM order_items WHERE product_id = ? LIMIT 1',
      args: [params.id],
    })

    if (orderItems.rows.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product that has been ordered. Consider marking it as out of stock instead.' },
        { status: 400 }
      )
    }

    await db.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

