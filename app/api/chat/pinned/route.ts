import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Get pinned messages for a room
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    const result = await db.execute({
      sql: `
        SELECT 
          pm.id,
          pm.message_id,
          pm.pinned_by,
          pm.created_at,
          cm.message,
          cm.created_at as message_created_at,
          u.username,
          u.avatar_url,
          u.first_name,
          u.full_name
        FROM pinned_messages pm
        INNER JOIN chat_messages cm ON pm.message_id = cm.id
        INNER JOIN users u ON cm.user_id = u.id
        WHERE pm.room_id = ?
        ORDER BY pm.created_at DESC
      `,
      args: [roomId],
    })

    const pinned = result.rows.map((row: any) => ({
      id: row.id,
      messageId: row.message_id,
      message: row.message,
      pinnedBy: row.pinned_by,
      pinnedAt: row.created_at,
      messageCreatedAt: row.message_created_at,
      author: {
        username: row.username,
        avatarUrl: row.avatar_url,
        displayName: row.full_name || row.first_name || row.username,
      },
    }))

    return NextResponse.json({ pinned }, { status: 200 })
  } catch (error) {
    console.error('Error fetching pinned messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Pin a message
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, roomId } = body

    if (!messageId || !roomId) {
      return NextResponse.json({ error: 'Message ID and Room ID are required' }, { status: 400 })
    }

    // Check if already pinned
    const existing = await db.execute({
      sql: 'SELECT id FROM pinned_messages WHERE message_id = ? AND room_id = ?',
      args: [messageId, roomId],
    })

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Message already pinned' }, { status: 400 })
    }

    // Pin message
    const pinId = randomUUID()
    await db.execute({
      sql: 'INSERT INTO pinned_messages (id, message_id, room_id, pinned_by) VALUES (?, ?, ?, ?)',
      args: [pinId, messageId, roomId, user.id],
    })

    return NextResponse.json({ success: true, pinId }, { status: 201 })
  } catch (error) {
    console.error('Error pinning message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Unpin a message
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pinId = searchParams.get('pinId')

    if (!pinId) {
      return NextResponse.json({ error: 'Pin ID is required' }, { status: 400 })
    }

    // Check if user can unpin (must be admin or the one who pinned it)
    const pinCheck = await db.execute({
      sql: 'SELECT pinned_by FROM pinned_messages WHERE id = ?',
      args: [pinId],
    })

    if (pinCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Pin not found' }, { status: 404 })
    }

    const pin = pinCheck.rows[0] as any
    if (pin.pinned_by !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await db.execute({
      sql: 'DELETE FROM pinned_messages WHERE id = ?',
      args: [pinId],
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error unpinning message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

