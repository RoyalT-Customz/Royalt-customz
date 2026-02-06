import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password, rememberMe, firstName, lastName } = body

    // Validate input
    if (!firstName || !lastName || !username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      )
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ? OR email = ?',
      args: [username, email],
    })

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    // Note: hide_full_name is set to 1 by default - only username is shown
    // Users can update their privacy settings later if they want to show their full name
    const userId = randomUUID()
    
    await db.execute({
      sql: 'INSERT INTO users (id, username, email, password, first_name, last_name, hide_full_name) VALUES (?, ?, ?, ?, ?, ?, 1)',
      args: [userId, username, email, hashedPassword, firstName, lastName],
    })

    // Get the created user
    const userResult = await db.execute({
      sql: 'SELECT id, username, email, first_name, last_name, full_name, phone, avatar_url, bio, role, is_active, is_verified, last_login, created_at FROM users WHERE id = ?',
      args: [userId],
    })

    const user = userResult.rows[0] as any

    // Create JWT token (auto-login after registration)
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'user',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(rememberMe ? '30d' : '7d')
      .sign(secret)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    )

    // Set HTTP-only cookie (auto-login)
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

