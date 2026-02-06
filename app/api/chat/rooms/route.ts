import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Get all rooms (existing)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get public rooms
    const publicRooms = await db.execute({
      sql: `
        SELECT 
          cr.id,
          cr.name,
          cr.description,
          cr.is_private,
          COUNT(DISTINCT cm.id) as message_count
        FROM chat_rooms cr
        LEFT JOIN chat_messages cm ON cr.id = cm.room_id AND cm.deleted = 0
        WHERE cr.is_private = 0
        GROUP BY cr.id, cr.name, cr.description, cr.is_private
        ORDER BY cr.created_at ASC
      `,
    })

    // Get private rooms user is member of
    const privateRooms = await db.execute({
      sql: `
        SELECT 
          cr.id,
          cr.name,
          cr.description,
          cr.is_private,
          COUNT(DISTINCT cm.id) as message_count
        FROM chat_rooms cr
        INNER JOIN chat_room_members crm ON cr.id = crm.room_id
        LEFT JOIN chat_messages cm ON cr.id = cm.room_id AND cm.deleted = 0
        WHERE cr.is_private = 1 AND crm.user_id = ?
        GROUP BY cr.id, cr.name, cr.description, cr.is_private
        ORDER BY cr.created_at ASC
      `,
      args: [user.id],
    })

    const rooms = [
      ...publicRooms.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isPrivate: row.is_private === 1,
        messageCount: row.message_count || 0,
      })),
      ...privateRooms.rows.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        isPrivate: row.is_private === 1,
        messageCount: row.message_count || 0,
      })),
    ]

    return NextResponse.json({ rooms }, { status: 200 })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new room
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, isPrivate = false } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 })
    }

    if (name.length > 50) {
      return NextResponse.json({ error: 'Room name is too long (max 50 characters)' }, { status: 400 })
    }

    // Check if room name already exists
    const existing = await db.execute({
      sql: 'SELECT id FROM chat_rooms WHERE LOWER(name) = LOWER(?)',
      args: [name.trim()],
    })

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Room name already exists' }, { status: 400 })
    }

    // Create room
    const roomId = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    await db.execute({
      sql: 'INSERT INTO chat_rooms (id, name, description, is_private, created_by) VALUES (?, ?, ?, ?, ?)',
      args: [roomId, name.trim(), description?.trim() || null, isPrivate ? 1 : 0, user.id],
    })

    // If private room, add creator as member
    if (isPrivate) {
      const memberId = randomUUID()
      await db.execute({
        sql: 'INSERT INTO chat_room_members (id, room_id, user_id) VALUES (?, ?, ?)',
        args: [memberId, roomId, user.id],
      })
    }

    return NextResponse.json({
      room: {
        id: roomId,
        name: name.trim(),
        description: description?.trim() || null,
        isPrivate,
        messageCount: 0,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
