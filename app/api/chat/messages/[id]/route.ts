import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PUT - Edit a message
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    // Check if message exists and belongs to user
    const messageResult = await db.execute({
      sql: 'SELECT user_id, room_id FROM chat_messages WHERE id = ? AND deleted = 0',
      args: [params.id],
    })

    if (messageResult.rows.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const msg = messageResult.rows[0] as any

    // Check if user owns the message or is admin
    if (msg.user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update message
    await db.execute({
      sql: 'UPDATE chat_messages SET message = ?, edited = 1, edited_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [message.trim(), params.id],
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error editing message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete a message
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if message exists
    const messageResult = await db.execute({
      sql: 'SELECT user_id, room_id FROM chat_messages WHERE id = ? AND deleted = 0',
      args: [params.id],
    })

    if (messageResult.rows.length === 0) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const msg = messageResult.rows[0] as any

    // Check if user owns the message or is admin
    if (msg.user_id !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Soft delete message
    await db.execute({
      sql: 'UPDATE chat_messages SET deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

