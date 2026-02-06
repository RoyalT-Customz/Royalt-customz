'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingBag,
  Shield,
  ShoppingCart,
  X,
  Search,
  Filter,
  Plus,
  Minus,
  ExternalLink,
  Star,
  Package,
  CheckCircle,
  Heart,
  Grid3x3,
  List,
  SlidersHorizontal,
  ChevronDown,
  Lock,
  ChevronRight,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  video_url?: string
  category: string
  inStock: boolean
  rating?: number
  reviews?: number
}

interface EscrowItem {
  id: string
  name: string
  description: string
  price: number
  tebexUrl: string
  image?: string
  video_url?: string
  inStock: boolean
}

interface CartItem extends Product {
  quantity: number
}

export default function Marketplace() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'escrow'>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [escrowItems, setEscrowItems] = useState<EscrowItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    setMounted(true)
    fetchProducts()
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('marketplace_favorites')
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
    // Load cart from localStorage
    const savedCart = localStorage.getItem('marketplace_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Error loading cart:', e)
      }
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem('marketplace_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    // Save favorites to localStorage whenever it changes
    localStorage.setItem('marketplace_favorites', JSON.stringify(favorites))
  }, [favorites])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      // Fetch regular products
      const productsResponse = await fetch('/api/products?is_escrow=false')
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        // Transform database products to match Product interface
        const transformedProducts: Product[] = (productsData.products || []).map((p: any) => {
          // Parse image_url - can be a JSON array or a single string
          let primaryImage: string | undefined = undefined
          if (p.image_url) {
            try {
              const parsed = JSON.parse(p.image_url)
              if (Array.isArray(parsed) && parsed.length > 0) {
                // Use first image as primary
                primaryImage = parsed[0]
              } else if (typeof parsed === 'string') {
                primaryImage = parsed
              }
            } catch {
              // If not JSON, treat as single string
              primaryImage = p.image_url
            }
          }
          
          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: parseFloat(p.price),
            category: p.category,
            image: primaryImage,
            video_url: p.video_url || undefined,
            inStock: true,
            rating: 5, // Default rating, can be calculated from reviews later
            reviews: 0, // Can be fetched from reviews table later
          }
        })
        setProducts(transformedProducts)
      }

      // Fetch escrow items
      const escrowResponse = await fetch('/api/products?is_escrow=true')
      if (escrowResponse.ok) {
        const escrowData = await escrowResponse.json()
        const transformedEscrow: EscrowItem[] = (escrowData.products || []).map((p: any) => {
          // Parse image_url - can be a JSON array or a single string
          let primaryImage: string | undefined = undefined
          if (p.image_url) {
            try {
              const parsed = JSON.parse(p.image_url)
              if (Array.isArray(parsed) && parsed.length > 0) {
                // Use first image as primary
                primaryImage = parsed[0]
              } else if (typeof parsed === 'string') {
                primaryImage = parsed
              }
            } catch {
              // If not JSON, treat as single string
              primaryImage = p.image_url
            }
          }
          
          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: parseFloat(p.price),
            tebexUrl: p.tebex_link || '',
            image: primaryImage,
            video_url: p.video_url || undefined,
            inStock: true,
          }
        })
        setEscrowItems(transformedEscrow)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Use only database products - no mock data
  const displayProducts = products
  const displayEscrowItems = escrowItems

  const categories = ['all', ...Array.from(new Set(displayProducts.map((p) => p.category)))]

  // Filter and sort products
  const filteredProducts = displayProducts
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stripHtmlTags(product.description).toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory && product.inStock
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'price-desc') return b.price - a.price
      return a.name.localeCompare(b.name)
    })

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id)
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    // Show cart briefly
    setTimeout(() => setCartOpen(true), 100)
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
    )
  }

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  // Helper function to strip HTML tags for listing display
  const stripHtmlTags = (html: string): string => {
    if (!html) return ''
    // Remove HTML tags using regex (works in both client and server)
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Marketplace
              </Link>
              
              {/* Tabs */}
              <div className="hidden md:flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'products'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Products
                </button>
                <button
                  onClick={() => setActiveTab('escrow')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'escrow'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Escrow
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Bar */}
              {activeTab === 'products' && (
                <div className="hidden md:flex relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Search */}
        {activeTab === 'products' && (
          <div className="md:hidden mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Mobile Tabs */}
        <div className="md:hidden mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'products'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Products ({filteredProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('escrow')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'escrow'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600'
            }`}
          >
            Escrow ({displayEscrowItems.length})
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Filters and Sort Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Grid3x3 size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <List size={16} />
                  </button>
                </div>

                <span className="text-sm text-gray-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </span>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">Sort by Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>

            {/* Category Filters */}
            {showFilters && (
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'All Categories' : category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="text-center py-24">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                <p className="text-lg text-gray-600 font-medium">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-900 font-semibold mb-2">No products found</p>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  >
                    {/* Product Image */}
                    <Link href={`/marketplace/${product.id}`}>
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(product.id)
                          }}
                          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-sm z-10"
                        >
                          <Heart
                            size={16}
                            className={favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                          />
                        </button>

                        {/* Category Badge */}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded text-xs font-medium text-gray-700 shadow-sm">
                          {product.category}
                        </div>
                        
                        {/* Video Indicator */}
                        {product.video_url && (
                          <div className="absolute top-2 right-10 px-2 py-1 bg-red-500/90 backdrop-blur-sm rounded text-xs font-medium text-white shadow-sm flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            Video
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-4">
                      <Link href={`/marketplace/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                          {stripHtmlTags(product.description)}
                        </p>
                      </Link>

                      {/* Rating */}
                      {product.rating && product.rating > 0 && (
                        <div className="flex items-center gap-1 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          {product.reviews && product.reviews > 0 && (
                            <span className="text-xs text-gray-500">({product.reviews})</span>
                          )}
                        </div>
                      )}

                      {/* Price and Add to Cart */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            ${product.price.toFixed(2)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addToCart(product)
                          }}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <ShoppingCart size={16} />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/marketplace/${product.id}`}
                    className="group flex gap-6 p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="relative w-48 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleFavorite(product.id)
                            }}
                            className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Heart
                              size={20}
                              className={favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                            />
                          </button>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{stripHtmlTags(product.description)}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                          {product.video_url && (
                            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                              Video
                            </span>
                          )}
                          {product.rating && product.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-sm text-gray-600 font-medium">{product.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-3xl font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addToCart(product)
                          }}
                          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <ShoppingCart size={18} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Escrow Tab */}
        {activeTab === 'escrow' && (
          <div>
            {/* Info Banner */}
            <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Lock size={18} className="text-blue-600" />
                    Escrow Protection Guaranteed
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    All escrow items are sold through our official Tebex store, which provides secure
                    payment processing and buyer protection. Your purchase is protected until you
                    receive and confirm your order.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Buyer Protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span>Order Confirmation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-24">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                <p className="text-lg text-gray-600 font-medium">Loading escrow items...</p>
              </div>
            ) : displayEscrowItems.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl text-gray-900 font-semibold mb-2">No escrow items available</p>
                <p className="text-gray-600">Escrow items will appear here once they are added by the admin.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayEscrowItems.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  >
                    <Link href={`/marketplace/${item.id}`}>
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                        
                        {/* Video Indicator */}
                        {item.video_url && (
                          <div className="absolute top-2 right-2 px-2 py-1 bg-red-500/90 backdrop-blur-sm rounded text-xs font-medium text-white shadow-sm flex items-center gap-1 z-10">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            Video
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="p-4">
                      <Link href={`/marketplace/${item.id}`}>
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
                          {stripHtmlTags(item.description)}
                        </p>
                      </Link>

                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-gray-900">
                          ${item.price.toFixed(2)}
                        </div>
                        <a
                          href={item.tebexUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <ExternalLink size={16} />
                          <span className="hidden sm:inline">Tebex</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Shopping Cart Sidebar */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[110] transition-opacity"
            onClick={() => setCartOpen(false)}
          />
          <div
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-[110] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cart Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                <p className="text-sm text-gray-600 mt-1">{cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}</p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Content */}
            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-900 font-semibold mb-2">Your cart is empty</p>
                  <p className="text-gray-600 mb-6">Start adding products to your cart</p>
                  <button
                    onClick={() => {
                      setCartOpen(false)
                      setActiveTab('products')
                    }}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-8">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="relative w-20 h-20 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-200">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                          <p className="text-primary-600 font-semibold mb-3">
                            ${item.price.toFixed(2)}
                          </p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-8 text-center text-gray-900 font-medium text-sm">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Subtotal</span>
                      <span className="text-gray-900 font-semibold">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Tax (10%)</span>
                      <span className="text-gray-900 font-semibold">${(cartTotal * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${(cartTotal * 1.1).toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-lg transition-colors mt-6 flex items-center justify-center gap-2">
                      <Lock size={20} />
                      Proceed to Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
