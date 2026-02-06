import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - List all tickets with user info
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assigned_to')
    const search = searchParams.get('search')

    let sql = `
      SELECT 
        t.id,
        t.subject,
        t.message,
        t.priority,
        t.status,
        t.assigned_to,
        t.created_at,
        t.updated_at,
        u.id as user_id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.full_name,
        u.hide_email,
        u.hide_phone,
        u.hide_full_name,
        (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `
    const args: any[] = []

    if (status && status !== 'all') {
      sql += ' AND t.status = ?'
      args.push(status)
    }

    if (priority && priority !== 'all') {
      sql += ' AND t.priority = ?'
      args.push(priority)
    }

    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'unassigned') {
        sql += ' AND t.assigned_to IS NULL'
      } else {
        sql += ' AND t.assigned_to = ?'
        args.push(assignedTo)
      }
    }

    if (search) {
      sql += ' AND (t.subject LIKE ? OR t.message LIKE ? OR u.username LIKE ?)'
      const searchTerm = `%${search}%`
      args.push(searchTerm, searchTerm, searchTerm)
    }

    sql += ' ORDER BY t.created_at DESC'

    const result = await db.execute({ sql, args })

    const tickets = result.rows.map((row: any) => ({
      id: row.id,
      subject: row.subject,
      message: row.message,
      priority: row.priority,
      status: row.status,
      assigned_to: row.assigned_to,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user: {
        id: row.user_id,
        username: row.username,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        full_name: row.full_name,
        hide_email: row.hide_email,
        hide_phone: row.hide_phone,
        hide_full_name: row.hide_full_name,
      },
      message_count: row.message_count || 0,
    }))

    return NextResponse.json({ tickets }, { status: 200 })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


