import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get order count
    const ordersResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
      args: [user.id],
    })
    const totalOrders = (ordersResult.rows[0] as any)?.count || 0

    // Get appointment count
    const appointmentsResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM appointments WHERE user_id = ?',
      args: [user.id],
    })
    const appointments = (appointmentsResult.rows[0] as any)?.count || 0

    // Get active tickets count
    const ticketsResult = await db.execute({
      sql: "SELECT COUNT(*) as count FROM tickets WHERE user_id = ? AND status IN ('open', 'pending')",
      args: [user.id],
    })
    const activeTickets = (ticketsResult.rows[0] as any)?.count || 0

    // Get reviews count
    const reviewsResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM reviews WHERE user_id = ?',
      args: [user.id],
    })
    const reviews = (reviewsResult.rows[0] as any)?.count || 0

    return NextResponse.json(
      {
        totalOrders,
        appointments,
        activeTickets,
        reviews,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

