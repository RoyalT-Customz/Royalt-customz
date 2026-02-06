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

    // Fetch user's orders
    const ordersResult = await db.execute({
      sql: `
        SELECT 
          id,
          total,
          status,
          payment_status,
          created_at
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
      args: [user.id],
    })

    // For each order, get the first product name
    const orders = await Promise.all(
      ordersResult.rows.map(async (row: any) => {
        // Get first product from order items
        const itemResult = await db.execute({
          sql: `
            SELECT p.name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            LIMIT 1
          `,
          args: [row.id],
        })
        
        const productName = itemResult.rows[0] ? (itemResult.rows[0] as any).name : 'Order'

        return {
          id: row.id,
          total: row.total,
          status: row.status,
          payment_status: row.payment_status,
          date: row.created_at?.split('T')[0] || row.created_at,
          product: productName,
        }
      })
    )

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

