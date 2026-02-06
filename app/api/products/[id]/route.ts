import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - Get single product by ID (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM products WHERE id = ?',
      args: [params.id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const product = result.rows[0] as any

    // Get average rating if reviews table exists (review count removed for now)
    try {
      const reviewsResult = await db.execute({
        sql: `
          SELECT 
            AVG(rating) as avg_rating
          FROM reviews
          WHERE product_id = ?
        `,
        args: [params.id],
      })

      if (reviewsResult.rows.length > 0) {
        const reviewData = reviewsResult.rows[0] as any
        const rating = reviewData.avg_rating ? parseFloat(reviewData.avg_rating) : null
        // Only set if there's an actual rating
        if (rating && rating > 0) {
          product.avg_rating = rating.toFixed(1)
        }
      }
    } catch (error) {
      // Reviews table might not exist or have issues, ignore
    }

    return NextResponse.json({ product }, { status: 200 })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

