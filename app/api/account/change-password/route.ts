import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { current_password, new_password } = body

    if (!current_password || !new_password) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Get current password hash
    const result = await db.execute({
      sql: 'SELECT password FROM users WHERE id = ?',
      args: [user.id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const currentPasswordHash = (result.rows[0] as any).password

    // Verify current password
    const isValid = await bcrypt.compare(current_password, currentPasswordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update password
    await db.execute({
      sql: 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [hashedPassword, user.id],
    })

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error changing password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

