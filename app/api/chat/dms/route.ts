import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Get all DM conversations
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await db.execute({
      sql: `
        SELECT 
          dm.id,
          dm.user1_id,
          dm.user2_id,
          dm.last_message_at,
          CASE 
            WHEN dm.user1_id = ? THEN u2.id
            ELSE u1.id
          END as other_user_id,
          CASE 
            WHEN dm.user1_id = ? THEN u2.username
            ELSE u1.username
          END as other_username,
          CASE 
            WHEN dm.user1_id = ? THEN u2.avatar_url
            ELSE u1.avatar_url
          END as other_avatar_url,
          CASE 
            WHEN dm.user1_id = ? THEN u2.first_name
            ELSE u1.first_name
          END as other_first_name,
          CASE 
            WHEN dm.user1_id = ? THEN u2.full_name
            ELSE u1.full_name
          END as other_full_name
        FROM direct_messages dm
        INNER JOIN users u1 ON dm.user1_id = u1.id
        INNER JOIN users u2 ON dm.user2_id = u2.id
        WHERE dm.user1_id = ? OR dm.user2_id = ?
        ORDER BY dm.last_message_at DESC
      `,
      args: [user.id, user.id, user.id, user.id, user.id, user.id, user.id],
    })

    const dms = result.rows.map((row: any) => ({
      id: row.id,
      otherUser: {
        id: row.other_user_id,
        username: row.other_username,
        avatarUrl: row.other_avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.other_username)}&background=CE1141&color=fff&bold=true`,
        displayName: row.other_full_name || row.other_first_name || row.other_username,
      },
      lastMessageAt: row.last_message_at,
    }))

    return NextResponse.json({ dms }, { status: 200 })
  } catch (error) {
    console.error('Error fetching DMs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create or get DM conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId } = body

    if (!userId || userId === user.id) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Check if DM already exists
    const existing = await db.execute({
      sql: `
        SELECT id FROM direct_messages 
        WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
      `,
      args: [user.id, userId, userId, user.id],
    })

    if (existing.rows.length > 0) {
      return NextResponse.json({ dmId: (existing.rows[0] as any).id }, { status: 200 })
    }

    // Create new DM
    const dmId = randomUUID()
    await db.execute({
      sql: 'INSERT INTO direct_messages (id, user1_id, user2_id) VALUES (?, ?, ?)',
      args: [dmId, user.id, userId],
    })

    return NextResponse.json({ dmId }, { status: 201 })
  } catch (error) {
    console.error('Error creating DM:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

