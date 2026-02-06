import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - List all users
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const isActive = searchParams.get('is_active')
    const isVerified = searchParams.get('is_verified')

    let sql = 'SELECT id, username, email, first_name, last_name, full_name, phone, avatar_url, bio, role, is_active, is_verified, last_login, hide_email, hide_phone, hide_full_name, created_at, updated_at FROM users WHERE 1=1'
    const args: any[] = []

    // Never return password hashes
    if (role && role !== 'all') {
      sql += ' AND role = ?'
      args.push(role)
    }

    if (isActive !== null) {
      sql += ' AND is_active = ?'
      args.push(isActive === 'true' ? 1 : 0)
    }

    if (isVerified !== null) {
      sql += ' AND is_verified = ?'
      args.push(isVerified === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY created_at DESC'

    let result
    try {
      result = await db.execute({
        sql,
        args,
      })
    } catch (error: any) {
      // Fallback if hide_full_name column doesn't exist yet
      const errorMessage = error?.message || error?.cause?.message || String(error || '')
      if (errorMessage.includes('no such column') && errorMessage.includes('hide_full_name')) {
        sql = 'SELECT id, username, email, first_name, last_name, full_name, phone, avatar_url, bio, role, is_active, is_verified, last_login, hide_email, hide_phone, created_at, updated_at FROM users WHERE 1=1'
        
        if (role && role !== 'all') {
          sql += ' AND role = ?'
        }
        if (isActive !== null) {
          sql += ' AND is_active = ?'
        }
        if (isVerified !== null) {
          sql += ' AND is_verified = ?'
        }
        sql += ' ORDER BY created_at DESC'
        
        result = await db.execute({
          sql,
          args,
        })
        
        // Add default hide_full_name value
        if (result.rows.length > 0) {
          result.rows = result.rows.map((row: any) => ({
            ...row,
            hide_full_name: 1, // Default: hide full name
          }))
        }
      } else {
        throw error
      }
    }

    return NextResponse.json({ users: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

