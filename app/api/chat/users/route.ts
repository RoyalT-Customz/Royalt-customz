import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET - Search users (for mentions)
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')

    if (query.length < 1) {
      return NextResponse.json({ users: [] }, { status: 200 })
    }

    const result = await db.execute({
      sql: `
        SELECT 
          id,
          username,
          avatar_url,
          first_name,
          last_name,
          full_name,
          role
        FROM users
        WHERE (username LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR full_name LIKE ?)
          AND id != ?
          AND is_active = 1
        LIMIT ?
      `,
      args: [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, user.id, limit],
    })

    const users = result.rows.map((row: any) => ({
      id: row.id,
      username: row.username,
      avatarUrl: row.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.username)}&background=CE1141&color=fff&bold=true`,
      displayName: row.full_name || row.first_name || row.username,
      role: row.role,
    }))

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error('Error searching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

