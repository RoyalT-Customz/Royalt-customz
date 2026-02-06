import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST - Reset password using reset code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, new_password } = body

    if (!code || !new_password) {
      return NextResponse.json(
        { error: 'Reset code and new password are required' },
        { status: 400 }
      )
    }

    if (new_password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Find valid reset token
    const result = await db.execute({
      sql: `
        SELECT prt.id, prt.user_id, prt.token, prt.expires_at, prt.used
        FROM password_reset_tokens prt
        WHERE prt.token = ? AND prt.used = 0
      `,
      args: [code],
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset code' },
        { status: 404 }
      )
    }

    const token = result.rows[0] as any
    const expiresAt = new Date(token.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      // Mark as used
      await db.execute({
        sql: 'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
        args: [token.id],
      })

      return NextResponse.json(
        { error: 'Reset code has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    // Hash new password
    const bcrypt = (await import('bcryptjs')).default
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update user password
    await db.execute({
      sql: 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [hashedPassword, token.user_id],
    })

    // Mark reset token as used
    await db.execute({
      sql: 'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
      args: [token.id],
    })

    console.log('✅ Password reset successfully:', {
      userId: token.user_id,
    })

    return NextResponse.json(
      {
        message: 'Password reset successfully. You can now log in with your new password.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error resetting password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



