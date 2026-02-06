'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight, Clock, User, Search, Filter, BookOpen, CheckCircle } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  excerpt?: string
  date: string
  category?: string
  image?: string
  author?: string
  readTime?: string
  slug?: string
  published_at?: string
  created_at?: string
  tags?: string[]
}

export default function Blog() {
  const [mounted, setMounted] = useState(false)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    setIsLoading(true)
    try {
      const url = new URL('/api/blogs', window.location.origin)
      if (searchQuery) {
        url.searchParams.set('search', searchQuery)
      }
      if (selectedCategory && selectedCategory !== 'all') {
        url.searchParams.set('category', selectedCategory)
      }

      const response = await fetch(url.toString())
      if (response.ok) {
        const data = await response.json()
        // Transform database posts to match BlogPost interface
        const transformedPosts: BlogPost[] = (data.posts || []).map((p: any) => {
          const date = p.published_at || p.created_at || new Date().toISOString()
          // Calculate read time (rough estimate: 200 words per minute)
          const wordCount = p.content ? p.content.split(/\s+/).length : 0
          const readTime = Math.ceil(wordCount / 200)
          
          return {
            id: p.id,
            title: p.title,
            excerpt: p.excerpt || p.content?.substring(0, 150) + '...' || '',
            date: date.split('T')[0],
            category: p.tags && p.tags.length > 0 ? p.tags[0] : 'General',
            image: p.featured_image_url || p.image_url || undefined,
            author: p.author_name || 'RoyalT Team',
            readTime: `${readTime} min read`,
            slug: p.slug,
            published_at: p.published_at,
            created_at: p.created_at,
            tags: p.tags || [],
          }
        })
        setBlogPosts(transformedPosts)
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchBlogPosts()
    }
  }, [searchQuery, selectedCategory, mounted])

  // Use only database posts - no mock data
  const displayPosts = blogPosts

  // Get categories from tags
  const allCategories = displayPosts.flatMap((post) => post.tags || [])
  const categories = ['all', ...Array.from(new Set(allCategories))]

  const filteredPosts = displayPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory =
      selectedCategory === 'all' ||
      (post.tags && post.tags.includes(selectedCategory)) ||
      post.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1),transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className={`inline-block mb-6 transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.2s' }}
            >
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                Blog
              </span>
            </div>
            <h1
              className={`text-6xl md:text-8xl font-bold mb-6 leading-tight transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.4s' }}
            >
              <span className="text-white">BLOG</span>
            </h1>
            <p
              className={`text-xl md:text-2xl text-gray-300 leading-relaxed transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.6s' }}
            >
              Stay updated with the latest guides, tutorials, and industry insights from RoyalT
              Customz.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-900/50 border-y border-gray-800 sticky top-20 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full lg:w-96 pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all
                      ${
                        selectedCategory === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700'
                      }
                    `}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <section className="py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-primary-600/20 border border-primary-500/50 rounded-full text-primary-400 text-sm font-medium">
                Featured
              </span>
            </div>
            <Link
              href={filteredPosts[0].slug ? `/blog/${filteredPosts[0].slug}` : `/blog/${filteredPosts[0].id}`}
              className="group block bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10"
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative aspect-video md:aspect-auto bg-gradient-to-br from-gray-700 to-gray-800">
                  {filteredPosts[0].image ? (
                    <Image
                      src={filteredPosts[0].image}
                      alt={filteredPosts[0].title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-24 h-24 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <span className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-xs font-semibold">
                      {filteredPosts[0].category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {filteredPosts[0].date}
                    </span>
                    {filteredPosts[0].readTime && (
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {filteredPosts[0].readTime}
                      </span>
                    )}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary-500 transition-colors text-white">
                    {filteredPosts[0].title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                    {filteredPosts[0].excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    {filteredPosts[0].author && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <User size={16} />
                        <span className="text-sm">{filteredPosts[0].author}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-primary-500 font-semibold group-hover:gap-3 transition-all">
                      <span>Read Article</span>
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="py-20 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
              <p className="text-xl text-gray-400">Loading blog posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-400 mb-4">
                {searchQuery || selectedCategory !== 'all' ? 'No articles found' : 'No blog posts available yet'}
              </p>
              <p className="text-gray-500 mb-6">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Blog posts will appear here once they are published by the admin.'}
              </p>
              {searchQuery || selectedCategory !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all"
                >
                  Clear Filters
                </button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  LATEST <span className="text-primary-500">ARTICLES</span>
                </h2>
                <p className="text-gray-400">
                  Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.slice(1).map((post) => (
                  <Link
                    key={post.id}
                    href={post.slug ? `/blog/${post.slug}` : `/blog/${post.id}`}
                    className="group block bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                      {post.image ? (
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 px-3 py-1 bg-primary-600/90 backdrop-blur-sm rounded-full text-primary-100 text-xs font-semibold">
                        {post.category}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-3 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {post.date}
                        </span>
                        {post.readTime && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {post.readTime}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary-500 transition-colors text-white line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        {post.author && (
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <User size={14} />
                            <span>{post.author}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-primary-500 text-sm font-medium">
                          <span>Read More</span>
                          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.15),transparent_70%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 p-8 md:p-12 backdrop-blur-sm shadow-2xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mb-6 shadow-lg shadow-primary-600/30">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Join us for high quality, affordable and{' '}
                <span className="text-primary-500">fun content!</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Get access to exclusive offers by signing up for our email list
              </p>
            </div>

            {/* Email Form */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg transition-all"
                />
                <button className="px-10 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:scale-105 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: CheckCircle, text: 'Exclusive discounts on build shop items' },
                { text: 'Notification of new content releases' },
                { text: 'Chances to win free custom builds' },
              ].map((benefit, index) => {
                const Icon = benefit.icon || CheckCircle
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50 hover:border-primary-500/50 transition-all"
                  >
                    <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-500" />
                    </div>
                    <p className="text-gray-300 leading-relaxed pt-1.5">{benefit.text}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
