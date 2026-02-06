import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Get single appointment with full details
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
      sql: `
        SELECT 
          a.id,
          a.user_id,
          a.service_type,
          a.appointment_date,
          a.duration_minutes,
          a.status,
          a.notes,
          a.location,
          a.created_at,
          a.updated_at,
             u.username,
             u.email,
             u.first_name,
             u.last_name,
             u.full_name,
             u.phone,
             u.hide_email,
             u.hide_phone,
             u.hide_full_name
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.id = ?
      `,
      args: [params.id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const appointment = result.rows[0] as any

    return NextResponse.json(
      {
        appointment: {
          id: appointment.id,
          user_id: appointment.user_id,
             user: {
               username: appointment.username,
               email: appointment.email,
               first_name: appointment.first_name,
               last_name: appointment.last_name,
               full_name: appointment.full_name,
               phone: appointment.phone,
               hide_email: appointment.hide_email,
               hide_phone: appointment.hide_phone,
               hide_full_name: appointment.hide_full_name,
             },
          service_type: appointment.service_type,
          appointment_date: appointment.appointment_date,
          duration_minutes: appointment.duration_minutes,
          status: appointment.status,
          notes: appointment.notes,
          location: appointment.location,
          created_at: appointment.created_at,
          updated_at: appointment.updated_at,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update appointment status or details
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
    const { status, service_type, appointment_date, duration_minutes, notes, location } = body

    if (status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, confirmed, completed, or cancelled' },
        { status: 400 }
      )
    }

    const updates: string[] = []
    const args: any[] = []

    if (status) {
      updates.push('status = ?')
      args.push(status)
    }

    if (service_type) {
      updates.push('service_type = ?')
      args.push(service_type)
    }

    if (appointment_date) {
      updates.push('appointment_date = ?')
      args.push(appointment_date)
    }

    if (duration_minutes !== undefined) {
      updates.push('duration_minutes = ?')
      args.push(duration_minutes)
    }

    if (notes !== undefined) {
      updates.push('notes = ?')
      args.push(notes)
    }

    if (location !== undefined) {
      updates.push('location = ?')
      args.push(location)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    args.push(params.id)

    await db.execute({
      sql: `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    return NextResponse.json(
      { message: 'Appointment updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.execute({
      sql: 'DELETE FROM appointments WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json(
      { message: 'Appointment deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

