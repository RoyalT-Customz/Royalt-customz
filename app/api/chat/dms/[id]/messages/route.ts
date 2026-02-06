import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Get DM messages
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is part of this DM
    const dmCheck = await db.execute({
      sql: 'SELECT user1_id, user2_id FROM direct_messages WHERE id = ?',
      args: [params.id],
    })

    if (dmCheck.rows.length === 0) {
      return NextResponse.json({ error: 'DM not found' }, { status: 404 })
    }

    const dm = dmCheck.rows[0] as any
    if (dm.user1_id !== user.id && dm.user2_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const result = await db.execute({
      sql: `
        SELECT 
          dmm.id,
          dmm.sender_id,
          dmm.message,
          dmm.edited,
          dmm.edited_at,
          dmm.deleted,
          dmm.created_at,
          u.username,
          u.avatar_url,
          u.first_name,
          u.last_name,
          u.full_name
        FROM direct_message_messages dmm
        INNER JOIN users u ON dmm.sender_id = u.id
        WHERE dmm.dm_id = ? AND dmm.deleted = 0
        ORDER BY dmm.created_at DESC
        LIMIT 50
      `,
      args: [params.id],
    })

    const messages = result.rows.map((row: any) => ({
      id: row.id,
      senderId: row.sender_id,
      username: row.username,
      avatarUrl: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username)}&background=CE1141&color=fff&bold=true`,
      displayName: row.full_name || row.first_name || row.username,
      message: row.message,
      edited: row.edited === 1,
      editedAt: row.edited_at,
      deleted: row.deleted === 1,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ messages: messages.reverse() }, { status: 200 })
  } catch (error) {
    console.error('Error fetching DM messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Send DM message
export async function POST(
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

    // Verify user is part of this DM
    const dmCheck = await db.execute({
      sql: 'SELECT user1_id, user2_id FROM direct_messages WHERE id = ?',
      args: [params.id],
    })

    if (dmCheck.rows.length === 0) {
      return NextResponse.json({ error: 'DM not found' }, { status: 404 })
    }

    const dm = dmCheck.rows[0] as any
    if (dm.user1_id !== user.id && dm.user2_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create message
    const messageId = randomUUID()
    await db.execute({
      sql: 'INSERT INTO direct_message_messages (id, dm_id, sender_id, message) VALUES (?, ?, ?, ?)',
      args: [messageId, params.id, user.id, message.trim()],
    })

    // Update last_message_at
    await db.execute({
      sql: 'UPDATE direct_messages SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [params.id],
    })

    // Get user info
    const userResult = await db.execute({
      sql: 'SELECT username, avatar_url, first_name, last_name, full_name FROM users WHERE id = ?',
      args: [user.id],
    })

    const userData = userResult.rows[0] as any

    const newMessage = {
      id: messageId,
      senderId: user.id,
      username: userData.username,
      avatarUrl: userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=CE1141&color=fff&bold=true`,
      displayName: userData.full_name || userData.first_name || userData.username,
      message: message.trim(),
      edited: false,
      editedAt: null,
      deleted: false,
      createdAt: new Date().toISOString(),
    }

    // Create notification for recipient
    const recipientId = dm.user1_id === user.id ? dm.user2_id : dm.user1_id
    const notificationId = randomUUID()
    await db.execute({
      sql: 'INSERT INTO chat_notifications (id, user_id, type, dm_message_id, from_user_id) VALUES (?, ?, ?, ?, ?)',
      args: [notificationId, recipientId, 'dm', messageId, user.id],
    })

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error('Error sending DM message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

