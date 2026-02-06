import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - List all services
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    let sql = 'SELECT * FROM services WHERE 1=1'
    const args: any[] = []

    if (category && category !== 'all') {
      sql += ' AND category = ?'
      args.push(category)
    }

    if (active !== null) {
      sql += ' AND active = ?'
      args.push(active === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY display_order ASC, created_at DESC'

    const result = await db.execute({
      sql,
      args,
    })

    return NextResponse.json({ services: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, icon, duration_minutes, price, active, display_order } = body

    // Validation
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    const serviceId = randomUUID()

    await db.execute({
      sql: `INSERT INTO services (
        id, name, description, category, icon, duration_minutes, price, active, display_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        serviceId,
        name,
        description || null,
        category,
        icon || null,
        duration_minutes || 60,
        price || null,
        active || 1,
        display_order || 0,
      ],
    })

    // Fetch the created service
    const result = await db.execute({
      sql: 'SELECT * FROM services WHERE id = ?',
      args: [serviceId],
    })

    return NextResponse.json(
      { message: 'Service created successfully', service: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

