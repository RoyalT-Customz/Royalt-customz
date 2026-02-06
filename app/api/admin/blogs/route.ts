import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - List all blog posts
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')

    let sql = `
      SELECT 
        bp.id,
        bp.title,
        bp.slug,
        bp.content,
        bp.excerpt,
        bp.category,
        bp.author_id,
        bp.image_url,
        bp.featured_image_url,
        bp.published,
        bp.views,
        bp.likes,
        bp.created_at,
        bp.updated_at,
        bp.published_at,
        u.username as author_name,
        GROUP_CONCAT(bpt.tag) as tags
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
      WHERE 1=1
    `
    const args: any[] = []

    if (published !== null) {
      sql += ' AND bp.published = ?'
      args.push(published === 'true' ? 1 : 0)
    }

    sql += ' GROUP BY bp.id ORDER BY bp.created_at DESC'

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

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      image_url,
      featured_image_url,
      published,
      tags,
    } = body

    // Validation
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existingSlug = await db.execute({
      sql: 'SELECT id FROM blog_posts WHERE slug = ?',
      args: [slug],
    })

    if (existingSlug.rows.length > 0) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const postId = randomUUID()
    const publishedAt = published ? new Date().toISOString() : null

    // Create blog post
    await db.execute({
      sql: `INSERT INTO blog_posts (
        id, title, slug, content, excerpt, author_id, image_url, featured_image_url,
        published, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        postId,
        title,
        slug,
        content,
        excerpt || null,
        user.id,
        image_url || null,
        featured_image_url || null,
        published ? 1 : 0,
        publishedAt,
      ],
    })

    // Add tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) {
        const tagId = randomUUID()
        await db.execute({
          sql: 'INSERT INTO blog_post_tags (id, post_id, tag) VALUES (?, ?, ?)',
          args: [tagId, postId, tag],
        })
      }
    }

    // Fetch the created post
    const result = await db.execute({
      sql: `SELECT 
        id, title, slug, content, excerpt, category, author_id, 
        image_url, featured_image_url, published, views, likes, 
        created_at, updated_at, published_at 
      FROM blog_posts WHERE id = ?`,
      args: [postId],
    })

    return NextResponse.json(
      { message: 'Blog post created successfully', post: result.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

