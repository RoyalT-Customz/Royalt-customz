'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  BookOpen,
  X,
  Save,
  Eye,
  EyeOff,
  Calendar,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Filter,
  Upload,
  ExternalLink,
} from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  author_id?: string
  image_url?: string
  featured_image_url?: string
  published: number
  views: number
  likes: number
  created_at: string
  updated_at: string
  published_at?: string
  author_name?: string
  tags?: string[]
}

export default function AdminBlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPublished, setFilterPublished] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image_url: '',
    featured_image_url: '',
    published: false,
    tags: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/blogs')
      if (response.ok) {
        const data = await response.json()
        setPosts(data.posts || [])
      } else {
        setError('Failed to fetch blog posts')
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setError('Error loading blog posts')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleFileUpload = async (file: File, type: 'featured' | 'regular' = 'regular') => {
    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)

      const response = await fetch('/api/admin/products/upload-image', {
        method: 'POST',
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        if (type === 'featured') {
          setFormData((prev) => ({ ...prev, featured_image_url: data.image_url }))
        } else {
          setFormData((prev) => ({ ...prev, image_url: data.image_url }))
        }
        setSuccess('Image uploaded successfully!')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Error uploading image')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent, type: 'featured' | 'regular' = 'regular') => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent, type: 'featured' | 'regular' = 'regular') => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        handleFileUpload(file, type)
      } else {
        setError('Please upload an image file')
      }
    }
  }

  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt || '',
        image_url: post.image_url || '',
        featured_image_url: post.featured_image_url || '',
        published: post.published === 1,
        tags: post.tags?.join(', ') || '',
      })
    } else {
      setEditingPost(null)
      setFormData({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        image_url: '',
        featured_image_url: '',
        published: false,
        tags: '',
      })
    }
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPost(null)
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image_url: '',
      featured_image_url: '',
      published: false,
      tags: '',
    })
    setError('')
    setSuccess('')
  }

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title, slug: editingPost ? formData.slug : generateSlug(title) })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.slug.trim()) {
      setError('Slug is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.content.trim()) {
      setError('Content is required')
      setIsSubmitting(false)
      return
    }

    try {
      const url = editingPost ? `/api/admin/blogs/${editingPost.id}` : '/api/admin/blogs'
      const method = editingPost ? 'PUT' : 'POST'

      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          slug: formData.slug.trim(),
          content: formData.content.trim(),
          excerpt: formData.excerpt.trim() || null,
          image_url: formData.image_url.trim() || null,
          featured_image_url: formData.featured_image_url.trim() || null,
          published: formData.published ? 1 : 0,
          tags: tagsArray,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save blog post')
        setIsSubmitting(false)
        return
      }

      setSuccess(editingPost ? 'Blog post updated successfully!' : 'Blog post created successfully!')
      setTimeout(() => {
        handleCloseModal()
        fetchPosts()
      }, 1500)
    } catch (error) {
      console.error('Error saving blog post:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/blogs/${postId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to delete blog post')
        return
      }

      setSuccess('Blog post deleted successfully!')
      setTimeout(() => {
        fetchPosts()
        setSuccess('')
      }, 1500)
    } catch (error) {
      console.error('Error deleting blog post:', error)
      setError('An error occurred. Please try again.')
    }
  }

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/admin/blogs/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...post,
          published: post.published === 1 ? 0 : 1,
          published_at: post.published === 1 ? null : new Date().toISOString(),
        }),
      })

      if (response.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Error toggling publish status:', error)
      setError('Failed to update publish status')
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPublished =
      filterPublished === 'all' ||
      (filterPublished === 'published' && post.published === 1) ||
      (filterPublished === 'draft' && post.published === 0)
    return matchesSearch && matchesPublished
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Blog <span className="text-primary-500">Management</span>
              </h1>
              <p className="text-gray-400 text-base lg:text-lg">Create, edit, and manage blog posts</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <p className="text-gray-400 text-sm mb-1 font-medium">Total Posts</p>
                <p className="text-3xl lg:text-4xl font-bold text-primary-500">{posts.length}</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
              >
                <Plus size={20} />
                New Blog Post
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 flex items-center gap-3 backdrop-blur-sm">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="hover:text-red-300 transition-colors">
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-800/50 rounded-xl text-green-400 flex items-center gap-3 backdrop-blur-sm">
              <CheckCircle size={20} className="flex-shrink-0" />
              <span className="flex-1">{success}</span>
              <button onClick={() => setSuccess('')} className="hover:text-green-300 transition-colors">
                <X size={18} />
              </button>
            </div>
          )}
        </section>

        {/* Filters */}
        <section className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Posts</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>
        </section>

        {/* Posts List */}
        {filteredPosts.length > 0 ? (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-primary-500/50 transition-all backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-primary-500/10"
              >
                <div className="flex flex-col md:flex-row gap-6 p-6">
                  {/* Image */}
                  <div className="relative w-full md:w-56 h-56 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 group">
                    {post.featured_image_url || post.image_url ? (
                      <Image
                        src={post.featured_image_url || post.image_url || ''}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    {post.published === 1 ? (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                        <CheckCircle size={14} />
                        Published
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-gray-600/80 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                        <Clock size={14} />
                        Draft
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                      )}

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-primary-400" />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye size={14} className="text-primary-400" />
                          <span>{post.views} views</span>
                        </div>
                        {post.author_name && (
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-primary-400" />
                            <span>{post.author_name}</span>
                          </div>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-primary-400" />
                            <span className="line-clamp-1">{post.tags.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700/50">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`px-4 py-2.5 rounded-lg font-medium transition-all inline-flex items-center gap-2 ${
                          post.published === 1
                            ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 hover:border-yellow-600/50'
                            : 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 hover:border-green-600/50'
                        }`}
                      >
                        {post.published === 1 ? <EyeOff size={16} /> : <Eye size={16} />}
                        {post.published === 1 ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => handleOpenModal(post)}
                        className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-600/30 hover:border-blue-600/50 inline-flex items-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      {post.published === 1 && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="px-4 py-2.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border border-primary-600/30 hover:border-primary-600/50 rounded-lg transition-all inline-flex items-center gap-2"
                        >
                          <ExternalLink size={16} />
                          View
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all border border-red-600/30 hover:border-red-600/50"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">No blog posts found</p>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterPublished !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first blog post'}
            </p>
            {!searchQuery && filterPublished === 'all' && (
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
              >
                <Plus size={20} />
                New Blog Post
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        {filteredPosts.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Showing <span className="text-primary-500 font-semibold">{filteredPosts.length}</span>{' '}
              {filteredPosts.length === 1 ? 'post' : 'posts'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 px-6 py-5 flex items-center justify-between backdrop-blur-sm">
              <h2 className="text-2xl lg:text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {editingPost ? 'Edit' : 'New'} <span className="text-primary-500">Blog Post</span>
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="Enter blog post title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="blog-post-slug"
                  />
                  <p className="mt-1 text-xs text-gray-500">URL-friendly version of the title</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all resize-none"
                    placeholder="Brief description of the blog post"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Featured Image URL
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={formData.featured_image_url}
                      onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                    <div
                      onDragEnter={(e) => handleDrag(e, 'featured')}
                      onDragLeave={(e) => handleDrag(e, 'featured')}
                      onDragOver={(e) => handleDrag(e, 'featured')}
                      onDrop={(e) => handleDrop(e, 'featured')}
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                        dragActive
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-700/50 bg-gray-800/30'
                      }`}
                    >
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 mb-2">Drag & drop or click to upload</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], 'featured')
                          }
                        }}
                        className="hidden"
                        id="featured-image-upload"
                      />
                      <label
                        htmlFor="featured-image-upload"
                        className="inline-block px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg cursor-pointer transition-all border border-primary-600/30 hover:border-primary-600/50 text-xs font-medium"
                      >
                        Choose File
                      </label>
                    </div>
                    {formData.featured_image_url && (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-700/50">
                        <Image
                          src={formData.featured_image_url}
                          alt="Featured preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, featured_image_url: '' })}
                          className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                    <div
                      onDragEnter={(e) => handleDrag(e, 'regular')}
                      onDragLeave={(e) => handleDrag(e, 'regular')}
                      onDragOver={(e) => handleDrag(e, 'regular')}
                      onDrop={(e) => handleDrop(e, 'regular')}
                      className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                        dragActive
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-700/50 bg-gray-800/30'
                      }`}
                    >
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-400 mb-2">Drag & drop or click to upload</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], 'regular')
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-block px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg cursor-pointer transition-all border border-primary-600/30 hover:border-primary-600/50 text-xs font-medium"
                      >
                        Choose File
                      </label>
                    </div>
                    {formData.image_url && (
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-700/50">
                        <Image
                          src={formData.image_url}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image_url: '' })}
                          className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="tutorial, guide, tips"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content * (Markdown supported)
                  </label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={15}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all resize-none font-mono text-sm"
                    placeholder="Write your blog post content here... (Markdown supported)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-primary-500/30 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-700 rounded focus:ring-primary-500 bg-gray-800"
                    />
                    <Eye className="w-5 h-5 text-primary-400" />
                    <span className="text-gray-300 font-medium">Publish immediately</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 to-transparent pt-6 pb-4 border-t border-gray-700/50 flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white rounded-xl font-semibold transition-all border border-gray-700/50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                >
                  {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                  <Save size={20} />
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
