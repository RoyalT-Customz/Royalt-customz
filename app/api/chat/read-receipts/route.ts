import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// POST - Mark message as read
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

    // Check if receipt already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM message_read_receipts WHERE message_id = ? AND user_id = ?',
      args: [messageId, user.id],
    })

    if (existing.rows.length === 0) {
      // Create read receipt
      const receiptId = randomUUID()
      await db.execute({
        sql: 'INSERT INTO message_read_receipts (id, message_id, user_id, room_id) VALUES (?, ?, ?, ?)',
        args: [receiptId, messageId, user.id, roomId],
      })
    }

    // Update last_read_message_id in chat_room_members
    await db.execute({
      sql: `
        INSERT INTO chat_room_members (id, room_id, user_id, last_read_message_id)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(room_id, user_id) DO UPDATE SET last_read_message_id = ?
      `,
      args: [randomUUID(), roomId, user.id, messageId, messageId],
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error creating read receipt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get read receipts for a message
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const result = await db.execute({
      sql: `
        SELECT 
          mrr.user_id,
          u.username,
          u.avatar_url,
          u.first_name,
          u.full_name,
          mrr.read_at
        FROM message_read_receipts mrr
        INNER JOIN users u ON mrr.user_id = u.id
        WHERE mrr.message_id = ?
        ORDER BY mrr.read_at DESC
      `,
      args: [messageId],
    })

    const receipts = result.rows.map((row: any) => ({
      userId: row.user_id,
      username: row.username,
      avatarUrl: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username)}&background=CE1141&color=fff&bold=true`,
      displayName: row.full_name || row.first_name || row.username,
      readAt: row.read_at,
    }))

    return NextResponse.json({ receipts }, { status: 200 })
  } catch (error) {
    console.error('Error fetching read receipts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

