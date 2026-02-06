'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import {
  Search,
  Filter,
  Package,
  User,
  Calendar,
  DollarSign,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  X,
  Eye,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { getUserDisplayName, getUserDisplayEmail } from '@/lib/user-display'

interface OrderItem {
  id: string
  product_id: string
  product_name?: string
  product_image?: string
  quantity: number
  price: number
}

interface Order {
  id: string
  user_id: string
  user: {
    username: string
    email: string
    first_name?: string
    last_name?: string
    full_name?: string
  }
  total: number
  status: string
  shipping_address?: string
  billing_address?: string
  payment_method?: string
  payment_status: string
  created_at: string
  updated_at: string
  items: OrderItem[]
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    payment_status: '',
  })

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterPaymentStatus !== 'all') params.append('payment_status', filterPaymentStatus)

      const response = await fetch(`/api/admin/orders?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        setError('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('Error loading orders')
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus, filterPaymentStatus])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleOpenModal = async (order: Order) => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedOrder(data.order)
        setStatusUpdate({
          status: data.order.status,
          payment_status: data.order.payment_status,
        })
        setShowModal(true)
      } else {
        setError('Failed to load order details')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      setError('Error loading order details')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedOrder(null)
    setError('')
    setSuccess('')
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: statusUpdate.status,
          payment_status: statusUpdate.payment_status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to update order')
        return
      }

      setSuccess('Order updated successfully!')
      setTimeout(() => {
        fetchOrders()
        handleCloseModal()
      }, 1500)
    } catch (error) {
      console.error('Error updating order:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'processing':
      case 'shipped':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      case 'cancelled':
      case 'failed':
        return 'bg-bulls-600/20 text-bulls-400 border-bulls-600/30'
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return <CheckCircle size={14} />
      case 'cancelled':
      case 'failed':
        return <XCircle size={14} />
      case 'processing':
      case 'shipped':
        return <Truck size={14} />
      case 'pending':
        return <Clock size={14} />
      default:
        return <Package size={14} />
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) =>
        item.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesSearch
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
                Orders <span className="text-primary-500">Management</span>
              </h1>
              <p className="text-gray-400 text-base lg:text-lg">View and manage all customer orders</p>
            </div>
            <div className="text-right p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <p className="text-gray-400 text-sm mb-1 font-medium">Total Orders</p>
              <p className="text-3xl lg:text-4xl font-bold text-primary-500">{orders.length}</p>
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
                placeholder="Search orders by ID, customer, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Payment Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </section>

        {/* Orders Table */}
        {filteredOrders.length > 0 ? (
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden shadow-xl backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/70 border-b border-gray-700/70 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-200 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {filteredOrders.map((order) => {
                    const displayName = order.user.full_name || `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() || order.user.username

                    return (
                      <tr key={order.id} className="hover:bg-gray-800/40 transition-all duration-200 border-b border-gray-700/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center">
                              <Package size={20} className="text-primary-400" />
                            </div>
                            <div>
                              <p className="text-white font-semibold">#{order.id.slice(0, 8)}</p>
                              <p className="text-gray-400 text-xs">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{displayName}</p>
                            <p className="text-gray-400 text-sm">@{order.user.username}</p>
                            <p className="text-gray-500 text-xs">{order.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            {order.items.slice(0, 2).map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                {item.product_image && (
                                  <div className="relative w-8 h-8 rounded overflow-hidden">
                                    <Image
                                      src={item.product_image}
                                      alt={item.product_name || 'Product'}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm truncate">{item.product_name || 'Unknown Product'}</p>
                                  <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-gray-500 text-xs">+{order.items.length - 2} more</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white font-semibold">
                            <DollarSign size={16} className="text-primary-400" />
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(order.payment_status)}`}>
                            {getStatusIcon(order.payment_status)}
                            {order.payment_status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar size={14} />
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleOpenModal(order)}
                            className="p-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-all border border-blue-600/30 hover:border-blue-600/50"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-gradient-to-br from-gray-800/30 to-gray-900/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">No orders found</p>
            <p className="text-gray-500">
              {searchQuery || filterStatus !== 'all' || filterPaymentStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'No orders have been placed yet'}
            </p>
          </div>
        )}

        {/* Results Count */}
        {filteredOrders.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Showing <span className="text-primary-500 font-semibold">{filteredOrders.length}</span>{' '}
              {filteredOrders.length === 1 ? 'order' : 'orders'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50 px-6 py-5 flex items-center justify-between backdrop-blur-sm">
              <h2 className="text-2xl lg:text-3xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Order <span className="text-primary-500">Details</span>
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Order Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Order ID:</span>
                      <span className="text-white font-mono">#{selectedOrder.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Date:</span>
                      <span className="text-white">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total:</span>
                      <span className="text-white font-bold text-lg">${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white">
                        {getUserDisplayName(selectedOrder.user)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Username:</span>
                      <span className="text-white">@{selectedOrder.user.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="text-white">{getUserDisplayEmail(selectedOrder.user) || 'Hidden'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                      {item.product_image && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.product_image}
                            alt={item.product_name || 'Product'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium">{item.product_name || 'Unknown Product'}</p>
                        <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-gray-400 text-xs">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Update Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Order Status</label>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Payment Status</label>
                    <select
                      value={statusUpdate.payment_status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, payment_status: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              {(selectedOrder.shipping_address || selectedOrder.billing_address) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedOrder.shipping_address && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Shipping Address</h3>
                      <p className="text-white text-sm whitespace-pre-line">{selectedOrder.shipping_address}</p>
                    </div>
                  )}
                  {selectedOrder.billing_address && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Billing Address</h3>
                      <p className="text-white text-sm whitespace-pre-line">{selectedOrder.billing_address}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Error/Success Messages */}
              {error && (
                <div className="p-4 bg-bulls-900/20 border border-bulls-800 rounded-lg text-bulls-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
              )}

              {/* Actions */}
              <div className="sticky bottom-0 bg-gradient-to-t from-gray-900 to-transparent pt-6 pb-4 border-t border-gray-700/50 flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white rounded-xl font-semibold transition-all border border-gray-700/50"
                >
                  Close
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-semibold transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


