import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - List all products (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isEscrow = searchParams.get('is_escrow')

    let sql = 'SELECT * FROM products WHERE 1=1'
    const args: any[] = []

    if (category && category !== 'all') {
      sql += ' AND category = ?'
      args.push(category)
    }

    if (isEscrow !== null) {
      sql += ' AND is_escrow = ?'
      args.push(isEscrow === 'true' ? 1 : 0)
    }

    sql += ' ORDER BY created_at DESC'

    const result = await db.execute({
      sql,
      args,
    })

    return NextResponse.json({ products: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

