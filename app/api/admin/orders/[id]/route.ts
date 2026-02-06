import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Get single order with full details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const orderResult = await db.execute({
      sql: `
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
          u.phone
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `,
      args: [params.id],
    })

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderResult.rows[0] as any

    // Get order items
    const itemsResult = await db.execute({
      sql: `
        SELECT 
          oi.id,
          oi.product_id,
          oi.quantity,
          oi.price,
          p.name as product_name,
          p.image_url as product_image,
          p.category as product_category
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `,
      args: [params.id],
    })

    return NextResponse.json(
      {
        order: {
          id: order.id,
          user_id: order.user_id,
          user: {
            username: order.username,
            email: order.email,
            first_name: order.first_name,
            last_name: order.last_name,
            full_name: order.full_name,
            phone: order.phone,
          },
          total: order.total,
          status: order.status,
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          created_at: order.created_at,
          updated_at: order.updated_at,
          items: itemsResult.rows.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_image: item.product_image,
            product_category: item.product_category,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, payment_status } = body

    if (status && !['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, processing, shipped, delivered, or cancelled' },
        { status: 400 }
      )
    }

    if (payment_status && !['pending', 'paid', 'failed', 'refunded'].includes(payment_status)) {
      return NextResponse.json(
        { error: 'Invalid payment status. Must be: pending, paid, failed, or refunded' },
        { status: 400 }
      )
    }

    const updates: string[] = []
    const args: any[] = []

    if (status) {
      updates.push('status = ?')
      args.push(status)
    }

    if (payment_status) {
      updates.push('payment_status = ?')
      args.push(payment_status)
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updates.push('updated_at = CURRENT_TIMESTAMP')
    args.push(params.id)

    await db.execute({
      sql: `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    return NextResponse.json(
      { message: 'Order updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

