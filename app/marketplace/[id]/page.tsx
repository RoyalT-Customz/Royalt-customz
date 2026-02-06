'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ShoppingCart,
  Package,
  Star,
  Shield,
  ExternalLink,
  Plus,
  Minus,
  CheckCircle,
  Loader2,
  XCircle,
  Heart,
  Share2,
  Lock,
  Zap,
  Settings,
  Code,
  CheckCircle2,
  Clock,
  Calendar,
  Truck,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings as SettingsIcon,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  video_url?: string
  category: string
  is_escrow: number
  tebex_link?: string
  avg_rating?: string
  key_features?: string
  framework_support?: string
  technical_details?: string
}

function ProductDetailContent() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState<any[]>([])
  const [addedToCart, setAddedToCart] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'features' | 'frameworks' | 'technical'>('features')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isAutoRotating, setIsAutoRotating] = useState(true)
  const [isHovering, setIsHovering] = useState(false)

  const fetchProduct = async (id: string) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Product not found')
        return
      }

      setProduct(data.product)
      
      // Debug: Log video_url to console
      if (data.product.video_url) {
        console.log('Product video_url:', data.product.video_url)
      }
      
      // Set up images array - support multiple images if stored as JSON array
      // First image is always the primary/main cover image
      if (data.product.image_url) {
        try {
          const parsed = JSON.parse(data.product.image_url)
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Ensure first image is primary/main cover
            setImages(parsed)
          } else {
            setImages([data.product.image_url])
          }
        } catch {
          setImages([data.product.image_url])
        }
      }
      
      // Reset to first image (primary cover) when product loads
      setSelectedImageIndex(0)
    } catch (err) {
      console.error('Error fetching product:', err)
      setError('Failed to load product')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    if (params.id) {
      fetchProduct(params.id as string)
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
    // Load favorites
    const savedFavorites = localStorage.getItem('marketplace_favorites')
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites)
        setIsFavorite(favorites.includes(params.id))
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
  }, [params.id])

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    if (images.length <= 1 || !isAutoRotating || isHovering || isFullscreen) return

    const interval = setInterval(() => {
      setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }, 5000) // 5 seconds

    return () => clearInterval(interval)
  }, [images.length, isAutoRotating, isHovering, isFullscreen])

  // Keyboard navigation for image slideshow
  useEffect(() => {
    if (images.length <= 1) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'ArrowLeft') {
          setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
          setIsAutoRotating(false) // Pause auto-rotation on manual navigation
        } else if (e.key === 'ArrowRight') {
          setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
          setIsAutoRotating(false) // Pause auto-rotation on manual navigation
        } else if (e.key === 'Escape') {
          setIsFullscreen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [images.length, isFullscreen])

  const handleAddToCart = () => {
    if (!product) return

    const cartItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price.toString()),
      image: images[0] || product.image_url,
      category: product.category,
      quantity: quantity,
    }

    const updatedCart = [...cart]
    const existingIndex = updatedCart.findIndex((item) => item.id === product.id)

    if (existingIndex >= 0) {
      updatedCart[existingIndex].quantity += quantity
    } else {
      updatedCart.push(cartItem)
    }

    setCart(updatedCart)
    localStorage.setItem('marketplace_cart', JSON.stringify(updatedCart))
    setAddedToCart(true)

    setTimeout(() => setAddedToCart(false), 3000)
  }

  const handleToggleFavorite = () => {
    if (!product) return
    const savedFavorites = localStorage.getItem('marketplace_favorites')
    let favorites = savedFavorites ? JSON.parse(savedFavorites) : []
    
    if (isFavorite) {
      favorites = favorites.filter((id: string) => id !== product.id)
    } else {
      favorites.push(product.id)
    }
    
    localStorage.setItem('marketplace_favorites', JSON.stringify(favorites))
    setIsFavorite(!isFavorite)
  }

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }


  // Parse product features from database
  const getProductFeatures = () => {
    if (!product?.key_features) return []
    
    try {
      const parsed = typeof product.key_features === 'string' 
        ? JSON.parse(product.key_features) 
        : product.key_features
      
      if (!Array.isArray(parsed)) return []
      
      const iconMap: { [key: string]: any } = {
        'Advanced System': Zap,
        'Comprehensive Upgrades': Settings,
        'Modern Interface': TrendingUp,
        'Admin System': Shield,
        'Multi-Framework': Code,
        'Access Control': Lock,
      }
      
      return parsed.map((feature: any) => {
        const title = feature.title || feature.name || 'Feature'
        const Icon = iconMap[title] || Zap
        
        return {
          icon: Icon,
          title: title,
          description: feature.description || '',
        }
      })
    } catch (e) {
      return []
    }
  }

  // Parse framework support from database
  const getFrameworkSupport = () => {
    if (!product?.framework_support) return []
    
    try {
      const parsed = typeof product.framework_support === 'string'
        ? JSON.parse(product.framework_support)
        : product.framework_support
      
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        return Object.entries(parsed)
          .filter(([_, status]) => status && status !== 'not_supported')
          .map(([framework, status]) => ({
            framework,
            status: status as string,
          }))
      }
      
      if (Array.isArray(parsed)) {
        return parsed.map((framework: string) => ({
          framework,
          status: 'supported',
        }))
      }
      
      return []
    } catch (e) {
      console.error('Error parsing framework support:', e)
      return []
    }
  }

  // Parse technical details from database
  const getTechnicalDetails = () => {
    if (!product?.technical_details) return null
    
    try {
      const parsed = typeof product.technical_details === 'string'
        ? JSON.parse(product.technical_details)
        : product.technical_details
      
      return parsed
    } catch (e) {
      return null
    }
  }

  // Helper function to parse video URL and get embed URL
  const getVideoEmbedUrl = (url: string | undefined): string | null => {
    if (!url || url.trim() === '') return null
    
    // Base64 data URL (from file uploads)
    if (url.startsWith('data:video/')) {
      return url
    }
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    const youtubeMatch = url.match(youtubeRegex)
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`
    }
    
    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/)(?:.*\/)?(\d+)/
    const vimeoMatch = url.match(vimeoRegex)
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`
    }
    
    // Direct video URL (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      return url
    }
    
    // If it's a valid URL but doesn't match above patterns, try to use it directly
    try {
      new URL(url)
      return url
    } catch {
      return null
    }
  }

  const videoEmbedUrl = product?.video_url ? getVideoEmbedUrl(product.video_url) : null

  // Framework logo and color mapping
  const getFrameworkInfo = (framework: string, status: string) => {
    const lower = framework.toLowerCase()
    let logoPath = ''
    let logoAlt = ''

    if (lower.includes('qbcore')) {
      logoPath = '/framework-support/qbcore.png'
      logoAlt = 'QBCore'
    } else if (lower === 'esx legacy' || lower.includes('esx legacy') || (lower.includes('esx') && !lower.includes('legacy'))) {
      logoPath = '/framework-support/esx.png'
      logoAlt = 'ESX Legacy'
    } else if (lower === 'qbox' || lower.includes('qbox')) {
      logoPath = '/framework-support/qbox.png'
      logoAlt = 'QBox'
    } else {
      logoPath = ''
      logoAlt = framework.substring(0, 2).toUpperCase()
    }

    return { logoPath, logoAlt, status }
  }

  // Compute product data for rendering
  const productFeatures = getProductFeatures()
  const frameworkSupport = getFrameworkSupport()
  const technicalDetails = getTechnicalDetails()

  // Set default active tab based on available content
  useEffect(() => {
    if (!product) return
    
    if (productFeatures.length > 0) {
      setActiveTab('features')
    } else if (frameworkSupport.length > 0) {
      setActiveTab('frameworks')
    } else if (technicalDetails) {
      setActiveTab('technical')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1b2838] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#66c0f4] animate-spin mx-auto mb-3" />
          <p className="text-[#acb2b8] text-sm font-medium">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#1b2838] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
          <p className="text-[#acb2b8] mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#66c0f4] hover:bg-[#4c9fd4] text-white rounded font-semibold text-sm transition-all shadow-lg"
          >
            <ArrowLeft size={18} />
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1b2838]">
      {/* Compact Header (Steam-style) */}
      <div className="sticky top-0 z-50 bg-[#16202d] border-b border-[#66c0f4]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 text-sm text-[#acb2b8] hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="font-medium">Back to Marketplace</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-lg transition-all ${
                  isFavorite
                    ? 'text-red-500 bg-red-500/20'
                    : 'text-[#acb2b8] hover:text-red-500 hover:bg-[#1b2838]'
                }`}
              >
                <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg text-[#acb2b8] hover:text-[#66c0f4] hover:bg-[#1b2838] transition-all"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Steam-Inspired Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Product Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            {product.name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-[#acb2b8] flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#16202d] rounded-full font-medium border border-[#66c0f4]/20">
              <Package className="w-3.5 h-3.5 text-[#66c0f4]" />
              {product.category}
            </span>
            {product.avg_rating && parseFloat(product.avg_rating) > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#ffa500] fill-[#ffa500]" />
                <span className="font-medium text-white">{product.avg_rating}</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Media & Content (Steam-style) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Video Player (Steam-style - shows first if available) */}
            {videoEmbedUrl && (
              <div className="relative w-full aspect-video bg-[#1b2838] rounded overflow-hidden shadow-lg group">
                {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('youtu.be') ? (
                  <iframe
                    src={videoEmbedUrl.includes('youtube.com/embed') ? `${videoEmbedUrl}?rel=0&modestbranding=1&showinfo=0&autoplay=0` : videoEmbedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${product.name} Video`}
                  />
                ) : videoEmbedUrl.includes('vimeo.com') || videoEmbedUrl.includes('player.vimeo.com') ? (
                  <iframe
                    src={videoEmbedUrl.includes('player.vimeo.com') ? `${videoEmbedUrl}?title=0&byline=0&portrait=0&autoplay=0` : videoEmbedUrl}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={`${product.name} Video`}
                  />
                ) : (
                  <video
                    src={videoEmbedUrl}
                    controls
                    className="w-full h-full"
                    controlsList="nodownload"
                    preload="metadata"
                    poster={images[0] || undefined}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}

            {/* Screenshot Gallery (Steam-style - shows below video or as main if no video) */}
            {images.length > 0 && (
              <div className="space-y-3">
                {/* Main Screenshot Display */}
                <div 
                  className="relative w-full aspect-video bg-[#1b2838] rounded overflow-hidden shadow-lg group cursor-pointer"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={() => setIsFullscreen(true)}
                >
                  {images[selectedImageIndex] ? (
                    <>
                      <Image
                        src={images[selectedImageIndex]}
                        alt={`${product.name} - Screenshot ${selectedImageIndex + 1}`}
                        fill
                        className="object-contain transition-opacity duration-500"
                        priority={selectedImageIndex === 0}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                      />
                      
                      {/* Navigation Arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                              setIsAutoRotating(false)
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Previous image"
                          >
                            <ChevronLeft size={20} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                              setIsAutoRotating(false)
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                            aria-label="Next image"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </>
                      )}

                      {/* Image Counter */}
                      {images.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-semibold z-10">
                          {selectedImageIndex + 1} / {images.length}
                        </div>
                      )}

                      {/* Fullscreen Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsFullscreen(true)
                        }}
                        className="absolute top-4 left-4 bg-black/70 hover:bg-black/90 backdrop-blur-sm text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                        aria-label="View fullscreen"
                      >
                        <Maximize size={18} />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#16202d]">
                      <Package className="w-24 h-24 text-[#8f98a0]" />
                    </div>
                  )}
                </div>

                {/* Screenshot Thumbnail Strip (Steam-style horizontal scroll) */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#66c0f4] scrollbar-track-[#16202d]">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedImageIndex(index)
                          setIsAutoRotating(false)
                        }}
                        className={`relative w-32 h-20 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${
                          selectedImageIndex === index
                            ? 'border-[#66c0f4] shadow-lg ring-2 ring-[#66c0f4]/30'
                            : 'border-[#8f98a0]/30 hover:border-[#66c0f4]/50'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Screenshot ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                        {selectedImageIndex === index && (
                          <div className="absolute inset-0 bg-[#66c0f4]/20" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* About This Product Section (Steam-style) */}
            <div className="bg-[#1b2838] rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4 pb-3 border-b border-[#66c0f4]/20">
                About This Product
              </h2>
              {product.description ? (
                <div 
                  className="text-[#acb2b8] leading-relaxed text-sm
                    [&>div]:mb-3 [&>div:last-child]:mb-0
                    [&>p]:mb-3 [&>p:last-child]:mb-0
                    [&>b]:font-bold [&>b]:text-white
                    [&>strong]:font-bold [&>strong]:text-white
                    [&>i]:italic
                    [&>u]:underline
                    [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-3
                    [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-white [&>h2]:mb-2
                    [&>h3]:text-base [&>h3]:font-bold [&>h3]:text-white [&>h3]:mb-2
                    [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-3
                    [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:mb-3
                    [&>li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-[#acb2b8] italic">No description available.</p>
              )}
            </div>

            {/* Detailed Information Tabs (Steam-style) - Only show if there are additional tabs beyond description */}
            {(productFeatures.length > 0 || frameworkSupport.length > 0 || technicalDetails) && (
              <div className="bg-[#1b2838] rounded-lg shadow-lg overflow-hidden">
                {/* Tab Headers */}
                <div className="bg-[#16202d] border-b border-[#66c0f4]/20 flex overflow-x-auto">
                  {productFeatures.length > 0 && (
                    <button
                      onClick={() => setActiveTab('features')}
                      className={`px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                        activeTab === 'features'
                          ? 'text-[#66c0f4] border-b-2 border-[#66c0f4] bg-[#1b2838]'
                          : 'text-[#8f98a0] hover:text-white hover:bg-[#1b2838]/50'
                      }`}
                    >
                      FEATURES
                    </button>
                  )}
                  {frameworkSupport.length > 0 && (
                    <button
                      onClick={() => setActiveTab('frameworks')}
                      className={`px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                        activeTab === 'frameworks'
                          ? 'text-[#66c0f4] border-b-2 border-[#66c0f4] bg-[#1b2838]'
                          : 'text-[#8f98a0] hover:text-white hover:bg-[#1b2838]/50'
                      }`}
                    >
                      FRAMEWORKS
                    </button>
                  )}
                  {technicalDetails && (
                    <button
                      onClick={() => setActiveTab('technical')}
                      className={`px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap ${
                        activeTab === 'technical'
                          ? 'text-[#66c0f4] border-b-2 border-[#66c0f4] bg-[#1b2838]'
                          : 'text-[#8f98a0] hover:text-white hover:bg-[#1b2838]/50'
                      }`}
                    >
                      TECHNICAL
                    </button>
                  )}
                </div>

                {/* Tab Content */}
                <div className="p-6">

                  {activeTab === 'features' && productFeatures.length > 0 && (
                    <div className="space-y-3">
                      {productFeatures.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                          <div key={index} className="flex items-start gap-4 p-4 bg-[#16202d] rounded-lg border border-[#66c0f4]/10 hover:border-[#66c0f4]/20 transition-colors">
                            <div className="w-10 h-10 bg-[#66c0f4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-[#66c0f4]" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-base text-white mb-1.5">{feature.title}</h3>
                              {feature.description && (
                                <p className="text-sm text-[#acb2b8] leading-relaxed">{feature.description}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {activeTab === 'frameworks' && frameworkSupport.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {frameworkSupport.map((item: any, index: number) => {
                        const info = getFrameworkInfo(item.framework, item.status)
                        const isSupported = item.status === 'supported'
                        const isComingSoon = item.status === 'coming_soon'
                        const isPlanned = item.status === 'planned'

                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border ${
                              isSupported
                                ? 'bg-[#1e3a2e] border-[#66c0f4]/30'
                                : isComingSoon
                                ? 'bg-[#3a2e1e] border-[#ffa500]/30'
                                : 'bg-[#16202d] border-[#8f98a0]/20'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              {info.logoPath ? (
                                <Image
                                  src={info.logoPath}
                                  alt={info.logoAlt}
                                  width={32}
                                  height={32}
                                  className="rounded"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-[#66c0f4]/20 rounded flex items-center justify-center text-xs font-bold text-[#66c0f4]">
                                  {info.logoAlt}
                                </div>
                              )}
                              <span className="text-sm font-semibold text-white">{item.framework}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSupported && (
                                <>
                                  <CheckCircle2 className="w-4 h-4 text-[#66c0f4]" />
                                  <span className="text-xs text-[#66c0f4] font-medium">Supported</span>
                                </>
                              )}
                              {isComingSoon && (
                                <>
                                  <Clock className="w-4 h-4 text-[#ffa500]" />
                                  <span className="text-xs text-[#ffa500] font-medium">Coming Soon</span>
                                </>
                              )}
                              {isPlanned && (
                                <>
                                  <Calendar className="w-4 h-4 text-[#8f98a0]" />
                                  <span className="text-xs text-[#8f98a0] font-medium">Planned</span>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {activeTab === 'technical' && technicalDetails && (
                    <div className="space-y-3">
                      {Object.entries(technicalDetails).map(([key, value], index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-[#16202d] rounded-lg border border-[#66c0f4]/10">
                          <div className="w-10 h-10 bg-[#66c0f4]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Settings className="w-5 h-5 text-[#66c0f4]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-white mb-1.5">{key}</h3>
                            <p className="text-sm text-[#acb2b8] break-words leading-relaxed">{String(value)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Right Column: Purchase Section (Steam-style) */}
          <div className="lg:col-span-1">
            <div className="bg-[#1b2838] rounded-lg shadow-lg p-6 sticky top-20 space-y-5 border border-[#66c0f4]/10">
              {/* Price */}
              <div>
                <div className="text-4xl font-bold text-white mb-3">
                  ${parseFloat(product.price.toString()).toFixed(2)}
                </div>
                {product.avg_rating && parseFloat(product.avg_rating) > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`${
                            i < Math.floor(parseFloat(product.avg_rating!))
                              ? 'text-[#ffa500] fill-[#ffa500]'
                              : 'text-[#8f98a0]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-[#acb2b8] font-medium">
                      {product.avg_rating}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity Selector */}
              {(!product.tebex_link || product.tebex_link.trim() === '') && (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-[#acb2b8]">Quantity</label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-[#66c0f4]/30 rounded-lg bg-[#16202d]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 text-[#acb2b8] hover:text-white hover:bg-[#66c0f4]/10 transition-all"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="px-4 py-2 text-white font-semibold min-w-[60px] text-center border-x border-[#66c0f4]/30 text-sm">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 text-[#acb2b8] hover:text-white hover:bg-[#66c0f4]/10 transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-[#acb2b8]">
                    Total: <span className="font-semibold text-white">
                      ${(parseFloat(product.price.toString()) * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-[#66c0f4]/20">
                {product.tebex_link && product.tebex_link.trim() !== '' ? (
                  <a
                    href={product.tebex_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-6 py-4 bg-[#66c0f4] hover:bg-[#4c9fd4] text-white rounded font-semibold text-base transition-all inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <ExternalLink size={20} />
                    Buy on Tebex
                  </a>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full px-6 py-4 bg-[#66c0f4] hover:bg-[#4c9fd4] text-white rounded font-semibold text-base transition-all inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                )}
                
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_INVITE || 'https://discord.gg/royalt-customz'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-4 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded font-semibold text-base transition-all inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                  Support Discord
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-[#66c0f4]/20 space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#acb2b8]">
                  <Truck className="w-5 h-5 text-[#66c0f4]" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#acb2b8]">
                  <Lock className="w-5 h-5 text-[#66c0f4]" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#acb2b8]">
                  <Shield className="w-5 h-5 text-[#66c0f4]" />
                  <span>Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {addedToCart && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 z-[100] animate-in slide-in-from-top">
          <CheckCircle size={20} />
          <span className="font-semibold text-sm">Added to cart successfully!</span>
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {isFullscreen && images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-10"
            aria-label="Close fullscreen"
          >
            <X size={24} />
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedImageIndex]}
              alt={`${product.name} - Image ${selectedImageIndex + 1}`}
              width={1200}
              height={1200}
              className="max-w-full max-h-full object-contain"
              priority={selectedImageIndex === 0}
              sizes="100vw"
            />

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
                    setIsAutoRotating(false) // Pause auto-rotation on manual navigation
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
                    setIsAutoRotating(false) // Pause auto-rotation on manual navigation
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Thumbnail Strip (Bottom) */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90%] overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImageIndex(index)
                    }}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImageIndex === index
                        ? 'border-white ring-2 ring-white/50'
                        : 'border-white/30 hover:border-white/60'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1b2838] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#66c0f4] animate-spin mx-auto mb-3" />
          <p className="text-[#acb2b8] text-sm font-medium">Loading product...</p>
        </div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  )
}
