import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// POST - Verify reset code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Reset code is required' },
        { status: 400 }
      )
    }

    // Find valid reset token
    const result = await db.execute({
      sql: `
        SELECT prt.id, prt.user_id, prt.token, prt.expires_at, prt.used, u.username
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
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

    // Code is valid - return user info (but don't mark as used yet - will be marked when password is changed)
    return NextResponse.json(
      {
        valid: true,
        user_id: token.user_id,
        username: token.username,
        expires_at: token.expires_at,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error verifying reset code:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



