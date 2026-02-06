import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// POST - Add/remove reaction
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, emoji, action = 'toggle' } = body

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'Message ID and emoji are required' }, { status: 400 })
    }

    // Check if reaction exists
    const existing = await db.execute({
      sql: 'SELECT id FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
      args: [messageId, user.id, emoji],
    })

    if (existing.rows.length > 0) {
      // Remove reaction
      await db.execute({
        sql: 'DELETE FROM message_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?',
        args: [messageId, user.id, emoji],
      })
      return NextResponse.json({ action: 'removed' }, { status: 200 })
    } else {
      // Add reaction
      const reactionId = randomUUID()
      await db.execute({
        sql: 'INSERT INTO message_reactions (id, message_id, user_id, emoji) VALUES (?, ?, ?, ?)',
        args: [reactionId, messageId, user.id, emoji],
      })
      return NextResponse.json({ action: 'added', reactionId }, { status: 200 })
    }
  } catch (error) {
    console.error('Error handling reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET - Get reactions for a message
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
          mr.emoji,
          COUNT(*) as count,
          GROUP_CONCAT(u.username) as users
        FROM message_reactions mr
        INNER JOIN users u ON mr.user_id = u.id
        WHERE mr.message_id = ?
        GROUP BY mr.emoji
      `,
      args: [messageId],
    })

    const reactions = result.rows.map((row: any) => ({
      emoji: row.emoji,
      count: row.count,
      users: row.users ? row.users.split(',') : [],
    }))

    return NextResponse.json({ reactions }, { status: 200 })
  } catch (error) {
    console.error('Error fetching reactions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

