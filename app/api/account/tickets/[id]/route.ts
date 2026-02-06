import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Get single ticket with messages (user's own tickets only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const ticketId = params.id

    // Get ticket (only if it belongs to the user)
    const ticketResult = await db.execute({
      sql: 'SELECT * FROM tickets WHERE id = ? AND user_id = ?',
      args: [ticketId, user.id],
    })

    if (ticketResult.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const ticket = ticketResult.rows[0] as any

    // Get all messages for this ticket
    const messagesResult = await db.execute({
      sql: `
        SELECT 
          tm.*,
          u.username,
          u.first_name,
          u.last_name,
          u.role
        FROM ticket_messages tm
        LEFT JOIN users u ON tm.user_id = u.id
        WHERE tm.ticket_id = ?
        ORDER BY tm.created_at ASC
      `,
      args: [ticketId],
    })

    const messages = messagesResult.rows.map((row: any) => ({
      id: row.id,
      message: row.message,
      is_admin: row.is_admin === 1,
      created_at: row.created_at,
      user: {
        username: row.username,
        first_name: row.first_name,
        last_name: row.last_name,
        role: row.role,
      },
    }))

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        message: ticket.message,
        priority: ticket.priority,
        status: ticket.status,
        assigned_to: ticket.assigned_to,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
      },
      messages,
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add user message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const ticketId = params.id
    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Verify ticket exists and belongs to user
    const ticketResult = await db.execute({
      sql: 'SELECT id, status FROM tickets WHERE id = ? AND user_id = ?',
      args: [ticketId, user.id],
    })

    if (ticketResult.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const ticket = ticketResult.rows[0] as any

    // Don't allow messages on closed tickets
    if (ticket.status === 'closed') {
      return NextResponse.json(
        { error: 'Cannot add messages to closed tickets' },
        { status: 400 }
      )
    }

    // Create message
    const messageId = randomUUID()
    await db.execute({
      sql: `
        INSERT INTO ticket_messages (id, ticket_id, user_id, message, is_admin, created_at)
        VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
      `,
      args: [messageId, ticketId, user.id, message.trim()],
    })

    // Update ticket updated_at and reopen if closed
    if (ticket.status === 'closed') {
      await db.execute({
        sql: 'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: ['open', ticketId],
      })
    } else {
      await db.execute({
        sql: 'UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [ticketId],
      })
    }

    return NextResponse.json(
      { message: 'Message added successfully', messageId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error adding message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


