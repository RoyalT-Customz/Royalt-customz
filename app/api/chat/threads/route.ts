import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Get thread messages
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')
    const messageId = searchParams.get('messageId')

    if (!threadId && !messageId) {
      return NextResponse.json({ error: 'Thread ID or Message ID is required' }, { status: 400 })
    }

    let sql = `
      SELECT 
        cm.id,
        cm.room_id,
        cm.user_id,
        cm.message,
        cm.reply_to_message_id,
        cm.thread_id,
        cm.created_at,
        u.username,
        u.avatar_url,
        u.first_name,
        u.last_name,
        u.full_name
      FROM chat_messages cm
      INNER JOIN users u ON cm.user_id = u.id
      WHERE cm.deleted = 0
    `
    const args: any[] = []

    if (threadId) {
      sql += ' AND (cm.thread_id = ? OR cm.id = (SELECT parent_message_id FROM message_threads WHERE id = ?))'
      args.push(threadId, threadId)
    } else if (messageId) {
      sql += ' AND (cm.id = ? OR cm.reply_to_message_id = ? OR cm.thread_id = (SELECT id FROM message_threads WHERE parent_message_id = ?))'
      args.push(messageId, messageId, messageId)
    }

    sql += ' ORDER BY cm.created_at ASC'

    const result = await db.execute({ sql, args })

    const messages = result.rows.map((row: any) => ({
      id: row.id,
      roomId: row.room_id,
      userId: row.user_id,
      username: row.username,
      avatarUrl: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username)}&background=CE1141&color=fff&bold=true`,
      displayName: row.full_name || row.first_name || row.username,
      message: row.message,
      replyToMessageId: row.reply_to_message_id,
      threadId: row.thread_id,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('Error fetching thread messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create thread or reply
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, message, roomId, isThreadStart = false } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!messageId && !isThreadStart) {
      return NextResponse.json({ error: 'Message ID is required for replies' }, { status: 400 })
    }

    let threadId: string | null = null

    // Check if thread already exists
    if (messageId) {
      const threadCheck = await db.execute({
        sql: 'SELECT id FROM message_threads WHERE parent_message_id = ?',
        args: [messageId],
      })

      if (threadCheck.rows.length > 0) {
        threadId = (threadCheck.rows[0] as any).id
      } else if (isThreadStart) {
        // Create new thread
        threadId = randomUUID()
        await db.execute({
          sql: 'INSERT INTO message_threads (id, parent_message_id, room_id, created_by) VALUES (?, ?, ?, ?)',
          args: [threadId, messageId, roomId, user.id],
        })
      }
    }

    // Create reply message
    const replyId = randomUUID()
    await db.execute({
      sql: `
        INSERT INTO chat_messages (id, room_id, user_id, message, reply_to_message_id, thread_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [replyId, roomId, user.id, message.trim(), messageId || null, threadId],
    })

    // Update thread updated_at
    if (threadId) {
      await db.execute({
        sql: 'UPDATE message_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        args: [threadId],
      })
    }

    // Get user info
    const userResult = await db.execute({
      sql: 'SELECT username, avatar_url, first_name, last_name, full_name FROM users WHERE id = ?',
      args: [user.id],
    })

    const userData = userResult.rows[0] as any

    const newMessage = {
      id: replyId,
      roomId,
      userId: user.id,
      username: userData.username,
      avatarUrl: userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=CE1141&color=fff&bold=true`,
      displayName: userData.full_name || userData.first_name || userData.username,
      message: message.trim(),
      replyToMessageId: messageId || null,
      threadId,
      createdAt: new Date().toISOString(),
    }

    // Create notification for parent message author
    if (messageId) {
      const parentMsg = await db.execute({
        sql: 'SELECT user_id FROM chat_messages WHERE id = ?',
        args: [messageId],
      })

      if (parentMsg.rows.length > 0 && (parentMsg.rows[0] as any).user_id !== user.id) {
        const notificationId = randomUUID()
        await db.execute({
          sql: 'INSERT INTO chat_notifications (id, user_id, type, message_id, thread_id, from_user_id) VALUES (?, ?, ?, ?, ?, ?)',
          args: [notificationId, (parentMsg.rows[0] as any).user_id, 'reply', replyId, threadId, user.id],
        })
      }
    }

    return NextResponse.json({ message: newMessage, threadId }, { status: 201 })
  } catch (error) {
    console.error('Error creating thread/reply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

