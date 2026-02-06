import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// GET - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await db.execute({
      sql: `
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
        WHERE bp.id = ?
        GROUP BY bp.id
      `,
      args: [params.id],
    })

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    const post = result.rows[0] as any
    post.tags = post.tags ? post.tags.split(',') : []

    return NextResponse.json({ post }, { status: 200 })
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update blog post
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
    const {
      title,
      slug,
      content,
      excerpt,
      image_url,
      featured_image_url,
      published,
      tags,
      published_at,
    } = body

    // Check if post exists
    const existing = await db.execute({
      sql: 'SELECT id FROM blog_posts WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Validation
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Title, slug, and content are required' },
        { status: 400 }
      )
    }

    // Check if slug already exists (excluding current post)
    const existingSlug = await db.execute({
      sql: 'SELECT id FROM blog_posts WHERE slug = ? AND id != ?',
      args: [slug, params.id],
    })

    if (existingSlug.rows.length > 0) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    // Determine published_at
    let finalPublishedAt = published_at
    if (published === 1 && !published_at) {
      // Check if it was previously unpublished
      const currentPost = await db.execute({
        sql: 'SELECT published, published_at FROM blog_posts WHERE id = ?',
        args: [params.id],
      })
      if (currentPost.rows[0] && (currentPost.rows[0] as any).published === 0) {
        finalPublishedAt = new Date().toISOString()
      } else {
        finalPublishedAt = (currentPost.rows[0] as any).published_at || new Date().toISOString()
      }
    } else if (published === 0) {
      finalPublishedAt = null
    }

    // Update blog post
    await db.execute({
      sql: `UPDATE blog_posts SET
        title = ?,
        slug = ?,
        content = ?,
        excerpt = ?,
        image_url = ?,
        featured_image_url = ?,
        published = ?,
        published_at = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      args: [
        title,
        slug,
        content,
        excerpt || null,
        image_url || null,
        featured_image_url || null,
        published ? 1 : 0,
        finalPublishedAt,
        params.id,
      ],
    })

    // Update tags - delete old tags and add new ones
    await db.execute({
      sql: 'DELETE FROM blog_post_tags WHERE post_id = ?',
      args: [params.id],
    })

    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tag of tags) {
        const tagId = randomUUID()
        await db.execute({
          sql: 'INSERT INTO blog_post_tags (id, post_id, tag) VALUES (?, ?, ?)',
          args: [tagId, params.id, tag],
        })
      }
    }

    // Fetch the updated post
    const result = await db.execute({
      sql: `SELECT 
        id, title, slug, content, excerpt, category, author_id, 
        image_url, featured_image_url, published, views, likes, 
        created_at, updated_at, published_at 
      FROM blog_posts WHERE id = ?`,
      args: [params.id],
    })

    return NextResponse.json(
      { message: 'Blog post updated successfully', post: result.rows[0] },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if post exists
    const existing = await db.execute({
      sql: 'SELECT id FROM blog_posts WHERE id = ?',
      args: [params.id],
    })

    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    // Delete tags first (cascade should handle this, but being explicit)
    await db.execute({
      sql: 'DELETE FROM blog_post_tags WHERE post_id = ?',
      args: [params.id],
    })

    // Delete blog post
    await db.execute({
      sql: 'DELETE FROM blog_posts WHERE id = ?',
      args: [params.id],
    })

    return NextResponse.json({ message: 'Blog post deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

