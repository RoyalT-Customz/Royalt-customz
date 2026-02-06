'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Settings,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Filter,
  Clock,
  DollarSign,
  Tag,
  ArrowUpDown,
} from 'lucide-react'

interface Service {
  id: string
  name: string
  description?: string
  category: string
  icon?: string
  duration_minutes: number
  price?: number
  active: number
  display_order: number
  created_at: string
  updated_at: string
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'MLO',
    icon: '',
    duration_minutes: '60',
    price: '',
    active: true,
    display_order: '0',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = ['MLO', 'Shell', 'Chain', 'Tattoo', 'Face', 'Other']

  const fetchServices = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/services')
      if (response.ok) {
        const data = await response.json()
        setServices(data.services || [])
      } else {
        setError('Failed to fetch services')
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      setError('Error loading services')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        description: service.description || '',
        category: service.category,
        icon: service.icon || '',
        duration_minutes: service.duration_minutes.toString(),
        price: service.price?.toString() || '',
        active: service.active === 1,
        display_order: service.display_order.toString(),
      })
    } else {
      setEditingService(null)
      setFormData({
        name: '',
        description: '',
        category: 'MLO',
        icon: '',
        duration_minutes: '60',
        price: '',
        active: true,
        display_order: '0',
      })
    }
    setShowModal(true)
    setError('')
    setSuccess('')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingService(null)
    setFormData({
      name: '',
      description: '',
      category: 'MLO',
      icon: '',
      duration_minutes: '60',
      price: '',
      active: true,
      display_order: '0',
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
    if (!formData.name.trim()) {
      setError('Service name is required')
      setIsSubmitting(false)
      return
    }
    if (!formData.category) {
      setError('Category is required')
      setIsSubmitting(false)
      return
    }

    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services'
      const method = editingService ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          category: formData.category,
          icon: formData.icon.trim() || null,
          duration_minutes: parseInt(formData.duration_minutes) || 60,
          price: formData.price ? parseFloat(formData.price) : null,
          active: formData.active ? 1 : 0,
          display_order: parseInt(formData.display_order) || 0,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save service')
        setIsSubmitting(false)
        return
      }

      setSuccess(editingService ? 'Service updated successfully!' : 'Service created successfully!')
      setTimeout(() => {
        handleCloseModal()
        fetchServices()
      }, 1500)
    } catch (error) {
      console.error('Error saving service:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to delete service')
        return
      }

      setSuccess('Service deleted successfully!')
      setTimeout(() => {
        fetchServices()
        setSuccess('')
      }, 1500)
    } catch (error) {
      console.error('Error deleting service:', error)
      setError('An error occurred. Please try again.')
    }
  }

  const handleToggleActive = async (service: Service) => {
    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...service,
          active: service.active === 1 ? 0 : 1,
        }),
      })

      if (response.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error('Error toggling service status:', error)
      setError('Failed to update service status')
    }
  }

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Sort by display_order
  const sortedServices = [...filteredServices].sort((a, b) => a.display_order - b.display_order)

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
                Services <span className="text-primary-500">Management</span>
              </h1>
              <p className="text-gray-400 text-base lg:text-lg">Manage services available for booking</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
                <p className="text-gray-400 text-sm mb-1 font-medium">Total Services</p>
                <p className="text-3xl lg:text-4xl font-bold text-primary-500">{services.length}</p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
              >
                <Plus size={20} />
                Add New Service
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
                placeholder="Search services..."
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

        {/* Services List */}
        {sortedServices.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedServices.map((service) => (
              <div
                key={service.id}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 p-6 hover:border-primary-500/50 transition-all backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-primary-500/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-600/20 to-primary-700/20 rounded-xl flex items-center justify-center border border-primary-600/30">
                        <Settings size={24} className="text-primary-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {service.active === 1 ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg text-xs font-semibold">
                              <CheckCircle size={12} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded-lg text-xs font-semibold">
                              <EyeOff size={12} />
                              Inactive
                            </span>
                          )}
                          <span className="px-2.5 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-semibold">
                            {service.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    {service.description && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={16} className="text-primary-400" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                      {service.price && (
                        <div className="flex items-center gap-2 text-gray-400">
                          <DollarSign size={16} className="text-primary-400" />
                          <span>${service.price.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-400">
                        <ArrowUpDown size={16} className="text-primary-400" />
                        <span>Order: {service.display_order}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-700/50">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all inline-flex items-center justify-center gap-2 ${
                      service.active === 1
                        ? 'bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 hover:border-yellow-600/50'
                        : 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 hover:border-green-600/50'
                    }`}
                  >
                    {service.active === 1 ? <EyeOff size={16} /> : <Eye size={16} />}
                    {service.active === 1 ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleOpenModal(service)}
                    className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-600/30 hover:border-blue-600/50"
                    title="Edit Service"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all border border-red-600/30 hover:border-red-600/50"
                    title="Delete Service"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">No services found</p>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by adding your first service'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={() => handleOpenModal()}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-primary-600/20"
              >
                <Plus size={20} />
                Add New Service
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        {sortedServices.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Showing <span className="text-primary-500 font-semibold">{sortedServices.length}</span>{' '}
              {sortedServices.length === 1 ? 'service' : 'services'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 px-6 py-5 flex items-center justify-between backdrop-blur-sm">
              <h2 className="text-2xl lg:text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {editingService ? 'Edit' : 'Add New'} <span className="text-primary-500">Service</span>
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
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="Enter service name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all resize-none"
                    placeholder="Enter service description"
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
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="0.00 (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon Name
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                    placeholder="Sparkles (lucide-react icon name)"
                  />
                  <p className="mt-1 text-xs text-gray-500">Icon name from lucide-react</p>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-primary-500/30 transition-all">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 text-primary-600 border-gray-700 rounded focus:ring-primary-500 bg-gray-800"
                    />
                    <span className="text-gray-300 font-medium">Service is active (available for booking)</span>
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
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                >
                  {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                  <Save size={20} />
                  {editingService ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
