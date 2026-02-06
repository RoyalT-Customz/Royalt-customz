import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - List all portfolio items (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    let sql = 'SELECT * FROM portfolio_items WHERE 1=1'
    const args: any[] = []

    if (category && category !== 'all') {
      sql += ' AND category = ?'
      args.push(category)
    }

    if (featured !== null && featured === 'true') {
      sql += ' AND featured = 1'
    }

    sql += ' ORDER BY featured DESC, created_at DESC'

    const result = await db.execute({
      sql,
      args,
    })

    return NextResponse.json({ items: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Error fetching portfolio items:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

