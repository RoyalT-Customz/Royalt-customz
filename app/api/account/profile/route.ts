import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const result = await db.execute({
      sql: `
        SELECT 
          id, username, email, first_name, last_name, full_name, phone,
          avatar_url, bio,
          hide_email, hide_phone, hide_full_name, privacy_level
        FROM users
        WHERE id = ?
      `,
      args: [user.id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: result.rows[0] }, { status: 200 })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      first_name,
      last_name,
      full_name,
      phone,
      bio,
      avatar_url,
      hide_email,
      hide_phone,
      hide_full_name,
      privacy_level,
    } = body

    const updates: string[] = []
    const args: any[] = []
    let hasHideFullName = false
    let hideFullNameValue: any = null

    if (first_name !== undefined) {
      updates.push('first_name = ?')
      args.push(first_name || null)
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?')
      args.push(last_name || null)
    }
    if (full_name !== undefined) {
      updates.push('full_name = ?')
      args.push(full_name || null)
    }
    if (phone !== undefined) {
      updates.push('phone = ?')
      args.push(phone || null)
    }
    if (bio !== undefined) {
      updates.push('bio = ?')
      args.push(bio || null)
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?')
      args.push(avatar_url || null)
    }
    if (hide_email !== undefined) {
      updates.push('hide_email = ?')
      args.push(hide_email ? 1 : 0)
    }
    if (hide_phone !== undefined) {
      updates.push('hide_phone = ?')
      args.push(hide_phone ? 1 : 0)
    }
    if (hide_full_name !== undefined) {
      hasHideFullName = true
      hideFullNameValue = hide_full_name ? 1 : 0
      updates.push('hide_full_name = ?')
      args.push(hideFullNameValue)
    }
    if (privacy_level !== undefined) {
      updates.push('privacy_level = ?')
      args.push(privacy_level)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    args.push(user.id)

    try {
      await db.execute({
        sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        args,
      })
    } catch (error: any) {
      // If hide_full_name column doesn't exist, remove it from updates and retry
      const errorMessage = error?.message || error?.cause?.message || String(error || '')
      if (errorMessage.includes('no such column') && errorMessage.includes('hide_full_name') && hasHideFullName) {
        // Rebuild updates and args without hide_full_name
        const newUpdates: string[] = []
        const newArgs: any[] = []
        
        if (first_name !== undefined) {
          newUpdates.push('first_name = ?')
          newArgs.push(first_name || null)
        }
        if (last_name !== undefined) {
          newUpdates.push('last_name = ?')
          newArgs.push(last_name || null)
        }
        if (full_name !== undefined) {
          newUpdates.push('full_name = ?')
          newArgs.push(full_name || null)
        }
        if (phone !== undefined) {
          newUpdates.push('phone = ?')
          newArgs.push(phone || null)
        }
        if (bio !== undefined) {
          newUpdates.push('bio = ?')
          newArgs.push(bio || null)
        }
        if (avatar_url !== undefined) {
          newUpdates.push('avatar_url = ?')
          newArgs.push(avatar_url || null)
        }
        if (hide_email !== undefined) {
          newUpdates.push('hide_email = ?')
          newArgs.push(hide_email ? 1 : 0)
        }
        if (hide_phone !== undefined) {
          newUpdates.push('hide_phone = ?')
          newArgs.push(hide_phone ? 1 : 0)
        }
        // Skip hide_full_name
        if (privacy_level !== undefined) {
          newUpdates.push('privacy_level = ?')
          newArgs.push(privacy_level)
        }
        
        newUpdates.push('updated_at = CURRENT_TIMESTAMP')
        newArgs.push(user.id)
        
        await db.execute({
          sql: `UPDATE users SET ${newUpdates.join(', ')} WHERE id = ?`,
          args: newArgs,
        })
        console.warn('hide_full_name column not found. Please run migration 009: npm run migrate-009')
      } else {
        throw error
      }
    }

    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

