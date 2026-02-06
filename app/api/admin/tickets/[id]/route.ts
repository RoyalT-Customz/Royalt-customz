import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Get single ticket with full details and messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ticketId = params.id

    // Get ticket with user info
    const ticketResult = await db.execute({
      sql: `
        SELECT 
          t.*,
          u.id as user_id,
          u.username,
          u.email,
          u.first_name,
          u.last_name,
          u.full_name,
          u.hide_email,
          u.hide_phone,
          u.hide_full_name
        FROM tickets t
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
      `,
      args: [ticketId],
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
        user: {
          id: ticket.user_id,
          username: ticket.username,
          email: ticket.email,
          first_name: ticket.first_name,
          last_name: ticket.last_name,
          full_name: ticket.full_name,
          hide_email: ticket.hide_email,
          hide_phone: ticket.hide_phone,
          hide_full_name: ticket.hide_full_name,
        },
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

// PUT - Update ticket (status, priority, assign)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ticketId = params.id
    const body = await request.json()
    const { status, priority, assigned_to } = body

    const updates: string[] = []
    const args: any[] = []

    if (status !== undefined) {
      updates.push('status = ?')
      args.push(status)
    }

    if (priority !== undefined) {
      updates.push('priority = ?')
      args.push(priority)
    }

    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?')
      args.push(assigned_to || null)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    args.push(ticketId)

    await db.execute({
      sql: `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    return NextResponse.json(
      { message: 'Ticket updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ticketId = params.id

    // Verify ticket exists
    const ticketResult = await db.execute({
      sql: 'SELECT id FROM tickets WHERE id = ?',
      args: [ticketId],
    })

    if (ticketResult.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Delete ticket (cascade will delete messages)
    await db.execute({
      sql: 'DELETE FROM tickets WHERE id = ?',
      args: [ticketId],
    })

    return NextResponse.json(
      { message: 'Ticket deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add admin message to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Verify ticket exists
    const ticketResult = await db.execute({
      sql: 'SELECT id FROM tickets WHERE id = ?',
      args: [ticketId],
    })

    if (ticketResult.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Create message
    const messageId = randomUUID()
    await db.execute({
      sql: `
        INSERT INTO ticket_messages (id, ticket_id, user_id, message, is_admin, created_at)
        VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
      `,
      args: [messageId, ticketId, user.id, message.trim()],
    })

    // Update ticket updated_at
    await db.execute({
      sql: 'UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [ticketId],
    })

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

