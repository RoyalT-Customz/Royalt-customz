import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Fetch user's tickets
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch user's tickets with message count
    const ticketsResult = await db.execute({
      sql: `
        SELECT 
          t.id,
          t.subject,
          t.message,
          t.priority,
          t.status,
          t.created_at,
          t.updated_at,
          (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count
        FROM tickets t
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
      `,
      args: [user.id],
    })

    const tickets = ticketsResult.rows.map((row: any) => ({
      id: row.id,
      subject: row.subject,
      message: row.message,
      priority: row.priority,
      status: row.status,
      date: row.created_at?.split('T')[0] || '',
      updated_at: row.updated_at,
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

// POST - Create new ticket
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
    const { subject, message, priority } = body

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      )
    }

    const ticketId = randomUUID()

    // Create ticket
    await db.execute({
      sql: `
        INSERT INTO tickets (id, user_id, subject, message, priority, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'open', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      args: [
        ticketId,
        user.id,
        subject.trim(),
        message.trim(),
        priority || 'medium',
      ],
    })

    // Create initial message
    const messageId = randomUUID()
    await db.execute({
      sql: `
        INSERT INTO ticket_messages (id, ticket_id, user_id, message, is_admin, created_at)
        VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
      `,
      args: [messageId, ticketId, user.id, message.trim()],
    })

    // Fetch the created ticket
    const result = await db.execute({
      sql: 'SELECT * FROM tickets WHERE id = ?',
      args: [ticketId],
    })

    const ticket = result.rows[0] as any

    return NextResponse.json(
      {
        message: 'Ticket created successfully',
        ticket: {
          id: ticket.id,
          subject: ticket.subject,
          message: ticket.message,
          priority: ticket.priority,
          status: ticket.status,
          date: ticket.created_at?.split('T')[0] || '',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

