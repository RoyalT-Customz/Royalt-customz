import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { db } from './db'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, secret)
    const userId = payload.userId as string

    // Get user from database
    const result = await db.execute({
      sql: 'SELECT id, username, email, first_name, last_name, full_name, phone, avatar_url, bio, role, is_active, is_verified, created_at, last_login, hide_email, hide_phone, hide_full_name FROM users WHERE id = ?',
      args: [userId],
    })

    if (result.rows.length === 0) {
      return null
    }

    return result.rows[0] as any
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}
