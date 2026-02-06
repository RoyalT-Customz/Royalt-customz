import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Get single service
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
      sql: 'SELECT * FROM services WHERE id = ?',
      args: [params.id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ service: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update service
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
    const { name, description, category, icon, duration_minutes, price, active, display_order } = body

    // Check if service exists
    const existing = await db.execute({
      sql: 'SELECT id FROM services WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Validation
    if (!name || !category) {
      return NextResponse.json(
        { error: 'Name and category are required' },
        { status: 400 }
      )
    }

    await db.execute({
      sql: `UPDATE services SET
        name = ?,
        description = ?,
        category = ?,
        icon = ?,
        duration_minutes = ?,
        price = ?,
        active = ?,
        display_order = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      args: [
        name,
        description || null,
        category,
        icon || null,
        duration_minutes || 60,
        price || null,
        active || 1,
        display_order || 0,
        params.id,
      ],
    })

    // Fetch the updated service
    const result = await db.execute({
      sql: 'SELECT * FROM services WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json(
      { message: 'Service updated successfully', service: result.rows[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if service exists
    const existing = await db.execute({
      sql: 'SELECT id FROM services WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // Check if service is used in appointments
    const appointments = await db.execute({
      sql: 'SELECT id FROM appointments WHERE service_type = (SELECT name FROM services WHERE id = ?) LIMIT 1',
      args: [params.id],
    })

    if (appointments.rows.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete service that has been used in appointments. Consider deactivating it instead.' },
        { status: 400 }
      )
    }

    await db.execute({
      sql: 'DELETE FROM services WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

