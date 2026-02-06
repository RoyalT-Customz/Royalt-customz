import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - List all appointments with user info
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceType = searchParams.get('service_type')
    const userId = searchParams.get('user_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    let sql = `
      SELECT 
        a.id,
        a.user_id,
        a.service_type,
        a.appointment_date,
        a.duration_minutes,
        a.status,
        a.notes,
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
      WHERE 1=1
    `
    const args: any[] = []

    if (status && status !== 'all') {
      sql += ' AND a.status = ?'
      args.push(status)
    }

    if (serviceType && serviceType !== 'all') {
      sql += ' AND a.service_type = ?'
      args.push(serviceType)
    }

    if (userId) {
      sql += ' AND a.user_id = ?'
      args.push(userId)
    }

    if (dateFrom) {
      sql += ' AND DATE(a.appointment_date) >= ?'
      args.push(dateFrom)
    }

    if (dateTo) {
      sql += ' AND DATE(a.appointment_date) <= ?'
      args.push(dateTo)
    }

    sql += ' ORDER BY a.appointment_date ASC'

    const result = await db.execute({
      sql,
      args,
    })

    const appointments = result.rows.map((row: any) => ({
      id: row.id,
      user_id: row.user_id,
      user: {
        username: row.username,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        full_name: row.full_name,
        phone: row.phone,
        hide_email: row.hide_email,
        hide_phone: row.hide_phone,
        hide_full_name: row.hide_full_name,
      },
      service_type: row.service_type,
      appointment_date: row.appointment_date,
      duration_minutes: row.duration_minutes,
      status: row.status,
      notes: row.notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    return NextResponse.json({ appointments }, { status: 200 })
  } catch (error) {
    console.error('Error fetching appointments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

