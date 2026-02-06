import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// DELETE - Delete any message (admin/moderator)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const messageId = searchParams.get('messageId')

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // Soft delete message
    await db.execute({
      sql: 'UPDATE chat_messages SET deleted = 1, deleted_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [messageId],
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Mute user
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, action, duration } = body // action: 'mute' or 'unmute', duration in hours

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 })
    }

    if (action === 'mute') {
      const muteUntil = duration
        ? new Date(Date.now() + duration * 60 * 60 * 1000).toISOString()
        : null

      // Check if mute record exists
      const existing = await db.execute({
        sql: 'SELECT id FROM user_mutes WHERE user_id = ? AND muted_by = ?',
        args: [userId, user.id],
      })

      if (existing.rows.length > 0) {
        await db.execute({
          sql: 'UPDATE user_mutes SET muted_until = ?, created_at = CURRENT_TIMESTAMP WHERE user_id = ? AND muted_by = ?',
          args: [muteUntil, userId, user.id],
        })
      } else {
        const muteId = randomUUID()
        await db.execute({
          sql: 'INSERT INTO user_mutes (id, user_id, muted_by, muted_until) VALUES (?, ?, ?, ?)',
          args: [muteId, userId, user.id, muteUntil],
        })
      }
    } else if (action === 'unmute') {
      await db.execute({
        sql: 'DELETE FROM user_mutes WHERE user_id = ?',
        args: [userId],
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error muting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

