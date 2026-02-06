import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, rememberMe } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ? OR email = ?',
      args: [username, username],
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = result.rows[0] as any

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login (if column exists)
    try {
      await db.execute({
        sql: 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        args: [user.id],
      })
    } catch (error: any) {
      // Ignore if column doesn't exist yet - will be added by migration
      if (!error.message?.includes('no such column')) {
        console.error('Error updating last_login:', error)
      }
    }

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      email: user.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(rememberMe ? '30d' : '7d')
      .sign(secret)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: userWithoutPassword,
      },
      { status: 200 }
    )

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

