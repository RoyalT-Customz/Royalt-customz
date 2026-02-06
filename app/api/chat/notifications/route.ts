import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Get notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    let sql = `
      SELECT 
        cn.id,
        cn.type,
        cn.message_id,
        cn.dm_message_id,
        cn.thread_id,
        cn.from_user_id,
        cn.read,
        cn.created_at,
        u.username,
        u.avatar_url,
        u.first_name,
        u.full_name
      FROM chat_notifications cn
      LEFT JOIN users u ON cn.from_user_id = u.id
      WHERE cn.user_id = ?
    `
    const args: any[] = [user.id]

    if (unreadOnly) {
      sql += ' AND cn.read = 0'
    }

    sql += ' ORDER BY cn.created_at DESC LIMIT 50'

    const result = await db.execute({ sql, args })

    const notifications = result.rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      messageId: row.message_id,
      dmMessageId: row.dm_message_id,
      threadId: row.thread_id,
      fromUser: row.from_user_id ? {
        id: row.from_user_id,
        username: row.username,
        avatarUrl: row.avatar_url,
        displayName: row.full_name || row.first_name || row.username,
      } : null,
      read: row.read === 1,
      createdAt: row.created_at,
    }))

    const unreadCount = notifications.filter(n => !n.read).length

    return NextResponse.json({ notifications, unreadCount }, { status: 200 })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      await db.execute({
        sql: 'UPDATE chat_notifications SET read = 1 WHERE user_id = ?',
        args: [user.id],
      })
    } else if (notificationId) {
      await db.execute({
        sql: 'UPDATE chat_notifications SET read = 1 WHERE id = ? AND user_id = ?',
        args: [notificationId, user.id],
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

