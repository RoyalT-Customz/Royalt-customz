import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch user's appointments
    const appointmentsResult = await db.execute({
      sql: `
        SELECT 
          id,
          service_type,
          appointment_date,
          duration_minutes,
          status,
          notes,
          created_at
        FROM appointments
        WHERE user_id = ?
        ORDER BY appointment_date ASC
      `,
      args: [user.id],
    })

    const appointments = appointmentsResult.rows.map((row: any) => ({
      id: row.id,
      service: row.service_type,
      date: row.appointment_date?.split('T')[0] || '',
      time: row.appointment_date ? new Date(row.appointment_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
      status: row.status,
      notes: row.notes,
      duration: row.duration_minutes,
    }))

    return NextResponse.json({ appointments }, { status: 200 })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { service_type, appointment_date, duration_minutes, notes, location } = body

    // Validation
    if (!service_type || !appointment_date) {
      return NextResponse.json(
        { error: 'Service type and appointment date are required' },
        { status: 400 }
      )
    }

    // Check for conflicts
    const appointmentDateTime = new Date(appointment_date)
    const endTime = new Date(appointmentDateTime.getTime() + (duration_minutes || 60) * 60000)

    const conflicts = await db.execute({
      sql: `
        SELECT id FROM appointments
        WHERE status != 'cancelled'
        AND appointment_date >= ?
        AND appointment_date < ?
      `,
      args: [appointmentDateTime.toISOString(), endTime.toISOString()],
    })

    if (conflicts.rows.length > 0) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another time.' },
        { status: 409 }
      )
    }

    const appointmentId = randomUUID()

    // Create appointment
    await db.execute({
      sql: `
        INSERT INTO appointments (
          id, user_id, service_type, appointment_date, duration_minutes, status, notes, location, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      args: [
        appointmentId,
        user.id,
        service_type,
        appointmentDateTime.toISOString(),
        duration_minutes || 60,
        notes || null,
        location || null,
      ],
    })

    // Fetch the created appointment
    const result = await db.execute({
      sql: `
        SELECT 
          id,
          service_type,
          appointment_date,
          duration_minutes,
          status,
          notes,
          created_at
        FROM appointments
        WHERE id = ?
      `,
      args: [appointmentId],
    })

    const appointment = result.rows[0] as any

    return NextResponse.json(
      {
        message: 'Appointment created successfully',
        appointment: {
          id: appointment.id,
          service: appointment.service_type,
          date: appointment.appointment_date?.split('T')[0] || '',
          time: appointment.appointment_date ? new Date(appointment.appointment_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
          status: appointment.status,
          notes: appointment.notes,
          duration: appointment.duration_minutes,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating appointment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

