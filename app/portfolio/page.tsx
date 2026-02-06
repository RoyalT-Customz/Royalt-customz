'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ArrowRight, Filter, Eye, ExternalLink } from 'lucide-react'

interface PortfolioItem {
  id: string
  title: string
  client_name?: string
  description?: string
  category: string
  image_url: string
  tags?: string
  featured?: number
}

export default function Portfolio() {
  const [mounted, setMounted] = useState(false)
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
    fetchPortfolioItems()
  }, [])

  const fetchPortfolioItems = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/portfolio')
      if (response.ok) {
        const data = await response.json()
        // Transform database items to match PortfolioItem interface
        const transformedItems: PortfolioItem[] = (data.items || []).map((item: any) => ({
          id: item.id,
          title: item.title,
          client_name: item.client_name,
          description: item.description,
          category: item.category,
          image_url: item.image_url,
          tags: item.tags,
          featured: item.featured,
        }))
        setPortfolioItems(transformedItems)
      }
    } catch (error) {
      console.error('Error fetching portfolio items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Use only database items - no mock data
  const displayItems = portfolioItems

  const categories = ['all', ...Array.from(new Set(displayItems.map((item) => item.category)))]

  const filteredItems =
    filter === 'all'
      ? displayItems
      : displayItems.filter((item) => item.category === filter)

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
                Portfolio
              </span>
            </div>
            <h1
              className={`text-6xl md:text-8xl font-bold mb-6 leading-tight transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.4s' }}
            >
              <span className="text-white">YOUR DREAM IS</span>
              <br />
              <span className="text-primary-500">OUR VISION</span>
            </h1>
            <p
              className={`text-xl md:text-2xl text-gray-300 leading-relaxed transition-all duration-1000 ${
                mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '0.6s' }}
            >
              Explore our collection of completed projects and see the quality we deliver. Each
              project represents our commitment to excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-12 bg-gray-900/50 border-y border-gray-800 sticky top-20 z-40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary-500" />
              <span className="text-gray-400 font-medium">Filter by Category:</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`
                    px-6 py-2.5 rounded-lg font-semibold transition-all duration-200
                    ${
                      filter === category
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white border border-gray-700/50'
                    }
                  `}
                >
                  {category === 'all' ? 'All Projects' : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Grid Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
              <p className="text-xl text-gray-400">Loading portfolio...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400 mb-4">
                {filter !== 'all' ? 'No projects found in this category.' : 'No portfolio items available yet'}
              </p>
              <p className="text-gray-500 mb-6">
                {filter !== 'all'
                  ? 'Try selecting a different category'
                  : 'Portfolio items will appear here once they are added by the admin.'}
              </p>
              <button
                onClick={() => setFilter('all')}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all"
              >
                {filter !== 'all' ? 'Show All Projects' : 'Refresh'}
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 hover:border-primary-500/50 transition-all cursor-pointer overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-700 to-gray-800">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-7xl font-bold text-gray-600 group-hover:text-primary-500 transition-colors">
                          {index + 1}
                        </div>
                      </div>
                    )}
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary-600/90 backdrop-blur-sm border border-primary-500/50 rounded-full text-primary-100 text-xs font-semibold">
                      {item.category}
                    </div>
                    {/* View Icon */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye className="w-5 h-5 text-white" />
                    </div>
                    {/* Hover Text */}
                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-semibold text-sm">View Details</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary-500 transition-colors text-white">
                      {item.title}
                    </h3>
                    {item.client_name && (
                      <p className="text-sm text-primary-400 mb-3 font-medium">{item.client_name}</p>
                    )}
                    {item.description && (
                      <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    {item.tags && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {item.tags.split(',').slice(0, 2).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Count */}
          <div className="mt-12 text-center">
            <p className="text-gray-400">
              Showing <span className="text-primary-500 font-semibold">{filteredItems.length}</span>{' '}
              {filteredItems.length === 1 ? 'project' : 'projects'}
              {filter !== 'all' && (
                <>
                  {' '}in <span className="text-primary-500 font-semibold">{filter}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.1),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            READY TO START YOUR <span className="text-primary-500">PROJECT?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Let's bring your vision to life. Contact us today to discuss your project.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="group px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-primary-600/30 hover:scale-105"
            >
              Contact Us
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/service"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-600 hover:scale-105"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Header */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-700 to-gray-800">
              {selectedItem.image_url ? (
                <Image
                  src={selectedItem.image_url}
                  alt={selectedItem.title}
                  fill
                  className="object-cover rounded-t-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-9xl font-bold text-gray-600">
                    {portfolioItems.indexOf(selectedItem) + 1}
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              >
                <X size={24} />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1.5 bg-primary-600/90 backdrop-blur-sm border border-primary-500/50 rounded-full text-primary-100 text-sm font-semibold">
                    {selectedItem.category}
                  </span>
                  {selectedItem.tags && selectedItem.tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 rounded-full text-gray-200 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {selectedItem.title}
                </h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
              <div className="mb-6">
                <p className="text-primary-400 text-lg font-semibold mb-4">
                  {selectedItem.client_name && `Client: ${selectedItem.client_name}`}
                </p>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {selectedItem.description}
                </p>
              </div>

              <div className="pt-8 border-t border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2"
                  >
                    Start Your Project
                    <ArrowRight size={20} />
                  </Link>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all border border-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
