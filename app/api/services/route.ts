import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - List active services (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let sql = 'SELECT * FROM services WHERE active = 1'
    const args: any[] = []

    if (category && category !== 'all') {
      sql += ' AND category = ?'
      args.push(category)
    }

    sql += ' ORDER BY display_order ASC, name ASC'

    const result = await db.execute({
      sql,
      args,
    })

    return NextResponse.json({ services: result.rows }, { status: 200 })
  } catch (error) {
    console.error('Error fetching services:', error)
    // If services table doesn't exist, return empty array
    return NextResponse.json({ services: [] }, { status: 200 })
  }
}

