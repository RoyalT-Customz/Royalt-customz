import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await db.execute({
      sql: 'SELECT id, username, email, first_name, last_name, full_name, phone, avatar_url, bio, role, is_active, is_verified, last_login, created_at, updated_at FROM users WHERE id = ?',
      args: [params.id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username, email, first_name, last_name, phone, role, is_active, is_verified } = body

    // Check if user exists
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Validation
    if (!username || !email) {
      return NextResponse.json(
        { error: 'Username and email are required' },
        { status: 400 }
      )
    }

    // Check if username or email is already taken by another user
    const duplicateCheck = await db.execute({
      sql: 'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
      args: [username, email, params.id],
    })

    if (duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      )
    }

    // Build full_name from first_name and last_name if provided
    const fullName = first_name && last_name ? `${first_name} ${last_name}`.trim() : null

    await db.execute({
      sql: `UPDATE users SET
        username = ?,
        email = ?,
        first_name = ?,
        last_name = ?,
        full_name = ?,
        phone = ?,
        role = ?,
        is_active = ?,
        is_verified = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      args: [
        username,
        email,
        first_name || null,
        last_name || null,
        fullName,
        phone || null,
        role || 'user',
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        is_verified !== undefined ? (is_verified ? 1 : 0) : 0,
        params.id,
      ],
    })

    // Fetch the updated user
    const result = await db.execute({
      sql: 'SELECT id, username, email, first_name, last_name, full_name, phone, avatar_url, bio, role, is_active, is_verified, last_login, created_at, updated_at FROM users WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json(
      { message: 'User updated successfully', user: result.rows[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Prevent deleting yourself
    if (user.id === params.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existing = await db.execute({
      sql: 'SELECT id, role FROM users WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting the last admin
    const adminCount = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM users WHERE role = ? AND is_active = 1',
      args: ['admin'],
    })

    const existingUser = existing.rows[0] as any
    if (existingUser.role === 'admin' && (adminCount.rows[0] as any).count <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last active admin user' },
        { status: 400 }
      )
    }

    // Delete user (cascade will handle related records)
    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

