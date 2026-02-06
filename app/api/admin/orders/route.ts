import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - List all orders with user info and order items
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('payment_status')
    const userId = searchParams.get('user_id')

    let sql = `
      SELECT 
        o.id,
        o.user_id,
        o.total,
        o.status,
        o.shipping_address,
        o.billing_address,
        o.payment_method,
        o.payment_status,
        o.created_at,
        o.updated_at,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.full_name,
        u.hide_email,
        u.hide_phone,
        u.hide_full_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `
    const args: any[] = []

    if (status && status !== 'all') {
      sql += ' AND o.status = ?'
      args.push(status)
    }

    if (paymentStatus && paymentStatus !== 'all') {
      sql += ' AND o.payment_status = ?'
      args.push(paymentStatus)
    }

    if (userId) {
      sql += ' AND o.user_id = ?'
      args.push(userId)
    }

    sql += ' ORDER BY o.created_at DESC'

    const result = await db.execute({
      sql,
      args,
    })

    // For each order, get order items
    const orders = await Promise.all(
      result.rows.map(async (row: any) => {
        const itemsResult = await db.execute({
          sql: `
            SELECT 
              oi.id,
              oi.product_id,
              oi.quantity,
              oi.price,
              p.name as product_name,
              p.image_url as product_image
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
          `,
          args: [row.id],
        })

        return {
          id: row.id,
          user_id: row.user_id,
          user: {
            username: row.username,
            email: row.email,
            first_name: row.first_name,
            last_name: row.last_name,
            full_name: row.full_name,
            hide_email: row.hide_email,
            hide_phone: row.hide_phone,
            hide_full_name: row.hide_full_name,
          },
          total: row.total,
          status: row.status,
          shipping_address: row.shipping_address,
          billing_address: row.billing_address,
          payment_method: row.payment_method,
          payment_status: row.payment_status,
          created_at: row.created_at,
          updated_at: row.updated_at,
          items: itemsResult.rows.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            quantity: item.quantity,
            price: item.price,
          })),
        }
      })
    )

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

