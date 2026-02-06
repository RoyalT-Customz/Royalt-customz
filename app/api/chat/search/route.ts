import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Search messages
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const roomId = searchParams.get('roomId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    let sql = `
      SELECT 
        cm.id,
        cm.room_id,
        cm.user_id,
        cm.message,
        cm.created_at,
        u.username,
        u.avatar_url,
        u.first_name,
        u.last_name,
        u.full_name,
        cr.name as room_name
      FROM chat_messages cm
      INNER JOIN users u ON cm.user_id = u.id
      INNER JOIN chat_rooms cr ON cm.room_id = cr.id
      WHERE cm.deleted = 0 AND cm.message LIKE ?
    `
    const args: any[] = [`%${query}%`]

    if (roomId) {
      sql += ' AND cm.room_id = ?'
      args.push(roomId)
    }

    sql += ' ORDER BY cm.created_at DESC LIMIT ? OFFSET ?'
    args.push(limit, offset)

    const result = await db.execute({ sql, args })

    const messages = result.rows.map((row: any) => ({
      id: row.id,
      roomId: row.room_id,
      roomName: row.room_name,
      userId: row.user_id,
      username: row.username,
      avatarUrl: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username)}&background=DC2626&color=fff&bold=true`,
      displayName: row.full_name || row.first_name || row.username,
      message: row.message,
      createdAt: row.created_at,
    }))

    return NextResponse.json({ messages, count: messages.length }, { status: 200 })
  } catch (error) {
    console.error('Error searching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

