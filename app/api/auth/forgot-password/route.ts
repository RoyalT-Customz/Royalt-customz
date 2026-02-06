import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// POST - Request password reset via email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find user by email
    const result = await db.execute({
      sql: 'SELECT id, username, email FROM users WHERE email = ?',
      args: [email],
    })

    if (result.rows.length === 0) {
      // Don't reveal if user exists or not for security
      // Return success regardless
      return NextResponse.json(
        { message: 'If an account exists with that email, a reset link has been sent.' },
        { status: 200 }
      )
    }

    const user = result.rows[0] as any

    // Invalidate any existing unused reset tokens for this user
    await db.execute({
      sql: 'UPDATE password_reset_tokens SET used = 1 WHERE user_id = ? AND used = 0',
      args: [user.id],
    })

    // Generate reset token
    const token = randomUUID()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiry

    // Store reset token
    const tokenId = randomUUID()
    await db.execute({
      sql: `
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used, created_at)
        VALUES (?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
      `,
      args: [tokenId, user.id, token, expiresAt.toISOString()],
    })

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(user.email, user.username, token)

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', {
        userId: user.id,
        username: user.username,
        error: emailResult.error,
      })

      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again later or contact support.' },
        { status: 500 }
      )
    }

    console.log('Password reset email sent:', {
      userId: user.id,
      username: user.username,
    })

    return NextResponse.json(
      { message: 'If an account exists with that email, a reset link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing forgot password:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
