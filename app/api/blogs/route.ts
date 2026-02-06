import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET - List published blog posts (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let sql = `
      SELECT 
        bp.*,
        u.username as author_name,
        GROUP_CONCAT(bpt.tag) as tags
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
      WHERE bp.published = 1
    `
    const args: any[] = []

    if (category && category !== 'all') {
      // Note: category filtering would require a category field in blog_posts table
      // For now, we'll filter by tags
      sql += ' AND bpt.tag = ?'
      args.push(category)
    }

    if (search) {
      sql += ' AND (bp.title LIKE ? OR bp.excerpt LIKE ? OR bp.content LIKE ?)'
      const searchTerm = `%${search}%`
      args.push(searchTerm, searchTerm, searchTerm)
    }

    sql += ' GROUP BY bp.id ORDER BY bp.published_at DESC, bp.created_at DESC'

    const result = await db.execute({
      sql,
      args,
    })

    // Transform results
    const posts = result.rows.map((row: any) => ({
      ...row,
      tags: row.tags ? row.tags.split(',') : [],
    }))

    return NextResponse.json({ posts }, { status: 200 })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

