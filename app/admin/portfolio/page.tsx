'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Image as ImageIcon,
  X,
  Save,
  Star,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  Tag,
  User,
  Upload,
} from 'lucide-react'

interface PortfolioItem {
  id: string
  title: string
  description?: string
  category: string
  image_url: string
  client_name?: string
  tags?: string
  featured: number
  views: number
  created_at: string
  updated_at: string
}

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'MLO',
    image_url: '',
    client_name: '',
    tags: '',
    featured: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const categories = ['MLO', 'Shell', 'Chain', 'Tattoo', 'Face', 'Other']

  const fetchItems = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/portfolio')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      } else {
        setError('Failed to fetch portfolio items')
      }
    } catch (error) {
      console.error('Error fetching portfolio items:', error)
      setError('Error loading portfolio items')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleFileUpload = async (file: File) => {
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
        setFormData((prev) => ({ ...prev, image_url: data.image_url }))
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        handleFileUpload(file)
      } else {
        setError('Please upload an image file')
      }
    }
  }

  const handleOpenModal = (item?: PortfolioItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title,
        description: item.description || '',
        category: item.category,
        image_url: item.image_url,
        client_name: item.client_name || '',
        tags: item.tags || '',
        featured: item.featured === 1,
      })
    } else {
      setEditingItem(null)
      setFormData({
        title: '',
        description: '',
        category: 'MLO',
        image_url: '',
        client_name: '',
        tags: '',
        featured: false,
      })
    }
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingItem(null)
    setFormData({
      title: '',
      description: '',
      category: 'MLO',
      image_url: '',
      client_name: '',
      tags: '',
      featured: false,
    })
    setError('')
    setSuccess('')
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
    if (!formData.image_url.trim()) {
      setError('Image URL is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.category) {
      setError('Category is required')
      setIsSubmitting(false)
      return
    }

    try {
      const url = editingItem
        ? `/api/admin/portfolio/${editingItem.id}`
        : '/api/admin/portfolio'
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          image_url: formData.image_url.trim(),
          client_name: formData.client_name.trim() || null,
          tags: formData.tags.trim() || null,
          featured: formData.featured ? 1 : 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save portfolio item')
        setIsSubmitting(false)
        return
      }

      setSuccess(editingItem ? 'Portfolio item updated successfully!' : 'Portfolio item created successfully!')
      setTimeout(() => {
        handleCloseModal()
        fetchItems()
      }, 1500)
    } catch (error) {
      console.error('Error saving portfolio item:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio item? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/portfolio/${itemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to delete portfolio item')
        return
      }

      setSuccess('Portfolio item deleted successfully!')
      setTimeout(() => {
        fetchItems()
        setSuccess('')
      }, 1500)
    } catch (error) {
      console.error('Error deleting portfolio item:', error)
      setError('An error occurred. Please try again.')
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
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
                Portfolio <span className="text-primary-500">Management</span>
              </h1>
              <p className="text-gray-400 text-base lg:text-lg">Manage portfolio items and showcase your work</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <p className="text-gray-400 text-sm mb-1 font-medium">Total Items</p>
                <p className="text-3xl lg:text-4xl font-bold text-primary-500">{items.length}</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
              >
                <Plus size={20} />
                Add New Item
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
                placeholder="Search portfolio items..."
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
          </div>
        </section>

        {/* Portfolio Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-primary-500/50 transition-all backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-primary-500/10 group"
              >
                <div className="relative w-full h-64 bg-gray-800 overflow-hidden">
                  {item.image_url ? (
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  {item.featured === 1 && (
                    <div className="absolute top-3 right-3 px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                      <Star size={14} className="fill-white" />
                      Featured
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
                    <span className="text-white text-xs font-semibold">{item.category}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
                  {item.client_name && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <User size={14} />
                      <span>{item.client_name}</span>
                    </div>
                  )}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {item.description || 'No description'}
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Eye size={14} />
                      <span>{item.views} views</span>
                    </div>
                    {item.tags && (
                      <div className="flex items-center gap-1 text-gray-500 text-xs">
                        <Tag size={14} />
                        <span className="line-clamp-1">{item.tags.split(',')[0]}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-700/50">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="flex-1 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-600/30 hover:border-blue-600/50 inline-flex items-center justify-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all border border-red-600/30 hover:border-red-600/50"
                      title="Delete Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">No portfolio items found</p>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first portfolio item'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
              >
                <Plus size={20} />
                Add New Item
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        {filteredItems.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Showing <span className="text-primary-500 font-semibold">{filteredItems.length}</span>{' '}
              {filteredItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700/50 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 px-6 py-5 flex items-center justify-between backdrop-blur-sm">
              <h2 className="text-2xl lg:text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {editingItem ? 'Edit' : 'Add New'} <span className="text-primary-500">Portfolio Item</span>
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="Enter portfolio item title"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all resize-none"
                    placeholder="Enter portfolio item description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="Client name (optional)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Image URL *
                  </label>
                  <div className="space-y-3">
                    <input
                      type="url"
                      required
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="text-center text-sm text-gray-400">or</div>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        dragActive
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-gray-700/50 bg-gray-800/30'
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 mb-2">
                        Drag and drop an image here, or click to upload
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0])
                          }
                        }}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-block px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-lg cursor-pointer transition-all border border-primary-600/30 hover:border-primary-600/50 text-sm font-medium"
                      >
                        Choose File
                      </label>
                    </div>
                    {isUploading && (
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Uploading image...</span>
                      </div>
                    )}
                    {formData.image_url && (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-700/50">
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
                          <X size={16} />
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
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-primary-500/30 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-700 rounded focus:ring-primary-500 bg-gray-800"
                    />
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300 font-medium">Feature this item</span>
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
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
