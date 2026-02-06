import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Fetch messages for a room
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId') || 'general'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch messages
    const result = await db.execute({
      sql: `
        SELECT 
          cm.id,
          cm.room_id,
          cm.user_id,
          cm.message,
          cm.edited,
          cm.edited_at,
          cm.deleted,
          cm.created_at,
          u.username,
          u.avatar_url,
          u.first_name,
          u.last_name,
          u.full_name
        FROM chat_messages cm
        INNER JOIN users u ON cm.user_id = u.id
        WHERE cm.room_id = ? AND cm.deleted = 0
        ORDER BY cm.created_at DESC
        LIMIT ? OFFSET ?
      `,
      args: [roomId, limit, offset],
    })

    const messages = result.rows.map((row: any) => ({
      id: row.id,
      roomId: row.room_id,
      userId: row.user_id,
      username: row.username,
      avatarUrl: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username)}&background=DC2626&color=fff&bold=true`,
      displayName: row.full_name || row.first_name || row.username,
      message: row.message,
      edited: row.edited === 1,
      editedAt: row.edited_at,
      deleted: row.deleted === 1,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ messages: messages.reverse() }, { status: 200 })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roomId = 'general', message, attachments = [], threadId = null } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message is too long (max 2000 characters)' }, { status: 400 })
    }

    // Check if room exists
    const roomResult = await db.execute({
      sql: 'SELECT id, is_private FROM chat_rooms WHERE id = ?',
      args: [roomId],
    })

    if (roomResult.rows.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const room = roomResult.rows[0] as any

    // If private room, check if user is a member
    if (room.is_private === 1) {
      const memberResult = await db.execute({
        sql: 'SELECT id FROM chat_room_members WHERE room_id = ? AND user_id = ?',
        args: [roomId, user.id],
      })

      if (memberResult.rows.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Create message
    const messageId = randomUUID()
    await db.execute({
      sql: `
        INSERT INTO chat_messages (id, room_id, user_id, message, thread_id)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [messageId, roomId, user.id, message.trim(), threadId],
    })

    // Handle mentions
    const { extractMentions } = await import('@/lib/chat-utils')
    const mentions = extractMentions(message)
    if (mentions.length > 0) {
      // Get mentioned users
      const placeholders = mentions.map(() => '?').join(',')
      const usersResult = await db.execute({
        sql: `SELECT id, username FROM users WHERE username IN (${placeholders})`,
        args: mentions,
      })

      // Create mention records
      for (const mentionedUser of usersResult.rows) {
        const mentionId = randomUUID()
        await db.execute({
          sql: 'INSERT INTO message_mentions (id, message_id, mentioned_user_id) VALUES (?, ?, ?)',
          args: [mentionId, messageId, (mentionedUser as any).id],
        })

        // Create notification
        const notificationId = randomUUID()
        await db.execute({
          sql: 'INSERT INTO chat_notifications (id, user_id, type, message_id, from_user_id) VALUES (?, ?, ?, ?, ?)',
          args: [notificationId, (mentionedUser as any).id, 'mention', messageId, user.id],
        })
      }
    }

    // Handle attachments
    if (attachments && attachments.length > 0) {
      for (const attachment of attachments) {
        const attachmentId = randomUUID()
        await db.execute({
          sql: 'INSERT INTO message_attachments (id, message_id, file_name, file_url, file_type, file_size) VALUES (?, ?, ?, ?, ?, ?)',
          args: [attachmentId, messageId, attachment.name, attachment.url, attachment.type, attachment.size],
        })
      }
    }

    // Get user info for response
    const userResult = await db.execute({
      sql: 'SELECT username, avatar_url, first_name, last_name, full_name FROM users WHERE id = ?',
      args: [user.id],
    })

    const userData = userResult.rows[0] as any

    const newMessage = {
      id: messageId,
      roomId,
      userId: user.id,
      username: userData.username,
      avatarUrl: userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=DC2626&color=fff&bold=true`,
      displayName: userData.full_name || userData.first_name || userData.username,
      message: message.trim(),
      edited: false,
      editedAt: null,
      deleted: false,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({ message: newMessage }, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

