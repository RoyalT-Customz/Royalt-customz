'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Package,
  X,
  Save,
  Upload,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  DollarSign,
  Tag,
  ShoppingCart,
  TrendingUp,
  Eye,
  Grid3x3,
  List,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Video,
  Play,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  video_url?: string
  is_escrow: number
  tebex_link?: string
  key_features?: string
  framework_support?: string
  technical_details?: string
  created_at: string
  updated_at: string
}

type ViewMode = 'grid' | 'list'

export default function AdminMarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'MLO',
    image_url: '',
    images: [] as string[],
    video_url: '',
    is_escrow: false,
    tebex_link: '',
    key_features: '',
    framework_support: '',
    technical_details: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [videoDragActive, setVideoDragActive] = useState(false)
  const [technicalDetailsFields, setTechnicalDetailsFields] = useState<Array<{key: string, value: string}>>([])
  const descriptionEditorRef = useRef<HTMLDivElement>(null)

  const categories = ['MLO', 'Shell', 'Chain', 'Tattoo', 'Face', 'Other']
  const frameworks = ['QBCore', 'ESX Legacy', 'QBox']

  // Helper function to get primary image from image_url (can be JSON array or string)
  const getPrimaryImage = (imageUrl: string | undefined): string | undefined => {
    if (!imageUrl) return undefined
    try {
      const parsed = JSON.parse(imageUrl)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Use first image as primary
        return parsed[0]
      } else if (typeof parsed === 'string') {
        return parsed
      }
    } catch {
      // If not JSON, treat as single string
      return imageUrl
    }
    return undefined
  }

  const fetchProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/products')
      if (response.ok) {
        const data = await response.json()
        const typedProducts: Product[] = (data.products || []).map((p: any): Product => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          image_url: p.image_url,
          is_escrow: p.is_escrow,
          tebex_link: p.tebex_link,
          key_features: p.key_features,
          framework_support: p.framework_support,
          technical_details: p.technical_details,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }))
        setProducts(typedProducts)
      } else {
        setError('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Error loading products')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Sync rich text editor with formData.description
  useEffect(() => {
    if (descriptionEditorRef.current && showModal) {
      const currentContent = descriptionEditorRef.current.innerHTML
      if (currentContent !== formData.description) {
        descriptionEditorRef.current.innerHTML = formData.description || ''
      }
    }
  }, [formData.description, showModal])

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      let keyFeatures = ''
      let frameworkSupport = ''
      let technicalDetailsFields: Array<{key: string, value: string}> = []
      let images: string[] = []

      try {
        if (product.key_features) {
          const parsed = typeof product.key_features === 'string' ? JSON.parse(product.key_features) : product.key_features
          keyFeatures = Array.isArray(parsed) ? parsed.map((f: any) => `${f.title || f.name || ''}: ${f.description || ''}`).join('\n') : product.key_features
        }
      } catch (e) {
        keyFeatures = product.key_features || ''
      }

      try {
        if (product.framework_support) {
          const parsed = typeof product.framework_support === 'string' ? JSON.parse(product.framework_support) : product.framework_support
          frameworkSupport = typeof parsed === 'object' && parsed !== null ? JSON.stringify(parsed) : product.framework_support
        }
      } catch (e) {
        frameworkSupport = product.framework_support || ''
      }

      try {
        if (product.technical_details) {
          const parsed = typeof product.technical_details === 'string' ? JSON.parse(product.technical_details) : product.technical_details
          if (typeof parsed === 'object' && parsed !== null) {
            technicalDetailsFields = Object.entries(parsed).map(([key, value]) => ({
              key,
              value: String(value)
            }))
          }
        }
      } catch (e) {
        // Keep empty if error
      }

      // Parse images - support both single image_url and multiple images array
      try {
        if (product.image_url) {
          const parsed = JSON.parse(product.image_url)
          if (Array.isArray(parsed)) {
            images = parsed
          } else {
            images = [product.image_url]
          }
        }
      } catch {
        if (product.image_url) {
          images = [product.image_url]
        }
      }

      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        category: product.category,
        image_url: images[0] || '',
        images: images,
        video_url: product.video_url || '',
        is_escrow: product.is_escrow === 1,
        tebex_link: product.tebex_link || '',
        key_features: keyFeatures,
        framework_support: frameworkSupport,
        technical_details: '',
      })
      setTechnicalDetailsFields(technicalDetailsFields)
    } else {
      setEditingProduct(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'MLO',
        image_url: '',
        images: [],
        video_url: '',
        is_escrow: false,
        tebex_link: '',
        key_features: '',
        framework_support: '',
        technical_details: '',
      })
      setTechnicalDetailsFields([])
    }
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'MLO',
      image_url: '',
      images: [],
      video_url: '',
      is_escrow: false,
      tebex_link: '',
      key_features: '',
      framework_support: '',
      technical_details: '',
    })
    setTechnicalDetailsFields([])
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    if (!formData.name.trim()) {
      setError('Product name is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.category) {
      setError('Category is required')
      setIsSubmitting(false)
      return
    }
    if (formData.is_escrow && !formData.tebex_link) {
      setError('Tebex link is required for escrow items')
      setIsSubmitting(false)
      return
    }

    let keyFeaturesJSON = null
    if (formData.key_features.trim()) {
      try {
        const features = formData.key_features
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            const parts = line.split(':').map(p => p.trim())
            return {
              title: parts[0] || 'Feature',
              description: parts.slice(1).join(': ') || '',
            }
          })
        keyFeaturesJSON = JSON.stringify(features)
      } catch (e) {
        setError('Invalid key features format. Use format: "Title: Description" (one per line)')
        setIsSubmitting(false)
        return
      }
    }

    let frameworkSupportJSON = null
    if (formData.framework_support.trim()) {
      try {
        const parsed = JSON.parse(formData.framework_support)
        frameworkSupportJSON = JSON.stringify(parsed)
      } catch (e) {
        try {
          const frameworkObj: any = {}
          formData.framework_support.split(',').forEach(f => {
            frameworkObj[f.trim()] = 'supported'
          })
          frameworkSupportJSON = JSON.stringify(frameworkObj)
        } catch (e2) {
          setError('Invalid framework support format.')
          setIsSubmitting(false)
          return
        }
      }
    }

    let technicalDetailsJSON = null
    if (technicalDetailsFields.length > 0) {
      const techObj: any = {}
      technicalDetailsFields.forEach(field => {
        if (field.key.trim() && field.value.trim()) {
          techObj[field.key.trim()] = field.value.trim()
        }
      })
      if (Object.keys(techObj).length > 0) {
        technicalDetailsJSON = JSON.stringify(techObj)
      }
    }
    
    // Handle images - use array if multiple, single string if one
    let imageUrlToSave: string | null = null
    if (formData.images.length > 0) {
      if (formData.images.length === 1) {
        imageUrlToSave = formData.images[0]
      } else {
        imageUrlToSave = JSON.stringify(formData.images)
      }
    }

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description || null, // Preserve HTML formatting
          price: parseFloat(formData.price),
          category: formData.category,
          image_url: imageUrlToSave,
          video_url: formData.video_url && formData.video_url.trim() ? formData.video_url.trim() : null,
          is_escrow: formData.is_escrow ? 1 : 0,
          tebex_link: formData.is_escrow ? formData.tebex_link.trim() : null,
          key_features: keyFeaturesJSON,
          framework_support: frameworkSupportJSON,
          technical_details: technicalDetailsJSON,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save product')
        setIsSubmitting(false)
        return
      }

      setSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
      setTimeout(() => {
        handleCloseModal()
        fetchProducts()
      }, 1500)
    } catch (error) {
      console.error('Error saving product:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileUpload = async (file: File, index?: number) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setIsUploading(true)
    if (index !== undefined) setUploadingIndex(index)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/admin/products/upload-image', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to upload image')
        return
      }

      if (index !== undefined) {
        // Replace image at specific index
        const newImages = [...formData.images]
        newImages[index] = data.image_url
        setFormData((prev) => ({ 
          ...prev, 
          images: newImages,
          image_url: newImages[0] || ''
        }))
      } else {
        // Add new image
        const newImages = [...formData.images, data.image_url]
        setFormData((prev) => ({ 
          ...prev, 
          images: newImages,
          image_url: newImages[0] || ''
        }))
      }
      
      setSuccess('Image uploaded successfully!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadingIndex(null)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData((prev) => ({ 
      ...prev, 
      images: newImages,
      image_url: newImages[0] || ''
    }))
  }

  const handleVideoUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a video file')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB')
      return
    }

    setIsUploadingVideo(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const response = await fetch('/api/admin/products/upload-video', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to upload video')
        setIsUploadingVideo(false)
        return
      }

      // Ensure video_url is set correctly
      if (!data.video_url) {
        setError('Video upload failed: No video URL returned')
        setIsUploadingVideo(false)
        return
      }

      setFormData((prev) => ({ 
        ...prev, 
        video_url: data.video_url
      }))
      
      setSuccess('Video uploaded successfully and saved to storage!')
      setTimeout(() => setSuccess(''), 2000)
      console.log('Video uploaded successfully:', data.video_url.substring(0, 50) + '...')
    } catch (error) {
      console.error('Error uploading video:', error)
      setError('Failed to upload video. Please try again.')
    } finally {
      setIsUploadingVideo(false)
    }
  }

  const handleRemoveVideo = () => {
    setFormData((prev) => ({ 
      ...prev, 
      video_url: ''
    }))
  }

  const addTechnicalDetailField = () => {
    setTechnicalDetailsFields([...technicalDetailsFields, { key: '', value: '' }])
  }

  const removeTechnicalDetailField = (index: number) => {
    setTechnicalDetailsFields(technicalDetailsFields.filter((_, i) => i !== index))
  }

  const updateTechnicalDetailField = (index: number, field: 'key' | 'value', value: string) => {
    const newFields = [...technicalDetailsFields]
    newFields[index][field] = value
    setTechnicalDetailsFields(newFields)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to delete product')
        return
      }

      setSuccess('Product deleted successfully!')
      setTimeout(() => {
        fetchProducts()
        setSuccess('')
      }, 1500)
    } catch (error) {
      console.error('Error deleting product:', error)
      setError('An error occurred. Please try again.')
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: products.length,
    escrow: products.filter(p => p.is_escrow === 1).length,
    regular: products.filter(p => p.is_escrow === 0).length,
    totalValue: products.reduce((sum, p) => sum + parseFloat(p.price.toString()), 0),
  }

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
                Marketplace <span className="text-primary-500">Management</span>
              </h1>
              <p className="text-gray-400 text-base lg:text-lg">Manage products and escrow items for your marketplace</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
            >
              <Plus size={20} />
              Add New Product
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Total Products</p>
                <Package className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Escrow Items</p>
                <ShoppingCart className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.escrow}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Regular Products</p>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.regular}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Total Value</p>
                <DollarSign className="w-5 h-5 text-primary-400" />
              </div>
              <p className="text-3xl font-bold text-white">${stats.totalValue.toFixed(2)}</p>
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

        {/* Filters & View Toggle */}
        <section className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="Grid View"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                title="List View"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Products Display */}
        {filteredProducts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-primary-500/50 transition-all backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1"
                >
                  <div className="relative w-full h-56 bg-gray-800 overflow-hidden">
                    {getPrimaryImage(product.image_url) ? (
                      <Image
                        src={getPrimaryImage(product.image_url)!}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-gray-600" />
                      </div>
                    )}
                    {product.is_escrow === 1 && (
                      <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                        <ShoppingCart size={12} />
                        Escrow
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
                      <span className="text-white text-xs font-semibold">{product.category}</span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                      {product.description || 'No description'}
                    </p>

                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700/50">
                      <div>
                        <p className="text-2xl font-bold text-primary-400">
                          ${parseFloat(product.price.toString()).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(product)}
                        className="flex-1 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-600/30 hover:border-blue-600/50 inline-flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all border border-red-600/30 hover:border-red-600/50"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6 hover:border-primary-500/50 transition-all backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-primary-500/10"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-full md:w-48 h-48 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                      {getPrimaryImage(product.image_url) ? (
                        <Image
                          src={getPrimaryImage(product.image_url)!}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-600" />
                        </div>
                      )}
                      {product.is_escrow === 1 && (
                        <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                          <ShoppingCart size={12} />
                          Escrow
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-semibold">
                              {product.category}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                            {product.description || 'No description'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary-400">
                            ${parseFloat(product.price.toString()).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-auto pt-4 border-t border-gray-700/50">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-600/30 hover:border-blue-600/50 inline-flex items-center gap-2"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all border border-red-600/30 hover:border-red-600/50"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">No products found</p>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
              >
                <Plus size={20} />
                Add New Product
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Showing <span className="text-primary-500 font-semibold">{filteredProducts.length}</span>{' '}
              {filteredProducts.length === 1 ? 'product' : 'products'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-2xl border border-gray-700/50 w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900/95 to-gray-800/95 border-b border-gray-700/50 px-6 py-4 flex items-center justify-between backdrop-blur-xl z-10">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  {editingProduct ? 'Edit' : 'Add New'} <span className="text-primary-500">Product</span>
                </h2>
                <p className="text-xs text-gray-400">Fill in the details below to {editingProduct ? 'update' : 'create'} your product</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <form id="product-form" onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="Enter product name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  {/* Rich Text Editor Toolbar */}
                  <div className="mb-2 flex items-center gap-2 p-2 bg-gray-800/40 rounded-lg border border-gray-700/50">
                    <button
                      type="button"
                      onClick={() => document.execCommand('bold', false)}
                      className="p-2 hover:bg-gray-700/50 rounded transition-colors"
                      title="Bold"
                    >
                      <Bold size={16} className="text-gray-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => document.execCommand('italic', false)}
                      className="p-2 hover:bg-gray-700/50 rounded transition-colors"
                      title="Italic"
                    >
                      <Italic size={16} className="text-gray-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => document.execCommand('underline', false)}
                      className="p-2 hover:bg-gray-700/50 rounded transition-colors"
                      title="Underline"
                    >
                      <Underline size={16} className="text-gray-300" />
                    </button>
                    <div className="w-px h-6 bg-gray-700/50 mx-1" />
                    <button
                      type="button"
                      onClick={() => document.execCommand('justifyLeft', false)}
                      className="p-2 hover:bg-gray-700/50 rounded transition-colors"
                      title="Align Left"
                    >
                      <AlignLeft size={16} className="text-gray-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => document.execCommand('justifyCenter', false)}
                      className="p-2 hover:bg-gray-700/50 rounded transition-colors"
                      title="Align Center"
                    >
                      <AlignCenter size={16} className="text-gray-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => document.execCommand('justifyRight', false)}
                      className="p-2 hover:bg-gray-700/50 rounded transition-colors"
                      title="Align Right"
                    >
                      <AlignRight size={16} className="text-gray-300" />
                    </button>
                  </div>
                  {/* Rich Text Editor */}
                  <div
                    ref={descriptionEditorRef}
                    contentEditable
                    onInput={(e) => {
                      const html = e.currentTarget.innerHTML
                      setFormData({ ...formData, description: html })
                    }}
                    className="w-full min-h-[200px] px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none overflow-y-auto"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '14px',
                      lineHeight: '1.6',
                    }}
                    data-placeholder="Enter product description..."
                  />
                  <style jsx global>{`
                    [contenteditable][data-placeholder]:empty:before {
                      content: attr(data-placeholder);
                      color: #9ca3af;
                      pointer-events: none;
                    }
                  `}</style>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 pr-10 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer hover:border-gray-600/50 hover:bg-gray-800/80"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-gray-800 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Images
                  </label>
                  
                  {/* Image Gallery */}
                  {formData.images.length > 0 && (
                    <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group aspect-square bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50">
                          <Image
                            src={img}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const input = document.createElement('input')
                                input.type = 'file'
                                input.accept = 'image/*'
                                input.onchange = (e) => {
                                  const file = (e.target as HTMLInputElement).files?.[0]
                                  if (file) handleFileUpload(file, index)
                                }
                                input.click()
                              }}
                              disabled={isUploading && uploadingIndex === index}
                              className="p-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg transition-all backdrop-blur-sm disabled:opacity-50"
                              title="Replace Image"
                            >
                              {isUploading && uploadingIndex === index ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Upload size={14} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all backdrop-blur-sm"
                              title="Remove Image"
                            >
                              <X size={14} />
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-primary-600/90 text-white text-xs font-semibold rounded backdrop-blur-sm">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 transition-all backdrop-blur-sm ${
                      dragActive
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-700/50 bg-gray-800/30'
                    }`}
                    onDragEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDragActive(true)
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDragActive(false)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setDragActive(false)
                      const files = Array.from(e.dataTransfer.files)
                      files.forEach(file => {
                        if (file.type.startsWith('image/')) {
                          handleFileUpload(file)
                        }
                      })
                    }}
                  >
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-300 mb-2">
                        <span className="text-primary-400 font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-gray-500 text-sm mb-4">PNG, JPG, GIF up to 10MB each (Multiple images supported)</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || [])
                          files.forEach(file => handleFileUpload(file))
                        }}
                        className="hidden"
                        id="image-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="image-upload"
                        className={`inline-block px-4 py-2 rounded-lg cursor-pointer transition-all ${
                          isUploading
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border border-primary-600/30 hover:border-primary-600/50'
                        }`}
                      >
                        {isUploading ? 'Uploading...' : 'Add Images'}
                      </label>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Or enter image URL (will be added to gallery)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="flex-1 px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                        placeholder="https://example.com/image.jpg"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && formData.image_url.trim()) {
                            e.preventDefault()
                            if (!formData.images.includes(formData.image_url.trim())) {
                              setFormData({
                                ...formData,
                                images: [...formData.images, formData.image_url.trim()],
                                image_url: ''
                              })
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (formData.image_url.trim() && !formData.images.includes(formData.image_url.trim())) {
                            setFormData({
                              ...formData,
                              images: [...formData.images, formData.image_url.trim()],
                              image_url: ''
                            })
                          }
                        }}
                        className="px-4 py-3 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border border-primary-600/30 hover:border-primary-600/50 rounded-xl transition-all"
                      >
                        Add URL
                      </button>
                    </div>
                  </div>
                </div>

                {/* Video Upload Section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Product Video (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Upload a video file or enter a video URL (YouTube, Vimeo, or direct video link)
                  </p>

                  {/* Video Preview */}
                  {formData.video_url && (
                    <div className="mb-4 relative group">
                      <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-700/50">
                        {formData.video_url.startsWith('data:video/') ? (
                          <video
                            src={formData.video_url}
                            controls
                            className="w-full h-full object-contain"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <Video className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                              <p className="text-gray-400 text-sm">Video URL: {formData.video_url.substring(0, 50)}...</p>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="absolute top-2 right-2 p-2 bg-red-600/90 hover:bg-red-600 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
                          title="Remove video"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Video Upload Area */}
                  {!formData.video_url && (
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 transition-all backdrop-blur-sm ${
                        videoDragActive
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-700/50 bg-gray-800/30'
                      }`}
                      onDragEnter={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setVideoDragActive(true)
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setVideoDragActive(false)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setVideoDragActive(false)
                        const files = Array.from(e.dataTransfer.files)
                        const videoFile = files.find(file => file.type.startsWith('video/'))
                        if (videoFile) {
                          handleVideoUpload(videoFile)
                        } else {
                          setError('Please select a video file')
                        }
                      }}
                    >
                      <div className="text-center">
                        <Video className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-300 mb-2">
                          <span className="text-primary-400 font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-gray-500 text-sm mb-4">MP4, WebM, MOV up to 100MB</p>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleVideoUpload(file)
                            }
                          }}
                          className="hidden"
                          id="video-upload"
                          disabled={isUploadingVideo}
                        />
                        <label
                          htmlFor="video-upload"
                          className={`inline-block px-4 py-2 rounded-lg cursor-pointer transition-all ${
                            isUploadingVideo
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border border-primary-600/30 hover:border-primary-600/50'
                          }`}
                        >
                          {isUploadingVideo ? (
                            <span className="flex items-center gap-2">
                              <Loader2 size={16} className="animate-spin" />
                              Uploading...
                            </span>
                          ) : (
                            'Upload Video'
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Video URL Input (Alternative) */}
                  {!formData.video_url && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Or enter video URL
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={formData.video_url}
                          onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                          className="flex-1 px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                          placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && formData.video_url.trim()) {
                              e.preventDefault()
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.video_url.trim()) {
                              setSuccess('Video URL added!')
                              setTimeout(() => setSuccess(''), 2000)
                            }
                          }}
                          className="px-4 py-3 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border border-primary-600/30 hover:border-primary-600/50 rounded-xl transition-all"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-primary-500/30 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.is_escrow}
                      onChange={(e) => setFormData({ ...formData, is_escrow: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-700 rounded focus:ring-primary-500 bg-gray-800"
                    />
                    <ShoppingCart className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300 font-medium">This is an escrow item (Tebex store)</span>
                  </label>
                </div>

                {formData.is_escrow && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tebex Link *
                    </label>
                    <input
                      type="url"
                      required={formData.is_escrow}
                      value={formData.tebex_link}
                      onChange={(e) => setFormData({ ...formData, tebex_link: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                      placeholder="https://yourstore.tebex.io/..."
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Key Features (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Enter one feature per line in format: "Title: Description"
                  </p>
                  <textarea
                    value={formData.key_features}
                    onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all resize-y"
                    placeholder="Advanced System: Multiple models, comprehensive functionality&#10;Modern Interface: Clean, responsive design with real-time updates&#10;Admin System: Permission-based access with complete control panel"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Framework Support
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Select the support status for each framework
                  </p>
                  <div className="space-y-3">
                    {frameworks.map((framework) => {
                      const currentStatus = (() => {
                        try {
                          if (!formData.framework_support) return 'not_supported'
                          const parsed = typeof formData.framework_support === 'string'
                            ? JSON.parse(formData.framework_support)
                            : formData.framework_support
                          if (typeof parsed === 'object' && parsed !== null) {
                            return parsed[framework] || 'not_supported'
                          }
                          return 'not_supported'
                        } catch {
                          return 'not_supported'
                        }
                      })()

                      const handleFrameworkStatusChange = (status: string) => {
                        try {
                          let current: any = {}
                          if (formData.framework_support) {
                            const parsed = typeof formData.framework_support === 'string'
                              ? JSON.parse(formData.framework_support)
                              : formData.framework_support
                            if (typeof parsed === 'object' && parsed !== null) {
                              current = parsed
                            }
                          }
                          current[framework] = status === 'not_supported' ? undefined : status
                          Object.keys(current).forEach(key => {
                            if (current[key] === undefined) delete current[key]
                          })
                          setFormData({ ...formData, framework_support: JSON.stringify(current) })
                        } catch (e) {
                          setFormData({ ...formData, framework_support: JSON.stringify({ [framework]: status }) })
                        }
                      }

                      return (
                        <div key={framework} className="flex items-center justify-between p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50">
                          <span className="text-white font-medium">{framework}</span>
                          <div className="flex items-center gap-2">
                            {(['supported', 'coming_soon', 'planned', 'not_supported'] as const).map((status) => {
                              const statusConfigs = {
                                supported: { label: 'Supported', color: 'green' },
                                coming_soon: { label: 'Coming Soon', color: 'yellow' },
                                planned: { label: 'Planned', color: 'blue' },
                                not_supported: { label: 'Not Supported', color: 'gray' },
                              } as const
                              
                              const statusConfig = statusConfigs[status]

                              return (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => handleFrameworkStatusChange(status)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    currentStatus === status
                                      ? statusConfig.color === 'green'
                                        ? 'bg-green-600 text-white'
                                        : statusConfig.color === 'yellow'
                                        ? 'bg-yellow-600 text-white'
                                        : statusConfig.color === 'blue'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-600 text-white'
                                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                  }`}
                                >
                                  {statusConfig.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Technical Details (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={addTechnicalDetailField}
                      className="px-3 py-1.5 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border border-primary-600/30 hover:border-primary-600/50 rounded-lg transition-all text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      Add Field
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    Add key-value pairs for technical specifications
                  </p>
                  
                  {technicalDetailsFields.length === 0 ? (
                    <div className="p-6 bg-gray-800/30 border border-gray-700/50 rounded-xl text-center">
                      <p className="text-gray-400 text-sm mb-3">No technical details added yet</p>
                      <button
                        type="button"
                        onClick={addTechnicalDetailField}
                        className="px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 border border-primary-600/30 hover:border-primary-600/50 rounded-lg transition-all text-sm font-medium inline-flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add First Field
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {technicalDetailsFields.map((field, index) => (
                        <div key={index} className="flex gap-3 items-center p-4 bg-gray-800/40 border border-gray-700/50 rounded-xl">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={field.key}
                              onChange={(e) => updateTechnicalDetailField(index, 'key', e.target.value)}
                              placeholder="Field name (e.g., Code Accessibility)"
                              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm mb-2"
                            />
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => updateTechnicalDetailField(index, 'value', e.target.value)}
                              placeholder="Value (e.g., Yes)"
                              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTechnicalDetailField(index)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                            title="Remove Field"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-4 bg-green-900/20 border border-green-800/50 rounded-xl text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle size={18} />
                    {success}
                  </div>
                )}
              </form>
            </div>

            <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 via-gray-900 to-gray-800 border-t border-gray-700/50 px-6 py-4 flex gap-4 backdrop-blur-xl">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white rounded-xl font-semibold transition-all border border-gray-700/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="product-form"
                disabled={isSubmitting || isUploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
              >
                {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                <Save size={20} />
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
