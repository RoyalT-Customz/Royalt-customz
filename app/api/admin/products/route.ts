import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - List all products
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isEscrow = searchParams.get('is_escrow')

    let sql = 'SELECT * FROM products WHERE 1=1'
    const args: any[] = []

    if (category && category !== 'all') {
      sql += ' AND category = ?'
      args.push(category)
    }

    if (isEscrow !== null) {
      sql += ' AND is_escrow = ?'
      args.push(isEscrow === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await db.execute({
      sql,
      args,
    })

    return NextResponse.json({ products: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, category, image_url, video_url, is_escrow, tebex_link, key_features, framework_support, technical_details } = body

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

    const productId = randomUUID()

    await db.execute({
      sql: `INSERT INTO products (
        id, name, description, price, category, image_url, video_url, is_escrow, tebex_link, key_features, framework_support, technical_details, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        productId,
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
      ],
    })

    // Fetch the created product
    const result = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [productId],
    })

    return NextResponse.json(
      { message: 'Product created successfully', product: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

